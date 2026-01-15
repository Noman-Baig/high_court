import React from "react";

/**
 * AuthHeader component - Reusable header for authentication pages
 * @param {string} icon - The type of icon to display ('lock', 'email', 'key')
 * @param {string} title - The main title text
 * @param {string} subtitle - The subtitle/description text
 */
const AuthHeader = ({ icon = "lock", title, subtitle }) => {
  const renderIcon = () => {
    switch (icon) {
      case "lock":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        );
      case "email":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        );
      case "key":
        return (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
        <svg
          className="h-10 w-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {renderIcon()}
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default AuthHeader;
