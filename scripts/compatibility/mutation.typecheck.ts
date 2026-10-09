import type { UseMutationResult } from "@tanstack/react-query";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";

// Compile only: inference across the packed wrapper, including callback context.
export function checkMutationTypes(): void {
  const mutation = useBlockingMutation({
    mutationFn: async (variables: { id: number }) => ({ saved: variables.id }),
    onMutate: (variables) => ({ previous: variables.id }),
    onSuccess: (data, variables, previous, context) => {
      const id: number = variables.id;
      const saved: number = data.saved;
      const old: number | undefined = previous?.previous;
      void [id, saved, old, context.client];
    },
    blockingConfig: { scope: "form", onError: true, reasonOnError: "Failed" },
  });
  const result: UseMutationResult<{ saved: number }, Error, { id: number }, { previous: number }> =
    mutation;
  const completion: Promise<{ saved: number }> = mutation.mutateAsync({ id: 1 });
  const immediate: void = mutation.mutate(
    { id: 2 },
    {
      onSuccess: (data, variables, previous) => {
        const saved: number = data.saved;
        const id: number = variables.id;
        const old: number | undefined = previous?.previous;
        void [saved, id, old];
      },
    }
  );
  void [result, completion, immediate];
}
