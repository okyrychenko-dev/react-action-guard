import { Input, Label, TextField } from "@heroui/react";
import type { ReactElement } from "react";

interface CheckoutFormFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function CheckoutFormField(props: CheckoutFormFieldProps): ReactElement {
  const { label, value, disabled, onChange } = props;

  return (
    <TextField value={value} isDisabled={disabled} onChange={onChange} className="min-w-0">
      <Label className="flex flex-col gap-1.5 text-slate-700 text-[13px] font-medium">
        {label}
      </Label>
      <Input />
    </TextField>
  );
}
