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
const { QueryClient, useMutation } = await import("@tanstack/react-query");
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
function mount(
  options,
  client = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } }),
  useMutationHook = useBlockingMutation
) {
  clients.add(client);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.add(root);
  let mutation;
  function Probe() {
    mutation = useMutationHook(options, client);
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
async function waitForMutationResult(predicate) {
  const deadline = Date.now() + 2000;
  while (!predicate()) {
    assert.ok(Date.now() < deadline, "native mutation result did not reach the expected state");
    await act(async () => {
      await new Promise((done) => setTimeout(done, 0));
    });
  }
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

for (const method of ["mutate", "mutateAsync"]) {
  it(`should preserve native cache-added reentrancy through packed ${method}`, async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
    const a = deferred();
    const b = deferred();
    const hook = mount(
      {
        mutationFn: (name) => (name === "A" ? a.promise : b.promise),
        blockingConfig: { scope: "packed-mutation", onError: true },
      },
      client
    );
    let started = false;
    let nested;
    const release = client.getMutationCache().subscribe((event) => {
      if (event.type === "added" && !started) {
        started = true;
        nested = hook
          .current()
          .mutateAsync("B")
          .catch(() => undefined);
      }
    });
    let outer;
    act(() => {
      outer = hook.current()[method]("A");
    });
    assert.equal(blockers().length, 1);
    await act(async () => {
      b.reject(new Error("B failed"));
      await nested;
      await new Promise((done) => setTimeout(done, 0));
    });
    assert.equal(hook.current().variables, "A");
    assert.equal(hook.current().isPending, true);
    await act(async () => {
      a.resolve("A succeeded");
      await outer;
      await new Promise((done) => setTimeout(done, 0));
    });
    await waitForMutationResult(() => hook.current().isSuccess);
    assert.equal(hook.current().data, "A succeeded");
    assert.equal(blockers().length, 0);
    release();
  });

  it(`should preserve prior native error after packed ${method} throws synchronously`, async () => {
    const client = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });
    const observedError = new Error("observed failure");
    const delegationError = new Error("native build failed");
    const hook = mount(
      {
        mutationFn: () => Promise.reject(observedError),
        blockingConfig: { scope: "packed-mutation", onError: true },
      },
      client
    );
    await act(async () => {
      await hook
        .current()
        .mutateAsync(undefined)
        .catch(() => undefined);
      await new Promise((done) => setTimeout(done, 0));
    });
    assert.equal(hook.current().error, observedError);
    assert.equal(blockers().length, 1);
    const release = client.getMutationCache().subscribe((event) => {
      if (event.type === "added") throw delegationError;
    });
    act(() => {
      assert.throws(
        () => hook.current()[method](undefined),
        (error) => error === delegationError
      );
    });
    assert.equal(hook.current().error, observedError);
    assert.equal(blockers().length, 1);
    release();
    await act(async () => {
      hook.current().reset();
      await new Promise((done) => setTimeout(done, 0));
    });
    assert.equal(blockers().length, 0);
  });
}

// Run the same public scenario against the installed native and packed hooks.
for (const method of ["mutate", "mutateAsync"]) {
  for (const outcome of ["success", "failure"]) {
    it(`should match native callbacks, reset and latest result through packed ${method} (${outcome})`, async () => {
      const transcripts = [];
      for (const useMutationHook of [useMutation, useBlockingMutation]) {
        const a = deferred();
        const b = deferred();
        const failure = new Error("B failed");
        const events = [];
        const hook = mount(
          {
            mutationFn: (name) => (name === "A" ? a.promise : b.promise),
            onSuccess: (data, name) => events.push(`success ${name} ${data}`),
            onError: (error, name) => events.push(`error ${name} ${error.message}`),
            onSettled: (_data, _error, name) => events.push(`settled ${name}`),
            blockingConfig: { scope: "packed-mutation", onError: true },
          },
          undefined,
          useMutationHook
        );
        let first;
        let second;
        act(() => {
          first = hook.current()[method]("A", { onSettled: () => events.push("call A") });
          const promise = hook.current()[method]("B", { onSettled: () => events.push("call B") });
          second = promise?.catch((error) => error);
        });
        await act(async () => {
          if (outcome === "success") b.resolve("B result");
          else b.reject(failure);
          await second;
        });
        await waitForMutationResult(
          () => hook.current().status === (outcome === "success" ? "success" : "error")
        );
        assert.equal(hook.current().variables, "B");
        assert.equal(hook.current().data, outcome === "success" ? "B result" : undefined);
        assert.equal(hook.current().error, outcome === "success" ? null : failure);
        const expectedBlockers = useMutationHook === useBlockingMutation ? 1 : 0;
        assert.equal(blockers().length, expectedBlockers);
        await act(async () => hook.current().reset());
        await waitForMutationResult(() => hook.current().isIdle);
        assert.equal(blockers().length, expectedBlockers);
        hook.unmount();
        await act(async () => {
          a.resolve("A result");
          await first;
        });
        await waitForMutationResult(() => events.includes("settled A"));
        assert.equal(blockers().length, 0);
        assert.deepEqual(events, [
          outcome === "success" ? "success B B result" : "error B B failed",
          "settled B",
          "call B",
          "success A A result",
          "settled A",
        ]);
        transcripts.push(events);
      }
      assert.deepEqual(transcripts[1], transcripts[0]);
    });
  }
}
