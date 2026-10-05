import { Card } from "@heroui/react";
import { getSessionSummaryMetrics } from "./SessionSummary.utils";
import type { ReactElement } from "react";
import type { SessionSummaryProps } from "./SessionSummary.types";

export function SessionSummary(props: SessionSummaryProps): ReactElement {
  const { events } = props;

  const metrics = getSessionSummaryMetrics(events);

  return (
    <Card aria-label="Session summary">
      <Card.Content className="grid grid-cols-3 gap-3 py-3">
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-widest text-teal-600">
            Prevented
          </p>
          <strong className="text-lg text-slate-900">{metrics.preventedBlockers}</strong>
        </div>
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-widest text-teal-600">
            Duplicate submits
          </p>
          <strong className="text-lg text-slate-900">{metrics.duplicateSubmitsSuppressed}</strong>
        </div>
        <div>
          <p className="m-0 text-[11px] font-bold uppercase tracking-widest text-teal-600">
            Timeouts
          </p>
          <strong className="text-lg text-slate-900">{metrics.timedOutBlockers}</strong>
        </div>
      </Card.Content>
    </Card>
  );
}
