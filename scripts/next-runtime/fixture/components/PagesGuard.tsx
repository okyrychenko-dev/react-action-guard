import { usePagesRouterBlocker } from "@okyrychenko-dev/react-action-guard-router/nextjs";

interface PagesGuardProps {
  confirm: () => Promise<boolean>;
  onBlock: VoidFunction;
  onAllow: VoidFunction;
}

export default function PagesGuard(props: PagesGuardProps) {
  const { confirm, onBlock, onAllow } = props;

  const { isBlocking } = usePagesRouterBlocker({
    when: true,
    message: "Leave protected work?",
    onConfirm: confirm,
    onBlock,
    onAllow,
  });

  return <p>Protection: {String(isBlocking)}</p>;
}
