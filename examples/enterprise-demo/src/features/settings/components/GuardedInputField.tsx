import { Input, Label, TextField } from "@heroui/react";
import { useGuardedField } from "@okyrychenko-dev/react-action-guard-ui";
import type { ReactElement } from "react";

interface GuardedInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}

export function GuardedInputField(props: GuardedInputFieldProps): ReactElement {
  const { label, value, onChange, type = "text" } = props;

  const { fieldState } = useGuardedField();

  return (
    <TextField
      value={value}
      onChange={onChange}
      isDisabled={fieldState.disabled}
      className="min-w-0"
    >
      <Label className="text-slate-700 text-[13px] font-medium">{label}</Label>
      <Input type={type} />
    </TextField>
  );
}
