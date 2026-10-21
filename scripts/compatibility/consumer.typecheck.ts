import {
  createBlockingLifecycle,
  createTypedHooks,
  UIBlockingProvider,
  useActionBlocker,
  useAsyncAction,
  useIsBlocked,
  type BlockingLifecycleSnapshot,
  type UIBlockingProviderProps,
  type UseAsyncActionOptions,
  type UseAsyncActionReturn,
} from "@okyrychenko-dev/react-action-guard";
import {
  useGuardedButton,
  type UseGuardedButtonReturn,
} from "@okyrychenko-dev/react-action-guard-ui";
import {
  ActionGuardDevtoolsProvider,
  type ActionGuardDevtoolsProviderProps,
} from "@okyrychenko-dev/react-action-guard-devtools";
import {
  useDialogState,
  type UseDialogStateReturn,
} from "@okyrychenko-dev/react-action-guard-router";

// Compile only: application-shaped public calls in both NodeNext module formats.
export function checkPublicTypes(): void {
  const providerProps: UIBlockingProviderProps = { children: null };
  UIBlockingProvider(providerProps);
  useActionBlocker("consumer", { scope: "form" }, false);
  const options: UseAsyncActionOptions = { reason: "Зберігаємо", priority: 0 };
  const execute: UseAsyncActionReturn = useAsyncAction("consumer", "form", options);
  const text: Promise<string> = execute(async () => "saved");
  const count: Promise<number> = execute(async () => 42);
  const empty: Promise<void> = execute(async (): Promise<void> => undefined);
  const rejected: Promise<never> = execute(async () => {
    throw new Error("consumer");
  });
  const bounded = useAsyncAction<string>("bounded");
  // @ts-expect-error Explicit hook generics reject incompatible callback results.
  bounded(async () => 42);
  const { useAsyncAction: useTypedAsyncAction } = createTypedHooks<"form">();
  const typed = useTypedAsyncAction("typed", "form");
  const typedText: Promise<string> = typed(async () => "saved");
  const typedCount: Promise<number> = typed(async () => 42);
  void [text, count, empty, rejected, typedText, typedCount];
  const blocked: boolean = useIsBlocked("form");
  const lifecycle = createBlockingLifecycle();
  const snapshot: BlockingLifecycleSnapshot = lifecycle.getSnapshot();
  const button: UseGuardedButtonReturn = useGuardedButton({ scope: "form" });
  const devtoolsProps: ActionGuardDevtoolsProviderProps = { children: null };
  ActionGuardDevtoolsProvider(devtoolsProps);
  const dialog: UseDialogStateReturn = useDialogState();
  void [blocked, snapshot, button, dialog];
}
