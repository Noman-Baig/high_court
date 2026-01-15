import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthHeader from "../components/AuthHeader";

import useOTPTimer from "../hooks/useOTPTimer";
import OTPVerification from "../components/forms/OTPVerification";
import FormErrorMessage from "../components/forms/FormErrorMessage";
import logo from "../logo.png";
import ModernFileUpload from "../components/ModernFileUpload";

export default function Register({ onToggleMode }) {
  const API_BASE = "https://www.gextoncloud.com/gexton_hcba_new/public/api";

  const [formData, setFormData] = useState({
    date: "",
    proposedName: "",
    proposerName: "",
    seconderName: "",
    advocateName: "",
    relation: "",
    cast: "",
    nic: "",
    gender: "",
    registrationNo: "",
    officeAddress: "",
    phoneMobile: "",
    residentialAddress: "",
    email: "",
    enrollmentDate: "",
    highCourtEnrollmentDate: "",
    dob: "",
    bloodGroup: "",
    districtBar: "",
    otherBar: "",
    password: "",
    cnicFrontFile: null,
    licenseFile: null,
    idCardFile: null,
    passportPhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendOTPLoading, setSendOTPLoading] = useState(false);
  const [verifyOTPLoading, setVerifyOTPLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cnicDisplay, setCnicDisplay] = useState("");

  const { timeRemaining, isTimerActive, startTimer, formatTime } = useOTPTimer(
    "register_otp_timer",
    300
  );

  // Format CNIC for display: 12345-1234567-1
  const formatCNIC = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(
      12,
      13
    )}`;
  };

  // Initialize CNIC display from initial state
  useEffect(() => {
    if (formData.nic) {
      setCnicDisplay(formatCNIC(formData.nic));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const styles = {
    fields: {
      display: "inline-block",
      width: "260px",
      margin: "0 8px",
      border: "none",
      borderBottom: "2px solid #e0e0e0", // default underline
      background: "transparent",
      padding: "10px 0 8px", // comfortable typing space
      fontSize: "15px",
      color: "#333",
      outline: "none",
      transition:
        "border-bottom-color 0.3s ease, border-bottom-width 0.3s ease",
      fontFamily: "Lato",
    },
    page: {
      maxWidth: 768,
      margin: "0 auto",
      height: "1000px",
      overflowX: "scroll",
      padding: "16px",
      // fontFamily: "Georgia, 'Times New Roman', serif",
      fontFamily: "Lato",
      color: "#111827",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    headerRow: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      alignItems: "flex-start",
    },
    headerCenter: { flex: 1, textAlign: "center", minWidth: 200 },
    photoBox: {
      width: 96,
      height: 96,
      border: "1px solid #d1d5db",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      overflow: "hidden",
      marginTop: 8,
    },
    smallText: { fontSize: 13, color: "#374151" },
    inputBase: {
      borderBottom: "1px solid #374151 !important",
      background: "transparent !important",
      padding: "6px 0",
      color: "inherit",
      fontSize: 15,
      width: "100%",
    },
    labelStack: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      alignItems: "flex-start",
      flex: 1,
    },
    labelText: {
      fontSize: 14,
      fontWeight: 500,
      flexShrink: 0,
    },
    inputWrapper: {
      width: "100%",
    },
    rowTwo: { display: "flex", gap: 12, flexWrap: "wrap" },
    fileSection: {
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: 12,
    },
    btnPrimary: {
      backgroundColor: "#06a652",
      color: "#fff",
      border: "none",
      padding: "12px 16px",
      borderRadius: 8,
      width: "100%",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: 15,
    },
    linkButton: {
      background: "none",
      border: "none",
      color: "#06a652",
      cursor: "pointer",
      fontWeight: 600,
    },
    errorList: { color: "#b91c1c", fontSize: 13, lineHeight: 1.4 },
    flexBetween: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    inputSmall: {
      padding: "8px 10px",
      borderRadius: 8,
      border: "1px solid #e6e6e6 !important",
      width: "100%",
    },
    passwordWrapper: {
      position: "relative",
    },
    eyeButton: {
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0 8px",
      display: "flex",
      alignItems: "center",
      color: "#6b7280",
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    const file = files[0];

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Max 2 MB.");
      e.target.value = "";
      return;
    }

    setFormData((s) => ({ ...s, [name]: file }));

    if (name === "passportPhoto") {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const validate = () => {
    const errs = [];
    const requiredText = [
      ["proposerName", "Proposer Name"],
      ["seconderName", "Seconder Name"],
      ["advocateName", "Advocate / Applicant Name"],
      ["relation", "Guardian (S/o, D/o, W/o)"],
      ["cast", "Caste"],
      ["registrationNo", "Bar License / Registration Number"],
      ["residentialAddress", "Present Address"],
      ["districtBar", "District Bar Member"],
      ["otherBar", "Other Bar Member"],
      ["email", "Email"],
      ["phoneMobile", "Phone / Mobile"],
      ["enrollmentDate", "Date of Enrollment (As an Advocate)"],
      ["dob", "Date of Birth"],
      ["password", "Password"],
    ];

    requiredText.forEach(([k, label]) => {
      if (!formData[k] || String(formData[k]).trim() === "") {
        errs.push(`${label} is required.`);
      }
    });

    if (!formData.nic) errs.push("NIC / CNIC is required.");
    else {
      const digits = String(formData.nic).replace(/\D/g, "");
      if (digits.length !== 13) errs.push("CNIC must be exactly 13 digits.");
    }

    if (formData.email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(formData.email)) errs.push("Email format is invalid.");
    }

    if (formData.phoneMobile && formData.phoneMobile.length > 20)
      errs.push("Phone must be max 20 characters.");

    if (formData.password && formData.password.length < 6)
      errs.push("Password must be at least 6 characters.");

    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();
      if (dob > today) errs.push("Date of Birth cannot be in the future.");
    }

    if (!formData.cnicFrontFile) errs.push("CNIC front image is required.");

    const fileChecks = [
      ["cnicFrontFile", ["image/", ".pdf"]],
      ["licenseFile", ["image/", ".pdf"]],
      ["idCardFile", ["image/", ".pdf"]],
      ["passportPhoto", ["image/"]],
    ];

    fileChecks.forEach(([key, allowed]) => {
      const f = formData[key];
      if (!f) return;
      const mime = f.type || "";
      const nameLower = f.name ? f.name.toLowerCase() : "";
      const ok =
        allowed.some((a) =>
          a.startsWith(".") ? nameLower.endsWith(a) : mime.startsWith(a)
        ) || false;
      if (!ok) errs.push(`${f.name || key} has an invalid file type.`);
      if (f.size && f.size > 2 * 1024 * 1024)
        errs.push(`${f.name || key} must be <= 2 MB.`);
    });

    return errs;
  };

  const submitRegister = async () => {
    setErrors([]);
    setMessage(null);

    const errs = validate();
    if (errs.length) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = new FormData();
    payload.append("proposer_name", formData.proposerName);
    payload.append("seconder_name", formData.seconderName);
    payload.append("name", formData.advocateName);
    payload.append("guardian_name", formData.relation);
    payload.append("date_of_birth", formData.dob);
    payload.append("caste", formData.cast);
    payload.append("cnic", String(formData.nic).replace(/\D/g, ""));
    payload.append("gender", formData.gender);
    payload.append("bar_license_number", formData.registrationNo);
    payload.append("present_address", formData.residentialAddress);
    if (formData.officeAddress)
      payload.append("office_address", formData.officeAddress);
    payload.append("date_of_enrollment_as_advocate", formData.enrollmentDate);
    if (formData.highCourtEnrollmentDate)
      payload.append(
        "date_of_enrollment_as_advocate_high_court",
        formData.highCourtEnrollmentDate
      );
    payload.append("district_bar_member", formData.districtBar);
    payload.append("other_bar_member", formData.otherBar);
    payload.append("email", formData.email);
    payload.append("phone", formData.phoneMobile);
    payload.append("password", formData.password);

    if (formData.cnicFrontFile)
      payload.append(
        "cnic_front_image",
        formData.cnicFrontFile,
        formData.cnicFrontFile.name
      );
    if (formData.idCardFile)
      payload.append(
        "idcard_of_highcourt",
        formData.idCardFile,
        formData.idCardFile.name
      );
    if (formData.licenseFile)
      payload.append(
        "license_ofhighcourt",
        formData.licenseFile,
        formData.licenseFile.name
      );
    if (formData.passportPhoto)
      payload.append(
        "passport_image",
        formData.passportPhoto,
        formData.passportPhoto.name
      );

    try {
      setLoading(true);
      console.log("Submitting registration:", formData);
      const res = await axios.post(`${API_BASE}/register`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res && (res.status === 200 || res.status === 201)) {
        localStorage.removeItem("register_otp_timer");
        setMessage(null);
        setErrors([]);
        setSavedEmail(formData.email);
        setShowOtpScreen(true);
      }
    } catch (err) {
      console.error(err);
      const serverErrors = [];
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (d.errors) {
          Object.values(d.errors).forEach((arr) => {
            if (Array.isArray(arr)) arr.forEach((m) => serverErrors.push(m));
            else serverErrors.push(String(arr));
          });
        } else if (d.message) serverErrors.push(d.message);
        else
          serverErrors.push("Registration failed. Check console for details.");
      } else {
        serverErrors.push("Network error. Check your connection or backend.");
      }
      setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedEmail(formData.email);
    setShowOtpScreen(true);
    // submitRegister();
  };

  const handleVerifyOtp = async () => {
    if (!otpValue || !savedEmail) {
      setErrors(["OTP and email are required for verification."]);
      return;
    }
    setErrors([]);
    setMessage(null);
    setVerifyOTPLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/register/otp/verify`, {
        email: savedEmail,
        otp: otpValue,
      });
      if (res && (res.status === 200 || res.status === 201)) {
        setMessage("OTP verified — registration complete.");
      } else {
        setErrors(["OTP verification failed."]);
      }
    } catch (err) {
      console.error("OTP verify error", err);
      const serverErrors = [];
      if (err.response && err.response.data) {
        const d = err.response.data;
        if (d.errors) {
          Object.values(d.errors).forEach((arr) => {
            if (Array.isArray(arr)) arr.forEach((m) => serverErrors.push(m));
            else serverErrors.push(String(arr));
          });
        } else if (d.message) serverErrors.push(d.message);
        else serverErrors.push("OTP verification failed.");
      } else {
        serverErrors.push("Network error during OTP verification.");
      }
      setErrors(serverErrors);
    } finally {
      setVerifyOTPLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!savedEmail) return setErrors(["No email found to send OTP."]);
    setMessage(null);
    setErrors([]);
    setSendOTPLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/register/otp/send`, {
        email: savedEmail,
      });

      if (response.status === 200 || response.status === 201) {
        startTimer();
        setMessage("OTP has been sent to your email. Check your inbox.");
      } else {
        setErrors(["Failed to send OTP. Please try again."]);
      }
    } catch (err) {
      console.error("OTP send error:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to send OTP. Please try again.";
      setErrors([errorMsg]);
    } finally {
      setSendOTPLoading(false);
    }
  };

  if (showOtpScreen) {
    return (
      <div
        style={{ maxWidth: 420, width: "100%", margin: "0 auto", padding: 24 }}
      >
        <AuthHeader
          icon="email"
          title="OTP Verification"
          subtitle="Enter the OTP sent to your email"
        />

        <OTPVerification
          email={savedEmail}
          otpValue={otpValue}
          setOtpValue={setOtpValue}
          sendOTPLoading={sendOTPLoading}
          verifyOTPLoading={verifyOTPLoading}
          errors={errors}
          message={message}
          onVerify={handleVerifyOtp}
          onResend={handleSendOtp}
          onBack={() => {
            setShowOtpScreen(false);
            setOtpValue("");
            setMessage(null);
            setErrors([]);
          }}
          timeRemaining={timeRemaining}
          isTimerActive={isTimerActive}
          formatTime={formatTime}
          verifyButtonText="Verify & Complete Registration"
          resendButtonText="Send OTP"
          backButtonText="Back"
          autoSend={false}
        />

        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          © 2025 High Court Bar Council. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <form
        onSubmit={handleSubmit}
        style={styles.form}
        encType="multipart/form-data"
      >
        <FormErrorMessage errors={errors} type="error" />

        <div style={styles.headerRow}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={logo}
                alt="HCBA Logo"
                style={{ maxHeight: 80, objectFit: "contain" }}
              />
            </div>

            <div style={styles.headerCenter}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  color: "#16a34a",
                  fontWeight: 600,
                }}
              >
                FORM FOR ADMISSION AS MEMBER
              </h1>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                of High Court Bar Association, Hyderabad
              </h2>
              <p
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  fontStyle: "italic",
                  textDecoration: "underline",
                  color: "#16a34a",
                }}
              >
                Regular Member/Associate Member
              </p>
            </div>

            <div style={styles.photoBox}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Passport Photo Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "Photograph"
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
            <div>The General Secretary,</div>
            <div>High Court Bar Association,</div>
            <div>Hyderabad.</div>
          </div>

          <div style={{ textAlign: "right", fontSize: 14 }}>
            <div style={{ fontWeight: 600 }}>
              Dated:{" "}
              {new Date()
                .toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\//g, "-")}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 14 }}>
          <p style={{ lineHeight: 1.6 }}>
            Dear Sir, I hereby propose the name of Mr.
            <input
              name="proposedName"
              value={formData.proposedName}
              onChange={handleChange}
              required
              placeholder="Proposed Name"
              style={styles.fields}
            />
            for the membership of the High Court Bar Association, Hyderabad and
            request you to place this application before the Managing Committee
            for consideration and disposal according to the relevant rules.
          </p>

          <div style={{ marginTop: 12 }}>
            <div style={{ textAlign: "right" }}>Your's Faithfully.</div>
          </div>
        </div>

        {/* Proposer */}
        <div style={{ fontSize: 14 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 13, fontStyle: "italic" }}>(PROPOSER)</div>
          </div>

          <div style={{ marginTop: 8 }}>
            <label style={styles.labelStack}>
              <span style={{ ...styles.labelText, fontWeight: 600 }}>
                NAME OF THE PROPOSER:
              </span>
              <div style={styles.inputWrapper}>
                <input
                  name="proposerName"
                  value={formData.proposerName}
                  onChange={handleChange}
                  required
                  style={styles.fields}
                  placeholder="In Block Letters"
                />
              </div>
            </label>
          </div>
        </div>

        <div style={{ fontSize: 14 }}>
          <p style={{ lineHeight: 1.6, fontStyle: "italic" }}>
            I, hereby second the above proposal.
          </p>
        </div>

        {/* Seconder */}
        <div style={{ fontSize: 14 }}>
          <label style={styles.labelStack}>
            <span style={{ ...styles.labelText, fontWeight: 600 }}>
              NAME OF THE SECONDER:
            </span>
            <div style={styles.inputWrapper}>
              <input
                name="seconderName"
                value={formData.seconderName}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="In Block Letters"
              />
            </div>
          </label>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ fontSize: 13, fontStyle: "italic" }}>(SECONDER)</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={styles.labelStack}>
            <span style={styles.labelText}>Advocate's Name:</span>
            <div style={styles.inputWrapper}>
              <input
                name="advocateName"
                value={formData.advocateName}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Advocate's Name (Block Letters)"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>S/o, D/o, W/o:</span>
            <div style={styles.inputWrapper}>
              <input
                name="relation"
                value={formData.relation}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Relation"
              />
            </div>
          </label>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={styles.labelStack}>
              <span style={styles.labelText}>Cast:</span>
              <div style={styles.inputWrapper}>
                <input
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  required
                  style={styles.fields}
                  placeholder="Cast"
                />
              </div>
            </label>

            <label style={styles.labelStack}>
              <span style={styles.labelText}>NIC #</span>
              <div style={styles.inputWrapper}>
                <input
                  name="nic"
                  value={cnicDisplay}
                  onChange={(e) => {
                    const value = e.target.value;
                    const digits = value.replace(/\D/g, "").slice(0, 13);
                    setCnicDisplay(formatCNIC(digits));
                    setFormData((prev) => ({ ...prev, nic: digits }));
                  }}
                  required
                  placeholder="12345-1234567-1"
                  style={styles.fields}
                />
              </div>
            </label>
          </div>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Gender:</span>
            <div style={styles.inputWrapper}>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={styles.fields}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Registration No.</span>
            <div style={styles.inputWrapper}>
              <input
                name="registrationNo"
                value={formData.registrationNo}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Registration Number / Bar License"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Office Address:</span>
            <div style={styles.inputWrapper}>
              <input
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                style={styles.fields}
                placeholder="Office Address"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Phone/Mobile:</span>
            <div style={styles.inputWrapper}>
              <input
                name="phoneMobile"
                value={formData.phoneMobile}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Phone or Mobile"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Residential Address:</span>
            <div style={styles.inputWrapper}>
              <input
                name="residentialAddress"
                value={formData.residentialAddress}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Residential Address"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Email:</span>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Email Address"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>Password:</span>
            <div style={{ ...styles.inputWrapper, ...styles.passwordWrapper }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ ...styles.fields, paddingRight: 35 }}
                placeholder="Set password (min 6 chars)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={styles.labelStack}>
              <span style={styles.labelText}>
                Date of Enrollment (As an Advocate):
              </span>
              <div style={styles.inputWrapper}>
                <input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate || ""}
                  onChange={handleChange}
                  required
                  style={styles.fields}
                />
              </div>
            </label>

            <label style={styles.labelStack}>
              <span style={styles.labelText}>
                Date of Enrollment (High Court):
              </span>
              <div style={styles.inputWrapper}>
                <input
                  type="date"
                  name="highCourtEnrollmentDate"
                  value={formData.highCourtEnrollmentDate || ""}
                  onChange={handleChange}
                  style={styles.fields}
                />
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={styles.labelStack}>
              <span style={styles.labelText}>Date of Birth</span>
              <div style={styles.inputWrapper}>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  style={styles.fields}
                />
              </div>
            </label>

            <label style={styles.labelStack}>
              <span style={styles.labelText}>Blood Group</span>
              <div style={styles.inputWrapper}>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  style={{ ...styles.fields, padding: "6px 8px" }}
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </label>
          </div>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>
              District Bar Association, Membership Please indicate:
            </span>
            <div style={styles.inputWrapper}>
              <input
                name="districtBar"
                value={formData.districtBar}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="District Bar Association"
              />
            </div>
          </label>

          <label style={styles.labelStack}>
            <span style={styles.labelText}>
              If a member of other Bar Association, Please indicate:
            </span>
            <div style={styles.inputWrapper}>
              <input
                name="otherBar"
                value={formData.otherBar}
                onChange={handleChange}
                required
                style={styles.fields}
                placeholder="Other Bar Association"
              />
            </div>
          </label>
        </div>

        <p style={{ fontSize: 14, marginTop: 8 }}>
          Hereby request for enlisted as member in the role of the advocates of
          High Court Bar Association, Hyderabad Sindh.
        </p>

        <div
          style={{
            background: "white",
            borderRadius: "20px",
            // padding: "32px",
            // boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
            marginTop: "32px",
            // border: "1px solid #f0f0f0",
          }}
        >
          <h3
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#333",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            Attachments
          </h3>
          <p
            style={{
              textAlign: "center",
              color: "#666",
              fontSize: "0.95rem",
              marginBottom: "32px",
            }}
          >
            Accepted: Images (JPG, PNG) or PDF • Max 2MB each
          </p>

          <div
            style={{
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            }}
          >
            {/* CNIC Front - Required */}
            <ModernFileUpload
              label="CNIC (Front)"
              description="Required"
              accept="image/*,.pdf"
              file={formData.cnicFrontFile}
              onChange={handleFileChange}
              onRemove={() =>
                setFormData((s) => ({ ...s, cnicFrontFile: null }))
              }
              required
            />

            {/* High Court License */}
            <ModernFileUpload
              label="License of High Court"
              description="Front / Back if separate"
              accept="image/*,.pdf"
              file={formData.licenseFile}
              onChange={handleFileChange}
              onRemove={() => setFormData((s) => ({ ...s, licenseFile: null }))}
            />

            {/* High Court ID Card */}
            <ModernFileUpload
              label="ID Card of High Court"
              accept="image/*,.pdf"
              file={formData.idCardFile}
              onChange={handleFileChange}
              onRemove={() => setFormData((s) => ({ ...s, idCardFile: null }))}
            />

            {/* Passport Photo with Live Preview */}
            <ModernFileUpload
              label="Passport Size Photograph"
              description="In Court Dress • Clear headshot"
              accept="image/*"
              file={formData.passportPhoto}
              preview={photoPreview}
              onChange={(e) => {
                handleFileChange(e);
                const file = e.target.files?.[0];
                if (file) {
                  if (photoPreview) URL.revokeObjectURL(photoPreview);
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
              onRemove={() => {
                setFormData((s) => ({ ...s, passportPhoto: null }));
                if (photoPreview) {
                  URL.revokeObjectURL(photoPreview);
                  setPhotoPreview(null);
                }
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  className="animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  style={{ marginRight: 8 }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    style={{ opacity: 0.25 }}
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Registration"
            )}
          </button>

          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#6b7280",
              marginTop: 16,
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              style={styles.linkButton}
            >
              Login here
            </button>
          </p>
        </div>
      </form>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          /* Desktop/Tablet: Show labels and inputs in row */
          label[style*="flex: 1"] {
            flex-direction: row !important;
            gap: 8px !important;
            align-items: center !important;
          }
          label[style*="flex: 1"] span {
            white-space: nowrap !important;
          }
          label[style*="flex: 1"] > div {
            flex: 1 !important;
            min-width: 150px !important;
            width: auto !important;
          }
        }

        @media (max-width: 767px) {
          /* Mobile: Stack labels and inputs vertically */
          label[style*="flex: 1"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
          label[style*="flex: 1"] > div {
            width: 100% !important;
          }
        }

        /* Loading spinner animation */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
