import { CheckoutFormField } from "./CheckoutFormField";
import type { ReactElement } from "react";

interface CheckoutFormProps {
  address: string;
  paymentReference: string;
  couponCode: string;
  addressDisabled: boolean;
  paymentDisabled: boolean;
  couponDisabled: boolean;
  onAddressChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onCouponChange: (value: string) => void;
}

export function CheckoutForm(props: CheckoutFormProps): ReactElement {
  const {
    address,
    paymentReference,
    couponCode,
    addressDisabled,
    paymentDisabled,
    couponDisabled,
    onAddressChange,
    onPaymentChange,
    onCouponChange,
  } = props;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <CheckoutFormField
        value={address}
        label="Shipping address"
        disabled={addressDisabled}
        onChange={onAddressChange}
      />
      <CheckoutFormField
        value={paymentReference}
        label="Payment reference"
        disabled={paymentDisabled}
        onChange={onPaymentChange}
      />
      <CheckoutFormField
        value={couponCode}
        label="Coupon code"
        disabled={couponDisabled}
        onChange={onCouponChange}
      />
    </div>
  );
}
