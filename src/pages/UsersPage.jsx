// import React, { useState } from "react";
// import { baseUrl } from "../services/base";
// import { FileImage, LucideLockKeyhole } from "lucide-react";

// const UsersPage = () => {
//   const [activeStep, setActiveStep] = useState("register");
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   // Form fields
//   const [proposerName, setProposerName] = useState("");
//   const [seconderName, setSeconderName] = useState("");
//   const [name, setName] = useState("");
//   const [guardianName, setGuardianName] = useState("");
//   const [dateOfBirth, setDateOfBirth] = useState("");
//   const [gender, setGender] = useState("male");
//   const [role, setRole] = useState("member");
//   const [caste, setCaste] = useState("");
//   const [cnic, setCnic] = useState("");
//   const [barLicenseNumber, setBarLicenseNumber] = useState("");
//   const [presentAddress, setPresentAddress] = useState("");
//   const [dateOfEnrollment, setDateOfEnrollment] = useState("");
//   const [districtBarMember, setDistrictBarMember] = useState("no");
//   const [otherBarMember, setOtherBarMember] = useState("no");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [cnicFrontImage, setCnicFrontImage] = useState(null);
//   const [cnicImageName, setCnicImageName] = useState("");
//   const [otp, setOtp] = useState("");

//   const API_BASE = baseUrl; // Replace with actual baseUrl

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setCnicFrontImage(file);
//       setCnicImageName(file.name);
//     }
//   };

//   const handleRegister = async () => {
//     if (!name || !cnic || !email || !phone || !password || !cnicFrontImage) {
//       setMessage({
//         text: "Please fill all required fields and upload CNIC image",
//         type: "error",
//       });
//       return;
//     }

//     setIsLoading(true);
//     setMessage({ text: "", type: "" });

//     const formdata = new FormData();
//     formdata.append("proposer_name", proposerName);
//     formdata.append("seconder_name", seconderName);
//     formdata.append("name", name);
//     formdata.append("guardian_name", guardianName);
//     formdata.append("date_of_birth", dateOfBirth);
//     formdata.append("gender", gender);
//     formdata.append("role", role);
//     formdata.append("caste", caste);
//     formdata.append("cnic", cnic);
//     formdata.append("bar_license_number", barLicenseNumber);
//     formdata.append("present_address", presentAddress);
//     formdata.append("date_of_enrollment_as_advocate", dateOfEnrollment);
//     formdata.append("district_bar_member", districtBarMember);
//     formdata.append("other_bar_member", otherBarMember);
//     formdata.append("email", email);
//     formdata.append("phone", phone);
//     formdata.append("password", password);
//     formdata.append("cnic_front_image", cnicFrontImage);

