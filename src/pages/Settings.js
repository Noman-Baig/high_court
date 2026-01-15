import React, { useEffect, useState } from "react";
import {
  DollarSign,
  CreditCard,
  Sticker,
  X,
  Upload,
  Trash2,
  Edit2,
} from "lucide-react";
import axios from "axios";
import { baseUrl } from "../services/base";
import { useAuth } from "../auth/Auth";
// import { useAuth } from "../auth/Auth.jsx";

export default function Settings() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("annual");

  const [message, setMessage] = useState({ text: "", type: "" });

  const [annualFee, setAnnualFee] = useState("");
  const [editingFee, setEditingFee] = useState("");

  const [loadingFetchFee, setLoadingFetchFee] = useState(false);
  const [loadingUpdateFee, setLoadingUpdateFee] = useState(false);
  const [loadingStickers, setLoadingStickers] = useState(false);
  const [loadingStickerSave, setLoadingStickerSave] = useState(false);
  const [loadingStickerDelete, setLoadingStickerDelete] = useState(null);
  const [stickers, setStickers] = useState([]);

  const [showStickerModal, setShowStickerModal] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);
  const [stickerForm, setStickerForm] = useState({
    title: "",
    description: "",
    price: "",
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    fetchAnnualFee();
    fetchStickers();
  }, []);

  const fetchAnnualFee = async () => {
    setLoadingFetchFee(true);
    try {
      const res = await axios.get(
        "https://gextoncloud.com/gexton_hcba_new/public/api/admin/fees-settings/annual-fee",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnualFee(res.data?.annual_fee || res.data?.data?.annual_fee || 0);
    } catch (err) {
      console.error("fetchAnnualFee:", err);
      setMessage({
        text: "Could not fetch annual fee (API disabled)",
        type: "error",
      });
    } finally {
      setLoadingFetchFee(false);
    }
  };

  const handleUpdateAnnualFee = async () => {
    if (!editingFee || parseFloat(editingFee) <= 0) {
      setMessage({ text: "Enter a valid amount", type: "error" });
      return;
    }

    const newAmount = parseFloat(editingFee);

    try {
      setLoadingUpdateFee(true);

      await axios.post(
        "https://gextoncloud.com/gexton_hcba_new/public/api/admin/fees-settings/annual-fee",
        { annual_fee: String(newAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAnnualFee(newAmount);
      setEditingFee("");
      setMessage({ text: "Annual fee updated", type: "success" });
    } catch (err) {
      console.error("updateAnnualFee:", err);
      setMessage({ text: "Failed to update annual fee", type: "error" });
    } finally {
      setLoadingUpdateFee(false);
    }
  };

  const fetchStickers = async () => {
    setLoadingStickers(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/stickers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStickers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("fetchStickers:", err);
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
    if (!window.confirm("Delete this sticker?")) return;

    setLoadingStickerDelete(id);
    try {
      await axios.post(
        `${baseUrl}/admin/stickers/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStickers((prev) => prev.filter((s) => s.id !== id));
      setMessage({ text: "Sticker deleted successfully", type: "success" });
    } catch (err) {
      console.error("deleteSticker:", err);
      setMessage({ text: "Failed to delete sticker", type: "error" });
    } finally {
      setLoadingStickerDelete(null);
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
          `${baseUrl}/admin/stickers/update/${editingSticker}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        await fetchStickers();
        setMessage({ text: "Sticker updated successfully", type: "success" });
      } else {
        const res = await axios.post(
          `${baseUrl}/admin/stickers/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
    <div style={{ fontFamily: "Lato" }}>
      <div style={{ maxWidth: "100vw", margin: "0 auto" }}>
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
            Admin Settings
          </h1>
          <p style={{ color: "#6b7280", marginTop: 6 }}>
            Manage system configurations and settings
          </p>
        </header>

        {renderMessage()}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          {[
            {
              id: "annual",
              label: "Annual Fee",
              icon: <DollarSign size={16} />,
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
          {/* Annual Fee Tab */}
          {activeTab === "annual" && (
            <div style={{ padding: "10px" }}>
              <h2
                style={{
                  marginBottom: 0,
                  color: "#111827",

                  fontWeight: 600,
                  fontSize: 24,
                }}
              >
                Annual Fee
              </h2>
              <p style={{ color: "#6b7280", marginTop: "5px" }}>
                View and update the membership annual fee.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 18,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    // padding: 18,
                    borderRadius: 12,
                    // background: "white",
                    minWidth: 220,
                    // boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
                  }}
                >
                  <div
                    style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}
                  >
                    Current Annual Fee
                  </div>
                  {loadingFetchFee ? (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        className="spinner"
                        style={{ width: 24, height: 24 }}
                      />
                      <span style={{ fontSize: 14, color: "#6b7280" }}>
                        Loading...
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#018f41",
                      }}
                    >
                      PKR {annualFee.toLocaleString()}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    Update Annual Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingFee}
                    onChange={(e) => setEditingFee(e.target.value)}
                    placeholder="Enter New Amount"
                    style={{
                      fontFamily: "Lato",
                      width: "80%",
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: "1px solid #e6e6e6",
                      fontSize: "1rem",
                    }}
                  />

                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button
                      onClick={handleUpdateAnnualFee}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: loadingUpdateFee ? "#6b7280" : "#018f41",
                        color: "white",
                        border: "none",
                        cursor: loadingUpdateFee ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      disabled={loadingUpdateFee}
                    >
                      {loadingUpdateFee && (
                        <div
                          className="spinner"
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                      {loadingUpdateFee ? "Saving..." : "Update Fee"}
                    </button>

                    <button
                      onClick={() => {
                        setEditingFee("");
                      }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: 10,
                        background: "transparent",
                        border: "1px solid #e6e6e6",
                        cursor: "pointer",
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stickers Tab */}
          {activeTab === "stickers" && (
            <div style={{ padding: "10px" }}>
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
                  <span style={{ fontSize: 16, color: "#6b7280" }}>
                    Loading stickers...
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  {stickers.map((s) => (
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
                            {s.name.toUpperCase() || s.title.toUpperCase()}
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

          {/* NFC Tab  */}
          {activeTab === "nfc" && (
            <div style={{ minHeight: 160, padding: "10px" }}>
              <h2
                style={{
                  marginTop: 0,
                  color: "#111827",
                  fontWeight: 600,
                  fontSize: 24,
                }}
              >
                NFC Cards
              </h2>
              <p style={{ color: "#6b7280" }}>
                No NFC card details available yet. Tab reserved for future
                functionality.
              </p>
            </div>
          )}
        </div>

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
              padding: 20,
            }}
            onClick={() => setShowStickerModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 640,
                background: "white",
                borderRadius: 14,
                padding: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
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
        `}</style>
      </div>
    </div>
  );
}
