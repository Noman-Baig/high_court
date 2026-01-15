// components/DateInput.jsx
import React from "react";
import { useFormContext } from "react-hook-form";

const DateInput = ({
  id,
  name,
  label,
  required = false,
  maxDate = null,
  minDate = null,
  className = "",
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const getMaxDate = () => {
    if (maxDate === "today") return new Date().toISOString().split("T")[0];
    return maxDate;
  };

  return (
    <div>
      <label htmlFor={id} className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="date"
        max={getMaxDate()}
        min={minDate}
        className={`form-input ${
          errors[name] ? "border-red-500" : ""
        } ${className}`}
        {...register(name, {
          required: required ? `${label} is required` : false,
          validate: (value) => {
            if (!value) return true;
            const date = new Date(value);
            const today = new Date();
            if (maxDate === "today" && date > today) {
              return `${label} cannot be in the future`;
            }
            return true;
          },
        })}
        {...props}
      />
      {errors[name] && <p className="form-error">{errors[name].message}</p>}
    </div>
  );
};

export default DateInput;
