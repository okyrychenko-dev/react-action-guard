import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import { QueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDeferred } from "../../test/test.utils";
import { useDifferentialMutation } from "./mutationDifferential.test.utils";
import { createMutationErrorBoundary } from "./mutationErrorBoundary.test.utils";

function blockers(): number {
  const { getBlockingInfo } = uiBlockingStoreApi.getState();

  return getBlockingInfo("differential").length;
}

describe("native mutation differential contract", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it.each(["success", "failure"])(
    "should match native callbacks and latest observation when B finishes before A (%s)",
    async (outcome) => {
      const transcripts: Array<Array<string>> = [];

      for (const adapter of [false, true]) {
        const client = new QueryClient();
        const a = createDeferred<string>();
        const b = createDeferred<string>();
        const events: Array<string> = [];
        const failure = new Error("B failed");
        const hook = renderHook(() =>
          useDifferentialMutation(
            adapter,
            {
              mutationFn: (name) => (name === "A" ? a.promise : b.promise),
              onMutate: (name) => {
                events.push(`prepare ${name}`);

                return `context ${name}`;
              },
              onSuccess: (data, name, context) => {
                events.push(`success ${name} ${data} ${context}`);
              },
              onError: (error, name, context) => {
                events.push(`error ${name} ${error.message} ${String(context)}`);
              },
              onSettled: (_data, _error, name) => {
                events.push(`settled ${name}`);
              },
            },
            client
          )
        );
        let first = Promise.resolve("");
        let second = Promise.resolve<unknown>(undefined);

        act(() => {
          first = hook.result.current.mutateAsync("A", {
            onSettled: () => events.push("call A"),
          });
          second = hook.result.current
            .mutateAsync("B", {
              onSuccess: () => events.push("call B success"),
              onError: () => events.push("call B error"),
              onSettled: () => events.push("call B settled"),
            })
            .catch((error: unknown) => error);
        });
        await act(async () => {
          if (outcome === "success") {
            b.resolve("B result");
          } else {
            b.reject(failure);
          }

          const value = await second;

          expect(value).toBe(outcome === "success" ? "B result" : failure);
        });
        await waitFor(() =>
          expect(hook.result.current.status).toBe(outcome === "success" ? "success" : "error")
        );
        expect(hook.result.current.variables).toBe("B");
        expect(blockers()).toBe(adapter ? 1 : 0);
        await act(async () => {
          a.resolve("A result");
          expect(await first).toBe("A result");
        });
        expect(hook.result.current.variables).toBe("B");
        expect(hook.result.current.data).toBe(outcome === "success" ? "B result" : undefined);
        expect(hook.result.current.error).toBe(outcome === "success" ? null : failure);
        expect(events).not.toContain("call A");

        const terminal =
          outcome === "success" ? "success B B result context B" : "error B B failed context B";

        expect(events).toEqual([
          "prepare A",
          "prepare B",
          terminal,
          "settled B",
          `call B ${outcome === "success" ? "success" : "error"}`,
          "call B settled",
          "success A A result context A",
          "settled A",
        ]);
        transcripts.push(events);
        act(() => hook.result.current.reset());
        await waitFor(() => expect(hook.result.current.isIdle).toBe(true));
        expect(blockers()).toBe(0);
        hook.unmount();
        client.clear();
      }
      expect(transcripts[1]).toEqual(transcripts[0]);
    }
  );

  it("should match native reset and callback suppression through detach with overlapping work", async () => {
    for (const adapter of [false, true]) {
      const client = new QueryClient();
      const a = createDeferred<string>();
      const b = createDeferred<string>();
      const optionSettled = vi.fn();
      const callSettled = vi.fn();
      const hook = renderHook(() =>
        useDifferentialMutation(
          adapter,
          {
            mutationFn: (name) => (name === "A" ? a.promise : b.promise),
            onSettled: optionSettled,
          },
          client
        )
      );
      let first = Promise.resolve("");
      let second = Promise.resolve("");

      act(() => {
        first = hook.result.current.mutateAsync("A", { onSettled: callSettled });
        second = hook.result.current.mutateAsync("B", { onSettled: callSettled });
        hook.result.current.reset();
      });
      await waitFor(() => expect(hook.result.current.isIdle).toBe(true));
      expect(hook.result.current.data).toBeUndefined();
      expect(hook.result.current.error).toBeNull();
      expect(hook.result.current.variables).toBeUndefined();
      expect(blockers()).toBe(adapter ? 1 : 0);
      hook.unmount();
      await act(async () => {
        b.resolve("B");
        expect(await second).toBe("B");
      });
      expect(blockers()).toBe(adapter ? 1 : 0);
      await act(async () => {
        a.resolve("A");
        expect(await first).toBe("A");
      });
      expect(blockers()).toBe(0);
      expect(optionSettled).toHaveBeenCalledTimes(2);
      expect(callSettled).not.toHaveBeenCalled();
      client.clear();
    }
  });

  it.each(["predicate", "client-default"])(
    "should match native error boundaries while an older execution remains pending (%s)",
    async (source) => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

      try {
        for (const adapter of [false, true]) {
          const client = new QueryClient();
          const older = createDeferred<string>();
          const latest = createDeferred<string>();
          const failure = new Error("latest failed");
          const caught = vi.fn();
          const predicate = vi.fn((error: Error) => error === failure);
          const options: UseMutationOptions<string, Error, string, string> = {
            mutationFn: (name) => (name === "A" ? older.promise : latest.promise),
          };

          if (source === "client-default") {
            client.setDefaultOptions({ mutations: { throwOnError: true } });
          } else {
            options.throwOnError = predicate;
          }

          const hook = renderHook(() => useDifferentialMutation(adapter, options, client), {
            wrapper: createMutationErrorBoundary(caught),
          });
          let first = Promise.resolve("");
          let second = Promise.resolve<unknown>(undefined);

          act(() => {
            first = hook.result.current.mutateAsync("A");
            second = hook.result.current.mutateAsync("B").catch((error: unknown) => error);
          });
          await act(async () => {
            latest.reject(failure);
            expect(await second).toBe(failure);
          });
          await waitFor(() => expect(caught).toHaveBeenCalledWith(failure));
          if (isDefined(options.throwOnError)) {
            expect(predicate).toHaveBeenCalledWith(failure);
          }
          expect(blockers()).toBe(adapter ? 1 : 0);
          await act(async () => {
            older.resolve("older result");
            expect(await first).toBe("older result");
          });
          expect(blockers()).toBe(0);
          expect(caught).toHaveBeenCalledTimes(1);
          hook.unmount();
          client.clear();
        }
      } finally {
        consoleError.mockRestore();
      }
    }
  );
});
