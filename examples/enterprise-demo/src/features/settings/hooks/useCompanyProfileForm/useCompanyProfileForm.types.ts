export interface CompanyProfileFormState {
  companyName: string;
  taxId: string;
  businessAddress: string;
}

export interface UseCompanyProfileFormReturn extends CompanyProfileFormState {
  statusLabel: string;
  statusColor: "warning" | "success";
  setCompanyName: (value: string) => void;
  setTaxId: (value: string) => void;
  setBusinessAddress: (value: string) => void;
  saveChanges: VoidFunction;
}
