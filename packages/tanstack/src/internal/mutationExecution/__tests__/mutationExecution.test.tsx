import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createMutationExecutionFixture } from "./mutationExecution.test.utils";

describe("execution owners sharing a native mutation observer", () => {
  it("should ignore the replaced owner's earlier error when a retained call is observed", async () => {
    const {
      a,
      b,
      observer,
      oldOwner,
      currentOwner,
      oldInfo,
      currentInfo,
      replace,
      cleanup,
      refreshNative,
    } = createMutationExecutionFixture();

    replace();

    const tokenB = currentOwner.begin();

    const promiseB = observer.mutate("B");

    refreshNative();

    const consumedB = promiseB.catch(() => undefined);
    const tokenA = oldOwner.begin();

    const promiseA = observer.mutate("A");

    refreshNative();

    expect(oldInfo("owner-observer")).toHaveLength(1);
    expect(currentInfo("owner-observer")).toHaveLength(1);

    await act(async () => {
      b.reject(new Error("B failed"));
      await consumedB;
    });

    currentOwner.finish(tokenB);

    expect(observer.getCurrentResult().isPending).toBe(true);

    await act(async () => {
      a.resolve("A succeeded");
      await promiseA;
    });

    oldOwner.finish(tokenA);

    expect(observer.getCurrentResult().data).toBe("A succeeded");
    expect(currentInfo("owner-observer")).toHaveLength(0);
    expect(oldInfo("owner-observer")).toHaveLength(0);

    cleanup();
  });
  it("should publish a retained call's latest error to the attached owner and clear it through retained reset", async () => {
    const {
      a,
      b,
      observer,
      oldOwner,
      currentOwner,
      oldInfo,
      currentInfo,
      replace,
      cleanup,
      refreshNative,
    } = createMutationExecutionFixture();

    replace();

    const tokenB = currentOwner.begin();

    const promiseB = observer.mutate("B");

    refreshNative();

    const tokenA = oldOwner.begin();

    const promiseA = observer.mutate("A").catch((error: unknown) => error);

    refreshNative();

    const failure = new Error("A failed");

    await act(async () => {
      a.reject(failure);
      expect(await promiseA).toBe(failure);
    });

    oldOwner.finish(tokenA);

    expect(observer.getCurrentResult().error).toBe(failure);
    expect(oldInfo("owner-observer")).toHaveLength(0);
    expect(currentInfo("owner-observer")).toHaveLength(1);
    expect(currentInfo("owner-observer")[0]?.reason).toBe("Saving changes...");

    await act(async () => {
      b.resolve("B");
      await promiseB;
    });

    currentOwner.finish(tokenB);

    expect(observer.getCurrentResult().error).toBe(failure);
    expect(currentInfo("owner-observer")).toHaveLength(1);
    expect(currentInfo("owner-observer")[0]?.reason).toBe("Latest error");

    observer.reset();
    oldOwner.reset();

    expect(observer.getCurrentResult().isIdle).toBe(true);
    expect(currentInfo("owner-observer")).toHaveLength(0);

    cleanup();
  });

  it("should ignore duplicate and foreign completions without changing native success", async () => {
    const { a, observer, oldOwner, currentOwner, currentInfo, replace, cleanup, refreshNative } =
      createMutationExecutionFixture();

    replace();

    const token = currentOwner.begin();

    const promise = observer.mutate("A");

    refreshNative();

    oldOwner.finish(token);
    expect(currentInfo("owner-observer")).toHaveLength(1);
    await act(async () => {
      a.resolve("done");
      await promise;
    });
    currentOwner.finish(token);
    currentOwner.finish(token);
    expect(observer.getCurrentResult().isSuccess).toBe(true);
    expect(currentInfo("owner-observer")).toHaveLength(0);
    cleanup();
  });

  it("should follow delegation order when clearing error protection starts a reentrant call", async () => {
    const {
      a,
      b,
      observer,
      oldOwner,
      currentOwner,
      currentInfo,
      observeCurrent,
      replace,
      cleanup,
      refreshNative,
    } = createMutationExecutionFixture();

    replace();

    const firstToken = currentOwner.begin();

    const first = observer.mutate("B").catch(() => undefined);

    refreshNative();

    await act(async () => {
      b.reject(new Error("B failed"));
      await first;
    });
    currentOwner.finish(firstToken);
    expect(currentInfo("owner-observer")).toHaveLength(1);

    let started = false;
    let nestedToken = Symbol();
    let nested: Promise<unknown> = Promise.resolve();
    const release = observeCurrent(({ action }) => {
      if (action === "remove" && !started) {
        started = true;
        nestedToken = currentOwner.begin();

        nested = observer.mutate("B").catch(() => undefined);
        refreshNative();
      }
    });
    const retainedToken = oldOwner.begin();

    const retained = observer.mutate("A");

    refreshNative();

    await act(async () => {
      await nested;
    });
    currentOwner.finish(nestedToken);
    expect(observer.getCurrentResult().isError).toBe(true);
    await act(async () => {
      a.resolve("A succeeded");
      await retained;
    });
    oldOwner.finish(retainedToken);
    expect(observer.getCurrentResult().isError).toBe(true);
    expect(observer.getCurrentResult().variables).toBe("B");
    expect(currentInfo("owner-observer")).toHaveLength(1);
    expect(currentInfo("owner-observer")[0]?.reason).toBe("Latest error");
    release();
    cleanup();
  });
  it("should reset shared observation without releasing another owner's pending call", async () => {
    const { b, observer, oldOwner, currentOwner, currentInfo, replace, cleanup, refreshNative } =
      createMutationExecutionFixture();

    replace();

    const token = currentOwner.begin();

    const promise = observer.mutate("B").catch(() => undefined);

    refreshNative();

    observer.reset();
    oldOwner.reset();
    expect(observer.getCurrentResult().isIdle).toBe(true);
    expect(currentInfo("owner-observer")).toHaveLength(1);
    await act(async () => {
      b.reject(new Error("reset call failed"));
      await promise;
    });
    currentOwner.finish(token);
    expect(observer.getCurrentResult().isIdle).toBe(true);
    expect(currentInfo("owner-observer")).toHaveLength(0);
    cleanup();
  });
});
