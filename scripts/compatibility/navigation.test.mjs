import assert from "node:assert/strict";
import { it } from "node:test";
import { readFile } from "node:fs/promises";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });

for (const key of ["window", "self", "document", "navigator", "HTMLElement", "Node"]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: ["window", "self"].includes(key) ? window : window[key],
  });
}

globalThis.scrollTo = window.scrollTo.bind(window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { createElement: h, useState } = await import("react");
const { createRoot } = await import("react-dom/client");
const { act: reactAct } = await import("react");
const act = reactAct ?? (await import("react-dom/test-utils")).act;
const { UIBlockingProvider } = await import("@okyrychenko-dev/react-action-guard");
const entries = JSON.parse(await readFile(new URL("./entries.json", import.meta.url), "utf8"));
const adapter = entries.some(({ path }) => path.endsWith("/react-router"))
  ? "react-router"
  : "tanstack-router";
const { useNavigationBlocker } = await import(
  `@okyrychenko-dev/react-action-guard-router/${adapter}`
);
let confirm = false;
let attempts = 0;
let allows = 0;
let confirmation;
let synchronous = false;
let intercepting = false;
let setProtection = () => {};

function Guard() {
  const [enabled, setEnabled] = useState(true);
  const when = adapter === "react-router" ? () => enabled : enabled;

  setProtection = setEnabled;

  const { isIntercepting } = useNavigationBlocker({
    when,
    message: "Leave?",
    blockBrowserUnload: false,
    onConfirm: () => {
      attempts++;
      if (synchronous) {
        return confirm;
      }

      return Promise.resolve(confirmation ?? confirm);
    },
    onAllow: () => allows++,
  });

  intercepting = isIntercepting;

  return h("div", null, "guard");
}

it("should deny, allow once, and keep protecting real router navigation", async () => {
  let element;
  let navigate;
  let location;
  if (adapter === "react-router") {
    const { createMemoryRouter, RouterProvider, Outlet } = await import("react-router-dom");
    const router = createMemoryRouter(
      [
        {
          path: "/",
          element: h(UIBlockingProvider, null, h(Guard), h(Outlet)),
          children: [
            { path: "a", element: h("p", null, "a") },
            { path: "b", element: h("p", null, "b") },
          ],
        },
      ],
      { initialEntries: ["/a"] }
    );
    element = h(RouterProvider, { router });
    navigate = (to) => router.navigate(to);
    location = () => router.state.location.pathname;
  } else {
    const {
      createRouter,
      createRootRoute,
      createRoute,
      createMemoryHistory,
      RouterProvider,
      Outlet,
    } = await import("@tanstack/react-router");
    const rootRoute = createRootRoute({
      component: () => h(UIBlockingProvider, null, h(Guard), h(Outlet)),
    });
    const routes = ["a", "b"].map((path) =>
      createRoute({ getParentRoute: () => rootRoute, path, component: () => h("p", null, path) })
    );
    const router = createRouter({
      routeTree: rootRoute.addChildren(routes),
      history: createMemoryHistory({ initialEntries: ["/a"] }),
    });
    await router.load();
    element = h(RouterProvider, { router });
    navigate = (to) => router.navigate({ to });
    location = () => router.state.location.pathname;
  }
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  const errors = [];
  const originalError = console.error;
  console.error = (...args) => errors.push(args);
  try {
    await act(async () => root.render(element));
    await act(async () => {
      void navigate("/b");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    assert.equal(location(), "/a");
    assert.equal(attempts, 1);
    confirm = true;
    await act(async () => {
      void navigate("/b");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    assert.equal(location(), "/b");
    assert.equal(attempts, 2);
    confirm = false;
    await act(async () => {
      void navigate("/a");
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    assert.equal(location(), "/b");
    assert.equal(attempts, 3);
    assert.equal(allows, 1);

    if (adapter === "react-router") {
      let settle;
      confirmation = new Promise((resolve) => {
        settle = resolve;
      });
      await act(async () => {
        void navigate("/a");
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      assert.equal(intercepting, true);
      assert.equal(location(), "/b");

      await act(async () => setProtection(false));
      assert.equal(intercepting, false, "disabled protection must reset the blocked attempt");
      assert.equal(location(), "/b");

      await act(async () => {
        settle(true);
        await confirmation;
      });
      assert.equal(location(), "/b", "invalidated approval must not resume navigation");
      assert.equal(intercepting, false);
      assert.equal(allows, 1);

      await act(async () => {
        void navigate("/a");
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      assert.equal(location(), "/a", "navigation should work after protection is disabled");
      assert.equal(attempts, 4);

      await act(async () => setProtection(true));
      let settleSuperseded;
      confirmation = new Promise((resolve) => {
        settleSuperseded = resolve;
      });
      await act(async () => {
        void navigate("/b");
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      assert.equal(intercepting, true);

      synchronous = true;
      await act(async () => {
        void navigate("/b");
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      assert.equal(intercepting, true);
      assert.equal(attempts, 6);

      await act(async () => setProtection(false));
      assert.equal(
        intercepting,
        false,
        "disabled protection must reset the synchronous replacement"
      );
      await act(async () => {
        settleSuperseded(true);
        await confirmation;
      });
      assert.equal(location(), "/a");
      assert.equal(allows, 1);

      await act(async () => {
        void navigate("/b");
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      assert.equal(location(), "/b");
      assert.equal(attempts, 6);
    }

    assert.deepEqual(errors, [], "navigation must not produce runtime errors");
  } finally {
    await act(async () => root.unmount());
    container.remove();
    console.error = originalError;
  }
});
