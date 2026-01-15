import React, { useEffect, useState } from "react";
import { Save, UserRoundCog, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";

const roles = [
  "president",
  "vice-president",
  "general-secretary",
  "joint-secretary",
  "library-secretary",
  "treasury",
  "member",
  "admin",
];

const MembersPage = () => {
  const { token } = useAuth();
  const API_BASE_URL = `${baseUrl}/admin`;
  const API_TOKEN = token;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [draftUser, setDraftUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async (page = 1, searchQuery = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, {
        params: {
          page,
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
        },
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setUsers(data.data || []);
      setCurrentPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, search);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const assignRole = async (userId, role) => {
    try {
      await axios.post(
        `${API_BASE_URL}/users/role/assign/${userId}`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return true;
    } catch (err) {
      console.error("Error assigning role:", err);
      alert("Failed to update role.");
      return false;
    }
  };

  const updateStatus = async (userId, status) => {
    try {
      await axios.post(
        `${API_BASE_URL}/users/account/status/${userId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      return true;
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
      return false;
    }
  };

  const saveChanges = async () => {
    const original = users.find((u) => u.id === draftUser.id);
    let success = true;

    if (original.role !== draftUser.role) {
      success = await assignRole(draftUser.id, draftUser.role);
    }
    if (success && original.status !== draftUser.status) {
      success = await updateStatus(draftUser.id, draftUser.status);
    }

    if (success) {
      await fetchUsers(currentPage, search);
      setEditingUserId(null);
      setDraftUser(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatRole = (role) =>
    role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return (
    <div style={pageContainer}>
      {/* <header style={header}>
        <div>
          <h1 style={pageTitle}>Users Management</h1>
          <p style={subtitle}>
            Manage all members of the bar association ({total} total)
          </p>
        </div>
      </header> */}

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
            Users Management
          </h1>
          <p style={{ color: "#555", fontSize: "1.1rem" }}>
            Manage all members of the bar association ({total} total)
          </p>
        </div>
      </header>

      <div style={searchWrapper}>
        <input
          type="text"
          placeholder="Search by name or CNIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
          style={searchInput}
        />
        {loading && <Loader2 style={loadingIcon} size={24} />}
      </div>

      {error && <div style={errorBox}>Error: {error}</div>}

      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Members</h3>
        </div>

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
        ) : users.length === 0 ? (
          <div style={emptyState}>No members found</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name / Reg. Date</th>
                <th style={thStyle}>CNIC</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isEditing = editingUserId === user.id;
                const data = isEditing ? draftUser : user;

                return (
                  <tr key={user.id} style={getRowStyle()}>
                    <td style={tdStyle}>
                      <div style={nameText}>{user.name}</div>
                      <div style={regDate}>
                        Reg: {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={valueMono}>{user.cnic || "—"}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={value}>{user.email}</div>
                      <div style={valueSmall}>{user.phone || "—"}</div>
                    </td>
                    <td style={tdStyle}>
                      {isEditing ? (
                        <select
                          value={data.role}
                          onChange={(e) =>
                            setDraftUser({ ...data, role: e.target.value })
                          }
                          style={editSelect}
                        >
                          {roles.map((r) => (
                            <option key={r} value={r}>
                              {formatRole(r)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span style={roleText}>{formatRole(user.role)}</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {isEditing ? (
                        <select
                          value={data.status}
                          onChange={(e) =>
                            setDraftUser({ ...data, status: e.target.value })
                          }
                          style={editSelect}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      ) : (
                        <span style={getStatusStyle(user.status)}>
                          {user.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setDraftUser({ ...user });
                          }}
                          style={editBtn}
                          title="Edit member"
                        >
                          <UserRoundCog size={20} />
                        </button>
                      ) : (
                        <div style={editActions}>
                          <button
                            onClick={saveChanges}
                            style={saveBtn}
                            title="Save changes"
                          >
                            <Save size={18} /> Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null);
                              setDraftUser(null);
                            }}
                            style={cancelBtn}
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={pagination}>
        <span style={pageInfo}>
          Page {currentPage} of {totalPages} • {total} members
        </span>
        <div style={pageButtons}>
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((p) => p - 1)}
            style={navBtn}
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage((p) => p + 1)}
            style={navBtn}
          >
            Next
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        input:focus,
        select:focus {
          outline: none;
          border-color: #018f41;
          box-shadow: 0 0 0 3px rgba(1, 143, 65, 0.2);
        }
      `}</style>
    </div>
  );
};

const pageContainer = {
  fontFamily: "Lato",
  maxWidth: "97%",
  margin: "0 auto",
};
const header = { marginBottom: 32 };
const pageTitle = {
  fontSize: "2.4rem",
  fontWeight: 700,
  color: "#018f41",
  margin: "0 0 8px 0",
};
const subtitle = { color: "#555", fontSize: "1.1rem", margin: 0 };
const searchWrapper = { position: "relative", marginBottom: 32 };
const searchInput = {
  fontFamily: "Lato",
  width: "100%",
  maxWidth: 600,
  padding: "16px 20px",
  fontSize: "1.05rem",
  border: "2px solid #e0e0e0",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};
const loadingIcon = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#018f41",
};
const errorBox = {
  padding: "16px 20px",
  background: "#ffebee",
  color: "#c62828",
  borderRadius: 12,
  marginBottom: 24,
  border: "1px solid #ef9a9a",
};

const tableCard = {
  background: "white",
  borderRadius: 16,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  overflow: "hidden",
};
const tableHeader = {
  padding: "20px 24px",
  borderBottom: "1px solid #eee",
  background: "#f8fafc",
};
const tableTitle = {
  margin: 0,
  fontSize: "1.25rem",
  color: "#1a1a1a",
  fontWeight: 600,
};

const tableStyle = { width: "100%", borderCollapse: "collapse" };

const thStyle = {
  padding: "14px 16px",
  background: "#f1f5f9",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#4b5563",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  borderBottom: "2px solid #e2e8f0",
};

const tdStyle = {
  padding: "16px",
  borderBottom: "1px solid #f0f0f0",
  verticalAlign: "middle",
};

const getRowStyle = () => ({
  background: "white",
  transition: "background 0.15s",
  ":hover": { background: "#f8fafc" },
});

const centerLoader = {
  padding: "80px 20px",
  textAlign: "center",
  color: "#666",
};
const emptyState = {
  padding: "80px 20px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "1.1rem",
};

const nameText = { fontWeight: 600, fontSize: "1.05rem", color: "#1f2937" };
const regDate = { fontSize: "0.82rem", color: "#6b7280", marginTop: 4 };

const value = { fontSize: "0.95rem", color: "#374151" };
const valueMono = {
  fontFamily: "Lato",
  fontSize: "0.95rem",
  color: "#374151",
};
const valueSmall = { fontSize: "0.88rem", color: "#6b7280" };

const roleText = { fontSize: "0.95rem", color: "#1e40af", fontWeight: 500 };

const editSelect = {
  padding: "10px 12px",
  fontSize: "0.95rem",
  borderRadius: 10,
  border: "2px solid #e5e7eb",
  background: "white",
  width: "100%",
};

const getStatusStyle = (status) => ({
  padding: "5px 12px",
  borderRadius: 999,
  fontSize: "0.82rem",
  fontWeight: 600,
  backgroundColor:
    status === "active"
      ? "#ecfdf5"
      : status === "inactive"
      ? "#fefce8"
      : "#fee2e2",
  color:
    status === "active"
      ? "#065f46"
      : status === "inactive"
      ? "#854d0e"
      : "#991b1b",
});

const editBtn = {
  padding: "10px",
  borderRadius: 10,
  border: "none",
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "pointer",
  transition: "all 0.2s",
};
const editActions = { display: "flex", gap: 12 };
const saveBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 16px",
  borderRadius: 10,
  border: "none",
  background: "#018f41",
  color: "white",
  fontWeight: 500,
  cursor: "pointer",
};
const cancelBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 16px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  color: "#4b5563",
  fontWeight: 500,
  cursor: "pointer",
};

const pagination = {
  marginTop: 24,
  padding: "16px 24px",
  background: "#f8fafc",
  borderRadius: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 16,
};
const pageInfo = { color: "#4b5563", fontSize: "0.95rem" };
const pageButtons = { display: "flex", gap: 12 };
const navBtn = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#374151",
  fontWeight: 500,
  cursor: "pointer",
};

export default MembersPage;
