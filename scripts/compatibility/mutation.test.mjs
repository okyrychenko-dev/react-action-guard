import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { Window } from "happy-dom";

const window = new Window({ url: "http://localhost/" });
for (const key of ["window", "document", "navigator", "HTMLElement", "Node"]) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === "window" ? window : window[key],
  });
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { act, createElement: h } = await import("react");
const { createRoot } = await import("react-dom/client");
const { QueryClient } = await import("@tanstack/react-query");
const { useBlockingMutation } = await import("@okyrychenko-dev/react-action-guard-tanstack");
const { uiBlockingStoreApi } = await import("@okyrychenko-dev/react-action-guard");
const roots = new Set();
const clients = new Set();

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((fulfill, fail) => {
    resolve = fulfill;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function mount(options) {
  const client = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
  clients.add(client);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.add(root);
  let mutation;
  function Probe() {
    mutation = useBlockingMutation(options, client);
    return null;
  }
  act(() => root.render(h(Probe)));

  function current() {
    return mutation;
  }

  function unmount() {
    act(() => root.unmount());
    roots.delete(root);
  }
  return { current, unmount };
}
function blockers() {
  const { getBlockingInfo } = uiBlockingStoreApi.getState();
  return getBlockingInfo("packed-mutation");
}
afterEach(() => {
  act(() => {
    for (const root of roots) root.unmount();
  });
  roots.clear();
  for (const client of clients) client.clear();
  clients.clear();
  const { clearAllBlockers } = uiBlockingStoreApi.getState();
  clearAllBlockers();
  document.body.replaceChildren();
});

for (const method of ["mutate", "mutateAsync"]) {
  it(`should retain A after B through packed ${method} and preserve native latest observation`, async () => {
    const a = deferred();
    const b = deferred();
    const hook = mount({
      mutationFn: (name) => (name === "A" ? a.promise : b.promise),
      blockingConfig: { scope: "packed-mutation" },
    });
    let first;
    let second;
    act(() => {
      first = hook.current()[method]("A");
      second = hook.current()[method]("B");
    });
    assert.equal(blockers().length, 1);
    await act(async () => {
      b.resolve("B");
      await second;
      await new Promise((done) => setTimeout(done, 0));
    });
    assert.equal(hook.current().data, "B");
    assert.equal(blockers().length, 1);
    await act(async () => {
      a.resolve("A");
      await first;
      await new Promise((done) => setTimeout(done, 0));
    });
    assert.equal(hook.current().data, "B");
    assert.equal(blockers().length, 0);
  });
}

it("should retain reset and detached work through native callback completion", async () => {
  const work = deferred();
  const callback = deferred();
  const hook = mount({
    mutationFn: () => work.promise,
    onSuccess: () => callback.promise,
    blockingConfig: { scope: "packed-mutation", onError: true },
  });
  let promise;
  act(() => {
    promise = hook.current().mutateAsync(undefined);
  });
  await act(async () => {
    hook.current().reset();
    await new Promise((done) => setTimeout(done, 0));
  });
  assert.equal(hook.current().isIdle, true);
  assert.equal(blockers().length, 1);
  hook.unmount();
  await act(async () => {
    work.resolve("done");
  });
  assert.equal(blockers().length, 1);
  await act(async () => {
    callback.resolve();
    assert.equal(await promise, "done");
  });
  assert.equal(blockers().length, 0);
});
