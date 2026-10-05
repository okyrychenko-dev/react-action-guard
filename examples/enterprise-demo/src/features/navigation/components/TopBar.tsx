import { Button } from "@heroui/react";
import type { ReactElement } from "react";

interface TopBarProps {
  onReset: VoidFunction;
}

export function TopBar(props: TopBarProps): ReactElement {
  const { onReset } = props;

  return (
    <header className="col-span-full row-start-1 flex items-center justify-between px-5 bg-slate-800 border-b border-white/7 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500 to-teal-700 grid place-items-center text-white text-[11px] font-extrabold tracking-[0.05em] shrink-0">
          AG
        </div>
        <span className="text-slate-100 text-[15px] font-semibold">ActionGuard Enterprise</span>
        <span className="px-1.5 py-0.5 rounded bg-teal-500/25 text-teal-300 text-[11px] font-semibold tracking-[0.04em] uppercase">
          isolated session
        </span>
      </div>
      <Button size="sm" variant="secondary" onPress={onReset}>
        Reset demo
      </Button>
    </header>
  );
}
