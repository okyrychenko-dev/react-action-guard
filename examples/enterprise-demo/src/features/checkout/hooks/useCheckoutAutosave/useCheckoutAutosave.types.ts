export interface CheckoutAutosaveOptions {
  enabled: boolean;
  dirty: boolean;
  blocked: boolean;
  address: string;
  paymentReference: string;
  onSave: VoidFunction;
}