//     try {
//       const res = await fetch(`${API_BASE}/register`, {
//         method: "POST",
//         body: formdata,
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({
//           text: "Registration successful! Sending OTP to your email...",
//           type: "success",
//         });
//         setActiveStep("otp-send");
//       } else {
//         setMessage({
//           text: data.message || "Registration failed",
//           type: "error",
//         });
//       }
//     } catch (err) {
//       setMessage({ text: "Network error. Please try again.", type: "error" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSendOtp = async () => {
//     if (!email) return;

//     setIsLoading(true);
//     setMessage({ text: "", type: "" });

//     try {
//       const res = await fetch(`${API_BASE}/register/otp/send`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({ text: "OTP sent successfully!", type: "success" });
//         setActiveStep("otp-verify");
//       } else {
//         setMessage({
//           text: data.message || "Failed to send OTP",
//           type: "error",
//         });
//       }
//     } catch (err) {
//       setMessage({ text: "Network error.", type: "error" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length !== 6) {
//       setMessage({ text: "Please enter a valid 6-digit OTP", type: "error" });
//       return;
//     }

//     setIsLoading(true);
//     setMessage({ text: "", type: "" });

//     try {
//       const res = await fetch(`${API_BASE}/register/otp/verify`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({
//           text: "OTP verified successfully! Your account is now active.",
//           type: "success",
//         });
//         setActiveStep("success");
//       } else {
//         setMessage({ text: data.message || "Invalid OTP", type: "error" });
//       }
//     } catch (err) {
//       setMessage({ text: "Network error.", type: "error" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setProposerName("");
//     setSeconderName("");
//     setName("");
//     setGuardianName("");
//     setDateOfBirth("");
//     setGender("male");
//     setRole("member");
//     setCaste("");
//     setCnic("");
//     setBarLicenseNumber("");
//     setPresentAddress("");
//     setDateOfEnrollment("");
//     setDistrictBarMember("no");
//     setOtherBarMember("no");
//     setEmail("");
//     setPhone("");
//     setPassword("");
//     setCnicFrontImage(null);
//     setCnicImageName("");
//     setOtp("");
//     setActiveStep("register");
//     setMessage({ text: "", type: "" });
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.maxWidth}>
//         {/* Header */}
//         <header style={styles.header}>
//           <div>
//             {/* <div style={styles.headerBadge}>Government Registration Portal</div> */}
//             <h1 style={styles.title}>Advocate Registration Form</h1>
//             <p style={styles.subtitle}>
//               Official membership application for legal practitioners
//             </p>
//           </div>
//         </header>

//         {/* Progress Stepper */}
//         <div style={styles.stepperContainer}>
//           {[
//             {
//               step: "register",
//               number: 1,
//               title: "Application Form",
//               desc: "Personal & Professional Details",
//             },
//             {
//               step: "otp-send",
//               number: 2,
//               title: "Email Verification",
//               desc: "OTP Authentication",
//             },
//             {
//               step: "success",
//               number: 3,
//               title: "Completion",
//               desc: "Confirmation",
//             },
//           ].map((item, idx) => {
//             const isActive =
//               item.step === activeStep ||
//               (item.step === "otp-send" &&
//                 ["otp-send", "otp-verify", "success"].includes(activeStep)) ||
//               (item.step === "success" && activeStep === "success");

//             return (
//               <div key={idx} style={styles.stepItem}>
//                 <div
//                   style={{
//                     ...styles.stepCircle,
//                     background: isActive ? "#018f41" : "#e8e8e8",
//                     color: isActive ? "white" : "#999",
//                     boxShadow: isActive
//                       ? "0 0 0 4px rgba(1,143,65,0.15)"
//                       : "none",
//                   }}
//                 >
//                   {item.number}
//                 </div>
//                 <div style={styles.stepText}>
//                   <p style={styles.stepTitle}>{item.title}</p>
//                   <small style={styles.stepDesc}>{item.desc}</small>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Alert Message */}
//         {message.text && (
//           <div
//             style={{
//               ...styles.alert,
//               background: message.type === "success" ? "#d4edda" : "#f8d7da",
//               borderLeft: `4px solid ${
//                 message.type === "success" ? "#28a745" : "#dc3545"
//               }`,
//               color: message.type === "success" ? "#155724" : "#721c24",
//             }}
//           >
//             <strong>
//               {message.type === "success" ? "✓ Success: " : "✗ Error: "}
//             </strong>
//             {message.text}
//           </div>
//         )}

//         {/* Main Form Card */}
//         <div style={styles.card}>
//           {activeStep === "register" && (
//             <>
//               <div style={styles.sectionHeader}>
//                 <h2 style={styles.sectionTitle}>Application Form</h2>
//                 <p style={styles.sectionSubtitle}>
//                   Please fill in all required fields marked with an asterisk (*)
//                 </p>
//               </div>

//               {/* Personal Information */}
//               <div style={styles.formSection}>
//                 <h3 style={styles.formSectionTitle}>Personal Information</h3>
//                 <div style={styles.formGrid}>
//                   <FormField label="Proposer Name" required={true}>
//                     <input
//                       type="text"
//                       value={proposerName}
//                       onChange={(e) => setProposerName(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter Proposer Name"
//                     />
//                   </FormField>

//                   <FormField label="Seconder Name" required={true}>
//                     <input
//                       type="text"
//                       value={seconderName}
//                       onChange={(e) => setSeconderName(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter Seconder Name"
//                     />
//                   </FormField>

//                   <FormField label="Full Name" required={true}>
//                     <input
//                       type="text"
//                       value={name}
//                       onChange={(e) => setName(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter complete legal name"
//                     />
//                   </FormField>

//                   <FormField label="Guardian Name" required={true}>
//                     <input
//                       type="text"
//                       value={guardianName}
//                       onChange={(e) => setGuardianName(e.target.value)}
//                       style={styles.input}
//                       placeholder="Father/Mother/Guardian name"
//                     />
//                   </FormField>

//                   <FormField label="Date of Birth" required={true}>
//                     <input
//                       type="date"
//                       value={dateOfBirth}
//                       onChange={(e) => setDateOfBirth(e.target.value)}
//                       style={styles.input}
//                     />
//                   </FormField>

//                   <FormField label="Gender" required={true}>
//                     <select
//                       value={gender}
//                       onChange={(e) => setGender(e.target.value)}
//                       style={styles.input}
//                     >
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </FormField>

//                   <FormField label="Caste/Community" required={true}>
//                     <input
//                       type="text"
//                       value={caste}
//                       onChange={(e) => setCaste(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter caste/community"
//                     />
//                   </FormField>

//                   <FormField label="CNIC Number" required={true}>
//                     <input
//                       type="text"
//                       value={cnic}
//                       onChange={(e) => setCnic(e.target.value)}
//                       style={styles.input}
//                       placeholder="e.g., 4130412345567"
//                     />
//                   </FormField>
//                 </div>
//               </div>
//               {/* Professional Information */}
//               <div style={styles.formSection}>
//                 <h3 style={styles.formSectionTitle}>
//                   Professional Information
//                 </h3>
//                 <div style={styles.formGrid}>
//                   <FormField label="Bar License Number" required={false}>
//                     <input
//                       type="text"
//                       value={barLicenseNumber}
//                       onChange={(e) => setBarLicenseNumber(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter bar license number"
//                     />
//                   </FormField>

//                   <FormField label="Date of Enrollment" required={false}>
//                     <input
//                       type="date"
//                       value={dateOfEnrollment}
//                       onChange={(e) => setDateOfEnrollment(e.target.value)}
//                       style={styles.input}
//                     />
//                   </FormField>

//                   <FormField label="District Bar Member" required={false}>
//                     <select
//                       value={districtBarMember}
//                       onChange={(e) => setDistrictBarMember(e.target.value)}
//                       style={styles.input}
//                     >
//                       <option value="no">No</option>
//                       <option value="yes">Yes</option>
//                     </select>
//                   </FormField>

//                   <FormField label="Other Bar Member" required={false}>
//                     <select
//                       value={otherBarMember}
//                       onChange={(e) => setOtherBarMember(e.target.value)}
//                       style={styles.input}
//                     >
//                       <option value="no">No</option>
//                       <option value="yes">Yes</option>
//                     </select>
//                   </FormField>

//                   <FormField label="Member Role" required={false}>
//                     <select
//                       value={role}
//                       onChange={(e) => setRole(e.target.value)}
//                       style={styles.input}
//                     >
//                       <option value="member">Member</option>
//                       <option value="admin">Admin</option>
//                     </select>
//                   </FormField>

//                   <FormField label="Present Address" required={false} fullWidth>
//                     <input
//                       type="text"
//                       value={presentAddress}
//                       onChange={(e) => setPresentAddress(e.target.value)}
//                       style={styles.input}
//                       placeholder="Enter complete address"
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               <div style={styles.formSection}>
//                 <h3 style={styles.formSectionTitle}>
//                   Contact & Account Information
//                 </h3>
//                 <div style={styles.formGrid}>
//                   <FormField label="Email Address" required={true}>
//                     <input
//                       type="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       style={styles.input}
//                       placeholder="your.email@example.com"
//                     />
//                   </FormField>

//                   <FormField label="Phone Number" required={true}>
//                     <input
//                       type="text"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       style={styles.input}
//                       placeholder="+92 300 1234567"
//                     />
//                   </FormField>

//                   <FormField label="Password" required={true}>
//                     <input
//                       type="password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       style={styles.input}
//                       placeholder="Create a secure password"
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               <div style={styles.formSection}>
//                 <h3 style={styles.formSectionTitle}>Document Upload</h3>
//                 <FormField label="CNIC Front Image" required={true} fullWidth>
//                   <label
//                     style={{
//                       ...styles.uploadBox,
//                       borderColor: cnicFrontImage ? "#018f41" : "#cbd5e0",
//                       background: cnicFrontImage ? "#f0f9f4" : "#fafafa",
//                     }}
//                   >
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       style={{ display: "none" }}
//                     />
//                     <div style={styles.uploadContent}>
//                       {/* <div
//                         style={{
//                           ...styles.uploadIcon,
//                           color: cnicFrontImage ? "#018f41" : "#718096",
//                         }}
//                       >
//                         📄
//                       </div> */}
//                       <FileImage
//                         style={{
//                           ...styles.uploadIcon,
//                           color: cnicFrontImage ? "#018f41" : "#718096",
//                         }}
//                       />
//                       <div style={styles.uploadText}>
//                         {cnicFrontImage ? (
//                           <>
//                             <strong style={{ color: "#018f41" }}>
//                               File uploaded successfully
//                             </strong>
//                             <p
//                               style={{
//                                 margin: "4px 0 0",
//                                 color: "#4a5568",
//                                 fontSize: "0.9rem",
//                               }}
//                             >
//                               {cnicImageName}
//                             </p>
//                           </>
//                         ) : (
//                           <>
//                             <strong>Click to upload CNIC front image</strong>
//                             <p
//                               style={{
//                                 margin: "4px 0 0",
//                                 color: "#718096",
//                                 fontSize: "0.9rem",
//                               }}
//                             >
//                               PNG, JPG or JPEG (MAX. 5MB)
//                             </p>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </label>
//                 </FormField>
//               </div>

//               <div style={styles.buttonContainer}>
//                 <button
//                   onClick={handleRegister}
//                   disabled={isLoading}
//                   style={{
//                     ...styles.primaryButton,
//                     opacity: isLoading ? 0.6 : 1,
//                     cursor: isLoading ? "not-allowed" : "pointer",
//                   }}
//                 >
//                   {isLoading
//                     ? "Submitting Application..."
//                     : "Submit Application"}
//                 </button>
//               </div>
//             </>
//           )}

//           {activeStep === "otp-send" && (
//             <div style={styles.centerContent}>
//               <div style={styles.otpIcon}>📧</div>
//               <h2 style={styles.sectionTitle}>Email Verification Required</h2>
//               <p style={styles.otpDescription}>
//                 We'll send a 6-digit verification code to your registered email
//                 address
//               </p>

//               <div style={{ width: "100%", maxWidth: "500px" }}>
//                 <FormField label="Email Address" required={true} fullWidth>
//                   <input
//                     type="email"
//                     value={email}
//                     readOnly
//                     style={{ ...styles.input, backgroundColor: "#f7fafc" }}
//                   />
//                 </FormField>

//                 <div style={styles.buttonContainer}>
//                   <button
//                     onClick={handleSendOtp}
//                     disabled={isLoading}
//                     style={{
//                       ...styles.primaryButton,
//                       opacity: isLoading ? 0.6 : 1,
//                       cursor: isLoading ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {isLoading ? "Sending OTP..." : "Send Verification Code"}
//                   </button>
//                   <button onClick={resetForm} style={styles.secondaryButton}>
//                     Cancel & Start Over
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === "otp-verify" && (
//             <div style={styles.centerContent}>
//               {/* <div style={styles.otpIcon}>🔐</div> */}
//               <LucideLockKeyhole style={{ width: "300px" }} />
//               <h2 style={styles.sectionTitle}>Enter Verification Code</h2>
//               <p style={styles.otpDescription}>
//                 Please enter the 6-digit code sent to <strong>{email}</strong>
//               </p>

//               <div style={{ width: "100%", maxWidth: "500px" }}>
//                 <FormField label="Verification Code" required={true} fullWidth>
//                   <input
//                     type="text"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value.slice(0, 6))}
//                     maxLength={6}
//                     style={{
//                       ...styles.input,
//                       textAlign: "center",
//                       letterSpacing: "16px",
//                       fontSize: "2rem",
//                       fontWeight: "600",
//                       padding: "20px",
//                     }}
//                     placeholder="000000"
//                   />
//                 </FormField>

//                 <div style={styles.buttonContainer}>
//                   <button
//                     onClick={handleVerifyOtp}
//                     disabled={isLoading}
//                     style={{
//                       ...styles.primaryButton,
//                       opacity: isLoading ? 0.6 : 1,
//                       cursor: isLoading ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {isLoading ? "Verifying..." : "Verify Code"}
//                   </button>
//                   <button onClick={resetForm} style={styles.secondaryButton}>
//                     Cancel & Start Over
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeStep === "success" && (
//             <div style={{ ...styles.centerContent, padding: "60px 20px" }}>
//               <div style={{ fontSize: "5rem", marginBottom: "24px" }}>✅</div>
//               <h2
//                 style={{
//                   ...styles.sectionTitle,
//                   color: "#018f41",
//                   marginBottom: "16px",
//                 }}
//               >
//                 Registration Completed Successfully
//               </h2>
//               <p style={styles.successDescription}>
//                 Your advocate membership application has been submitted and
//                 verified. You will receive a confirmation email shortly with
//                 further instructions.
//               </p>
//               <div style={{ marginTop: "40px" }}>
//                 <button onClick={resetForm} style={styles.primaryButton}>
//                   Register Another Advocate
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         {/* <div style={styles.footer}>
//           <p>© 2026 Government Registration Portal. All rights reserved.</p>
//           <p
//             style={{ fontSize: "0.85rem", color: "#718096", marginTop: "8px" }}
//           >
//             For assistance, contact support@example.gov.pk
//           </p>
//         </div> */}
//       </div>

//       <style jsx global>{`
//         * {
//           box-sizing: border-box;
//         }
//         input:focus,
//         select:focus,
//         textarea:focus {
//           outline: none !important;
//           border-color: #018f41 !important;
//           box-shadow: 0 0 0 3px rgba(1, 143, 65, 0.1) !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// const FormField = ({ label, required, children, fullWidth }) => (
//   <div
//     style={{
//       ...styles.fieldContainer,
//       gridColumn: fullWidth ? "1 / -1" : "auto",
//     }}
//   >
//     <label style={styles.label}>
//       {label}
//       {required && <span style={styles.required}> *</span>}
//     </label>
//     {children}
//   </div>
// );

// const styles = {
//   container: {
//     maxWidth: "97%",
//     // background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
//     fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
//   },
//   maxWidth: {
//     maxWidth: "100vw",
//     margin: "0 auto",
//   },
//   header: {
//     marginBottom: "40px",
//   },
//   headerBadge: {
//     display: "inline-block",
//     padding: "6px 16px",
//     background: "#018f41",
//     color: "white",
//     borderRadius: "20px",
//     fontSize: "0.8rem",
//     fontWeight: "600",
//     letterSpacing: "0.5px",
//     textTransform: "uppercase",
//     marginBottom: "16px",
//   },
//   title: {
//     fontSize: "2.5rem",
//     fontWeight: "700",
//     color: "#018f41",
//     margin: "0 0 12px 0",
//     lineHeight: "1.2",
//   },
//   subtitle: {
//     fontSize: "1.1rem",
//     color: "#4a5568",
//     margin: 0,
//   },
//   stepperContainer: {
//     display: "flex",
//     gap: "24px",
//     marginBottom: "40px",
//     flexWrap: "wrap",
//     background: "white",
//     padding: "32px",
//     borderRadius: "16px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },
//   stepItem: {
//     display: "flex",
//     alignItems: "center",
//     gap: "12px",
//     flex: "1",
//     minWidth: "200px",
//   },
//   stepCircle: {
//     width: "48px",
//     height: "48px",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "1.25rem",
//     fontWeight: "700",
//     flexShrink: 0,
//     transition: "all 0.3s ease",
//   },
//   stepText: {
//     flex: 1,
//   },
//   stepTitle: {
//     margin: 0,
//     fontWeight: "600",
//     color: "#2d3748",
//     fontSize: "1rem",
//   },
//   stepDesc: {
//     color: "#718096",
//     fontSize: "0.85rem",
//   },
//   alert: {
//     padding: "16px 20px",
//     marginBottom: "32px",
//     borderRadius: "12px",
//     fontSize: "0.95rem",
//     lineHeight: "1.5",
//   },
//   card: {
//     background: "white",
//     borderRadius: "16px",
//     boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
//     padding: "48px",
//     marginBottom: "32px",
//   },
//   sectionHeader: {
//     marginBottom: "40px",
//     paddingBottom: "24px",
//     borderBottom: "2px solid #e2e8f0",
//   },
//   sectionTitle: {
//     fontSize: "1.8rem",
//     fontWeight: "700",
//     color: "#1a202c",
//     margin: "0 0 8px 0",
//   },
//   sectionSubtitle: {
//     fontSize: "1rem",
//     color: "#718096",
//     margin: 0,
//   },
//   formSection: {
//     marginBottom: "40px",
//   },
//   formSectionTitle: {
//     fontSize: "1.25rem",
//     fontWeight: "600",
//     color: "#2d3748",
//     marginBottom: "24px",
//     paddingBottom: "12px",
//     borderBottom: "2px solid #018f41",
//     display: "inline-block",
//   },
//   formGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: "24px",
//   },
//   fieldContainer: {
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
//   },
//   label: {
//     fontSize: "0.95rem",
//     fontWeight: "600",
//     color: "#2d3748",
//     letterSpacing: "0.3px",
//   },
//   required: {
//     color: "#e53e3e",
//     fontWeight: "700",
//   },
//   input: {
//     width: "100%",
//     padding: "12px 16px",
//     fontSize: "1rem",
//     border: "2px solid #cbd5e0",
//     borderRadius: "10px",
//     background: "white",
//     transition: "all 0.2s ease",
//     color: "#2d3748",
//   },
//   uploadBox: {
//     display: "block",
//     padding: "32px",
//     border: "2px dashed #cbd5e0",
//     borderRadius: "12px",
//     textAlign: "center",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     background: "#fafafa",
//   },
//   uploadContent: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "12px",
//   },
//   uploadIcon: {
//     fontSize: "3rem",
//   },
//   uploadText: {
//     color: "#4a5568",
//   },
//   buttonContainer: {
//     display: "flex",
//     gap: "16px",
//     marginTop: "32px",
//     flexWrap: "wrap",
//   },
//   primaryButton: {
//     flex: 1,
//     minWidth: "200px",
//     padding: "16px 32px",
//     background: "#018f41",
//     color: "white",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "1.05rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     boxShadow: "0 6px 20px rgba(1,143,65,0.3)",
//   },
//   secondaryButton: {
//     flex: 1,
//     minWidth: "200px",
//     padding: "16px 32px",
//     background: "#718096",
//     color: "white",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "1.05rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//   },
//   centerContent: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     textAlign: "center",
//     padding: "40px 20px",
//   },
//   otpIcon: {
//     fontSize: "4rem",
//     marginBottom: "24px",
//   },
//   otpDescription: {
//     fontSize: "1.05rem",
//     color: "#4a5568",
//     maxWidth: "600px",
//     marginBottom: "32px",
//     lineHeight: "1.6",
//   },
//   successDescription: {
//     fontSize: "1.1rem",
//     color: "#4a5568",
//     maxWidth: "700px",
//     margin: "0 auto",
//     lineHeight: "1.7",
//   },
//   footer: {
//     textAlign: "center",
//     padding: "32px 20px",
//     color: "#4a5568",
//     fontSize: "0.9rem",
//   },
// };

// export default UsersPage;

import React, { useState } from "react";
import { baseUrl } from "../services/base";
import {
  FileImage,
  LucideLockKeyhole,
  CheckCircle,
  LucideMail,
  LucideMailCheck,
} from "lucide-react";

const UsersPage = () => {
  const [activeStep, setActiveStep] = useState("register");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form fields
  const [proposerName, setProposerName] = useState("");
  const [seconderName, setSeconderName] = useState("");
  const [name, setName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("male");
  const [role, setRole] = useState("member");
  const [caste, setCaste] = useState("");
  const [cnic, setCnic] = useState("");
  const [barLicenseNumber, setBarLicenseNumber] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [dateOfEnrollment, setDateOfEnrollment] = useState("");
  const [districtBarMember, setDistrictBarMember] = useState("no");
  const [otherBarMember, setOtherBarMember] = useState("no");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Document states
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicFrontName, setCnicFrontName] = useState("");
  const [cnicFrontPreview, setCnicFrontPreview] = useState(null);

  const [hcLicense, setHcLicense] = useState(null);
  const [hcLicenseName, setHcLicenseName] = useState("");
  const [hcLicensePreview, setHcLicensePreview] = useState(null);

  const [hcIdCard, setHcIdCard] = useState(null);
  const [hcIdCardName, setHcIdCardName] = useState("");
  const [hcIdCardPreview, setHcIdCardPreview] = useState(null);

  const [passport, setPassport] = useState(null);
  const [passportName, setPassportName] = useState("");
  const [passportPreview, setPassportPreview] = useState(null);

  const [otp, setOtp] = useState("");

  const API_BASE = baseUrl;

  const handleFileChange = (setter, nameSetter, previewSetter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setter(file);
    nameSetter(file.name);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      previewSetter(url);
    } else {
      previewSetter(null);
    }
  };

  const handleRegister = async () => {
    if (
      !name ||
      !cnic ||
      !email ||
      !phone ||
      !password ||
      !cnicFront ||
      !hcLicense ||
      !hcIdCard ||
      !passport
    ) {
      setMessage({
        text: "Please complete all required fields and upload all 4 documents",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    const formdata = new FormData();
    formdata.append("proposer_name", proposerName);
    formdata.append("seconder_name", seconderName);
    formdata.append("name", name);
    formdata.append("guardian_name", guardianName);
    formdata.append("date_of_birth", dateOfBirth);
    formdata.append("gender", gender);
    formdata.append("role", role);
    formdata.append("caste", caste);
    formdata.append("cnic", cnic);
    formdata.append("bar_license_number", barLicenseNumber);
    formdata.append("present_address", presentAddress);
    formdata.append("date_of_enrollment_as_advocate", dateOfEnrollment);
    formdata.append("district_bar_member", districtBarMember);
    formdata.append("other_bar_member", otherBarMember);
    formdata.append("email", email);
    formdata.append("phone", phone);
    formdata.append("password", password);

    // Documents
    formdata.append("cnic_front_image", cnicFront);
    formdata.append("license_ofhighcourt", hcLicense);
    formdata.append("idcard_of_highcourt", hcIdCard);
    formdata.append("passport_image", passport);

    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        body: formdata,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: "Registration successful! Sending OTP to your email...",
          type: "success",
        });
        setActiveStep("otp-send");
      } else {
        setMessage({
          text:
            data.message ||
            "Registration failed. Check all required documents.",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP handlers remain the same...
  const handleSendOtp = async () => {
    if (!email) return;

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API_BASE}/register/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "OTP sent successfully!", type: "success" });
        setActiveStep("otp-verify");
      } else {
        setMessage({
          text: data.message || "Failed to send OTP",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: "Network error.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ text: "Please enter a valid 6-digit OTP", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API_BASE}/register/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: "OTP verified successfully! Your account is now active.",
          type: "success",
        });
        setActiveStep("success");
      } else {
        setMessage({ text: data.message || "Invalid OTP", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProposerName("");
    setSeconderName("");
    setName("");
    setGuardianName("");
    setDateOfBirth("");
    setGender("male");
    setRole("member");
    setCaste("");
    setCnic("");
    setBarLicenseNumber("");
    setPresentAddress("");
    setDateOfEnrollment("");
    setDistrictBarMember("no");
    setOtherBarMember("no");
    setEmail("");
    setPhone("");
    setPassword("");

    // Reset documents
    setCnicFront(null);
    setCnicFrontName("");
    setCnicFrontPreview(null);
    setHcLicense(null);
    setHcLicenseName("");
    setHcLicensePreview(null);
    setHcIdCard(null);
    setHcIdCardName("");
    setHcIdCardPreview(null);
    setPassport(null);
    setPassportName("");
    setPassportPreview(null);

    setOtp("");
    setActiveStep("register");
    setMessage({ text: "", type: "" });
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Advocate Registration Form</h1>
            <p style={styles.subtitle}>
              Official membership application for legal practitioners
            </p>
          </div>
        </header>

        {/* Progress Stepper */}
        <div style={styles.stepperContainer}>
          {[
            {
              step: "register",
              number: 1,
              title: "Application Form",
              desc: "Personal & Professional Details",
            },
            {
              step: "otp-send",
              number: 2,
              title: "Email Verification",
              desc: "OTP Authentication",
            },
            {
              step: "success",
              number: 3,
              title: "Completion",
              desc: "Confirmation",
            },
          ].map((item, idx) => {
            const isActive =
              item.step === activeStep ||
              (item.step === "otp-send" &&
                ["otp-send", "otp-verify", "success"].includes(activeStep)) ||
              (item.step === "success" && activeStep === "success");

            return (
              <div key={idx} style={styles.stepItem}>
                <div
                  style={{
                    ...styles.stepCircle,
                    background: isActive ? "#018f41" : "#e8e8e8",
                    color: isActive ? "white" : "#999",
                    boxShadow: isActive
                      ? "0 0 0 4px rgba(1,143,65,0.15)"
                      : "none",
                  }}
                >
                  {item.number}
                </div>
                <div style={styles.stepText}>
                  <p style={styles.stepTitle}>{item.title}</p>
                  <small style={styles.stepDesc}>{item.desc}</small>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alert */}
        {message.text && (
          <div
            style={{
              ...styles.alert,
              background: message.type === "success" ? "#d4edda" : "#f8d7da",
              borderLeft: `4px solid ${
                message.type === "success" ? "#28a745" : "#dc3545"
              }`,
              color: message.type === "success" ? "#155724" : "#721c24",
            }}
          >
            <strong>
              {message.type === "success" ? "✓ Success: " : "✗ Error: "}
            </strong>
            {message.text}
          </div>
        )}

        {/* Main Card */}
        <div style={styles.card}>
          {activeStep === "register" && (
            <>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Application Form</h2>
                <p style={styles.sectionSubtitle}>
                  Please fill in all required fields marked with an asterisk (*)
                </p>
              </div>

              {/* Personal Information */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>Personal Information</h3>
                <div style={styles.formGrid}>
                  <FormField label="Proposer Name" required>
                    <input
                      type="text"
                      value={proposerName}
                      onChange={(e) => setProposerName(e.target.value)}
                      style={styles.input}
                      placeholder="Enter Proposer Name"
                    />
                  </FormField>

                  <FormField label="Seconder Name" required>
                    <input
                      type="text"
                      value={seconderName}
                      onChange={(e) => setSeconderName(e.target.value)}
                      style={styles.input}
                      placeholder="Enter Seconder Name"
                    />
                  </FormField>

                  <FormField label="Full Name" required>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.input}
                      placeholder="Enter complete legal name"
                    />
                  </FormField>

                  <FormField label="Guardian Name" required>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      style={styles.input}
                      placeholder="Father/Mother/Guardian name"
                    />
                  </FormField>

                  <FormField label="Date of Birth" required>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      style={styles.input}
                    />
                  </FormField>

                  <FormField label="Gender" required>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={styles.input}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>

                  <FormField label="Caste/Community" required>
                    <input
                      type="text"
                      value={caste}
                      onChange={(e) => setCaste(e.target.value)}
                      style={styles.input}
                      placeholder="Enter caste/community"
                    />
                  </FormField>

                  <FormField label="CNIC Number" required>
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      style={styles.input}
                      placeholder="e.g., 4130412345567"
                    />
                  </FormField>
                </div>
              </div>

              {/* Professional Information */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>
                  Professional Information
                </h3>
                <div style={styles.formGrid}>
                  <FormField label="Bar License Number">
                    <input
                      type="text"
                      value={barLicenseNumber}
                      onChange={(e) => setBarLicenseNumber(e.target.value)}
                      style={styles.input}
                      placeholder="Enter bar license number"
                    />
                  </FormField>

                  <FormField label="Date of Enrollment">
                    <input
                      type="date"
                      value={dateOfEnrollment}
                      onChange={(e) => setDateOfEnrollment(e.target.value)}
                      style={styles.input}
                    />
                  </FormField>

                  <FormField label="District Bar Member">
                    <select
                      value={districtBarMember}
                      onChange={(e) => setDistrictBarMember(e.target.value)}
                      style={styles.input}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </FormField>

                  <FormField label="Other Bar Member">
                    <select
                      value={otherBarMember}
                      onChange={(e) => setOtherBarMember(e.target.value)}
                      style={styles.input}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </FormField>

                  <FormField label="Member Role">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={styles.input}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </FormField>

                  <FormField label="Present Address" fullWidth>
                    <input
                      type="text"
                      value={presentAddress}
                      onChange={(e) => setPresentAddress(e.target.value)}
                      style={styles.input}
                      placeholder="Enter complete address"
                    />
                  </FormField>
                </div>
              </div>

              {/* Contact & Account */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>
                  Contact & Account Information
                </h3>
                <div style={styles.formGrid}>
                  <FormField label="Email Address" required>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      placeholder="your.email@example.com"
                    />
                  </FormField>

                  <FormField label="Phone Number" required>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={styles.input}
                      placeholder="+92 300 1234567"
                    />
                  </FormField>

                  <FormField label="Password" required>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      placeholder="Create a secure password"
                    />
                  </FormField>
                </div>
              </div>

              {/* ──────────────── DOCUMENTS SECTION ──────────────── */}
              <div style={styles.formSection}>
                <h3 style={styles.formSectionTitle}>Required Documents</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "16px",
                    marginTop: "16px",
                  }}
                >
                  {/* CNIC Front */}
                  <DocumentUploadCard
                    title="CNIC Front"
                    file={cnicFront}
                    preview={cnicFrontPreview}
                    name={cnicFrontName}
                    onChange={handleFileChange(
                      setCnicFront,
                      setCnicFrontName,
                      setCnicFrontPreview
                    )}
                    required
                  />

                  {/* High Court License */}
                  <DocumentUploadCard
                    title="HC License"
                    file={hcLicense}
                    preview={hcLicensePreview}
                    name={hcLicenseName}
                    onChange={handleFileChange(
                      setHcLicense,
                      setHcLicenseName,
                      setHcLicensePreview
                    )}
                    required
                  />

                  {/* High Court ID Card */}
                  <DocumentUploadCard
                    title="HC ID Card"
                    file={hcIdCard}
                    preview={hcIdCardPreview}
                    name={hcIdCardName}
                    onChange={handleFileChange(
                      setHcIdCard,
                      setHcIdCardName,
                      setHcIdCardPreview
                    )}
                    required
                  />

                  {/* Passport Photo */}
                  <DocumentUploadCard
                    title="Passport Photo"
                    file={passport}
                    preview={passportPreview}
                    name={passportName}
                    onChange={handleFileChange(
                      setPassport,
                      setPassportName,
                      setPassportPreview
                    )}
                    required
                  />
                </div>
              </div>

              <div style={styles.buttonContainer}>
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  style={{
                    ...styles.primaryButton,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </>
          )}

          {/* OTP screens remain the same */}
          {activeStep === "otp-send" && (
            <div style={styles.centerContent}>
              <div style={styles.otpIcon}>
                <LucideMailCheck size={80} />{" "}
              </div>
              <h2 style={styles.sectionTitle}>Email Verification Required</h2>
              <p style={styles.otpDescription}>
                We'll send a 6-digit verification code to your registered email
                address
              </p>

              <div style={{ width: "100%", maxWidth: "500px" }}>
                <FormField fullWidth>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    style={{ ...styles.input, backgroundColor: "#f7fafc" }}
                  />
                </FormField>

                <div style={styles.buttonContainer}>
                  <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    style={{
                      ...styles.primaryButton,
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "Sending OTP..." : "Send Code"}
                  </button>
                  <button onClick={resetForm} style={styles.secondaryButton}>
                    Cancel & Start Over
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === "otp-verify" && (
            <div style={styles.centerContent}>
              <LucideLockKeyhole size={80} style={{ marginBottom: "10px" }} />
              <h2 style={styles.sectionTitle}>Enter Verification Code</h2>
              <p style={styles.otpDescription}>
                Please enter the 6-digit code sent to <strong>{email}</strong>
              </p>

              <div style={{ width: "100%", maxWidth: "500px" }}>
                <FormField fullWidth>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                    maxLength={6}
                    style={{
                      ...styles.input,
                      textAlign: "center",
                      letterSpacing: "16px",
                      fontSize: "2rem",
                      fontWeight: "600",
                      padding: "20px",
                    }}
                    placeholder="000000"
                  />
                </FormField>

                <div style={styles.buttonContainer}>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={isLoading}
                    style={{
                      ...styles.primaryButton,
                      opacity: isLoading ? 0.6 : 1,
                      cursor: isLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {isLoading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button onClick={resetForm} style={styles.secondaryButton}>
                    Cancel & Start Over
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeStep === "success" && (
            <div style={{ ...styles.centerContent, padding: "60px 20px" }}>
              <div style={{ fontSize: "5rem", marginBottom: "24px" }}>
                <CheckCircle size={80} color="green" />
              </div>
              <h2
                style={{
                  ...styles.sectionTitle,
                  color: "#018f41",
                  marginBottom: "16px",
                }}
              >
                Registration Completed Successfully
              </h2>
              <p style={styles.successDescription}>
                Your advocate membership application has been submitted and
                verified. You will receive a confirmation email shortly with
                further instructions.
              </p>
              <div style={{ marginTop: "40px" }}>
                <button onClick={resetForm} style={styles.primaryButton}>
                  Register Another Advocate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        input:focus,
        select:focus {
          outline: none !important;
          border-color: #018f41 !important;
          box-shadow: 0 0 0 3px rgba(1, 143, 65, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

// New small modern document card component
const DocumentUploadCard = ({
  title,
  file,
  preview,
  name,
  onChange,
  required,
}) => {
  const inputId = `file-upload-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <label
      htmlFor={inputId}
      style={{
        border: `2px ${file ? "solid #018f41" : "dashed #cbd5e0"}`,
        borderRadius: "12px",
        padding: "12px",
        background: file ? "#f0f9f4" : "#fafafa",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        minHeight: "140px",
        display: "block", // ← important: label should be block
        width: "100%",
      }}
    >
      <input
        id={inputId}
        type="file"
        accept={title.includes("Passport") ? "image/*" : "image/*,.pdf"}
        onChange={onChange}
        style={{ display: "none" }}
      />

      {file && (
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            color: "#018f41",
          }}
        >
          <CheckCircle size={20} />
        </div>
      )}

      {preview ? (
        <img
          src={preview}
          alt="preview"
          style={{
            maxWidth: "80px",
            maxHeight: "80px",
            objectFit: "cover",
            borderRadius: "6px",
            margin: "0 auto 8px",
          }}
        />
      ) : (
        <FileImage
          style={{
            width: 48,
            height: 48,
            color: file ? "#018f41" : "#718096",
            margin: "0 auto 8px",
          }}
        />
      )}

      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: file ? "600" : "500",
          color: file ? "#018f41" : "#4a5568",
        }}
      >
        {file ? name : title}
      </div>

      {!file && (
        <div
          style={{
            fontSize: "0.75rem",
            color: "#718096",
            marginTop: "4px",
          }}
        >
          Click to upload
        </div>
      )}
    </label>
  );
};

const FormField = ({ label, required, children, fullWidth }) => (
  <div
    style={{
      ...styles.fieldContainer,
      gridColumn: fullWidth ? "1 / -1" : "auto",
    }}
  >
    <label style={styles.label}>
      {label}
      {required && <span style={styles.required}> *</span>}
    </label>
    {children}
  </div>
);

// Keep your original styles object (no changes needed here)
// const styles = {
//   container: {
//     maxWidth: "97%",
//     fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
//   },
//   maxWidth: {
//     maxWidth: "100vw",
//     margin: "0 auto",
//   },
//   header: {
//     marginBottom: "40px",
//   },
//   title: {
//     fontSize: "2.5rem",
//     fontWeight: "700",
//     color: "#018f41",
//     margin: "0 0 12px 0",
//     lineHeight: "1.2",
//   },
//   subtitle: {
//     fontSize: "1.1rem",
//     color: "#4a5568",
//     margin: 0,
//   },
//   stepperContainer: {
//     display: "flex",
//     gap: "24px",
//     marginBottom: "40px",
//     flexWrap: "wrap",
//     background: "white",
//     padding: "32px",
//     borderRadius: "16px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
//   },
//   // ... rest of your original styles remain unchanged ...
//   // Just keeping the important ones here for reference
//   formGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: "24px",
//   },
//   // ... (all other styles stay exactly the same)
// };

const styles = {
  container: {
    maxWidth: "97%",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  maxWidth: {
    maxWidth: "100vw",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#018f41",
    margin: "0 0 12px 0",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#4a5568",
    margin: 0,
  },
  stepperContainer: {
    display: "flex",
    gap: "24px",
    marginBottom: "40px",
    flexWrap: "wrap",
    background: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  // ... rest of your original styles remain unchanged ...
  // Just keeping the important ones here for reference
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  container: {
    maxWidth: "97%",
    // background: "linear-gradient(135deg, #f5f7fa 0%, #e8edf2 100%)",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  maxWidth: {
    maxWidth: "100vw",
    margin: "0 auto",
  },
  header: {
    marginBottom: "40px",
  },
  headerBadge: {
    display: "inline-block",
    padding: "6px 16px",
    background: "#018f41",
    color: "white",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700",
    color: "#018f41",
    margin: "0 0 12px 0",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#4a5568",
    margin: 0,
  },
  stepperContainer: {
    display: "flex",
    gap: "24px",
    marginBottom: "40px",
    flexWrap: "wrap",
    background: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: "1",
    minWidth: "200px",
  },
  stepCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    fontWeight: "700",
    flexShrink: 0,
    transition: "all 0.3s ease",
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    margin: 0,
    fontWeight: "600",
    color: "#2d3748",
    fontSize: "1rem",
  },
  stepDesc: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  alert: {
    padding: "16px 20px",
    marginBottom: "32px",
    borderRadius: "12px",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    padding: "48px",
    marginBottom: "32px",
  },
  sectionHeader: {
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#1a202c",
    margin: "0 0 0px 0",
  },
  sectionSubtitle: {
    fontSize: "1rem",
    color: "#718096",
    margin: 0,
  },
  formSection: {
    marginBottom: "40px",
  },
  formSectionTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "2px solid #018f41",
    display: "inline-block",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#2d3748",
    letterSpacing: "0.3px",
  },
  required: {
    color: "#e53e3e",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "1rem",
    border: "2px solid #cbd5e0",
    borderRadius: "10px",
    background: "white",
    transition: "all 0.2s ease",
    color: "#2d3748",
  },
  uploadBox: {
    display: "block",
    padding: "32px",
    border: "2px dashed #cbd5e0",
    borderRadius: "12px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "#fafafa",
  },
  uploadContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  uploadIcon: {
    fontSize: "3rem",
  },
  uploadText: {
    color: "#4a5568",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
  primaryButton: {
    flex: 1,
    minWidth: "200px",
    padding: "16px 32px",
    background: "#018f41",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(1,143,65,0.3)",
  },
  secondaryButton: {
    flex: 1,
    minWidth: "200px",
    padding: "16px 32px",
    background: "#718096",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "40px 20px",
  },
  otpIcon: {
    fontSize: "4rem",
    marginBottom: "24px",
  },
  otpDescription: {
    fontSize: "1.05rem",
    color: "#4a5568",
    maxWidth: "600px",
    // marginBottom: "32px",
    lineHeight: "1.6",
  },
  successDescription: {
    fontSize: "1.1rem",
    color: "#4a5568",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: "1.7",
  },
  footer: {
    textAlign: "center",
    padding: "32px 20px",
    color: "#4a5568",
    fontSize: "0.9rem",
  },
};

export default UsersPage;
