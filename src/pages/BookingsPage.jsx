import React, { useState, useEffect } from "react";
import {
  Save,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  CalendarIcon,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";

const days = ["S", "M", "T", "W", "T", "F", "S"];

const Calendar = ({ month, availableDates, onSelect, today }) => {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const firstDay = new Date(year, mon, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(new Date(year, mon, d));
  }
  const monthName = month.toLocaleString("default", { month: "long" });
  return (
    <div
      style={{
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{ textAlign: "center", marginBottom: "12px", color: "#018f41" }}
      >
        {monthName} {year}
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {days.map((d) => (
          <div
            key={d}
            style={{ textAlign: "center", fontWeight: "600", color: "#64748b" }}
          >
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            {day
              ? (() => {
                  const dateStr = day.toISOString().split("T")[0];
                  const isAvailable = availableDates.includes(dateStr);
                  const isPast = day < today;
                  return (
                    <button
                      disabled={!isAvailable || isPast}
                      onClick={() => onSelect(dateStr)}
                      style={{
                        background:
                          isAvailable && !isPast ? "#e8f5e9" : "lightgray",
                        textDecoration:
                          isAvailable && !isPast ? "none" : "line-through",
                        color: isAvailable && !isPast ? "#018f41" : "gray",
                        border: "1px solid #ddd",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        cursor:
                          isAvailable && !isPast ? "pointer" : "not-allowed",
                      }}
                    >
                      {day.getDate()}
                    </button>
                  );
                })()
              : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const CalendarPicker = ({ availableDates, onSelect }) => {
  const today = new Date(); // Use current date
  const month1 = new Date(today.getFullYear(), today.getMonth(), 1);
  const month2 = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return (
    <div
      style={{
        display: "flex",
        gap: "24px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      <Calendar
        month={month1}
        availableDates={availableDates}
        onSelect={onSelect}
        today={today}
      />
      <Calendar
        month={month2}
        availableDates={availableDates}
        onSelect={onSelect}
        today={today}
      />
    </div>
  );
};

const BookingsPage = () => {
  const { role, token, user } = useAuth();
  const isAdmin = role === "admin";
  const [bookings, setBookings] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    links: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [title, setTitle] = useState("Auditorium");
  const [bookingDate, setBookingDate] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const API_BASE = baseUrl;

  const fetchBookings = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/bookings/index?page=${page}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setBookings(data.booked || []);
      setAvailableDates(data.available_dates || []);
      setPagination({
        current_page: data.current_page || 1,
        last_page: data.last_page || 1,
        links: data.links || [],
      });
    } catch (err) {
      setMessage({ text: "Network error. Check token/server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token, searchQuery]);

  const handleCreateOrUpdate = async () => {
    if (!title.trim() || !bookingDate) {
      setError("Title and Booking Date are required");
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isEdit) {
        res = await axios.post(
          `${API_BASE}/bookings/update/${selectedBooking.id}`,
          { title, booking_date: bookingDate },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        res = await axios.post(
          `${API_BASE}/bookings/store`,
          { title, booking_date: bookingDate },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      if (res.data.message.includes("success")) {
        setMessage({
          text: isEdit
            ? "Booking updated successfully"
            : "Booking created successfully",
          type: "success",
        });
        fetchBookings();
        resetModal();
      } else {
        setError(res.data.message || "Failed to process booking");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    setLoading(true);
    try {
      const res = await axios.delete(`${API_BASE}/bookings/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.message.includes("removed")) {
        setMessage({ text: "Booking deleted successfully", type: "success" });
        fetchBookings();
      } else {
        setError("Failed to delete booking");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE}/bookings/status/${id}`,
        { status: "approved" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.message.includes("success")) {
        setMessage({ text: "Booking approved successfully", type: "success" });
        fetchBookings();
      } else {
        setError("Failed to approve booking");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setSelectedBooking(null);
    setTitle("");
    setBookingDate("");
    setError("");
  };

  useEffect(() => {
    if (showModal && isEdit && selectedBooking) {
      setTitle(selectedBooking.title || "");
      setBookingDate(selectedBooking.booking_date.split("T")[0] || "");
    }
  }, [showModal, isEdit, selectedBooking]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div style={pageContainer}>
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
            Bookings Management
          </h1>
          <p style={{ color: "#555", fontSize: "1.1rem" }}>
            Manage event bookings
          </p>
        </div>
        <button
          onClick={() => {
            setIsEdit(false);
            setShowModal(true);
          }}
          style={{
            padding: "14px 32px",
            background: "#018f41",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1.1rem",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(174, 251, 209, 0.3)",
            transition: "all 0.3s",
          }}
        >
          + New Booking
        </button>
      </header>

      <div style={searchWrapper}>
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
          style={searchInput}
        />
        {loading && <Loader2 style={loadingIcon} size={24} />}
      </div>

      {error && <div style={errorBox}>Error: {error}</div>}

      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Bookings</h3>
        </div>

        {loading ? (
          <div style={centerLoader}>
            <div
              style={{
                animation: "spin 1s linear infinite",
                width: 48,
                height: 48,
                border: "4px solid #e5e7eb",
                borderTop: "4px solid #047857",
                borderRadius: "50%",
                margin: "0 auto 16px",
              }}
            />
            <p>Loading bookings…</p>
          </div>
        ) : bookings.length === 0 ? (
          <div style={emptyState}>No bookings found</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} style={getRowStyle()}>
                  <td style={tdStyle}>{booking.title}</td>
                  <td style={tdStyle}>{formatDate(booking.booking_date)}</td>
                  <td style={tdStyle}>{booking.user.name}</td>
                  <td style={tdStyle}>
                    <span style={getStatusStyle(booking.status || "pending")}>
                      {(booking.status || "pending").toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsEdit(true);
                          setShowModal(true);
                        }}
                        style={editBtn}
                        title="Edit booking"
                      >
                        <Edit size={20} />
                      </button>
                      {isAdmin &&
                        (booking.status || "pending") === "pending" && (
                          <button
                            onClick={() => handleApprove(booking.id)}
                            style={{ ...editBtn, color: "#018f41" }}
                            title="Approve booking"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )}
                      <button
                        onClick={() => handleDelete(booking.id)}
                        style={{ ...editBtn, color: "#e74c3c" }}
                        title="Delete booking"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={pagination}>
        <span style={pageInfo}>
          Page {pagination.current_page} of {pagination.last_page}
        </span>
        <div style={pageButtons}>
          <button
            disabled={pagination.current_page === 1 || loading}
            onClick={() => fetchBookings(pagination.current_page - 1)}
            style={navBtn}
          >
            Previous
          </button>
          <button
            disabled={
              pagination.current_page === pagination.last_page || loading
            }
            onClick={() => fetchBookings(pagination.current_page + 1)}
            style={navBtn}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                {isEdit ? "Edit Booking" : "New Booking"}
              </h2>
              <p style={modalStyles.subtitle}>
                {isEdit
                  ? "Update booking details"
                  : "Create a new event booking"}
              </p>
            </div>
            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* <div style={iphoneInputBar}>
                  <input
                    placeholder="Event Title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div> */}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Select Booking Date *"
                    value={bookingDate}
                    readOnly
                    style={iphoneInput}
                    onClick={() => {}}
                  />
                  <CalendarIcon
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#018f41",
                    }}
                  />
                </div>
                <CalendarPicker
                  availableDates={availableDates}
                  onSelect={setBookingDate}
                />
              </div>
              {error && (
                <p style={{ color: "#e74c3c", marginTop: "12px" }}>{error}</p>
              )}
            </div>
            <div style={modalStyles.footer}>
              <button
                onClick={handleCreateOrUpdate}
                disabled={loading || !title.trim() || !bookingDate}
                style={{
                  ...modalStyles.primaryButton,
                  opacity: loading || !title.trim() || !bookingDate ? 0.6 : 1,
                }}
              >
                {loading
                  ? "Processing..."
                  : isEdit
                  ? "Update Booking"
                  : "Create Booking"}
              </button>
              <button onClick={resetModal} style={modalStyles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

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

// Styles same as MembersPage
const pageContainer = {
  fontFamily: "Lato",
  maxWidth: "97%",
  margin: "0 auto",
};
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

const editBtn = {
  padding: "10px",
  borderRadius: 10,
  border: "none",
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "pointer",
  transition: "all 0.2s",
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

const getStatusStyle = (status) => ({
  padding: "5px 12px",
  borderRadius: 999,
  fontSize: "0.82rem",
  fontWeight: 600,
  backgroundColor: status === "approved" ? "#ecfdf5" : "#fee2e2",
  color: status === "approved" ? "#065f46" : "#991b1b",
});

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
};

const iphoneInput = {
  flex: 1,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  color: "#333",
  padding: "8px 0",
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
    background: "#018f41",
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

export default BookingsPage;
