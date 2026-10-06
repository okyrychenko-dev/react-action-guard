import { useEnterpriseIsBlocked } from "@features/core/guard/scopes";
import { useBlockingMutation } from "@okyrychenko-dev/react-action-guard-tanstack";
import { delay } from "@shared/utils";
import { useState } from "react";
import { INITIAL_COMPANY_PROFILE_FORM } from "./useCompanyProfileForm.constants";
import type { UseCompanyProfileFormReturn } from "./useCompanyProfileForm.types";

export function useCompanyProfileForm(): UseCompanyProfileFormReturn {
  const [companyName, setCompanyName] = useState(INITIAL_COMPANY_PROFILE_FORM.companyName);
  const [taxId, setTaxId] = useState(INITIAL_COMPANY_PROFILE_FORM.taxId);
  const [businessAddress, setBusinessAddress] = useState(
    INITIAL_COMPANY_PROFILE_FORM.businessAddress
  );

  const isBlocked = useEnterpriseIsBlocked("checkout");
  const mutation = useBlockingMutation({
    mutationKey: ["settings", "company-profile"],
    mutationFn: async () => {
      await delay(800);
    },
    blockingConfig: {
      scope: "checkout",
      reasonOnPending: "Saving company profile settings...",
      priority: 45,
    },
  });

  return {
    companyName,
    taxId,
    businessAddress,
    statusLabel: isBlocked ? "Guarded" : "Open",
    statusColor: isBlocked ? "warning" : "success",
    setCompanyName,
    setTaxId,
    setBusinessAddress,
    saveChanges: () => {
      mutation.mutate();
    },
  };
}
