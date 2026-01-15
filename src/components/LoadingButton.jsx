import React from "react";

/**
 * LoadingButton component - Reusable button with loading state
 * @param {boolean} loading - Whether the button is in loading state
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} loadingText - Text to show when loading
 * @param {string} children - Button text when not loading
 * @param {string} type - Button type (submit, button, etc.)
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {boolean} fullWidth - Whether button should be full width
 */
const LoadingButton = ({
  loading = false,
  disabled = false,
  loadingText = "Loading...",
  children,
  type = "submit",
  onClick,
  className = "",
  fullWidth = true,
}) => {
  const baseClass = fullWidth ? "btn-primary w-full" : "btn-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${baseClass} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
