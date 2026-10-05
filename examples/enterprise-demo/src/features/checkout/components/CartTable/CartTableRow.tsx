import { Table } from "@heroui/react";
import { formatCurrency } from "../../checkout.utils";
import type { ReactElement } from "react";
import type { CartLine } from "../../checkout.types";

interface CartTableRowProps {
  line: Readonly<CartLine>;
}

export function CartTableRow(props: CartTableRowProps): ReactElement {
  const { line } = props;

  return (
    <Table.Row key={line.id} id={line.id}>
      <Table.Cell>{line.sku}</Table.Cell>
      <Table.Cell>{line.name}</Table.Cell>
      <Table.Cell>{line.quantity}</Table.Cell>
      <Table.Cell>{formatCurrency(line.quantity * line.unitPrice)}</Table.Cell>
      <Table.Cell>{line.riskScore}</Table.Cell>
    </Table.Row>
  );
}
