// components/forms/OTPVerification.jsx
import React, { useState, useEffect } from "react";
import OTPInput from "./OTPInput";
import LoadingButton from "../LoadingButton";

const OTPVerification = ({
  email,
  otpValue,
  setOtpValue,
  sendOTPLoading,
  verifyOTPLoading,
  errors = [],
  message,
  onVerify,
  onResend,
  onBack,
  timeRemaining,
  isTimerActive,
  formatTime,
  verifyButtonText = "Verify & Continue",
  resendButtonText = "Send OTP",
  backButtonText = "Back",
  autoSend = false, // NEW: control whether to auto-send on mount
  onInitialSend = null, // NEW: callback for initial send
}) => {
  const [initialSendDone, setInitialSendDone] = useState(false);

  // Handle initial auto-send only once
  useEffect(() => {
    if (autoSend && !initialSendDone && email && onInitialSend) {
      setInitialSendDone(true);
      onInitialSend();
    }
  }, [autoSend, initialSendDone, email, onInitialSend]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg bg-white shadow-sm border border-gray-200 p-6">
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{message}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="space-y-1">
              {errors.map((er, i) => (
                <p key={i} className="text-sm text-red-800">
                  • {er}
                </p>
              ))}
            </div>
          </div>
        )}

        {email && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              OTP will be sent to: <strong>{email}</strong>
            </p>
          </div>
        )}

        <OTPInput
          id="otp"
          value={otpValue}
          onChange={(e) => setOtpValue(e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          label="Verification OTP"
        />

        {/* Show different messages based on timer state */}
        <div className="text-center">
          {isTimerActive ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                OTP sent. You can request a new one in:
              </p>
              <p className="text-lg font-bold text-primary">
                {formatTime(timeRemaining)}
              </p>
              <button
                type="button"
                onClick={onResend}
                disabled={sendOTPLoading || isTimerActive}
                className="text-sm text-primary hover:text-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendOTPLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Click the button below to receive OTP
              </p>
              <button
                type="button"
                onClick={onResend}
                disabled={sendOTPLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendOTPLoading ? "Sending..." : resendButtonText}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          {backButtonText}
        </button>
        <LoadingButton
          type="button"
          onClick={onVerify}
          loading={verifyOTPLoading}
          disabled={!otpValue || otpValue.length < 6}
          loadingText="Verifying..."
          fullWidth={false}
          className="flex-1"
        >
          {verifyButtonText}
        </LoadingButton>
      </div>
    </div>
  );
};

export default OTPVerification;
