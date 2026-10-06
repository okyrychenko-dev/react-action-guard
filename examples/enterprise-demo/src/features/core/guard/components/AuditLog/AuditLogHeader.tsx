import { Button } from "@heroui/react";
import type { ReactElement } from "react";

interface AuditLogHeaderProps {
  isExportDisabled: boolean;
  onExport: VoidFunction;
  onClear: VoidFunction;
}

export function AuditLogHeader(props: AuditLogHeaderProps): ReactElement {
  const { isExportDisabled, onExport, onClear } = props;
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="m-0 mb-0.5 text-teal-600 text-[11px] font-bold tracking-widest uppercase">
          Middleware
        </p>
        <h3 className="m-0 text-slate-900 text-[14px] font-semibold">Audit event log</h3>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" isDisabled={isExportDisabled} onPress={onExport}>
          Export
        </Button>
        <Button size="sm" variant="secondary" onPress={onClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
