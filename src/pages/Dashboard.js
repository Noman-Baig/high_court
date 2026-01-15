import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";
import { Edit, Trash2 } from "lucide-react";

const API_BASE = baseUrl;

const Dashboard = () => {
  const { user, token } = useAuth();
  const role = user?.role || "member";

  const [adminCommittees, setAdminCommittees] = useState([]);
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general");
  const [committeeId, setCommitteeId] = useState("");

  // Permissions
  const isAdmin = role === "admin";
  const userChairmanCommittees =
    user?.committees?.filter((c) => c.is_chairman === true) || [];
  const isChairman = userChairmanCommittees.length > 0;
  const canAddNotice = isAdmin || isChairman;

  const canEditOrDelete = (notif) => {
    if (isAdmin) return true;
    if (isChairman) {
      return userChairmanCommittees.some(
        (c) => c.committee_id === notif.committee_id
      );
    }
    return false;
  };

  // Fetch all committees for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchAllCommittees = async () => {
        setLoadingCommittees(true);
        try {
          const res = await fetch(`${API_BASE}/committee`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await res.json();
          if (result.status && Array.isArray(result.data)) {
            setAdminCommittees(result.data);
          }
        } catch (err) {
          console.error("Failed to fetch committees:", err);
          setAdminCommittees([]);
        } finally {
          setLoadingCommittees(false);
        }
      };
      fetchAllCommittees();
    }
  }, [isAdmin, token]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/announcements/index`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();

      if (json.status && Array.isArray(json.data)) {
        const mapped = json.data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.content,
          priority:
            item.type === "general"
              ? "medium"
              : item.type === "committee"
              ? "low"
              : "high",
          date: new Date(item.posted_at || item.created_at).toLocaleDateString(
            "en-GB"
          ),
          category: item.type,
          sender: item.poster?.name || "Admin",
          posted_by: item.posted_by,
          committee: item.committee,
          committee_id: item.committee_id,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  // Modal handlers
  const openAddModal = () => {
    setTitle("");
    setContent("");
    setType(isAdmin ? "general" : "committee");
    setCommitteeId("");
    setShowAddModal(true);
  };

  const openEditModal = (n) => {
    setTitle(n.title);
    setContent(n.description);
    setType(n.category);
    setCommitteeId(n.committee_id || "");
    setSelectedNotification(n);
    setShowEditModal(true);
  };

  const handleView = (n) => {
    setSelectedNotification(n);
    setShowDetailModal(true);
  };

  // Submit notice (add or edit)
  const submitNotice = async (isEdit = false) => {
    if (!title.trim() || !content.trim()) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      type,
      ...(type === "committee" && committeeId
        ? { committee_id: Number(committeeId) }
        : {}),
    };

    const url = isEdit
      ? `${API_BASE}/announcements/update/${selectedNotification.id}`
      : `${API_BASE}/announcements/store`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.status && json.data) {
        const mapped = {
          id: json.data.id,
          title: json.data.title,
          description: json.data.content,
          priority:
            json.data.type === "general"
              ? "medium"
              : json.data.type === "committee"
              ? "low"
              : "high",
          date: new Date(
            json.data.posted_at || json.data.created_at
          ).toLocaleDateString("en-GB"),
          category: json.data.type,
          sender: json.data.poster?.name || "Admin",
          posted_by: json.data.posted_by,
          committee: json.data.committee,
          committee_id: json.data.committee_id,
        };

        if (isEdit) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === mapped.id ? mapped : n))
          );
          setShowEditModal(false);
        } else {
          setNotifications((prev) => [mapped, ...prev]);
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      const res = await fetch(`${API_BASE}/announcements/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setShowDetailModal(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    const lower = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.description.toLowerCase().includes(lower) ||
        n.sender.toLowerCase().includes(lower)
    );
  }, [notifications, searchQuery]);

  const generalNotifs = filteredNotifications.filter(
    (n) => n.category === "general"
  );
  const welfareNotifs = filteredNotifications.filter(
    (n) => n.category === "welfare"
  );
  const committeeNotifs = filteredNotifications.filter(
    (n) => n.category === "committee"
  );

  const NotificationItem = ({ n, isSmall = false }) => {
    const priorityColor =
      {
        high: "#e74c3c",
        medium: "#f39c12",
        low: "#018f41",
      }[n.priority] || "#95a5a6";

    return (
      <div
        onClick={() => handleView(n)}
        style={{
          padding: isSmall ? "12px 16px" : "16px 20px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        className="hover:bg-gray-50"
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: priorityColor,
            flexShrink: 0,
            marginTop: "6px",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span style={{ fontWeight: "600", color: "#2c3e50" }}>
              {n.title}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "#7f8c8d",
                textTransform: "capitalize",
              }}
            >
              ({n.priority})
            </span>
          </div>
          <p
            style={{
              margin: 0,
              color: "#7f8c8d",
              fontSize: isSmall ? "0.85rem" : "0.9rem",
              // background: "red",
              maxHeight: "35px",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {n.description}
          </p>
          <small
            style={{ color: "#95a5a6", display: "block", marginTop: "4px" }}
          >
            {n.date} • From: {n.sender}
          </small>
        </div>

        {canEditOrDelete(n) && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Edit
              onClick={() => openEditModal(n)}
              size={22}
              color="grey"
              className="cursor-pointer hover:text-blue-600"
            />
            <Trash2
              onClick={() => deleteAnnouncement(n.id)}
              size={22}
              color="red"
              className="cursor-pointer hover:text-red-600"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Lato",
        minHeight: "100vh",
        // background: "#f8fafc",
      }}
    >
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
              Dashboard
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Stay updated with all association activities and alerts
            </p>
          </div>
          {canAddNotice && (
            <button onClick={openAddModal} style={primaryButton}>
              + Add Notification
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
        ) : (
          <>
            <div style={{ marginBottom: "32px" }}>
              <input
                type="text"
                placeholder="Search by title, content, or sender..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={searchInput}
              />
            </div>

            <div
              className="main-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
                marginBottom: "40px",
              }}
            >
              <div style={cardStyle}>
                <div style={sectionHeader}>General Notice Board</div>
                <div style={scrollContainer}>
                  {generalNotifs.length === 0 ? (
                    <EmptyState />
                  ) : (
                    generalNotifs.map((n) => (
                      <NotificationItem key={n.id} n={n} />
                    ))
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={sectionHeader}>Welfare Notice Board</div>
                <div style={scrollContainer}>
                  {welfareNotifs.length === 0 ? (
                    <EmptyState message="No welfare notifications" />
                  ) : (
                    welfareNotifs.map((n) => (
                      <NotificationItem key={n.id} n={n} isSmall />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={sectionHeader}>Committee Notice Board</div>
              <div style={scrollContainer}>
                {committeeNotifs.length === 0 ? (
                  <EmptyState message="No committee notifications" />
                ) : (
                  committeeNotifs.map((n) => (
                    <NotificationItem key={n.id} n={n} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                {showEditModal ? "Edit" : "Add New"} Notification
              </h2>
              <p style={modalStyles.subtitle}>
                Create or update an announcement
              </p>
            </div>

            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Title - iPhone Style */}
                <div style={iphoneInputBar}>
                  <input
                    placeholder="Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Content - iPhone Style Growing Textarea */}
                <div style={iphoneInputBar}>
                  <textarea
                    placeholder="Content *"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="1"
                    style={{ ...iphoneInput, minHeight: "120px" }}
                    onInput={(e) => {
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        240
                      )}px`;
                    }}
                    required
                  />
                </div>

                {/* Type Dropdown */}
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCommitteeId("");
                  }}
                  style={inputStyle}
                >
                  {isAdmin && (
                    <>
                      <option value="general">General</option>
                      <option value="welfare">Welfare</option>
                      <option value="committee">Committee</option>
                    </>
                  )}
                  {!isAdmin && isChairman && (
                    <option value="committee">Committee</option>
                  )}
                </select>

                {/* Committee Dropdown - Only when type === committee */}
                {type === "committee" && (
                  <select
                    value={committeeId}
                    onChange={(e) => setCommitteeId(e.target.value)}
                    style={{
                      ...inputStyle,
                      opacity: loadingCommittees ? 0.7 : 1,
                    }}
                    disabled={loadingCommittees}
                    required
                  >
                    <option value="">
                      {loadingCommittees
                        ? "Loading committees..."
                        : "Select Committee"}
                    </option>

                    {isAdmin &&
                      adminCommittees.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}

                    {!isAdmin &&
                      userChairmanCommittees.map((c) => (
                        <option key={c.committee_id} value={c.committee_id}>
                          {c.committee_name}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={() => submitNotice(showEditModal)}
                disabled={!title.trim() || !content.trim()}
                style={{
                  ...modalStyles.primaryButton,
                  opacity: !title.trim() || !content.trim() ? 0.6 : 1,
                }}
              >
                {showEditModal ? "Save Changes" : "Add Notification"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                style={modalStyles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      {showDetailModal && selectedNotification && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Notification Details</h2>
              <p style={modalStyles.subtitle}>
                Posted on {selectedNotification.date} by{" "}
                {selectedNotification.sender}
              </p>
            </div>

            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "24px" }}>
                <div>
                  <strong>Title</strong>
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "1.1rem",
                      color: "#333",
                    }}
                  >
                    {selectedNotification.title}
                  </p>
                </div>

                <div>
                  <strong>Description</strong>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "16px",
                      borderRadius: "12px",
                      marginTop: "8px",
                      lineHeight: "1.7",
                      color: "#444",
                    }}
                  >
                    {selectedNotification.description}
                  </div>
                </div>

                <div>
                  <strong>Category</strong>
                  <span style={modalStyles.badge}>
                    {selectedNotification.category.charAt(0).toUpperCase() +
                      selectedNotification.category.slice(1)}
                  </span>
                </div>

                <div>
                  <strong>Priority</strong>
                  <span
                    style={{
                      ...modalStyles.badge,
                      background:
                        selectedNotification.priority === "high"
                          ? "#fee2e2"
                          : selectedNotification.priority === "medium"
                          ? "#fff7ed"
                          : "#f0fdf4",
                      color:
                        selectedNotification.priority === "high"
                          ? "#991b1b"
                          : selectedNotification.priority === "medium"
                          ? "#9c4221"
                          : "#166534",
                    }}
                  >
                    {selectedNotification.priority.charAt(0).toUpperCase() +
                      selectedNotification.priority.slice(1)}
                  </span>
                </div>

                {selectedNotification.committee && (
                  <div>
                    <strong>Committee</strong>
                    <p style={{ marginTop: "8px" }}>
                      {selectedNotification.committee}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div style={modalStyles.footer}>
              {canEditOrDelete(selectedNotification) && (
                <>
                  <button
                    onClick={() => {
                      openEditModal(selectedNotification);
                      setShowDetailModal(false);
                    }}
                    style={{
                      ...modalStyles.primaryButton,
                      background: "#f39c12",
                      boxShadow: "0 6px 20px rgba(243,156,18,0.3)",
                    }}
                  >
                    <Edit size={18} style={{ marginRight: "8px" }} />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(selectedNotification.id)}
                    style={{
                      ...modalStyles.primaryButton,
                      background: "#e74c3c",
                      boxShadow: "0 6px 20px rgba(231,76,60,0.3)",
                    }}
                  >
                    <Trash2 size={18} style={{ marginRight: "8px" }} />
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                style={modalStyles.secondaryButton}
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
};

const EmptyState = ({ message = "No notifications found" }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "#95a5a6" }}>
    <p>{message}</p>
  </div>
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

const iphoneInputBar = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "#f8f9fa",
  borderRadius: "24px",
  padding: "12px 16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  border: "1px solid #e0e0e0",
  fontFamily: "Lato",
};

const iphoneInput = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  color: "#333",
  padding: "8px 0",
  fontFamily: "Lato",
};
// Your beautiful styles — unchanged
const cardStyle = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  overflow: "hidden",
};
const sectionHeader = {
  padding: "20px",
  borderBottom: "1px solid #eee",
  fontWeight: "600",
  color: "#2c3e50",
};
const scrollContainer = { maxHeight: "600px", overflowY: "auto" };
const primaryButton = {
  padding: "14px 40px",
  background: "#018f41",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontSize: "1.1rem",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 6px 16px rgba(174, 255, 210, 0.3)",
  transition: "all 0.3s",
};
const searchInput = {
  width: "100%",
  maxWidth: "500px",
  padding: "16px 20px",
  borderRadius: "16px",
  border: "2px solid #e0e0e0",
  fontSize: "1.1rem",
  fontFamily: "Lato",
  background: "white",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};
const inputStyle = {
  padding: "14px 16px",
  borderRadius: "20px",
  border: "2px solid #e0e0e0",
  fontSize: "1rem",
  background: "#f8fafc",
  fontFamily: "Lato",
};

const modalStyles = {
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "600px",
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
  body: { padding: "32px 40px", fontFamily: "Lato" },
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
  badge: {
    padding: "6px 14px",
    borderRadius: "30px",
    fontSize: "0.9rem",
    fontWeight: "600",
    background: "#f1f5f9",
    color: "#334155",
    alignSelf: "flex-start",
  },
};

export default Dashboard;
