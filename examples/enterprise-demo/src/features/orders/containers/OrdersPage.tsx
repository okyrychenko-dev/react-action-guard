import { Alert, Button, Card, Chip, EmptyState, Skeleton, Table } from "@heroui/react";
import { useGuardedButton } from "@okyrychenko-dev/react-action-guard-ui";
import { PageHeader } from "@shared/components";
import { OrderRow } from "../components";
import { useOrders } from "../hooks";
import type { ReactElement } from "react";

export function OrdersPage(): ReactElement {
  const query = useOrders();

  const { buttonState } = useGuardedButton({ scope: ["checkout", "payment"] });

  const orders = query.data ?? [];
  const flaggedCount = orders.filter((o) => o.status === "flagged").length;
  const errorMessage =
    query.error instanceof Error ? query.error.message : "Orders could not be loaded.";

  const handleRetry = (): void => {
    void query.refetch();
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Order Management"
        title="Orders"
        description="Void and Refund actions are guarded by the payment scope — block it from the Checkout page to see cross-scope protection in action."
      />

      <div className="flex items-center gap-3">
        <Chip color="default" variant="soft">
          {orders.length} total orders
        </Chip>
        <Chip color="danger" variant="soft">
          {flaggedCount} flagged
        </Chip>
      </div>

      <Card aria-label="Orders table">
        <Card.Content className="flex flex-col gap-4 p-0">
          {query.isError && (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>Orders unavailable</Alert.Title>
                <Alert.Description>
                  <div className="flex flex-col gap-3">
                    <span>{errorMessage}</span>
                    <Button size="sm" variant="secondary" onPress={handleRetry}>
                      Retry orders
                    </Button>
                  </div>
                </Alert.Description>
              </Alert.Content>
            </Alert>
          )}
          <Table className="data-table" aria-label="Order list">
            <Table.Content>
              <Table.Header>
                <Table.Column isRowHeader>Order ID</Table.Column>
                <Table.Column>Customer</Table.Column>
                <Table.Column>Amount</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Risk</Table.Column>
                <Table.Column>Date</Table.Column>
                <Table.Column>Actions</Table.Column>
              </Table.Header>
              <Table.Body>
                {query.isPending &&
                  Array.from({ length: 8 }, (_, i) => (
                    <Table.Row key={i} id={`loading-${i.toString()}`}>
                      <Table.Cell colSpan={7}>
                        <Skeleton className="h-4 rounded" />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                {!query.isPending && !query.isError && orders.length === 0 && (
                  <Table.Row id="orders-empty">
                    <Table.Cell colSpan={7}>
                      <EmptyState className="py-6 text-slate-400 text-[13px]">
                        No orders match this session.
                      </EmptyState>
                    </Table.Cell>
                  </Table.Row>
                )}
                {!query.isPending &&
                  !query.isError &&
                  orders.map((order) => (
                    <OrderRow key={order.id} order={order} actionDisabled={buttonState.disabled} />
                  ))}
              </Table.Body>
            </Table.Content>
          </Table>
        </Card.Content>
      </Card>

      <Alert status="accent">
        <Alert.Content>
          <Alert.Title>Cross-scope guard</Alert.Title>
          <Alert.Description>
            Void and Refund actions are automatically guarded by the checkout and payment scopes.
            Block either scope from the Checkout page to see them disable here.
          </Alert.Description>
        </Alert.Content>
      </Alert>
    </div>
  );
}
