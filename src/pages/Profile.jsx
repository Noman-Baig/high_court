import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Sticker,
  X,
  Upload,
  Trash2,
  Edit2,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { baseUrl } from "../services/base";
import { useAuth } from "../auth/Auth";
// import { useAuth } from "../auth/Auth.jsx";

export default function Profile() {
  const { token, user } = useAuth();
  const API_BASE_URL = baseUrl;
  const API_TOKEN = token;

  const [activeTab, setActiveTab] = useState("personal");

  const [message, setMessage] = useState({ text: "", type: "" });

  const [userDetails, setUserDetails] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingStickers, setLoadingStickers] = useState(false);
  const [loadingStickerSave, setLoadingStickerSave] = useState(false);
  const [loadingStickerDelete, setLoadingStickerDelete] = useState(null);
  const [stickers, setStickers] = useState([]);

  const [nfcCards, setNfcCards] = useState([]);
  const [nfcRequests, setNfcRequests] = useState([]);
  const [loadingNfcCards, setLoadingNfcCards] = useState(false);
  const [loadingNfcRequests, setLoadingNfcRequests] = useState(false);
  const [showNfcRequestModal, setShowNfcRequestModal] = useState(false);
  const [nfcRequestForm, setNfcRequestForm] = useState({
    request_type: "lost",
    reason: "",
  });
  const [loadingNfcRequest, setLoadingNfcRequest] = useState(false);
  const [togglingCardId, setTogglingCardId] = useState(null);

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stickerToDelete, setStickerToDelete] = useState(null);
  const [editingSticker, setEditingSticker] = useState(null);
  const [stickerForm, setStickerForm] = useState({
    title: "",
    description: "",
    price: "",
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    loadUserDetails();
    fetchStickers();
    fetchNfcCards();
    fetchNfcRequests();
  }, []);

  const loadUserDetails = () => {
    try {
      const details = localStorage.getItem("myDetails");
      if (details) {
        setUserDetails(JSON.parse(details));
      }
    } catch (err) {
      console.error("Error loading user details:", err);
    }
  };

  const handlePasswordUpdate = () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ text: "Please fill both password fields", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    // API integration pending
    setMessage({ text: "Password update feature coming soon", type: "info" });
  };

  const fetchNfcCards = async () => {
    setLoadingNfcCards(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/nfc/cards`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setNfcCards(data.data || []);
    } catch (err) {
      console.error("Error fetching NFC cards:", err);
    } finally {
      setLoadingNfcCards(false);
    }
  };

  const fetchNfcRequests = async () => {
    setLoadingNfcRequests(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/nfc/requests`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setNfcRequests(data.data || []);
    } catch (err) {
      console.error("Error fetching NFC requests:", err);
    } finally {
      setLoadingNfcRequests(false);
    }
  };

  const handleNfcRequestSubmit = async () => {
    if (!nfcRequestForm.reason.trim()) {
      setMessage({ text: "Please provide a reason", type: "error" });
      return;
    }
    setLoadingNfcRequest(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/nfc/requests`,
        nfcRequestForm,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setMessage({
        text: "NFC request submitted successfully",
        type: "success",
      });
      setShowNfcRequestModal(false);
      setNfcRequestForm({ request_type: "lost", reason: "" });
      fetchNfcRequests();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Error submitting request",
        type: "error",
      });
    } finally {
      setLoadingNfcRequest(false);
    }
  };

  const handleToggleCard = async (cardId) => {
    setTogglingCardId(cardId);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/nfc/cards/${cardId}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setMessage({
        text: "Card status updated successfully",
        type: "success",
      });
      fetchNfcCards();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Error toggling card status",
        type: "error",
      });
    } finally {
      setTogglingCardId(null);
    }
  };

  const fetchStickers = async () => {
    setLoadingStickers(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/stickers`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      const data = res.data?.data || res.data;
      setStickers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchStickers:", err);
      setStickers([]);
      setMessage({ text: "Could not fetch stickers", type: "error" });
    } finally {
      setLoadingStickers(false);
    }
  };

  const openCreateSticker = () => {
    setEditingSticker(null);
    setStickerForm({
      title: "",
      description: "",
      price: "",
      imageFile: null,
      imagePreview: "",
    });
    setShowStickerModal(true);
  };

  const openEditSticker = (st) => {
    setEditingSticker(st.id);
    setStickerForm({
      title: st.name || st.title,
      description: st.description || "",
      price: st.price,
      imageFile: null,
      imagePreview: st.image,
    });
    setShowStickerModal(true);
  };

  const handleStickerDelete = async (id) => {
    setStickerToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteSticker = async () => {
    if (!stickerToDelete) return;

    setLoadingStickerDelete(stickerToDelete);
    setShowDeleteModal(false);
    try {
      await axios.post(
        `${API_BASE_URL}/admin/stickers/delete/${stickerToDelete}`,
        {},
        { headers: { Authorization: `Bearer ${API_TOKEN}` } }
      );
      setStickers((prev) => prev.filter((s) => s.id !== stickerToDelete));
      setMessage({ text: "Sticker deleted successfully", type: "success" });
    } catch (err) {
      console.error("deleteSticker:", err);
      setMessage({ text: "Failed to delete sticker", type: "error" });
    } finally {
      setLoadingStickerDelete(null);
      setStickerToDelete(null);
    }
  };

  const handleStickerSave = async () => {
    const { title, description, price, imageFile } = stickerForm;
    if (!title || !price) {
      setMessage({
        text: "Please fill sticker name and price",
        type: "error",
      });
      return;
    }

    setLoadingStickerSave(true);
    try {
      const formData = new FormData();
      formData.append("name", title);
      formData.append("description", description || "");
      formData.append("price", price);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingSticker) {
        const res = await axios.post(
          `${API_BASE_URL}/admin/stickers/update/${editingSticker}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        await fetchStickers();
        setMessage({ text: "Sticker updated successfully", type: "success" });
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/admin/stickers/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        await fetchStickers();
        setMessage({ text: "Sticker created successfully", type: "success" });
      }

      setShowStickerModal(false);
    } catch (err) {
      setMessage({ text: "Failed to save sticker", type: "error" });
    } finally {
      setLoadingStickerSave(false);
    }
  };

  const handleStickerImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setStickerForm((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const renderMessage = () => {
    if (!message.text) return null;
    return (
      <div
        style={{
          padding: "12px 20px",
          borderRadius: 12,
          marginBottom: 20,
          fontWeight: 600,
          background: message.type === "success" ? "#e8f5e9" : "#ffebee",
          color: message.type === "success" ? "#018f41" : "#c62828",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{message.text}</span>
        <button
          onClick={() => setMessage({ text: "", type: "" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "inherit",
          }}
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  return (
    <div
      style={{
        fontFamily: "Lato",
        padding: "18px 20px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <header style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontSize: "2.6rem",
              fontWeight: "700",
              color: "#018f41",
              margin: "0 0 8px 0",
              textShadow: "0 2px 4px rgba(1,143,65,0.1)",
            }}
          >
            Profile
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Manage system configurations and settings
          </p>
        </header>

        {renderMessage()}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              id: "personal",
              label: "Personal Details",
              icon: <User size={16} />,
            },
            { id: "stickers", label: "Stickers", icon: <Sticker size={16} /> },
            { id: "nfc", label: "NFC Cards", icon: <CreditCard size={16} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border:
                  activeTab === t.id
                    ? "2px solid #018f41"
                    : "1px solid #e6e6e6",
                background:
                  activeTab === t.id
                    ? "linear-gradient(180deg,#ffffff,#f2fbf5)"
                    : "white",
                boxShadow:
                  activeTab === t.id
                    ? "0 6px 18px rgba(1,143,65,0.06)"
                    : "none",
                cursor: "pointer",
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontWeight: 600,
                minWidth: "fit-content",
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content area */}
        <div
          style={{
            background: "linear-gradient(180deg,#ffffff,#f9fafb)",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 10px 28px rgba(2,6,23,0.06)",
          }}
        >
          {/* Personal Details Tab */}
          {activeTab === "personal" && (
            <div>
              <h2
                style={{
                  marginTop: 0,
                  color: "#111827",
                  fontWeight: 600,
                  fontSize: 24,
                }}
              >
                Personal Details
              </h2>
              <p style={{ color: "#6b7280" }}>
                View your personal information and update your password.
              </p>

              {userDetails ? (
                <div style={{ marginTop: 20 }}>
                  {/* Personal Information */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                      marginBottom: 20,
                    }}
                  >
                    <h3
                      style={{ marginTop: 0, color: "#374151", fontSize: 18 }}
                    >
                      Profile Information
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 16,
                        marginTop: 16,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Full Name
                        </label>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {userDetails.name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          CNIC
                        </label>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {userDetails.cnic || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Email
                        </label>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {userDetails.email || "N/A"}
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            color: "#6b7280",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Phone
                        </label>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {userDetails.phone || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password Update Section */}
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                    }}
                  >
                    <h3
                      style={{ marginTop: 0, color: "#374151", fontSize: 18 }}
                    >
                      Update Password
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: 16,
                        marginTop: 16,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          New Password
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            style={{
                              width: "100%",
                              padding: "12px 40px 12px 14px",
                              borderRadius: 10,
                              border: "1px solid #e6e6e6",
                              fontSize: "1rem",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                              position: "absolute",
                              right: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 8,
                            }}
                          >
                            {showNewPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: 8,
                            color: "#374151",
                            fontWeight: 600,
                          }}
                        >
                          Confirm Password
                        </label>
                        <div style={{ position: "relative" }}>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            style={{
                              width: "100%",
                              padding: "12px 40px 12px 14px",
                              borderRadius: 10,
                              border: "1px solid #e6e6e6",
                              fontSize: "1rem",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            style={{
                              position: "absolute",
                              right: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 8,
                            }}
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handlePasswordUpdate}
                      style={{
                        marginTop: 16,
                        padding: "10px 20px",
                        borderRadius: 10,
                        background: "#018f41",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#6b7280" }}
                >
                  No user details found
                </div>
              )}
            </div>
          )}

          {/* Stickers Tab */}
          {activeTab === "stickers" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: 24,
                  }}
                >
                  Stickers
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={openCreateSticker}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "#018f41",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    + Create Sticker
                  </button>
                </div>
              </div>

              {loadingStickers ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 200,
                    gap: 12,
                  }}
                >
                  <div className="spinner" style={{ width: 32, height: 32 }} />
                  <Loader2
                    style={{
                      animation: "spin 1s linear infinite",
                      color: "#018f41",
                    }}
                    size={36}
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill,minmax(min(240px, 100%), 1fr))",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  {stickers?.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        background: "white",
                        borderRadius: 12,
                        padding: 12,
                        boxShadow: "0 8px 20px rgba(2,6,23,0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <img
                        src={`https://www.gextoncloud.com/gexton_hcba_new/public/${s.image}`}
                        alt={s.name || s.title}
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {s.name || s.title}
                          </div>
                          {s.description && (
                            <div
                              style={{
                                color: "#6b7280",
                                fontSize: 11,
                                marginTop: 2,
                              }}
                            >
                              {s.description}
                            </div>
                          )}
                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: 13,
                              marginTop: 4,
                            }}
                          >
                            PKR {s.price}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => openEditSticker(s)}
                            title="Edit"
                            disabled={loadingStickerDelete === s.id}
                            style={{
                              padding: 8,
                              borderRadius: 8,
                              border: "none",
                              cursor:
                                loadingStickerDelete === s.id
                                  ? "not-allowed"
                                  : "pointer",
                              background: "#f3f4f6",
                              opacity: loadingStickerDelete === s.id ? 0.5 : 1,
                            }}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleStickerDelete(s.id)}
                            title="Delete"
                            disabled={loadingStickerDelete === s.id}
                            style={{
                              padding: 8,
                              borderRadius: 8,
                              border: "none",
                              cursor:
                                loadingStickerDelete === s.id
                                  ? "not-allowed"
                                  : "pointer",
                              background: "#fff4f4",
                              opacity: loadingStickerDelete === s.id ? 0.5 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {loadingStickerDelete === s.id ? (
                              <div
                                className="spinner"
                                style={{ width: 16, height: 16 }}
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NFC Cards Tab */}
          {activeTab === "nfc" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      color: "#111827",
                      fontWeight: 600,
                      fontSize: 24,
                    }}
                  >
                    NFC Cards
                  </h2>
                  <p style={{ color: "#6b7280", marginTop: 6 }}>
                    Manage your NFC cards and requests
                  </p>
                </div>
                <button
                  onClick={() => setShowNfcRequestModal(true)}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "#018f41",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  + New Request
                </button>
              </div>

              {/* NFC Cards */}
              <div style={{ marginBottom: 24 }}>
                <h3
                  style={{ color: "#374151", fontSize: 18, marginBottom: 12 }}
                >
                  My Cards
                </h3>
                {loadingNfcCards ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 120,
                      gap: 12,
                    }}
                  >
                    <div
                      className="spinner"
                      style={{ width: 32, height: 32 }}
                    />
                    <Loader2
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#018f41",
                      }}
                      size={36}
                    />
                  </div>
                ) : nfcCards.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {nfcCards.map((card) => (
                      <div
                        key={card.id}
                        style={{
                          background: "white",
                          borderRadius: 12,
                          padding: 16,
                          boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: 12,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 16,
                                color: "#111827",
                              }}
                            >
                              Card #{card.card_number || card.id}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                                marginTop: 4,
                              }}
                            >
                              {card.card_type || "Standard"}
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "4px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                card.status === "active"
                                  ? "#d1fae5"
                                  : "#fee2e2",
                              color:
                                card.status === "active"
                                  ? "#065f46"
                                  : "#991b1b",
                            }}
                          >
                            {card.status || "Inactive"}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#6b7280",
                            marginBottom: 12,
                          }}
                        >
                          Issued:{" "}
                          {card.issued_at
                            ? new Date(card.issued_at).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <button
                          onClick={() => handleToggleCard(card.id)}
                          disabled={togglingCardId === card.id}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #e6e6e6",
                            background:
                              togglingCardId === card.id ? "#f3f4f6" : "white",
                            cursor:
                              togglingCardId === card.id
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          {togglingCardId === card.id ? (
                            <>
                              <div
                                className="spinner"
                                style={{ width: 16, height: 16 }}
                              />
                              Updating...
                            </>
                          ) : (
                            `${
                              card.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            } Card`
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 32,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No NFC cards found
                  </div>
                )}
              </div>

              {/* NFC Requests */}
              <div>
                <h3
                  style={{ color: "#374151", fontSize: 18, marginBottom: 12 }}
                >
                  Request History
                </h3>
                {loadingNfcRequests ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 120,
                      gap: 12,
                    }}
                  >
                    <div
                      className="spinner"
                      style={{ width: 32, height: 32 }}
                    />
                    <Loader2
                      style={{
                        animation: "spin 1s linear infinite",
                        color: "#018f41",
                      }}
                      size={36}
                    />
                  </div>
                ) : nfcRequests.length > 0 ? (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      overflow: "auto",
                    }}
                  >
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "#f9fafb" }}>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Request Type
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Reason
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              padding: "12px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {nfcRequests.map((req) => (
                          <tr
                            key={req.id}
                            style={{ borderTop: "1px solid #f3f4f6" }}
                          >
                            <td
                              style={{ padding: "12px 16px", color: "#111827" }}
                            >
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  background:
                                    req.request_type === "lost"
                                      ? "#fef3c7"
                                      : "#dbeafe",
                                  color:
                                    req.request_type === "lost"
                                      ? "#92400e"
                                      : "#1e40af",
                                }}
                              >
                                {req.request_type}
                              </span>
                            </td>
                            <td
                              style={{ padding: "12px 16px", color: "#6b7280" }}
                            >
                              {req.reason}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  background:
                                    req.status === "approved"
                                      ? "#d1fae5"
                                      : req.status === "rejected"
                                      ? "#fee2e2"
                                      : "#e5e7eb",
                                  color:
                                    req.status === "approved"
                                      ? "#065f46"
                                      : req.status === "rejected"
                                      ? "#991b1b"
                                      : "#374151",
                                }}
                              >
                                {req.status || "pending"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 16px",
                                color: "#6b7280",
                                fontSize: 13,
                              }}
                            >
                              {req.created_at
                                ? new Date(req.created_at).toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 12,
                      padding: 32,
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No requests found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NFC Request Modal */}
        {showNfcRequestModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "10px",
            }}
            onClick={() => setShowNfcRequestModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "min(500px, calc(100vw - 20px))",
                background: "white",
                borderRadius: 14,
                padding: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                  New NFC Request
                </h3>
                <button
                  onClick={() => setShowNfcRequestModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X />
                </button>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#374151",
                  }}
                >
                  Request Type
                </label>
                <select
                  value={nfcRequestForm.request_type}
                  onChange={(e) =>
                    setNfcRequestForm((p) => ({
                      ...p,
                      request_type: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    marginBottom: 16,
                    fontSize: 14,
                  }}
                >
                  <option value="lost">Lost</option>
                  <option value="damaged">Damaged</option>
                </select>

                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "#374151",
                  }}
                >
                  Reason
                </label>
                <textarea
                  value={nfcRequestForm.reason}
                  onChange={(e) =>
                    setNfcRequestForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  placeholder="Describe your reason..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    resize: "vertical",
                    fontSize: 14,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <button
                  onClick={() => setShowNfcRequestModal(false)}
                  disabled={loadingNfcRequest}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    background: "white",
                    cursor: loadingNfcRequest ? "not-allowed" : "pointer",
                    opacity: loadingNfcRequest ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNfcRequestSubmit}
                  disabled={loadingNfcRequest}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: loadingNfcRequest ? "#6b7280" : "#018f41",
                    color: "white",
                    border: "none",
                    cursor: loadingNfcRequest ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 600,
                  }}
                >
                  {loadingNfcRequest && (
                    <div
                      className="spinner"
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                  {loadingNfcRequest ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticker Modal (create / edit) */}
        {showStickerModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "10px",
            }}
            onClick={() => setShowStickerModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "min(640px, calc(100vw - 20px))",
                background: "white",
                borderRadius: 14,
                padding: "20px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {editingSticker ? "Edit Sticker" : "Create Sticker"}
                </h3>
                <button
                  onClick={() => setShowStickerModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X />
                </button>
              </div>

              <div
                className="modal-grid-responsive"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Name
                  </label>
                  <input
                    value={stickerForm.title}
                    onChange={(e) =>
                      setStickerForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Sticker name"
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6e6e6",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginTop: 12,
                      marginBottom: 6,
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={stickerForm.description}
                    onChange={(e) =>
                      setStickerForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Sticker description"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6e6e6",
                      resize: "vertical",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginTop: 12,
                      marginBottom: 6,
                    }}
                  >
                    Price (PKR)
                  </label>
                  <input
                    value={stickerForm.price}
                    onChange={(e) =>
                      setStickerForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="Price"
                    type="number"
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #e6e6e6",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Image
                  </label>
                  <div
                    onClick={() =>
                      document.getElementById("stickerModalImage").click()
                    }
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      border: "2px dashed #e6e6e6",
                      textAlign: "center",
                      cursor: "pointer",
                      minHeight: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stickerForm.imagePreview ? (
                      <img
                        src={`https://www.gextoncloud.com/gexton_hcba_new/public/${stickerForm.imagePreview}`}
                        alt="preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div style={{ textAlign: "center", color: "#6b7280" }}>
                        <Upload />
                        <div style={{ marginTop: 8, fontWeight: 600 }}>
                          Click to upload
                        </div>
                      </div>
                    )}
                    <input
                      id="stickerModalImage"
                      type="file"
                      accept="image/*"
                      onChange={handleStickerImageUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                  marginTop: 14,
                }}
              >
                <button
                  onClick={() => setShowStickerModal(false)}
                  disabled={loadingStickerSave}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    background: "transparent",
                    cursor: loadingStickerSave ? "not-allowed" : "pointer",
                    opacity: loadingStickerSave ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStickerSave}
                  disabled={loadingStickerSave}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: loadingStickerSave ? "#6b7280" : "#018f41",
                    color: "white",
                    border: "none",
                    cursor: loadingStickerSave ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {loadingStickerSave && (
                    <div
                      className="spinner"
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                  {loadingStickerSave ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1001,
              padding: "10px",
            }}
            onClick={() => {
              setShowDeleteModal(false);
              setStickerToDelete(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "min(420px, calc(100vw - 20px))",
                background: "white",
                borderRadius: 14,
                padding: 24,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                animation: "modalFadeIn 0.2s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={28} style={{ color: "#dc2626" }} />
                </div>
              </div>

              <h3
                style={{
                  margin: "0 0 8px 0",
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Delete Sticker?
              </h3>

              <p
                style={{
                  margin: "0 0 24px 0",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Are you sure you want to delete this sticker? This action cannot
                be undone.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "stretch",
                }}
              >
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setStickerToDelete(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#374151",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSticker}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          input:focus,
          select:focus,
          textarea:focus {
            outline: none !important;
            border-color: #018f41 !important;
            box-shadow: 0 0 0 3px rgba(1, 143, 65, 0.12);
          }

          .spinner {
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          /* Responsive styles */
          @media (max-width: 768px) {
            h1 {
              font-size: 2rem !important;
            }

            /* Make modal grid single column on mobile */
            .modal-grid-responsive {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 480px) {
            h1 {
              font-size: 1.75rem !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
