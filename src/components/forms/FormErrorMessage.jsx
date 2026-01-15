// components/ErrorDisplay.jsx
import React from "react";

const ErrorDisplay = ({ errors, type = "error", className = "" }) => {
  if (!errors || errors.length === 0) return null;

  const bgColor =
    type === "error"
      ? "bg-red-50 border-red-200"
      : "bg-yellow-50 border-yellow-200";
  const textColor = type === "error" ? "text-red-800" : "text-yellow-800";

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-4 ${className}`}>
      <div className="space-y-1">
        {Array.isArray(errors) ? (
          errors.map((error, index) => (
            <p key={index} className={`text-sm ${textColor}`}>
              • {error}
            </p>
          ))
        ) : (
          <p className={`text-sm ${textColor}`}>• {errors}</p>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
