import { PageHeader } from "@shared/components";
import {
  OrderExportCard,
  PushPriceUpdateCard,
  SyncInventoryCard,
  ValidatePaymentGatewayCard,
} from "../components";
import type { ReactElement } from "react";

export function IntegrationsPage(): ReactElement {
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="API Integrations"
        title="Integration Hub"
        description="Live API operations powered by TanStack Query with automatic scope-based UI blocking."
      />

      <div className="grid grid-cols-2 gap-4">
        <SyncInventoryCard />
        <PushPriceUpdateCard />
        <ValidatePaymentGatewayCard />
        <OrderExportCard />
      </div>
    </div>
  );
}
