import React, { useState, useMemo, useEffect } from "react";
import api from "../services/api";
import {
  FileText,
  Hospital,
  Clock,
  X,
  Calendar,
  User,
  CreditCard,
  CheckCircle,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../auth/Auth";

const WelfarePage = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin" ? true : false;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarkLoading, setRemarkLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [memberCnic, setMemberCnic] = useState("");
  const [requestType, setRequestType] = useState("medical");
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentNames, setAttachmentNames] = useState([]);

  const [newRemark, setNewRemark] = useState("");
  const [amountGiven, setAmountGiven] = useState("");

  const STATUS_FLOW = ["received", "funding", "ready", "collected", "rejected"];

  const mapStatus = (backendStatus) => {
    if (!backendStatus) return "received";
    if (backendStatus === "received") return "received";
    if (backendStatus === "funding") return "funding";
    if (backendStatus === "ready" || backendStatus === "approved")
      return "ready";
    if (backendStatus === "collected" || backendStatus === "success")
      return "collected";
    if (backendStatus === "rejected") return "rejected";
    return backendStatus;
  };

  const mapBackendToFrontend = (item) => ({
    id: item.id,
    requesterId: item.user_id || "",
    requesterName: item.user || "",
    memberId: item.claimer_id || "",
    memberName: item.claimer || "",
    memberCnic: item.claimer?.cnic || "",
    type: item.type || "medical",
    details: item.reason || "",
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    status: mapStatus(item.status),
    remarks: Array.isArray(item.remarks)
      ? item.remarks.map((r) =>
          typeof r === "string"
            ? { text: r, date: new Date().toLocaleDateString("en-GB") }
            : r
        )
      : [],
    amount: item.amount ? parseFloat(item.amount) : 0,
    checkReady: item.status === "approved" || item.status === "ready",
    collected: item.status === "collected",
    createdAt: item.created_at
      ? new Date(item.created_at).toLocaleDateString("en-GB")
      : new Date().toLocaleDateString("en-GB"),
  });

  const fetchRequests = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const response = await api.get("/welfare-claims/index");
      const data = response.data.data || [];
      setRequests(data.map(mapBackendToFrontend));
    } catch (error) {
      console.error("Error fetching welfare claims:", error);
      setMessage({
        text: error?.response?.data?.message || "Failed to fetch requests",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
    setAttachmentNames(files.map((f) => f.name));
  };

  const submitNewRequest = async () => {
    if (!memberCnic || !details) {
      setMessage({ text: "CNIC and reason are required", type: "error" });
      return;
    }

    setSubLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("cnic_number", memberCnic);
      formData.append("type", requestType);
      formData.append("reason", details);

      if (attachments.length > 0)
        attachments.forEach((file) => formData.append("files[]", file));

      const response = await api.post("/welfare-claims/store", formData);

      if (response.data.data) {
        setRequests([mapBackendToFrontend(response.data.data), ...requests]);
        setMessage({
          text: response.data.message || "Request submitted successfully",
          type: "success",
        });
        resetAddForm();
        setShowAddModal(false);
        fetchRequests();
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setMessage({
        text: error?.response?.data?.message || "Failed to submit request",
        type: "error",
      });
    } finally {
      setSubLoading(false);
    }
  };

  const resetAddForm = () => {
    setMemberCnic("");
    setRequestType("medical");
    setDetails("");
    setAttachments([]);
    setAttachmentNames([]);
  };

  const addRemark = async (reqId) => {
    if (!newRemark.trim()) return;

    setRemarkLoading(true);
    try {
      const response = await api.post(`/welfare-claims/add-remark/${reqId}`, {
        remark: newRemark,
      });
      setMessage({
        text: response.data.message || "Remark added successfully",
        type: "success",
      });

      setRequests(
        requests.map((req) =>
          req.id === reqId
            ? {
                ...req,
                remarks: [
                  ...req.remarks,
                  {
                    text: newRemark,
                    date: new Date().toLocaleDateString("en-GB"),
                  },
                ],
              }
            : req
        )
      );
      setNewRemark("");
      fetchRequests();
    } catch (error) {
      console.error("Error adding remark:", error);
      setMessage({
        text: error?.response?.data?.message || "Failed to add remark",
        type: "error",
      });
    } finally {
      setRemarkLoading(false);
    }
  };

  const updateStatus = async (reqId) => {
    if (!selectedStatus) return;
    if (selectedStatus === "ready" && !amountGiven) {
      setMessage({
        text: "Amount is required when marking Ready",
        type: "error",
      });
      return;
    }

    setStatusLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = { status: selectedStatus };
      if (selectedStatus === "ready") payload.amount = amountGiven;

      const response = await api.post(
        `/welfare-claims/update-status/${reqId}`,
        payload
      );
      setMessage({
        text: response.data.message || "Status updated",
        type: "success",
      });

      setRequests(
        requests.map((req) =>
          req.id === reqId
            ? {
                ...req,
                status: selectedStatus,
                amount:
                  selectedStatus === "ready"
                    ? parseFloat(amountGiven) || req.amount
                    : req.amount,
                checkReady: selectedStatus === "ready",
                collected:
                  selectedStatus === "collected" ? true : req.collected,
              }
            : req
        )
      );

      setAmountGiven("");
      setSelectedStatus("");
      fetchRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage({
        text: error?.response?.data?.message || "Failed to update status",
        type: "error",
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        String(req.memberName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(req.memberCnic || "").includes(searchQuery) ||
        String(req.memberId || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchQuery, filterStatus]);

  const getStatusBadge = (status) => {
    const styles = {
      received: { bg: "#f39c12", text: "Received" },
      funding: { bg: "#f6b93b", text: "Funding" },
      ready: { bg: "#018f41", text: "Ready" },
      collected: { bg: "#27ae60", text: "Collected" },
      rejected: { bg: "#e74c3c", text: "Rejected" },
    };
    const s = styles[status] || { bg: "#95a5a6", text: "Unknown" };
    return (
      <span
        style={{
          background: s.bg,
          color: "white",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "0.8rem",
          fontWeight: "600",
        }}
      >
        {s.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "medical":
        return "🏥";
      case "death":
        return "🕯️";
      default:
        return "📄";
    }
  };

  const openDetails = (req) => {
    setShowDetailsModal(req.id);
    setSelectedStatus(req.status || "received");
    setAmountGiven(req.amount ? String(req.amount) : "");
  };

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
                textShadow: "0 2px 4px rgba(1,143,65,0.1)",
              }}
            >
              Welfare Assistance
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Submit and track financial aid requests
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {!isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                style={primaryButton}
              >
                + New Request
              </button>
            )}
          </div>
        </header>

        {message.text && (
          <div
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontWeight: "600",
              background: message.type === "success" ? "#e8f5e9" : "#ffebee",
              color: message.type === "success" ? "#018f41" : "#c62828",
            }}
          >
            {message.text}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Search by name, CNIC, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInput}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={filterSelect}
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="funding">Funding</option>
            <option value="ready">Ready</option>
            <option value="collected">Collected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading && (
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
        )}

        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => openDetails(req)}
                style={{
                  background: "linear-gradient(180deg, #ffffff, #f9fafb)",
                  borderRadius: 18,
                  boxShadow: "0 10px 28px rgba(2, 6, 23, 0.08)",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 36px rgba(2, 6, 23, 0.14)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 28px rgba(2, 6, 23, 0.08)";
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "16px",
                    background: "#ecfdf5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      //   width: 42,
                      //   height: 42,
                      //   borderRadius: "50%",
                      //   background: "#d1fae5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <>{req.type.toUpperCase()}</>
                  </div>

                  {getStatusBadge(req.status)}
                </div>

                {/* Body */}
                <div style={{ padding: "16px" }}>
                  <h3
                    style={{
                      margin: "0 0 6px",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {req.memberName || "—"}
                  </h3>

                  <p
                    style={{
                      margin: "8px 0",
                      color: "#475569",
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {req.details?.length > 90
                      ? req.details.slice(0, 90) + "…"
                      : req.details || "No details provided."}
                  </p>

                  {/* Meta */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "left",
                      alignItems: "center",
                      alignContent: "start",
                      marginTop: 12,
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    <Calendar style={{ marginRight: "5px" }} />{" "}
                    <span>{req.createdAt}</span>
                    {/* {req.attachments.length > 0 && (
                      <span style={{ color: "#2563eb" }}>
                        📎 {req.attachments.length}
                      </span>
                    )} */}
                  </div>

                  {/* Amount */}
                  {req.amount > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        alignContent: "start",
                        marginTop: 12,
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      <Calendar style={{ marginRight: "5px" }} /> Rs.{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {req.amount.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "center",
                        alignContent: "start",
                        marginTop: 12,
                        fontSize: 13,
                        color: "#6b7280",
                      }}
                    >
                      <Calendar style={{ marginRight: "5px" }} /> Rs.{" "}
                      <span style={{ fontWeight: "bold" }}>...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredRequests.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "100px 20px",
              color: "#9ca3af",
            }}
          >
            <div style={{ fontSize: "4.5rem", marginBottom: 16 }}>🤲</div>
            <h3 style={{ marginBottom: 6, color: "#475569" }}>
              No requests found
            </h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <ModalOverlay>
          <div style={{ ...modalContent, maxWidth: "600px" }}>
            <h2
              style={{
                textAlign: "center",
                color: "#018f41",
                marginBottom: "24px",
              }}
            >
              New Welfare Request
            </h2>

            <div style={{ display: "grid", gap: "16px" }}>
              <input
                placeholder="Member CNIC * (Required)"
                value={memberCnic}
                onChange={(e) => setMemberCnic(e.target.value)}
                style={inputStyle}
              />

              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                style={inputStyle}
              >
                <option value="medical"> Medical Emergency</option>
                <option value="death"> Death/Funeral</option>
                <option value="other"> Other</option>
              </select>

              <textarea
                placeholder="Reason / Details * (Required)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows="4"
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <label style={uploadLabel}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                {attachmentNames.length > 0
                  ? `📎 ${attachmentNames.length} file(s) selected`
                  : "Upload Documents (Optional)"}
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "12px",
                width: "100%",
              }}
            >
              <button
                onClick={submitNewRequest}
                style={{ ...primaryButton, width: "50%" }}
                disabled={!memberCnic || !details || subLoading}
              >
                {subLoading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                style={{ ...secondaryButton, width: "50%" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showDetailsModal &&
        (() => {
          const req = requests.find((r) => r.id === showDetailsModal);
          if (!req) return null;

          const currentIndex = STATUS_FLOW.indexOf(
            req.status === undefined ? "received" : req.status
          );
          const isTerminal =
            req.status === "collected" || req.status === "rejected";

          return (
            <ModalOverlay>
              <div
                style={{
                  ...modalContent,
                  maxWidth: "760px",
                  padding: "28px",
                  position: "relative",
                }}
              >
                {/* Close */}
                <button
                  onClick={() => {
                    setShowDetailsModal(null);
                    setNewRemark("");
                    setAmountGiven("");
                    setSelectedStatus("");
                  }}
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <h2
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "#065f46",
                      marginBottom: 6,
                    }}
                  >
                    Welfare Request Details
                  </h2>
                  <p style={{ color: "#6b7280", fontSize: 14 }}>
                    Request #{req.id} • {req.memberName}
                  </p>
                </div>

                {/* Status bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#ecfdf5",
                    padding: "14px 18px",
                    borderRadius: 12,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    <Calendar size={18} color="#047857" />
                    <span style={{ fontWeight: 600 }}>{req.createdAt}</span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>

                {/* Info Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <InfoItem
                    icon={<CreditCard size={16} />}
                    label="Welfare ID"
                    value={req.id}
                  />
                  <InfoItem
                    icon={<User size={16} />}
                    label="Requested by"
                    value={req.requesterName}
                  />
                  <InfoItem
                    icon={<FileText size={16} />}
                    label="Request Type"
                    value={req.type}
                  />
                  <InfoItem
                    icon={<Wallet size={16} />}
                    label="Approved Amount"
                    value={
                      req.amount > 0
                        ? `Rs. ${req.amount.toLocaleString()}`
                        : "—"
                    }
                  />
                </div>

                {/* Details */}
                <Section title="Request Details">
                  <p style={{ lineHeight: 1.6, color: "#374151" }}>
                    {req.details}
                  </p>
                </Section>

                {/* Attachments */}
                {req.attachments.length > 0 && (
                  <Section title={`Attachments (${req.attachments.length})`}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {req.attachments.map((name, i) => (
                        <span
                          key={i}
                          style={{
                            background: "#e0f2fe",
                            color: "#0369a1",
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Remarks */}
                {req.remarks.length > 0 && (
                  <Section title="Tracking Remarks">
                    {req.remarks.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          background: "#f0fdf4",
                          borderLeft: "4px solid #16a34a",
                          padding: "10px 14px",
                          borderRadius: 8,
                          marginBottom: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <MessageSquare size={14} />
                          <p style={{ margin: 0 }}>{r.text}</p>
                        </div>
                        <small style={{ color: "#6b7280" }}>{r.date}</small>
                      </div>
                    ))}
                  </Section>
                )}

                {/* Admin Actions */}
                {isAdmin && !isTerminal && (
                  <div
                    style={{
                      marginTop: 28,
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 20,
                    }}
                  >
                    {/* <h3 style={{ marginBottom: 14, color: "#065f46" }}>
                      Admin Actions
                    </h3> */}

                    {/* <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      <input
                        placeholder="Add tracking remark..."
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button
                        onClick={() => addRemark(req.id)}
                        disabled={!newRemark.trim() || remarkLoading}
                        style={primaryButton}
                      >
                        {remarkLoading ? "Adding..." : "Add"}
                      </button>
                    </div> */}

                    <div>
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
                      <div style={{ ...iphoneInputBar, marginBottom: "20px" }}>
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
                          onClick={() => addRemark(req.id)}
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

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          selectedStatus === "ready" ? "1fr 1fr" : "1fr",
                        gap: 12,
                      }}
                    >
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={inputStyle}
                      >
                        {STATUS_FLOW.map((s, idx) => (
                          <option
                            key={s}
                            value={s}
                            disabled={idx < currentIndex}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>

                      {selectedStatus === "ready" && (
                        <input
                          type="number"
                          placeholder="Amount (PKR)"
                          value={amountGiven}
                          onChange={(e) => setAmountGiven(e.target.value)}
                          style={inputStyle}
                        />
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={() => updateStatus(req.id)}
                        disabled={!selectedStatus || statusLoading}
                        style={{ ...primaryButton, width: "50%" }}
                      >
                        {statusLoading ? "Updating..." : "Update Status"}
                      </button>
                      <button
                        onClick={() => setShowDetailsModal(null)}
                        style={{ ...secondaryButton, width: "50%" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </ModalOverlay>
          );
        })()}

      <style jsx global>{`
        input:focus,
        select:focus,
        textarea:focus {
          outline: none !important;
          border-color: #018f41 !important;
          box-shadow: 0 0 0 3px rgba(1, 143, 65, 0.2);
        }
      `}</style>
    </div>
  );
};

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

const modalContent = {
  background: "white",
  borderRadius: "20px",
  padding: "32px",
  width: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
};

const primaryButton = {
  padding: "14px 28px",
  backgroundColor: "#018f41",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s",
};

const secondaryButton = { ...primaryButton, backgroundColor: "#95a5a6" };

const searchInput = {
  fontFamily: "Lato",
  flex: 1,
  minWidth: "280px",
  padding: "16px 20px",
  borderRadius: "16px",
  border: "2px solid #e0e0e0",
  fontSize: "1.1rem",
  background: "white",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};

const filterSelect = {
  fontFamily: "Lato",
  padding: "16px 20px",
  borderRadius: "16px",
  border: "2px solid #e0e0e0",
  fontSize: "1.1rem",
  background: "white",
  minWidth: "200px",
};

const inputStyle = {
  fontFamily: "Lato",
  width: "100%",
  padding: "14px 16px",
  borderRadius: "20px",
  border: "2px solid #e0e0e0",
  fontSize: "1rem",
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
};
const Section = ({ title, children }) => (
  <div style={{ marginBottom: 22 }}>
    <h4 style={{ marginBottom: 10, color: "#065f46" }}>{title}</h4>
    {children}
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div
    style={{
      background: "#f9fafb",
      padding: "12px 14px",
      borderRadius: 10,
      display: "flex",
      gap: 10,
      alignItems: "center",
    }}
  >
    {icon}
    <div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value || "—"}</div>
    </div>
  </div>
);

export default WelfarePage;
