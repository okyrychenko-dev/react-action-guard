export interface PaymentSettingsState {
  gatewayUrl: string;
  apiKey: string;
}

export interface UsePaymentSettingsReturn extends PaymentSettingsState {
  statusLabel: string;
  statusColor: "warning" | "success";
  setGatewayUrl: (value: string) => void;
  setApiKey: (value: string) => void;
  saveChanges: VoidFunction;
}
