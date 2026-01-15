import React, { useState, useEffect } from "react";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/Auth"; // Adjust path if needed
import Register from "./Registration_Form";
// import Register from "./Registration_Form";

const Login = () => {
  // Form states
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [cnic, setCnic] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const API_BASE = "https://www.gextoncloud.com/gexton_hcba_new/public/api";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cnic: cnic.trim(), password }),
      });

      const data = await res.json();
      console.log("Login response:", data);
      setOtp(data.otp);

      if (data.status !== "success") {
        throw new Error(data.message || "Invalid CNIC or password");
      }

      setEmail(data.email || "");
      setSuccessMsg("OTP has been sent to your registered email");
      setStep(2);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp, email }),
      });

      const data = await res.json();
      console.log("OTP verify response:", data);

      if (data.status !== "success") {
        throw new Error(data.message || "Invalid or expired OTP");
      }

      // Save auth data (adjust according to your Auth context)
      login({
        token: data.token,
        user: data.user,
      });

      // Optional: redirect after login
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    // ... (All your existing styles remain unchanged)
    container: {
      fontFamily: "Montserrat",
      display: "flex",
      alignItems: "start",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#f8fafc",
    },
    grid: {
      display: isMobile ? "block" : "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0",
      width: "100%",
      maxWidth: "97vw",
      height: "100%",
      // padding: "20px",
      borderRadius: "24px",
      overflow: "hidden",
      background: "white",
      boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
    },
    leftPanel: {
      background: "white",
      padding: "60px 50px",
      display: "flex",
      alignItems: "start",
      justifyContent: "center",
    },
    formCard: {
      width: "100%",
      maxWidth: "420px",
    },
    logoContainer: {
      textAlign: "center",
      marginBottom: "40px",
    },
    logoPlaceholder: {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      overflow: "hidden",
    },
    title: {
      fontSize: "2.4rem",
      fontWeight: "700",
      color: "#333",
      textAlign: "center",
      margin: "0 0 12px 0",
    },
    subtitle: {
      textAlign: "center",
      color: "#666",
      fontSize: "1.05rem",
      marginBottom: "40px",
      lineHeight: "1.6",
    },
    urdu: {
      fontFamily: "'Noto Nastaliq Urdu', serif",
      display: "block",
      marginTop: "8px",
      fontSize: "1.1rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      marginBottom: "24px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontWeight: "600",
      color: "#444",
      fontSize: "1rem",
    },
    required: {
      color: "#e74c3c",
    },
    input: {
      padding: "16px 20px",
      borderRadius: "12px",
      border: "2px solid #e0e0e0",
      fontSize: "1.05rem",
      transition: "all 0.3s ease",
      background: "#f8fafc",
    },
    signInButton: {
      padding: "16px",
      background: "linear-gradient(135deg,#4b9f71 0%,rgb(128, 195, 128) 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "1.2rem",
      fontWeight: "600",
      cursor: loading ? "not-allowed" : "pointer",
      marginTop: "12px",
      boxShadow: "0 8px 25px rgba(118, 75, 162, 0.4)",
      transition: "all 0.3s ease",
      opacity: loading ? 0.8 : 1,
    },
    errorMsg: {
      background: "#ffebee",
      color: "#c0392b",
      padding: "14px 18px",
      borderRadius: "12px",
      textAlign: "center",
      fontSize: "0.95rem",
      marginBottom: "20px",
    },
    successMsg: {
      background: "#e8f5e9",
      color: "#2e7d32",
      padding: "14px 18px",
      borderRadius: "12px",
      textAlign: "center",
      fontSize: "0.95rem",
      marginBottom: "20px",
      fontWeight: "500",
    },
    backLink: {
      textAlign: "center",
      marginTop: "20px",
      color: "#764ba2",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "underline",
    },
    links: {
      textAlign: "center",
      margin: "24px 0",
      fontSize: "0.95rem",
      color: "#764ba2",
    },
    link: { color: "#764ba2", textDecoration: "none", fontWeight: "500" },
    separator: { margin: "0 12px", color: "#aaa" },
    contactText: {
      textAlign: "center",
      color: "#444",
      marginBottom: "24px",
      fontFamily: "'Noto Nastaliq Urdu', serif",
      fontSize: "1.1rem",
    },
    registerButtons: { display: "flex", gap: "16px", justifyContent: "center" },
    registerBtn: {
      padding: "14px 24px",
      background: "#f1f5f9",
      color: "#334155",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontWeight: "600",
      cursor: "pointer",
      textAlign: "center",
      transition: "all 0.3s ease",
      minWidth: "140px",
    },
    // Right panel styles unchanged...
    rightPanel: {
      background: "linear-gradient(135deg, #4b9f71 0%,rgb(54, 112, 80) 100%)",
      color: "white",
      padding: "60px 50px",
      display: "flex",
      alignItems: "start",
    },
    infoCard: { width: "100%" },
    infoTitle: {
      fontSize: "2rem",
      fontWeight: "700",
      marginBottom: "12px",
      lineHeight: "1.4",
    },
    infoUrdu: {
      fontFamily: "'Noto Nastaliq Urdu', serif",
      fontSize: "1.4rem",
      marginBottom: "32px",
      opacity: 0.9,
    },
    infoDesc: {
      fontSize: "1.05rem",
      lineHeight: "1.8",
      opacity: 0.9,
      marginBottom: "32px",
    },
    contactInfo: {
      fontSize: "1rem",
      lineHeight: "1.8",
      opacity: 0.85,
      marginBottom: "40px",
    },
    emailLink: { color: "black", textDecoration: "none" },
    videoSection: { marginTop: "40px" },
    videoTitle: {
      fontSize: "1.5rem",
      marginBottom: "24px",
      textAlign: "center",
      fontWeight: "600",
    },
    videoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "20px",
      marginBottom: "32px",
    },
    videoCard: { textDecoration: "none", color: "white", textAlign: "center" },
    videoThumbnail: {
      position: "relative",
      borderRadius: "16px",
      overflow: "hidden",
      marginBottom: "12px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    },
    thumbnailImg: { width: "100%", height: "auto", display: "block" },
    playIcon: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      fontSize: "3rem",
      opacity: 0.9,
    },
    videoLabel: { fontSize: "0.95rem", fontWeight: "500" },
    urduSmall: {
      fontFamily: "'Noto Nastaliq Urdu', serif",
      display: "block",
      marginTop: "4px",
      fontSize: "0.9rem",
      opacity: 0.8,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {/* Left Side - Login Form */}
        <div style={styles.leftPanel}>
          {/* <Register /> */}

          {showRegister ? (
            <Register onToggleMode={() => setShowRegister(false)} />
          ) : (
            <div style={styles.formCard}>
              <div style={styles.logoContainer}>
                <div style={styles.logoPlaceholder}>
                  <img
                    src={logo}
                    alt="HCBA Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <h1 style={styles.title}>Sign In</h1>
              <p style={styles.subtitle}>
                {step === 1
                  ? "Already have an account. Please Sign In"
                  : "Enter the OTP sent to your email"}
                <br />
                <span style={styles.urdu}>
                  {step === 1
                    ? "اگر آپ کا اکاؤنٹ موجود ہے تو براہ مہربانی سائن ان کریں"
                    : "اپنے ای میل پر بھیجا گیا OTP درج کریں"}
                </span>
              </p>

              {error && <div style={styles.errorMsg}>{error}</div>}
              {successMsg && <div style={styles.successMsg}>{successMsg}</div>}

              {step === 1 ? (
                <form onSubmit={handleCredentialsSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      CNIC <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      placeholder="Enter your CNIC (without dashes)"
                      style={styles.input}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Password <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      style={styles.input}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    style={styles.signInButton}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Continue"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      OTP Code <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit OTP"
                      style={styles.input}
                      maxLength={6}
                      required
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    style={styles.signInButton}
                    disabled={loading}
                  >
                    {loading ? "Verifying OTP..." : "Verify & Sign In"}
                  </button>

                  <div
                    style={styles.backLink}
                    onClick={() => {
                      setStep(1);
                      setError("");
                      setSuccessMsg("");
                    }}
                  >
                    ← Back to credentials
                  </div>
                </form>
              )}

              {step === 1 && (
                <>
                  <div style={styles.links}>
                    <a href="#" style={styles.link}>
                      Forgot password?
                    </a>
                    <span style={styles.separator}>•</span>
                    <a href="#" style={styles.link}>
                      پس ورڈ بھول گئے ہیں؟
                    </a>
                  </div>

                  <p style={styles.contactText}>
                    اگر آپ کا اکاؤنٹ نہیں ہے تو نیچے دیے گئے بٹن سے رجسٹر کریں
                  </p>

                  <div style={styles.registerButtons}>
                    <button
                      onClick={() => setShowRegister(true)}
                      style={styles.registerBtn}
                    >
                      Open Registration Form
                      <br />
                      رجسٹریشن
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Side - Info & Videos (unchanged) */}
        <div style={styles.rightPanel}>
          <div style={styles.infoCard}>
            <h2 style={styles.infoTitle}>
              Welcome to HCBA Online Registration Portal
            </h2>
            <p style={styles.infoUrdu}>
              ایچ سی بی اے آن لائن رجسٹریشن پورٹل میں خوش آمدید
            </p>
            <p style={styles.infoDesc}>
              The purpose of our portal is to provide the lawyers' community
              with an easy and convenient platform so they can manage all their
              work effortlessly — including complaints, elections, results,
              library services, welfare activities, committees, and much more.
            </p>
            <p style={styles.contactInfo}>
              For details and Technical Assistance please call us on HCBA Toll
              Free number <strong>0900-78601</strong> From 8:30AM to 4:30PM
              (Monday - Friday)
              <br />
              <br />
              or send us your query in detail (containing CNIC, contact No,
              Trade applied etc) at{" "}
              <a href="mailto:portal@hcba.com" style={styles.emailLink}>
                portal@hcba.com
              </a>
            </p>

            <div style={styles.videoSection}>
              <h3 style={styles.videoTitle}>رہنمائی ویڈیوز</h3>

              <div style={styles.videoGrid}>
                <a
                  href="https://www.youtube.com/watch?v=example1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.videoCard}
                >
                  <div style={styles.videoThumbnail}>
                    <img
                      src="https://img.freepik.com/premium-photo/mallet-gavel-wooden-table-courtroom_23-2147898292.jpg"
                      alt="Candidate Registration"
                      style={styles.thumbnailImg}
                    />
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  <p style={styles.videoLabel}>
                    Advocate Registration
                    <br />
                    <span style={styles.urduSmall}>وکیل رجسٹریشن</span>
                  </p>
                </a>

                <a
                  href="https://www.youtube.com/watch?v=example2"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.videoCard}
                >
                  <div style={styles.videoThumbnail}>
                    <img
                      src="https://img.freepik.com/premium-photo/mallet-gavel-wooden-table-courtroom_23-2147898292.jpg"
                      alt="Institute Registration"
                      style={styles.thumbnailImg}
                    />
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  <p style={styles.videoLabel}>
                    Complaint Registration
                    <br />
                    <span style={styles.urduSmall}>شکایت رجسٹریشن</span>
                  </p>
                </a>

                <a
                  href="https://www.youtube.com/watch?v=example3"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.videoCard}
                >
                  <div style={styles.videoThumbnail}>
                    <img
                      src="https://img.freepik.com/premium-photo/mallet-gavel-wooden-table-courtroom_23-2147898292.jpg"
                      alt="Assessor Registration"
                      style={styles.thumbnailImg}
                    />
                    <div style={styles.playIcon}>▶</div>
                  </div>
                  <p style={styles.videoLabel}>
                    Election Submission
                    <br />
                    <span style={styles.urduSmall}>انتخاب جمع کرانا</span>
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap");
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: "Poppins", sans-serif;
          background: #f8fafc;
        }

        @media (max-width: 1024px) {
          [style*="gridTemplateColumns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          [style*="padding: 60px 50px"] {
            padding: 40px 30px !important;
          }
        }
        @media (max-width: 640px) {
          [style*="gridTemplateColumns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          [style*="display: flex"][style*="gap: 16px"] {
            flex-direction: column !important;
          }
          [style*="fontSize: 2.4rem"] {
            font-size: 2rem !important;
          }
          [style*="fontSize: 2rem"] {
            font-size: 1.7rem !important;
          }
        }
        input:focus {
          border-color: #764ba2 !important;
          box-shadow: 0 0 0 4px rgba(118, 75, 162, 0.2) !important;
        }
        button:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default Login;
