import { Chip } from "@heroui/react";
import { scopeChipProps } from "./CheckoutStatus.utils";
import type { ReactElement } from "react";

interface CheckoutStatusProps {
  isPaymentBlocked: boolean;
  isInventoryBlocked: boolean;
  isNavigationBlocked: boolean;
}

export function CheckoutStatus(props: CheckoutStatusProps): ReactElement {
  const { isPaymentBlocked, isInventoryBlocked, isNavigationBlocked } = props;

  const payment = scopeChipProps(isPaymentBlocked, "Payment blocked", "Payment open");
  const inventory = scopeChipProps(isInventoryBlocked, "Inventory blocked", "Inventory reserved");
  const navigation = scopeChipProps(isNavigationBlocked, "Navigation blocked", "Navigation open");

  return (
    <div className="flex flex-wrap gap-2">
      <Chip color={payment.color} variant="soft">
        {payment.label}
      </Chip>
      <Chip color={inventory.color} variant="soft">
        {inventory.label}
      </Chip>
      <Chip color={navigation.color} variant="soft">
        {navigation.label}
      </Chip>
    </div>
  );
}
