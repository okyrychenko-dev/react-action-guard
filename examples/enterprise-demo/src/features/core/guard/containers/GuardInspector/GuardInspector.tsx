import { ButtonGroup, Chip, Separator } from "@heroui/react";
import { SectionTitle } from "@shared/components";
import { useState } from "react";
import { AuditLog, BlockerList, ScopeTabBar, SessionSummary } from "../../components";
import { useAuditLog } from "../../hooks";
import { type EnterpriseScope, useEnterpriseBlockingInfo } from "../../scopes";
import { AuditFilterButton } from "./AuditFilterButton";
import { AUDIT_ACTION_FILTERS, AUDIT_SCOPE_FILTERS } from "./GuardInspector.constants";
import { filterAuditEvents } from "./GuardInspector.utils";
import type { ReactElement } from "react";
import type { AuditActionFilter, AuditScopeFilter } from "./GuardInspector.types";

export function GuardInspector(): ReactElement {
  const [selectedScope, setSelectedScope] = useState<EnterpriseScope>("checkout");
  const [auditActionFilter, setAuditActionFilter] = useState<AuditActionFilter>("all");
  const [auditScopeFilter, setAuditScopeFilter] = useState<AuditScopeFilter>("all");
  const blockers = useEnterpriseBlockingInfo(selectedScope);
  const { events, rejections, clearEvents } = useAuditLog();
  const filteredEvents = filterAuditEvents(events, {
    action: auditActionFilter,
    scope: auditScopeFilter,
  });

  const chipColor = blockers.length > 0 ? "warning" : "success";

  return (
    <div className="p-5 flex flex-col gap-4" aria-label="Guard inspector">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle eyebrow="Guard state" title="Blocker inspector" />
        <Chip color={chipColor} variant="soft" size="sm">
          {blockers.length} active
        </Chip>
      </div>

      <ScopeTabBar selectedScope={selectedScope} onScopeChange={setSelectedScope} />
      <BlockerList blockers={blockers} />
      <SessionSummary events={events} rejections={rejections} />
      <div className="flex flex-col gap-2" aria-label="Audit filters">
        <ButtonGroup size="sm" variant="secondary" className="flex flex-wrap gap-2">
          {AUDIT_SCOPE_FILTERS.map((scope) => (
            <AuditFilterButton
              key={scope}
              value={scope}
              currentFilter={auditScopeFilter}
              onSelect={setAuditScopeFilter}
            />
          ))}
        </ButtonGroup>
        <ButtonGroup size="sm" variant="secondary" className="flex flex-wrap gap-2">
          {AUDIT_ACTION_FILTERS.map((action) => (
            <AuditFilterButton
              key={action}
              value={action}
              currentFilter={auditActionFilter}
              onSelect={setAuditActionFilter}
            />
          ))}
        </ButtonGroup>
      </div>
      <Separator />
      <AuditLog events={filteredEvents} onClear={clearEvents} />
    </div>
  );
}
