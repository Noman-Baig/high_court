import React from "react";

/**
 * OTPInput component - Reusable OTP/PIN input field with validation
 * @param {string} id - Input field ID
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {number} maxLength - Max length (default: 6)
 * @param {string} label - Input label
 * @param {object} error - Error object from form validation
 * @param {object} register - React Hook Form register function
 * @param {string} name - Input name
 */
const OTPInput = ({
  id = "otp",
  value,
  onChange,
  placeholder = "Enter 6-digit OTP",
  maxLength = 6,
  label = "Verification OTP",
  error,
  register,
  name = "otp",
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="one-time-code"
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...(register
          ? register(name, {
              required: `${label} is required`,
              pattern: {
                value: new RegExp(`^\\d{${maxLength}}$`),
                message: `${label} must be ${maxLength} digits`,
              },
            })
          : {})}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
