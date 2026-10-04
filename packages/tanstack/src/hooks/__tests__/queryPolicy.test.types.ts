import type {
  InfiniteData,
  QueryClient,
  UseInfiniteQueryResult,
  UseQueryResult,
} from "@tanstack/react-query";
import type { QueryBlockingConfig } from "../useBlockingQuery.types";

export interface PolicyFixtureOptions {
  client: QueryClient;
  enabled?: boolean;
  queryFn: () => Promise<string>;
  config?: QueryBlockingConfig;
}

export interface PolicyFixtureResult {
  query: UseQueryResult<string>;
  infinite: UseInfiniteQueryResult<InfiniteData<string>>;
  collection: [UseQueryResult<string>, UseQueryResult<string>];
  reasons: Array<Array<string>>;
}
