import { expect, it } from "vitest";
import { useBlockingInfiniteQuery } from "../useBlockingInfiniteQuery";
import { useBlockingMutation } from "../useBlockingMutation";
import { useBlockingQueries } from "../useBlockingQueries";
import { useBlockingQuery } from "../useBlockingQuery";
import type { InfiniteData, UseQueryResult } from "@tanstack/react-query";

type IsEqual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

// The generic preserves the exact tuple shape for TanStack Query's overloads.
const tuple = <const T extends Array<unknown>>(...values: T): T => {
  return values;
};

it("preserves query select inference", () => {
  function useTypedQuery() {
    return useBlockingQuery({
      queryKey: tuple("user"),
      queryFn: async () => ({ id: 1, name: "Ada" }),
      select: (data) => data.name,
      blockingConfig: {
        scope: "query",
      },
    });
  }

  type QueryResult = ReturnType<typeof useTypedQuery>;

  const queryResultCheck: IsEqual<QueryResult, UseQueryResult<string>> = true;
  const queryDataCheck: IsEqual<QueryResult["data"], string | undefined> = true;
  expect(queryResultCheck).toBe(true);
  expect(queryDataCheck).toBe(true);
});

it("preserves infinite query data shape", () => {
  function useTypedInfiniteQuery() {
    return useBlockingInfiniteQuery({
      queryKey: tuple("feed"),
      queryFn: async ({ pageParam }: { pageParam: number }) => ({
        items: [pageParam],
        nextPage: pageParam + 1,
      }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextPage,
      blockingConfig: {
        scope: "infinite",
      },
    });
  }

  type InfiniteResult = ReturnType<typeof useTypedInfiniteQuery>;
  interface PageData {
    items: Array<number>;
    nextPage: number;
  }

  const infiniteDataCheck: IsEqual<InfiniteResult["data"], InfiniteData<PageData> | undefined> =
    true;
  expect(infiniteDataCheck).toBe(true);
});

it("preserves mutation variable and result inference", () => {
  function useTypedMutation() {
    return useBlockingMutation({
      mutationFn: async (variables: { id: string }): Promise<{ ok: true; id: string }> => {
        return {
          ok: true,
          id: variables.id,
        };
      },
      onMutate: async (variables) => ({
        snapshotId: variables.id,
      }),
      blockingConfig: {
        scope: "mutation",
      },
    });
  }

  type MutationResult = ReturnType<typeof useTypedMutation>;

  const mutationVariablesCheck: IsEqual<Parameters<MutationResult["mutate"]>[0], { id: string }> =
    true;
  const mutationDataCheck: IsEqual<MutationResult["data"], { ok: true; id: string } | undefined> =
    true;
  const mutationStateCheck: IsEqual<MutationResult["variables"], { id: string } | undefined> = true;
  expect(mutationVariablesCheck).toBe(true);
  expect(mutationDataCheck).toBe(true);
  expect(mutationStateCheck).toBe(true);
});

it("preserves tuple inference for parallel queries", () => {
  function useTypedQueries() {
    return useBlockingQueries(
      tuple(
        {
          queryKey: tuple("user"),
          queryFn: async () => ({ id: 1, name: "Ada" }),
          select: (data: { id: number; name: string }) => data.name,
        },
        {
          queryKey: tuple("posts"),
          queryFn: async () => [{ id: 1, title: "Hello" }],
        }
      ),
      {
        scope: "queries",
      }
    );
  }

  type QueryResults = ReturnType<typeof useTypedQueries>;

  const userDataCheck: IsEqual<QueryResults[0]["data"], string | undefined> = true;
  const postsDataCheck: IsEqual<
    QueryResults[1]["data"],
    Array<{ id: number; title: string }> | undefined
  > = true;

  expect(userDataCheck).toBe(true);
  expect(postsDataCheck).toBe(true);
});
