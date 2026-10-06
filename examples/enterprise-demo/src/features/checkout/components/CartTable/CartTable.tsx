import { Table } from "@heroui/react";
import { CartTableRow } from "./CartTableRow";
import type { ReactElement } from "react";
import type { CartLine } from "../../checkout.types";

interface CartTableProps {
  lines: ReadonlyArray<CartLine>;
}

export function CartTable(props: CartTableProps): ReactElement {
  const { lines } = props;

  return (
    <Table className="data-table" aria-label="Cart lines">
      <Table.Content>
        <Table.Header>
          <Table.Column isRowHeader>SKU</Table.Column>
          <Table.Column>Item</Table.Column>
          <Table.Column>Qty</Table.Column>
          <Table.Column>Total</Table.Column>
          <Table.Column>Risk</Table.Column>
        </Table.Header>
        <Table.Body>
          {lines.map((line) => (
            <CartTableRow key={line.id} line={line} />
          ))}
        </Table.Body>
      </Table.Content>
    </Table>
  );
}
