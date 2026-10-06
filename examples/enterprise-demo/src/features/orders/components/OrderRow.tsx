import { Button, Chip, Table } from "@heroui/react";
import {
  formatAmount,
  getRiskChipColor,
  getRiskLabel,
  getStatusChipColor,
  getStatusLabel,
} from "../orders.utils";
import type { ReactElement } from "react";
import type { Order } from "../orders.types";

interface OrderRowProps {
  order: Order;
  actionDisabled: boolean;
}

export function OrderRow(props: OrderRowProps): ReactElement {
  const { order, actionDisabled } = props;

  return (
    <Table.Row id={order.id}>
      <Table.Cell className="font-mono text-[13px] text-slate-700">{order.id}</Table.Cell>
      <Table.Cell className="text-slate-900 font-medium">{order.customer}</Table.Cell>
      <Table.Cell className="tabular-nums text-slate-900">{formatAmount(order.amount)}</Table.Cell>
      <Table.Cell>
        <Chip color={getStatusChipColor(order.status)} variant="soft" size="sm">
          {getStatusLabel(order.status)}
        </Chip>
      </Table.Cell>
      <Table.Cell>
        <Chip color={getRiskChipColor(order.risk)} variant="soft" size="sm">
          {getRiskLabel(order.risk)}
        </Chip>
      </Table.Cell>
      <Table.Cell className="text-slate-500 text-[13px]">{order.date}</Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            isDisabled={actionDisabled}
            aria-label={`Void order ${order.id}`}
          >
            Void
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isDisabled={actionDisabled}
            aria-label={`Refund order ${order.id}`}
          >
            Refund
          </Button>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
