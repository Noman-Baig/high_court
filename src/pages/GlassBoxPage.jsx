import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";

const GlassBoxPage = () => {
  const { token } = useAuth();

  const [isChairman, setIsChairman] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentNames, setAttachmentNames] = useState([]);

  // Detail modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newRemark, setNewRemark] = useState("");
  const [satisfied, setSatisfied] = useState(null);
  const [feedbackRemark, setFeedbackRemark] = useState("");

  const API_BASE = baseUrl;

  // Fix keyboard jump & focus loss on mobile
  useEffect(() => {
    if (showCreateModal || selectedComplaint) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [showCreateModal, selectedComplaint]);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchComplaints = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaint`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.status) {
        setComplaints(data.data || []);
        setIsChairman(data.is_chairman === true || data.is_admin === true);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommittees = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/committee`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.status && Array.isArray(data.data)) {
        setCommittees(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch committees:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
      fetchCommittees();
    }
  }, [token]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
    setAttachmentNames(files.map((f) => f.name));
  };

  const createComplaint = async () => {
    if (!title.trim() || !description.trim() || !committeeId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("committee_id", committeeId);
    attachments.forEach((file) => formData.append("attachments[]", file));

    try {
      const res = await fetch(`${API_BASE}/complaint/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.status) {
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
        setCommitteeId("");
        setAttachments([]);
        setAttachmentNames([]);
        fetchComplaints();
      }
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addRemark = async (id) => {
    if (!newRemark.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaint/add-remark/${id}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ remark: newRemark.trim() }),
      });
      const data = await res.json();
      if (data.status) {
        setNewRemark("");
        fetchComplaintDetail(id);
      }
    } catch (err) {
      console.error("Remark error:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeComplaint = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaint/close/${id}`, {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.status) {
        fetchComplaints();
        fetchComplaintDetail(id);
      }
    } catch (err) {
      console.error("Close error:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (id) => {
    if (satisfied === null) return;
    if (satisfied === false && !feedbackRemark.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/complaint/satisfaction-feedback/${id}`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            satisfied: satisfied ? 1 : 0,
            remark: satisfied === false ? feedbackRemark.trim() : "",
          }),
        }
      );
      const data = await res.json();
      if (data.status) {
        setSatisfied(null);
        setFeedbackRemark("");
        fetchComplaints();
        fetchComplaintDetail(id);
      }
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintDetail = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/complaint/view/${id}`, {
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.status) setSelectedComplaint(data.data);
    } catch (err) {
      console.error("Detail fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (comp) => fetchComplaintDetail(comp.id);

  return (
    <div style={{ fontFamily: "Lato" }}>
      <div style={{ maxWidth: "97%", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.6rem",
                fontWeight: "700",
                color: "#018f41",
                margin: "0 0 8px 0",
              }}
            >
              Glass Box
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Raise, track, and resolve association grievances
            </p>
          </div>
          {token && !isChairman && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={primaryButton}
            >
              + New Complaint
            </button>
          )}
        </header>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #047857",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ fontSize: 15, fontWeight: 500 }}>Loading requests…</p>

            <style>
              {`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}
            </style>
          </div>
        ) : complaints.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "120px 20px",
              color: "#95a5a6",
            }}
          >
            <div style={{ fontSize: "6rem", marginBottom: "24px" }}>📬</div>
            <h3>No complaints found</h3>
            {!isChairman && (
              <p>Start by submitting your first grievance above.</p>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {complaints.map(
              (comp) => (
                console.log(comp),
                (
                  <div
                    key={comp.id}
                    onClick={() => openDetail(comp)}
                    style={complaintCard}
                  >
                    <div
                      style={{
                        padding: "16px",
                        background:
                          comp.status === "closed" ? "#e8f5e9" : "#fffbeb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          background:
                            comp.status === "closed" ? "#10b981" : "#f59e0b",
                          color: "white",
                        }}
                      >
                        {comp.status.toUpperCase()}
                      </span>
                      <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {comp.committee?.name || "General"}
                      </span>
                    </div>
                    <div style={{ padding: "20px" }}>
                      <h3
                        style={{
                          margin: "0 0 10px",
                          fontSize: "1.25rem",
                          color: "#2c3e50",
                        }}
                      >
                        {comp.title}
                      </h3>
                      <p
                        style={{
                          color: "#555",
                          fontSize: "0.95rem",
                          margin: "0 0 12px",
                          lineHeight: "1.5",
                        }}
                      >
                        {comp.description.length > 85
                          ? comp.description.slice(0, 85) + "..."
                          : comp.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                          color: "#777",
                        }}
                      >
                        <span>By: {comp.creator?.name}</span>
                        <span>
                          {new Date(comp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Submit New Complaint</h2>
              <p style={modalStyles.subtitle}>
                Raise your concern to the relevant committee
              </p>
            </div>
            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                <select
                  value={committeeId}
                  onChange={(e) => setCommitteeId(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Committee</option>
                  {committees.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div style={iphoneInputBar}>
                  <input
                    placeholder="Complaint Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                <div style={iphoneInputBar}>
                  <textarea
                    placeholder="Describe your complaint in detail *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="1"
                    style={{ ...iphoneInput, minHeight: "100px" }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        200
                      )}px`;
                    }}
                    required
                  />
                </div>

                <label style={uploadLabel}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  {attachmentNames.length > 0
                    ? `📎 ${attachmentNames.length} file(s) selected`
                    : "Upload Supporting Documents (Optional)"}
                </label>
              </div>
            </div>
            <div style={modalStyles.footer}>
              <button
                onClick={createComplaint}
                disabled={
                  loading ||
                  !title.trim() ||
                  !description.trim() ||
                  !committeeId
                }
                style={{
                  ...modalStyles.primaryButton,
                  opacity:
                    loading ||
                    !title.trim() ||
                    !description.trim() ||
                    !committeeId
                      ? 0.6
                      : 1,
                }}
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                style={modalStyles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                Complaint #{selectedComplaint.complaint.id}
              </h2>
              <p style={modalStyles.subtitle}>
                Posted on{" "}
                {new Date(
                  selectedComplaint.complaint.created_at
                ).toLocaleString()}
              </p>
            </div>
            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Detail Fields (unchanged) */}
                <div>
                  <strong>Title</strong>
                  <p style={{ marginTop: "6px", fontSize: "1.1rem" }}>
                    {selectedComplaint.complaint.title}
                  </p>
                </div>
                <div>
                  <strong>Committee</strong>
                  <p style={{ marginTop: "6px" }}>
                    {selectedComplaint.complaint.committee?.name || "General"}
                  </p>
                </div>
                <div>
                  <strong>Status</strong>
                  <span
                    style={{
                      marginLeft: "12px",
                      padding: "6px 16px",
                      borderRadius: "30px",
                      background:
                        selectedComplaint.complaint.status === "closed"
                          ? "#10b981"
                          : "#f59e0b",
                      color: "white",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                    }}
                  >
                    {selectedComplaint.complaint.status.toUpperCase()}
                  </span>
                </div>
                {selectedComplaint.complaint.closed_at && (
                  <div>
                    <strong>Closed On</strong>
                    <p style={{ marginTop: "6px" }}>
                      {new Date(
                        selectedComplaint.complaint.closed_at
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedComplaint.complaint.user_satisfied !== null && (
                  <div>
                    <strong>Member Satisfaction</strong>
                    <p style={{ marginTop: "6px" }}>
                      {selectedComplaint.complaint.user_satisfied
                        ? "Satisfied"
                        : "Not Satisfied"}
                    </p>
                  </div>
                )}

                <div>
                  <strong>Description</strong>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "12px",
                      marginTop: "8px",
                      lineHeight: "1.7",
                    }}
                  >
                    {selectedComplaint.complaint.description}
                  </div>
                </div>

                {selectedComplaint.complaint.attachments?.length > 0 && (
                  <div>
                    <strong>Attachments</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px",
                        marginTop: "10px",
                      }}
                    >
                      {selectedComplaint.complaint.attachments.map((att, i) => (
                        <span
                          key={i}
                          style={{
                            background: "#e3f2fd",
                            padding: "8px 16px",
                            borderRadius: "30px",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          📎 {att.filename}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedComplaint.complaint.remarks?.length > 0 && (
                  <div style={{ marginTop: "32px" }}>
                    <h4
                      style={{
                        margin: "0 0 16px",
                        color: "#065f46",
                        fontWeight: "600",
                        fontSize: "1.3rem",
                      }}
                    >
                      Remarks / Actions
                    </h4>

                    <div style={{ display: "grid", gap: "12px" }}>
                      {selectedComplaint.complaint.remarks.length === 0 ? (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            color: "#94a3b8",
                            fontSize: "0.95rem",
                          }}
                        >
                          No remarks added yet.
                        </div>
                      ) : (
                        selectedComplaint.complaint.remarks.map((r, i) => (
                          <div
                            key={r.id || i}
                            style={{
                              background:
                                r.role === "chairman"
                                  ? "#f0fdf4"
                                  : r.role === "admin"
                                  ? "#e0f2fe"
                                  : "#f8fafc",
                              borderLeft:
                                r.role === "chairman"
                                  ? "4px solid #16a34a"
                                  : r.role === "admin"
                                  ? "4px solid #2563eb"
                                  : "4px solid #94a3b8",
                              padding: "14px 16px",
                              borderRadius: "12px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",

                                // marginBottom: "6px",
                              }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  background:
                                    r.role === "chairman"
                                      ? "#16a34a"
                                      : r.role === "admin"
                                      ? "#2563eb"
                                      : "#6b7280",
                                  color: "white",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.8rem",
                                  fontWeight: "bold",
                                }}
                              >
                                {r.role === "chairman"
                                  ? "C"
                                  : r.role === "admin"
                                  ? "A"
                                  : "M"}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  // background: "red",
                                  width: "90%",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,

                                    fontWeight: "600",
                                    color: "#1e293b",
                                  }}
                                >
                                  {r.role === "chairman"
                                    ? "Chairman"
                                    : r.role === "admin"
                                    ? "Admin"
                                    : "Member"}
                                </p>
                                <small style={{ color: "#6b7280" }}>
                                  {new Date(r.created_at).toLocaleString()}
                                </small>
                              </div>
                            </div>
                            <p
                              style={{
                                margin: "0px 0 0 42px",
                                // lineHeight: "1.6",
                                color: "#374151",
                                // background: "red",
                              }}
                            >
                              {r.remark}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Chairman Add Remark - iPhone Style */}
                {isChairman &&
                  selectedComplaint.complaint.status !== "closed" &&
                  selectedComplaint.flags.can_add_remark && (
                    <div style={{ marginTop: "32px" }}>
                      <h3
                        style={{
                          color: "#018f41",
                          marginBottom: "16px",
                          fontSize: "1.3rem",
                          fontWeight: "600",
                        }}
                      >
                        Add Remark
                      </h3>
                      <div style={iphoneInputBar}>
                        <textarea
                          placeholder="Write your remark here..."
                          value={newRemark}
                          onChange={(e) => setNewRemark(e.target.value)}
                          rows="1"
                          style={iphoneInput}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                        />
                        <button
                          onClick={() =>
                            addRemark(selectedComplaint.complaint.id)
                          }
                          disabled={!newRemark.trim() || loading}
                          style={{
                            ...iphoneSendButton,
                            background:
                              newRemark.trim() && !loading ? "#018f41" : "#ccc",
                          }}
                        >
                          {loading ? <div style={spinner} /> : <SendIcon />}
                        </button>
                      </div>
                    </div>
                  )}

                {/* Member Feedback - iPhone Style Send Bar */}
                {!isChairman &&
                  selectedComplaint.flags.ask_user &&
                  selectedComplaint.complaint.user_satisfied === null && (
                    <div
                      style={{
                        marginTop: "32px",
                        padding: "24px",
                        background: "#f8f9fa",
                        borderRadius: "16px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#018f41",
                          marginBottom: "20px",
                          textAlign: "center",
                        }}
                      >
                        Are you satisfied with the resolution?
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          justifyContent: "center",
                          marginBottom: "24px",
                        }}
                      >
                        <button
                          onClick={() => setSatisfied(true)}
                          style={{
                            padding: "14px 40px",
                            background:
                              satisfied === true ? "#018f41" : "#e5e7eb",
                            color: satisfied === true ? "white" : "#333",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setSatisfied(false)}
                          style={{
                            padding: "14px 40px",
                            background:
                              satisfied === false ? "#e74c3c" : "#e5e7eb",
                            color: satisfied === false ? "white" : "#333",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          No
                        </button>
                      </div>

                      {/* Feedback Remark - Only if No */}
                      {satisfied === false && (
                        <div style={iphoneInputBar}>
                          <textarea
                            placeholder="Remark (Required)..."
                            value={feedbackRemark}
                            onChange={(e) => setFeedbackRemark(e.target.value)}
                            rows="1"
                            style={iphoneInput}
                            onInput={(e) => {
                              e.target.style.height = "auto";
                              e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                          />
                          <button
                            onClick={() =>
                              submitFeedback(selectedComplaint.complaint.id)
                            }
                            disabled={loading || !feedbackRemark.trim()}
                            style={{
                              ...iphoneSendButton,
                              background:
                                feedbackRemark.trim() && !loading
                                  ? "#018f41"
                                  : "#ccc",
                            }}
                          >
                            {loading ? <div style={spinner} /> : <SendIcon />}
                          </button>
                        </div>
                      )}

                      {/* Direct Submit if Yes */}
                      {satisfied === true && (
                        <button
                          onClick={() =>
                            submitFeedback(selectedComplaint.complaint.id)
                          }
                          disabled={loading}
                          style={{
                            ...modalStyles.primaryButton,
                            width: "100%",
                            marginTop: "16px",
                          }}
                        >
                          Submit Feedback
                        </button>
                      )}
                    </div>
                  )}
                {selectedComplaint.flags.can_close &&
                  selectedComplaint.complaint.status !== "closed" &&
                  (console.log(selectedComplaint.complaint.status),
                  (
                    <button
                      onClick={() =>
                        closeComplaint(selectedComplaint.complaint.id)
                      }
                      disabled={loading}
                      style={primaryButton}
                    >
                      {/* <LucideCheckCircle
                      size={20}
                      style={{ marginRight: "8px" }}
                    /> */}
                      Close Complaint
                    </button>
                  ))}
              </div>
            </div>
            <div style={modalStyles.footer}>
              <button
                onClick={() => setSelectedComplaint(null)}
                style={modalStyles.secondaryButton}
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        input:focus,
        textarea:focus,
        select:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
};

// Styles (unchanged — your beautiful UI preserved)
const ModalOverlay = ({ children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    }}
  >
    {children}
  </div>
);

const iphoneInputBar = {
  display: "flex",
  fontFamily: "Lato",
  alignItems: "flex-end",
  gap: "12px",
  background: "#f8f9fa",
  borderRadius: "24px",
  padding: "12px 16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e0e0e0",
};
const iphoneInput = {
  fontFamily: "Lato",
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  resize: "none",
  fontSize: "1rem",
  color: "#333",
  padding: "8px 0",
  minHeight: "40px",
};
const iphoneSendButton = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(1,143,65,0.3)",
};
const spinner = {
  width: "20px",
  height: "20px",
  border: "2px solid #fff",
  borderTop: "2px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
const SendIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const complaintCard = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s ease",
};
const primaryButton = {
  padding: "14px 40px",
  background: "#018f41",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "1.1rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(174, 251, 209, 0.3)",
  transition: "all 0.3s",
};
const inputStyle = {
  padding: "14px 16px",
  borderRadius: "20px",
  border: "2px solid #e0e0e0",
  fontSize: "1rem",
  fontFamily: "Lato",
  background: "#f8fafc",
};
const uploadLabel = {
  display: "block",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  border: "2px dashed #018f41",
  borderRadius: "12px",
  textAlign: "center",
  cursor: "pointer",
  fontWeight: "600",
  color: "#018f41",
  transition: "all 0.3s",
};

const modalStyles = {
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "640px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "32px 40px 20px",
    textAlign: "center",
    borderBottom: "1px solid #f0f0f0",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#018f41",
    margin: "0 0 8px 0",
  },
  subtitle: { color: "#64748b", fontSize: "1rem" },
  body: { padding: "32px 40px", flex: 1, overflowY: "auto" },
  footer: {
    padding: "24px 40px 40px",
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "14px 32px",
    background: "#018f41",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(174, 251, 209, 0.3)",
  },
  secondaryButton: { ...primaryButton, background: "#94a3b8" },
};

export default GlassBoxPage;
