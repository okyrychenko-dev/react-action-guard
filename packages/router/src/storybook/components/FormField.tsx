import { ChangeEvent, ReactElement } from "react";

interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: "text" | "textarea";
  rows?: number;
  onChange: (value: string) => void;
}

function FormField(props: FormFieldProps): ReactElement {
  const { label, value, placeholder, type = "text", rows = 4, onChange } = props;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {type === "textarea" ? (
        <textarea
          className="form-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          type="text"
          className="form-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default FormField;
