import {
  QueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { useBlockingMutation } from "../useBlockingMutation";

/** Both branches use the same public options and an independent native client. */
export function useDifferentialMutation(
  adapter: boolean,
  options: UseMutationOptions<string, Error, string, string>,
  client: QueryClient
): UseMutationResult<string, Error, string, string> {
  const native = useMutation(options, client);
  const coordinated = useBlockingMutation(
    { ...options, blockingConfig: { scope: "differential", onError: true } },
    client
  );

  return adapter ? coordinated : native;
}
