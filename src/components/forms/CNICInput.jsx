// components/CNICInput.jsx
import React from "react";

const formatCNIC = (value = "") => {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

const CNICInput = React.forwardRef(
  (
    {
      id,
      label,
      value,
      onChange,
      error,
      required = true,
      placeholder = "12345-1234567-1",
      ...props
    },
    ref
  ) => {
    const handleChange = (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length > 5 && value.length <= 12) {
        value = `${value.slice(0, 5)}-${value.slice(5)}`;
      } else if (value.length > 12) {
        value = `${value.slice(0, 5)}-${value.slice(5, 12)}-${value.slice(
          12,
          13
        )}`;
      }
      e.target.value = value;
      onChange && onChange(e);
    };

    return (
      <div>
        {label && (
          <label htmlFor={id} className="form-label">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type="text"
          value={formatCNIC(value)}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={15}
          className={`form-input ${error ? "border-red-500" : ""}`}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

CNICInput.displayName = "CNICInput";

export default CNICInput;
