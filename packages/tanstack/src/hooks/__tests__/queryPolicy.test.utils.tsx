import { UIBlockingProvider, useBlockingInfo } from "@okyrychenko-dev/react-action-guard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useBlockingInfiniteQuery, useBlockingQueries, useBlockingQuery } from "../../hooks";
import type { ReactElement, ReactNode } from "react";
import type { PolicyFixtureOptions, PolicyFixtureResult } from "./queryPolicy.test.types";

export function usePolicyFixture({
  client,
  enabled = true,
  queryFn,
  config = {},
}: PolicyFixtureOptions): PolicyFixtureResult {
  const query = useBlockingQuery(
    {
      queryKey: ["single"],
      queryFn,
      enabled,
      blockingConfig: { ...config, scope: "single" },
    },
    client
  );
  const infinite = useBlockingInfiniteQuery(
    {
      queryKey: ["infinite"],
      queryFn,
      enabled,
      initialPageParam: 0,
      getNextPageParam: (_lastPage, pages) => pages.length,
      blockingConfig: { ...config, scope: "infinite" },
    },
    client
  );
  const collection = useBlockingQueries(
    [
      { queryKey: ["collection"], queryFn, enabled },
      { queryKey: ["idle"], queryFn, enabled: false },
    ],
    { ...config, scope: "collection" },
    client
  );

  return {
    query,
    infinite,
    collection,
    reasons: [
      useBlockingInfo("single"),
      useBlockingInfo("infinite"),
      useBlockingInfo("collection"),
    ].map((blockers) => blockers.map(({ reason }) => reason)),
  };
}

export function createPolicyWrapper(
  client: QueryClient
): ({ children }: { children: ReactNode }) => ReactElement {
  return function PolicyWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <UIBlockingProvider>{children}</UIBlockingProvider>
      </QueryClientProvider>
    );
  };
}
