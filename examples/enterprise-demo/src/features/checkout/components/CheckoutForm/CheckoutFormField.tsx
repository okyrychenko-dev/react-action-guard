import { Input, Label } from "@heroui/react";
import { type ChangeEvent, type ReactElement } from "react";

interface CheckoutFormFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function CheckoutFormField(props: CheckoutFormFieldProps): ReactElement {
  const { label, value, disabled, onChange } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-1">
      <Label className="flex flex-col gap-1.5 text-slate-700 text-[13px] font-medium">
        {label}
      </Label>
      <Input aria-label={label} value={value} disabled={disabled} onChange={handleChange} />
    </div>
  );
}
