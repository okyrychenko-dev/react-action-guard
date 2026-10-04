import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });
for (const key of ["window", "document", "navigator", "HTMLElement", "Node"]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === "window" ? window : window[key],
  });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { createElement: h, StrictMode } = await import("react");
const { createRoot, hydrateRoot } = await import("react-dom/client");
const { act: reactAct } = await import("react");
const act = reactAct ?? (await import("react-dom/test-utils")).act;
const { renderToString } = await import("react-dom/server");
const {
  UIBlockingProvider,
  useActionBlocker,
  useIsBlocked,
  useUIBlockingContext,
  uiBlockingStoreApi,
} = await import("@okyrychenko-dev/react-action-guard");
const roots = [];
const stores = new Map();

function Probe({ name, active = false }) {
  const store = useUIBlockingContext();
  stores.set(name, store);
  useActionBlocker("shared-id", { scope: "form" }, active);
  return h("span", { "data-name": name }, String(useIsBlocked("form")));
}
function provider(name, active = false, children) {
  return h(UIBlockingProvider, null, h(Probe, { name, active }), children);
}
function mount(element) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(element));
  return { container, root };
}
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  const { clearAllBlockers } = uiBlockingStoreApi.getState();
  clearAllBlockers();
  stores.clear();
  document.body.replaceChildren();
});

test("should isolate adjacent, nested and independent Strict Mode provider roots", () => {
  const first = mount(
    h(StrictMode, null, provider("outer", true, provider("nested")), provider("adjacent"))
  );
  const second = mount(h(StrictMode, null, provider("independent")));
  assert.equal(first.container.querySelector('[data-name="outer"]').textContent, "true");
  for (const name of ["nested", "adjacent"]) {
    assert.equal(first.container.querySelector(`[data-name="${name}"]`).textContent, "false");
  }
  assert.equal(second.container.textContent, "false");
  const { isBlocked: isGlobalBlocked } = uiBlockingStoreApi.getState();
  assert.equal(isGlobalBlocked("form"), false);
  const outerStore = stores.get("outer");
  act(() => first.root.render(h(StrictMode, null, provider("outer", false))));
  const { isBlocked } = outerStore.getState();
  assert.equal(isBlocked("form"), false, "effect cleanup releases the provider blocker");
  assert.equal(first.container.textContent, "false");
});

test("should isolate server requests and hydrate without a mismatch", async () => {
  const firstHtml = renderToString(provider("request-one"));
  const firstStore = stores.get("request-one");
  const { addBlocker } = firstStore.getState();
  addBlocker("server-only", { scope: "form" });
  const secondHtml = renderToString(provider("request-two"));
  assert.match(firstHtml, />false</);
  assert.match(secondHtml, />false</);
  assert.notEqual(firstStore, stores.get("request-two"));
  const { isBlocked: isGlobalBlocked } = uiBlockingStoreApi.getState();
  assert.equal(isGlobalBlocked("form"), false);
  const container = document.createElement("div");
  container.innerHTML = firstHtml;
  document.body.append(container);
  const errors = [];
  await act(async () => {
    roots.push(
      hydrateRoot(container, provider("request-one", true), {
        onRecoverableError: (error) => errors.push(error),
      })
    );
  });
  assert.deepEqual(errors, []);
  assert.equal(container.textContent, "true", "blocking starts after hydration effects");
  const { isBlocked } = firstStore.getState();
  assert.equal(isBlocked("form"), true, "hydration does not reuse the request store");
  assert.notEqual(firstStore, stores.get("request-one"));
});
