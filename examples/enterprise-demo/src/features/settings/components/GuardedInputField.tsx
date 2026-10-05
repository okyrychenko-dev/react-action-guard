import { Input } from "@heroui/react";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <label className="flex flex-col gap-1.5 text-slate-700 text-[13px] font-medium">
      {label}
      <Input
        value={value}
        onChange={handleChange}
        disabled={fieldState.disabled}
        type={type}
        aria-label={label}
      />
    </label>
  );
}
