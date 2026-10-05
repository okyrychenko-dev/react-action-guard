import {
  createBlockingLifecycle,
  UIBlockingProvider,
  useActionBlocker,
  useIsBlocked,
  type BlockingLifecycleSnapshot,
  type UIBlockingProviderProps,
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
  const blocked: boolean = useIsBlocked("form");
  const lifecycle = createBlockingLifecycle();
  const snapshot: BlockingLifecycleSnapshot = lifecycle.getSnapshot();
  const button: UseGuardedButtonReturn = useGuardedButton({ scope: "form" });
  const devtoolsProps: ActionGuardDevtoolsProviderProps = { children: null };
  ActionGuardDevtoolsProvider(devtoolsProps);
  const dialog: UseDialogStateReturn = useDialogState();
  void [blocked, snapshot, button, dialog];
}
