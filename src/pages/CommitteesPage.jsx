import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";
import { EditIcon, Eye } from "lucide-react";

const CommitteesPage = () => {
  const { role, token } = useAuth();

  const isAdmin = role === "admin";
  const [committees, setCommittees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Add/Edit States
  const [committeeName, setCommitteeName] = useState("");
  const [committeeDescription, setCommitteeDescription] = useState("");
  const [chairmanId, setChairmanId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Search & Bulk
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedSelectedIds, setSelectedSelectedIds] = useState([]);

  const API_BASE = baseUrl;

  const committeeTableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0",
    background: "white",
    fontSize: "1rem",
  };

  const tableHeaderRow = {
    background: "#f1f5f9",
  };

  const tableHeaderCell = {
    padding: "16px 20px",
    textAlign: "left",
    fontWeight: "600",
    color: "#4b5563",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e2e8f0",
  };

  const tableCell = {
    padding: "16px 20px",
    borderBottom: "1px solid #f0f0f0",
    color: "#374151",
  };

  const chairmanRow = {
    background: "#e8f5e9",
  };

  const memberRow = {
    background: "white",
    transition: "background 0.2s",
  };

  const chairmanBadge = {
    padding: "6px 14px",
    background: "#018f41",
    color: "white",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: "600",
  };

  const memberBadge = {
    padding: "6px 14px",
    background: "#e0e7ff",
    color: "#4338ca",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: "600",
  };

  // Fetch committees & available users
  const fetchCommittees = async () => {
    try {
      const res = await fetch(`${API_BASE}/committee`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status) setCommittees(json.data || []);
    } catch (err) {
      console.error("Error fetching committees:", err);
    }
    setLoading(false);
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/committee/available-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.status) setAvailableUsers(json.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchCommitteeDetails = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/committee/view/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      return json.status ? json.data : null;
    } catch (err) {
      console.error("Error fetching details:", err);
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      fetchCommittees();
      fetchAvailableUsers();
    }
  }, [token]);

  const handleAddOrEdit = async (isEdit = false) => {
    if (
      !committeeName.trim() ||
      !committeeDescription.trim() ||
      !chairmanId ||
      selectedUsers.length === 0
    )
      return;

    const finalUsers = selectedUsers.includes(chairmanId)
      ? selectedUsers
      : [...selectedUsers, chairmanId];

    const payload = {
      name: committeeName.trim(),
      description: committeeDescription.trim(),
      users: finalUsers,
      chairman_id: chairmanId,
    };

    try {
      const url = isEdit
        ? `${API_BASE}/committee/update/${selectedCommittee.id}`
        : `${API_BASE}/committee/create`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status) {
        fetchCommittees();
        resetModalStates();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const resetModalStates = () => {
    setCommitteeName("");
    setCommitteeDescription("");
    setChairmanId(null);
    setSelectedUsers([]);
    setAvailableSearch("");
    setSelectedSearch("");
    setSelectedAvailableIds([]);
    setSelectedSelectedIds([]);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedCommittee(null);
  };

  const openEditModal = async (committee) => {
    setLoading(true);
    const details = await fetchCommitteeDetails(committee.id);
    if (details) {
      setLoading(false);
      setSelectedCommittee(details);
      setCommitteeName(details.name);
      setCommitteeDescription(details.description);
      const chairman = details.members.find((m) => m.role === "chairman");
      setChairmanId(chairman?.user_id || null);
      setSelectedUsers(details.members.map((m) => m.user_id));
      setShowEditModal(true);
    }
  };

  const openViewModal = async (committee) => {
    setLoading(true);
    const details = await fetchCommitteeDetails(committee.id);
    if (details) {
      setSelectedCommittee(details);
      setShowViewModal(true);
      setLoading(false);
    }
  };

  const bulkAddUsers = () => {
    const newUsers = [
      ...selectedUsers,
      ...selectedAvailableIds.filter((id) => !selectedUsers.includes(id)),
    ];
    setSelectedUsers(newUsers);
    setSelectedAvailableIds([]);
  };

  const bulkRemoveUsers = () => {
    const newUsers = selectedUsers.filter(
      (id) => !selectedSelectedIds.includes(id)
    );
    setSelectedUsers(newUsers);
    setSelectedSelectedIds([]);
    if (selectedSelectedIds.includes(chairmanId)) setChairmanId(null);
  };

  const toggleAvailableCheckbox = (id) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectedCheckbox = (id) => {
    setSelectedSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Filtered lists
  const filteredAvailableUsers = useMemo(() => {
    if (!availableSearch) return availableUsers;
    return availableUsers.filter((u) =>
      u.name.toLowerCase().includes(availableSearch.toLowerCase())
    );
  }, [availableUsers, availableSearch]);

  const filteredSelectedUsers = useMemo(() => {
    const base = selectedUsers.map((id) => {
      const member = selectedCommittee?.members?.find((m) => m.user_id === id);
      const user = member?.user || availableUsers.find((u) => u.id === id);
      return { id, name: user?.name || "Unknown" };
    });
    if (!selectedSearch) return base;
    return base.filter((u) =>
      u.name.toLowerCase().includes(selectedSearch.toLowerCase())
    );
  }, [selectedUsers, selectedSearch, selectedCommittee, availableUsers]);

  const filteredCommittees = useMemo(() => {
    if (!searchQuery) return committees;
    const q = searchQuery.toLowerCase();
    return committees.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [committees, searchQuery]);

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
                fontSize: "2.8rem",
                fontWeight: "700",
                color: "#018f41",
                margin: "0 0 8px 0",
              }}
            >
              Committees
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Manage committees seamlessly
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                resetModalStates();
                setShowAddModal(true);
              }}
              style={primaryButton}
            >
              + Add Committee
            </button>
          )}
        </header>
        <div style={{ marginBottom: "40px", maxWidth: "600px" }}>
          <input
            type="text"
            placeholder="Search by committee name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInput}
          />
        </div>
        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredCommittees.map((committee) => (
              <div key={committee.id} style={committeeCard}>
                <div
                  style={{
                    height: "120px",
                    background: "#e8f5e9",
                    position: "relative",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "#018f41",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    {committee.members_count} Members
                  </div>
                  <div
                    style={{
                      padding: "5px",

                      borderRadius: "100%",
                      textAlign: "center",
                      // background: "white",
                    }}
                  >
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/615/615075.png"
                      alt="Committee"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontSize: "1.4rem",
                      margin: "0 0 8px",
                      color: "#2c3e50",
                    }}
                  >
                    {committee.name}
                  </h3>
                  <p
                    style={{
                      color: "#7f8c8d",
                      margin: "0 0 16px",
                      fontStyle: "italic",
                      height: "40px",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    {committee.description}
                  </p>
                  {/* <button
                  onClick={() => openViewModal(committee)}
                  style={viewButton}
                >
                  View Details
                </button> */}

                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        background: "#e9f5ea",
                        display: "flex",
                        width: "40px",
                        borderRadius: "5px",
                        padding: "5px",
                        cursor: "pointer",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Eye onClick={() => openViewModal(committee)} />
                      <span style={{ fontSize: "12px" }}>View</span>
                    </div>

                    {isAdmin && (
                      <div
                        style={{
                          background: "#cddffd",
                          display: "flex",
                          width: "40px",
                          borderRadius: "5px",
                          padding: "5px",
                          cursor: "pointer",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <EditIcon onClick={() => openEditModal(committee)} />
                        <span style={{ fontSize: "12px" }}>Edit</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        {filteredCommittees.length === 0 && !loading && (
          <EmptyState isAdmin={isAdmin} />
        )}
      </div>

      {/* Add / Edit Modal */}
      {(showAddModal || showEditModal) && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                {showEditModal ? "Edit" : "Add New"} Committee
              </h2>
              <p style={modalStyles.subtitle}>
                Manage committee details and members
              </p>
            </div>
            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Name - iPhone Style */}
                <div style={iphoneInputBar}>
                  <input
                    placeholder="Committee Name *"
                    value={committeeName}
                    onChange={(e) => setCommitteeName(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Description - iPhone Style */}
                <div style={iphoneInputBar}>
                  <textarea
                    placeholder="Description *"
                    value={committeeDescription}
                    onChange={(e) => setCommitteeDescription(e.target.value)}
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

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                    marginTop: "8px",
                  }}
                >
                  {/* Available Users */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        color: "#2c3e50",
                        fontWeight: "600",
                      }}
                    >
                      Add New Members
                    </h4>

                    {/* Search */}
                    {/* <div style={iphoneInputBar}>
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={availableSearch}
                        onChange={(e) => setAvailableSearch(e.target.value)}
                        style={iphoneInput}
                      />
                    </div> */}

                    {/* User List - Fixed Height & Scroll */}
                    <div
                      style={{
                        flex: 1,
                        background: "#f8f9fa",
                        borderRadius: "16px",
                        border: "1px solid #e0e0e0",
                        padding: "12px",
                        maxHeight: "260px",
                        overflowY: "auto",
                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
                        margin: "12px 0",
                      }}
                    >
                      {filteredAvailableUsers.length === 0 ? (
                        <p
                          style={{
                            color: "#95a5a6",
                            textAlign: "center",
                            margin: "40px 0",
                            fontSize: "0.95rem",
                          }}
                        >
                          No users found
                        </p>
                      ) : (
                        filteredAvailableUsers.map((user) => (
                          <label
                            key={user.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 8px",
                              borderRadius: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              background: selectedAvailableIds.includes(user.id)
                                ? "#e8f5e9"
                                : "transparent",
                            }}
                            onMouseOver={(e) =>
                              !selectedUsers.includes(user.id) &&
                              (e.currentTarget.style.background = "#f0f0f0")
                            }
                            onMouseOut={(e) =>
                              !selectedUsers.includes(user.id) &&
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedAvailableIds.includes(user.id)}
                              onChange={() => toggleAvailableCheckbox(user.id)}
                              disabled={selectedUsers.includes(user.id)}
                              style={{
                                cursor: selectedUsers.includes(user.id)
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "1rem",
                                color: selectedUsers.includes(user.id)
                                  ? "#95a5a6"
                                  : "#333",
                              }}
                            >
                              {user.name}
                              {selectedUsers.includes(user.id) && " (Added)"}
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={bulkAddUsers}
                      disabled={selectedAvailableIds.length === 0}
                      style={{
                        ...modalStyles.primaryButton,
                        width: "100%",
                        background:
                          selectedAvailableIds.length === 0
                            ? "#ccc"
                            : "#018f41",
                        opacity: selectedAvailableIds.length === 0 ? 0.7 : 1,
                        cursor:
                          selectedAvailableIds.length === 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Add ({selectedAvailableIds.length})
                    </button>
                  </div>

                  {/* Selected Members */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        color: "#2c3e50",
                        fontWeight: "600",
                      }}
                    >
                      Current Members
                    </h4>

                    {/* Search */}
                    {/* <div style={iphoneInputBar}>
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={selectedSearch}
                        onChange={(e) => setSelectedSearch(e.target.value)}
                        style={iphoneInput}
                      />
                    </div> */}

                    {/* User List - Fixed Height & Scroll */}
                    <div
                      style={{
                        flex: 1,
                        background: "#f8f9fa",
                        borderRadius: "16px",
                        border: "1px solid #e0e0e0",
                        padding: "12px",
                        maxHeight: "260px",
                        overflowY: "auto",
                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
                        margin: "12px 0",
                      }}
                    >
                      {filteredSelectedUsers.length === 0 ? (
                        <p
                          style={{
                            color: "#95a5a6",
                            textAlign: "center",
                            margin: "40px 0",
                            fontSize: "0.95rem",
                          }}
                        >
                          No members selected
                        </p>
                      ) : (
                        filteredSelectedUsers.map((user) => (
                          <label
                            key={user.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 8px",
                              borderRadius: "12px",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              background: selectedSelectedIds.includes(user.id)
                                ? "#fee2e2"
                                : "transparent",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background =
                                selectedSelectedIds.includes(user.id)
                                  ? "#fee2e2"
                                  : "#f0f0f0")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background =
                                selectedSelectedIds.includes(user.id)
                                  ? "#fee2e2"
                                  : "transparent")
                            }
                          >
                            <input
                              type="checkbox"
                              checked={selectedSelectedIds.includes(user.id)}
                              onChange={() => toggleSelectedCheckbox(user.id)}
                            />
                            <span style={{ fontSize: "1rem", color: "#333" }}>
                              {user.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={bulkRemoveUsers}
                      disabled={selectedSelectedIds.length === 0}
                      style={{
                        ...modalStyles.primaryButton,
                        width: "100%",
                        background:
                          selectedSelectedIds.length === 0 ? "#ccc" : "#e74c3c",
                        opacity: selectedSelectedIds.length === 0 ? 0.7 : 1,
                        cursor:
                          selectedSelectedIds.length === 0
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      Remove ({selectedSelectedIds.length})
                    </button>
                  </div>
                </div>

                {/* Chairman Select */}
                <select
                  value={chairmanId || ""}
                  onChange={(e) =>
                    setChairmanId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  style={{
                    fontFamily: "Lato",
                    border: "1px solid #d3d3d3",
                    borderRadius: "15px",
                    padding: "20px",
                  }}
                >
                  <option value="">Select Chairman</option>
                  {selectedUsers.map((id) => {
                    const user =
                      availableUsers.find((u) => u.id === id) ||
                      selectedCommittee?.members?.find((m) => m.user_id === id)
                        ?.user;
                    return (
                      <option key={id} value={id}>
                        {user?.name || "Unknown"}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div style={modalStyles.footer}>
              <button
                onClick={() => handleAddOrEdit(showEditModal)}
                disabled={
                  !committeeName.trim() ||
                  !committeeDescription.trim() ||
                  !chairmanId ||
                  selectedUsers.length === 0
                }
                style={{
                  ...modalStyles.primaryButton,
                  opacity:
                    !committeeName.trim() ||
                    !committeeDescription.trim() ||
                    !chairmanId ||
                    selectedUsers.length === 0
                      ? 0.6
                      : 1,
                }}
              >
                {showEditModal ? "Update" : "Create"} Committee
              </button>
              <button
                onClick={resetModalStates}
                style={modalStyles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* View Modal */}
      {/* {showViewModal && selectedCommittee && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>{selectedCommittee.name}</h2>
              <p style={modalStyles.subtitle}>
                {selectedCommittee.members_count} Members
              </p>
            </div>
            <div style={modalStyles.body}>
              <p
                style={{
                  lineHeight: "1.7",
                  color: "#555",
                  marginBottom: "24px",
                }}
              >
                {selectedCommittee.description}
              </p>
              <h4 style={{ color: "#2c3e50", margin: "24px 0 12px" }}>
                Members
              </h4>
              <div style={{ display: "grid", gap: "12px" }}>
                {selectedCommittee.members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: "12px 16px",
                      background: m.role === "chairman" ? "#e8f5e9" : "#f8f9fa",
                      borderRadius: "12px",
                    }}
                  >
                    <strong>{m.user.name}</strong>{" "}
                    {m.role === "chairman" && (
                      <span style={{ color: "#018f41", fontWeight: "600" }}>
                        {" "}
                        (Chairman)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div style={modalStyles.footer}>
              <button
                onClick={() => setShowViewModal(false)}
                style={modalStyles.secondaryButton}
              >
                Close
              </button>
            </div>
          </div>
        </ModalOverlay>
      )} */}
      {showViewModal && selectedCommittee && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>{selectedCommittee.name}</h2>
              <p style={modalStyles.subtitle}>
                {selectedCommittee.members_count} Member
                {selectedCommittee.members_count !== 1 ? "s" : ""}
              </p>
            </div>

            <div style={modalStyles.body}>
              <p
                style={{
                  lineHeight: "1.7",
                  color: "#555",
                  marginBottom: "32px",
                  fontSize: "1.05rem",
                }}
              >
                {selectedCommittee.description}
              </p>

              <h4
                style={{
                  color: "#2c3e50",
                  margin: "0 0 16px",
                  fontSize: "1.3rem",
                  fontWeight: "600",
                }}
              >
                Committee Members
              </h4>

              {/* Responsive Table */}
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <table style={committeeTableStyle}>
                  <thead>
                    <tr style={tableHeaderRow}>
                      <th style={tableHeaderCell}>Sr#</th>
                      <th style={tableHeaderCell}>Name</th>
                      <th style={tableHeaderCell}>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Chairman First */}
                    {selectedCommittee.members
                      .filter((m) => m.role === "chairman")
                      .map((m, idx) => (
                        <tr key={m.id} style={chairmanRow}>
                          <td style={tableCell}>{idx + 1}</td>
                          <td style={tableCell}>
                            <strong>{m.user.name}</strong>
                          </td>
                          <td style={tableCell}>
                            <span style={chairmanBadge}>Chairman</span>
                          </td>
                        </tr>
                      ))}

                    {/* Other Members */}
                    {selectedCommittee.members
                      .filter((m) => m.role !== "chairman")
                      .map((m, idx) => (
                        <tr key={m.id} style={memberRow}>
                          <td style={tableCell}>
                            {selectedCommittee.members.filter(
                              (c) => c.role === "chairman"
                            ).length +
                              idx +
                              1}
                          </td>
                          <td style={tableCell}>{m.user.name}</td>
                          <td style={tableCell}>
                            <span style={memberBadge}>Member</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {selectedCommittee.members.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#94a3b8",
                  }}
                >
                  No members assigned yet.
                </div>
              )}
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={() => setShowViewModal(false)}
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

// Reusable Components & Styles

const iphoneInputBar = {
  fontFamily: "Lato",
  display: "flex",
  alignItems: "center",
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
  fontSize: "1rem",
  color: "#333",
  padding: "8px 0",
};

const EmptyState = ({ isAdmin }) => (
  <div style={{ textAlign: "center", padding: "80px 20px", color: "#95a5a6" }}>
    <img
      src="https://static.vecteezy.com/system/resources/thumbnails/002/387/693/small/user-profile-icon-free-vector.jpg"
      alt="Committee"
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        marginBottom: "20px",
      }}
    />
    <h3>No committees found</h3>
    <p>
      {isAdmin
        ? "Start by adding your first committee!"
        : "Check back later for new additions."}
    </p>
  </div>
);

const committeeCard = {
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  overflow: "hidden",
  transition: "all 0.4s ease",
  cursor: "default",
};
const viewButton = {
  width: "100%",
  padding: "12px",
  background: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "16px",
};
const editButton = {
  width: "100%",
  padding: "12px",
  background: "#018f41",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "12px",
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
const searchInput = {
  fontFamily: "Lato",
  width: "100%",
  padding: "16px 20px",
  borderRadius: "16px",
  border: "2px solid #e0e0e0",
  fontSize: "1.1rem",
  background: "white",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
};
const inputStyle = {
  padding: "14px 16px",
  borderRadius: "12px",
  border: "2px solid #e0e0e0",
  fontSize: "1rem",
  background: "#f8fafc",
};
const searchBox = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
};
const memberList = {
  maxHeight: "200px",
  overflowY: "auto",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "10px",
  marginBottom: "10px",
};
const memberItem = {
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
  cursor: "pointer",
};
const actionBtn = {
  width: "100%",
  padding: "10px",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const modalStyles = {
  card: {
    background: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "800px",
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
  secondaryButton: {
    padding: "14px 32px",
    // background: "#018f41",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(174, 251, 209, 0.3)",
    background: "#94a3b8",
  },
};
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
export default CommitteesPage;
