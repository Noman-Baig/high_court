import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";
import { EditIcon } from "lucide-react";

const LibraryPage = () => {
  const { role, token, user } = useAuth();

  const isLibrarian = role === "librarian-secratery" || role === "admin";
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    links: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });

  // Add/Edit Book Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newType, setNewType] = useState("book"); // "book" or "e-journal"
  const [newRFID, setNewRFID] = useState("");
  const [files, setFiles] = useState([]); // multiple files for e-journal
  const [fileNames, setFileNames] = useState([]);
  const [error, setError] = useState("");
  const [fetchedUserId, setFetchedUserId] = useState(null);

  // Issue Book Modal States
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [cnic, setCnic] = useState("");
  const [fetchedName, setFetchedName] = useState("");
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [returnDate, setReturnDate] = useState("");

  const API_BASE = baseUrl;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const verifyCnic = async () => {
    if (cnic.length !== 13) {
      setError("CNIC must be 13 digits");
      return;
    }

    setLoading(true);
    setError("");
    setFetchedName("");
    setFetchedUserId(null);

    try {
      const response = await fetch(`${baseUrl}/user/fetchUserViaCnic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cnic_number: cnic,
        }),
      });

      const data = await response.json();

      if (data.status === "success" && data.user) {
        console.log(data);
        setFetchedName(data.user.name);
        setFetchedUserId(data.user.id);
        setError("");
      } else {
        setError(data.message || "User does not exist with this CNIC number.");
        setFetchedName("");
        setFetchedUserId(null);
      }
    } catch (err) {
      setError("Failed to connect to server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch books
  const fetchBooks = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/library-items/index?page=${page}${
        searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
      }`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();

      if (res.ok) {
        setBooks(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          links: data.links || [],
        });
      } else {
        setMessage({
          text: data.message || "Failed to load books",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({ text: "Network error. Check token/server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBooks();
  }, [token, searchQuery]);

  useEffect(() => {
    if (showAddModal && isEdit && selectedBook) {
      setNewTitle(selectedBook.title || "");
      setNewAuthor(selectedBook.author_name || "");
      setNewType(selectedBook.type || "book");
      setNewRFID(selectedBook.rfid_tag || "");
      setFileNames([]);
      setFiles([]);
    }
  }, [showAddModal, isEdit, selectedBook]);

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (newType !== "e-journal") {
      setMessage({
        text: "Files are only allowed for e-journal type",
        type: "error",
      });
      return;
    }
    setFiles(selectedFiles);
    setFileNames(selectedFiles.map((f) => f.name));
  };

  const addBook = async () => {
    if (!newTitle.trim() || !newAuthor.trim()) {
      setMessage({ text: "Title and Author are required", type: "error" });
      return;
    }

    if (newType === "e-journal" && files.length === 0) {
      setMessage({
        text: "At least one PDF file is required for e-journal",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("author_name", newAuthor);
    formData.append("type", newType);
    if (newType === "book") formData.append("rfid_tag", newRFID);

    if (newType === "e-journal") {
      files.forEach((file) => formData.append("files[]", file));
    }

    try {
      const res = await fetch(`${API_BASE}/library-items/store`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.message?.includes("success")) {
        setMessage({ text: "Book added successfully", type: "success" });
        fetchBooks();
        resetModal();
      } else {
        setMessage({
          text: data.errors?.files?.[0] || data.message || "Failed to add book",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Add book error:", err);
      setMessage({ text: "Network error - check console", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async () => {
    if (!newTitle.trim() || !newAuthor.trim()) {
      setMessage({ text: "Title and Author are required", type: "error" });
      return;
    }

    // For edit, files are optional (to keep existing if no new upload)
    if (newType === "e-journal" && !isEdit && files.length === 0) {
      setMessage({
        text: "At least one PDF file is required for e-journal",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("author_name", newAuthor);
    formData.append("type", newType);
    if (newType === "book") formData.append("rfid_tag", newRFID);
    formData.append("_method", "POST"); // Assuming Laravel-style for update via POST

    if (newType === "e-journal" && files.length > 0) {
      files.forEach((file) => formData.append("files[]", file));
    }

    try {
      const res = await fetch(
        `${API_BASE}/library-items/update/${selectedBook.id}`,
        {
          method: "POST", // Using POST with _method=PUT
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.message?.includes("success")) {
        setMessage({ text: "Book updated successfully", type: "success" });
        fetchBooks();
        resetModal();
      } else {
        setMessage({
          text:
            data.errors?.files?.[0] || data.message || "Failed to update book",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Update book error:", err);
      setMessage({ text: "Network error - check console", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setIsEdit(false);
    setSelectedBook(null);
    setNewTitle("");
    setNewAuthor("");
    setNewType("book");
    setNewRFID("");
    setFiles([]);
    setFileNames([]);
  };

  const fetchPersonName = async () => {
    if (cnic.length < 13) {
      setFetchedName("");
      return;
    }
    setIsFetchingName(true);
    // Mock or replace with real API
    setTimeout(() => {
      setFetchedName(
        cnic === "4130412345678" ? "Ahmed Ali Khan" : "Member not found"
      );
      setIsFetchingName(false);
    }, 800);
  };

  const issueBook = async (uId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/borrow/store`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          user_id: isLibrarian ? uId : user.id,
          cnic_number: cnic,
          date: isLibrarian ? returnDate : "",
          library_item_id: selectedBookId,
          status: isLibrarian ? "borrowed" : "reserved",
        }),
      });

      const data = await res.json();
      if (data.message?.includes("borrowed")) {
        setMessage({ text: "Book issued successfully", type: "success" });
        fetchBooks();
        setShowIssueModal(false);
        setCnic("");
        setFetchedName("");
        setReturnDate("");
        setSelectedBookId(null);
      } else {
        setMessage({
          text: data.message || "Failed to issue book",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (bookId) => {
    console.log(bookId);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/borrow/store`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          library_item_id: bookId,
          status: "returned",
        }),
      });

      const data = await res.json();
      if (data.message?.includes("returned")) {
        setMessage({ text: "Book returned successfully", type: "success" });
        fetchBooks();
      } else {
        setMessage({ text: "Failed to return book", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const q = searchQuery.toLowerCase();
    return books.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.author_name?.toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  return (
    <div
      style={{
        fontFamily: "Lato",
      }}
    >
      <div style={{ maxWidth: "97%", margin: "0 auto" }}>
        {/* Header */}
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
                fontSize: "clamp(2.2rem, 5.5vw, 2.8rem)",
                fontWeight: "700",
                color: "#018f41",
                margin: "0 0 8px 0",
              }}
            >
              Library
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Manage books, e-journals, and borrowing seamlessly
            </p>
          </div>

          {isLibrarian && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  setIsEdit(false);
                  setSelectedBook(null);
                  setShowAddModal(true);
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
                  boxShadow: "0 6px 16px rgba(174, 255, 210, 0.3)",
                  transition: "all 0.3s",
                }}
              >
                + Add New Book
              </button>
            </div>
          )}
        </header>

        {/* Search */}
        <div style={{ marginBottom: "40px", maxWidth: "600px" }}>
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 20px",
              borderRadius: "16px",
              border: "2px solid #e0e0e0",
              fontSize: "1.1rem",
              background: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* Books Grid */}
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
        ) : filteredBooks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "120px 20px",
              color: "#95a5a6",
            }}
          >
            <img
              src="https://marketplace.canva.com/QeoHo/MAG6mtQeoHo/1/tl/canva-green-book-icon---outline-MAG6mtQeoHo.png"
              alt="No Books"
              style={{ width: "120px", height: "120px", marginBottom: "24px" }}
            />
            <h3>No books found</h3>
            <p>
              {isLibrarian ? "Add your first book above!" : "Check back later."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                style={{
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div
                  style={{
                    height: "160px",
                    background: "#e8f5e9",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background:
                        book.type === "e-journal"
                          ? "#3498db"
                          : book.latest_borrow.status !== "returned"
                          ? "#e74c3c"
                          : "#018f41",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    {book.type === "e-journal"
                      ? "E-Journal"
                      : book.latest_borrow.status !== "returned"
                      ? "Borrowed"
                      : "Available"}
                  </div>

                  <div style={{ padding: "16px", textAlign: "center" }}>
                    {book.type === "book" ? (
                      <img
                        src="https://marketplace.canva.com/QeoHo/MAG6mtQeoHo/1/tl/canva-green-book-icon---outline-MAG6mtQeoHo.png"
                        alt="Book"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <img
                        src="https://static.vecteezy.com/system/resources/thumbnails/034/759/283/small/3d-file-pdf-symbol-icon-illustration-png.png"
                        alt="E-Journal"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                    <p
                      style={{
                        color: "#018f41",
                        fontWeight: "600",
                        marginTop: "8px",
                        fontSize: "0.9rem",
                      }}
                    >
                      {book.type === "book" ? "Book" : "E-Journal"}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "16px", flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.2rem",
                        margin: "0 0 6px",
                        color: "#2c3e50",
                        // background: "red",
                        height: "28px",
                        maxLines: "1",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      {book.title}
                    </h3>
                    {isLibrarian && (
                      <div
                        onClick={() => {
                          setSelectedBook(book);
                          setIsEdit(true);
                          setShowAddModal(true);
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <EditIcon
                          style={{
                            color: "green",
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        <span style={{ fontSize: "10px", color: "green" }}>
                          Edit
                        </span>
                      </div>
                    )}
                  </div>
                  <p
                    style={{
                      color: "#7f8c8d",
                      margin: "0 0 8px",
                      fontStyle: "italic",
                      fontSize: "0.9rem",
                    }}
                  >
                    Author: {book.author_name || "Unknown"}
                  </p>

                  {book.type === "book" &&
                    book.latest_borrow.status !== "returned" && (
                      <p
                        style={{
                          color: "#e74c3c",
                          fontSize: "0.85rem",
                          margin: "6px 0",
                        }}
                      >
                        Available on:{" "}
                        {new Date(book.latest_borrow.date).toLocaleDateString()}
                      </p>
                    )}
                  {book.type !== "book" && (
                    <p
                      style={{
                        color: "#018f41",
                        fontSize: "0.85rem",
                        margin: "6px 0",
                      }}
                    >
                      Available
                    </p>
                  )}

                  {!isLibrarian &&
                    book.type === "book" &&
                    book.latest_borrow.status === "returned" && (
                      <button
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setShowReserveModal(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "#018f41",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "10px",
                          fontSize: "0.95rem",
                        }}
                      >
                        Reserve Book
                      </button>
                    )}

                  {!isLibrarian &&
                    book.type === "book" &&
                    book.latest_borrow.status !== "returned" && (
                      <button
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "grey",
                          color: "red",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "10px",
                          fontSize: "0.95rem",
                        }}
                      >
                        Book is Reserved
                      </button>
                    )}

                  {isLibrarian &&
                    book.type === "book" &&
                    (book.latest_borrow.status === "returned" ||
                    book.latest_borrow.status === "reserved" ? (
                      <button
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setShowIssueModal(true);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background:
                            book.latest_borrow.status !== "reserved"
                              ? "#018f41"
                              : "grey",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "10px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {book.latest_borrow.status !== "reserved"
                          ? "Issue Book"
                          : "Confirm Issue"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          returnBook(book.id);
                        }}
                        style={{
                          width: "100%",
                          padding: "10px",
                          background: "rgb(231, 76, 60)",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "600",
                          cursor: "pointer",
                          marginTop: "10px",
                          fontSize: "0.85rem",
                        }}
                      >
                        Return Confirm
                      </button>
                    ))}

                  {book.type === "e-journal" && book.files?.length > 0 && (
                    <button
                      onClick={() => {
                        const url = `${book.files[0]["url"]}`;
                        window.open(url, "_blank");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "rgb(40, 80, 123)",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontWeight: "600",
                        cursor: "pointer",
                        marginTop: "10px",
                        fontSize: "0.85rem",
                      }}
                    >
                      Read PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "32px",
              gap: "12px",
            }}
          >
            {pagination.links.map((link, i) => (
              <button
                key={i}
                disabled={!link.url}
                onClick={() => {
                  if (link.url) {
                    const page = new URL(link.url).searchParams.get("page");
                    fetchBooks(page);
                  }
                }}
                style={{
                  padding: "10px 16px",
                  background: link.active ? "#018f41" : "#f1f5f9",
                  color: link.active ? "white" : "#333",
                  border: "none",
                  borderRadius: "8px",
                  cursor: link.url ? "pointer" : "not-allowed",
                  opacity: link.url ? 1 : 0.5,
                }}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Book Modal */}
      {showAddModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>
                {isEdit ? "Edit Book / E-Journal" : "Add New Book / E-Journal"}
              </h2>
              <p style={modalStyles.subtitle}>
                {isEdit
                  ? "Update resources in the library catalog"
                  : "Add resources to the library catalog"}
              </p>
            </div>

            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Title */}
                <div style={iphoneInputBar}>
                  <input
                    placeholder="Book Title *"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Author */}
                <div style={iphoneInputBar}>
                  <input
                    placeholder="Author Name *"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Type Dropdown */}
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="book">Book (Physical)</option>
                  <option value="e-journal">E-Journal (PDF)</option>
                </select>

                {/* RFID - Only for Books */}
                {newType === "book" && (
                  <div style={iphoneInputBar}>
                    <input
                      placeholder="RFID Tag (optional)"
                      value={newRFID}
                      onChange={(e) => setNewRFID(e.target.value)}
                      style={iphoneInput}
                    />
                  </div>
                )}

                {/* File Upload - Only for E-Journals */}
                {newType === "e-journal" && (
                  <>
                    {isEdit && selectedBook?.files?.length > 0 && (
                      <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                        Current PDFs:{" "}
                        {selectedBook.files
                          .map((f) => f.url.split("/").pop())
                          .join(", ")}
                      </p>
                    )}
                    <label style={uploadLabel}>
                      <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                      />
                      {fileNames.length > 0
                        ? `📎 ${fileNames.length} PDF(s) selected (will replace existing if any)`
                        : isEdit
                        ? "Upload New PDF(s) (optional)"
                        : "Upload PDF File(s) *"}
                    </label>
                  </>
                )}
              </div>
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={isEdit ? updateBook : addBook}
                disabled={
                  loading ||
                  !newTitle.trim() ||
                  !newAuthor.trim() ||
                  (newType === "e-journal" && !isEdit && fileNames.length === 0)
                }
                style={{
                  ...modalStyles.primaryButton,
                  opacity:
                    loading ||
                    !newTitle.trim() ||
                    !newAuthor.trim() ||
                    (newType === "e-journal" &&
                      !isEdit &&
                      fileNames.length === 0)
                      ? 0.6
                      : 1,
                }}
              >
                {loading
                  ? isEdit
                    ? "Updating..."
                    : "Adding..."
                  : isEdit
                  ? "Update"
                  : "Add Book"}
              </button>
              <button onClick={resetModal} style={modalStyles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Issue Book</h2>
              <p style={modalStyles.subtitle}>Borrow a book to a member</p>
            </div>

            <div style={modalStyles.body}>
              <div style={{ display: "grid", gap: "20px" }}>
                <div style={iphoneInputBar}>
                  <input
                    placeholder="CNIC Number *"
                    value={cnic}
                    onChange={(e) => {
                      setCnic(e.target.value);
                      if (e.target.value.length >= 12) verifyCnic();
                    }}
                    style={iphoneInput}
                    required
                  />
                </div>

                <div
                  style={{
                    padding: "14px 16px",
                    background: fetchedName
                      ? "#e8f5e9"
                      : error
                      ? "#ffebee"
                      : "#f8f9fa",
                    borderRadius: "12px",
                    border: `2px solid ${
                      fetchedName ? "#018f41" : error ? "#e74c3c" : "#e0e0e0"
                    }`,
                    color: fetchedName
                      ? "#018f41"
                      : error
                      ? "#c0392b"
                      : "#95a5a6",
                    fontWeight: fetchedName || error ? "600" : "normal",
                    minHeight: "20px",
                  }}
                >
                  {isFetchingName
                    ? "Verifying CNIC..."
                    : fetchedName ||
                      "Name appears after successful verification"}
                </div>

                <div style={iphoneInputBar}>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    style={iphoneInput}
                  />
                </div>
              </div>
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={() => issueBook(fetchedUserId)}
                disabled={
                  !fetchedName || !returnDate || loading || !fetchedUserId
                }
                style={{
                  ...modalStyles.primaryButton,
                  opacity:
                    fetchedName && returnDate && !loading && fetchedUserId
                      ? 1
                      : 0.6,
                }}
              >
                {loading ? "Issuing..." : "Issue Book"}
              </button>
              <button
                onClick={() => setShowIssueModal(false)}
                style={modalStyles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {showReserveModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Confirm Book Reservation</h2>
              <p style={modalStyles.subtitle}>
                Please review the reservation terms
              </p>
            </div>

            <div style={modalStyles.body}>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#fef3c7",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <span style={{ fontSize: "36px" }}>📚</span>
                </div>

                <p
                  style={{
                    color: "#444",
                    lineHeight: "1.7",
                    fontSize: "1.05rem",
                  }}
                >
                  You are reserving this book.
                  <br />
                  <strong style={{ color: "#d97706" }}>
                    You must collect it from the library within 24 hours
                  </strong>
                  , otherwise the reservation will be automatically cancelled
                  and the book will become available for others.
                </p>
              </div>
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={() => issueBook(user.id)}
                disabled={loading}
                style={{
                  ...modalStyles.primaryButton,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Reserving..." : "Confirm Reservation"}
              </button>
              <button
                onClick={() => {
                  setShowReserveModal(false);
                  setReturnDate("");
                }}
                style={modalStyles.secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      <style jsx global>{`
        input:focus,
        select:focus {
          outline: none !important;
          border-color: #018f41 !important;
          box-shadow: 0 0 0 4px rgba(1, 143, 65, 0.2) !important;
        }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(
              auto-fill,
              minmax(180px, 1fr)
            ) !important;
          }
        }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: repeat(
              auto-fill,
              minmax(160px, 1fr)
            ) !important;
          }
        }
        @media (max-width: 480px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
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

const inputStyle = {
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
  secondaryButton: {
    padding: "14px 32px",
    background: "#018f41",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "1.05rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(1,143,65,0.3)",
    background: "#94a3b8",
  },
};

export default LibraryPage;

// import React, { useState, useEffect, useMemo } from "react";
// import { useAuth } from "../auth/Auth";
// import { baseUrl } from "../services/base";
// import { EditIcon } from "lucide-react";
// const LibraryPage = () => {
//   const { role, token, user } = useAuth();

//   const isLibrarian =
//     role === "librarian-secratery" ? true : role === "admin" ? true : false;
//   const [books, setBooks] = useState([]);
//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     last_page: 1,
//     links: [],
//   });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [message, setMessage] = useState({ text: "", type: "" });

//   // Add Book Modal States
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showReserveModal, setShowReserveModal] = useState(false);
//   const [newTitle, setNewTitle] = useState("");
//   const [newAuthor, setNewAuthor] = useState("");
//   const [newType, setNewType] = useState("book"); // "book" or "e-journal"
//   const [newRFID, setNewRFID] = useState("");
//   const [files, setFiles] = useState([]); // multiple files for e-journal
//   const [fileNames, setFileNames] = useState([]);
//   const [error, setError] = useState("");
//   const [fetchedUserId, setFetchedUserId] = useState(null);

//   // Issue Book Modal States
//   const [showIssueModal, setShowIssueModal] = useState(false);
//   const [selectedBookId, setSelectedBookId] = useState(null);
//   const [cnic, setCnic] = useState("");
//   const [fetchedName, setFetchedName] = useState("");
//   const [isFetchingName, setIsFetchingName] = useState(false);
//   const [returnDate, setReturnDate] = useState("");

//   const API_BASE = baseUrl;

//   const authHeaders = {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };

//   const verifyCnic = async () => {
//     if (cnic.length !== 13) {
//       setError("CNIC must be 13 digits");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setFetchedName("");
//     setFetchedUserId(null);

//     try {
//       const response = await fetch(`${baseUrl}/user/fetchUserViaCnic`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           cnic_number: cnic,
//         }),
//       });

//       const data = await response.json();

//       if (data.status === "success" && data.user) {
//         console.log(data);
//         setFetchedName(data.user.name);
//         setFetchedUserId(data.user.id);
//         setError("");
//       } else {
//         setError(data.message || "User does not exist with this CNIC number.");
//         setFetchedName("");
//         setFetchedUserId(null);
//       }
//     } catch (err) {
//       setError("Failed to connect to server. Please try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch books
//   const fetchBooks = async (page = 1) => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const url = `${API_BASE}/library-items/index?page=${page}${
//         searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ""
//       }`;
//       const res = await fetch(url, { headers: authHeaders });
//       const data = await res.json();

//       if (res.ok) {
//         setBooks(data.data || []);
//         setPagination({
//           current_page: data.current_page,
//           last_page: data.last_page,
//           links: data.links || [],
//         });
//       } else {
//         setMessage({
//           text: data.message || "Failed to load books",
//           type: "error",
//         });
//       }
//     } catch (err) {
//       setMessage({ text: "Network error. Check token/server.", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) fetchBooks();
//   }, [token, searchQuery]);

//   const handleFileUpload = (e) => {
//     const selectedFiles = Array.from(e.target.files);
//     if (newType !== "e-journal") {
//       setMessage({
//         text: "Files are only allowed for e-journal type",
//         type: "error",
//       });
//       return;
//     }
//     setFiles(selectedFiles);
//     setFileNames(selectedFiles.map((f) => f.name));
//   };

//   const addBook = async () => {
//     if (!newTitle.trim() || !newAuthor.trim()) {
//       setMessage({ text: "Title and Author are required", type: "error" });
//       return;
//     }

//     if (newType === "e-journal" && files.length === 0) {
//       setMessage({
//         text: "At least one PDF file is required for e-journal",
//         type: "error",
//       });
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("title", newTitle);
//     formData.append("author_name", newAuthor);
//     formData.append("type", newType);
//     if (newType === "book") formData.append("rfid_tag", newRFID);

//     // Attach files only for e-journal
//     if (newType === "e-journal") {
//       files.forEach((file) => formData.append("files[]", file));
//     }

//     try {
//       const res = await fetch(`${API_BASE}/library-items/store`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       console.log("Response status:", res.status);
//       const data = await res.json();
//       console.log("Response data:", data);

//       if (data.message?.includes("success")) {
//         setMessage({ text: "Book added successfully", type: "success" });
//         fetchBooks();
//         setShowAddModal(false);
//         setNewTitle("");
//         setNewAuthor("");
//         setNewType("book");
//         setNewRFID("");
//         setFiles([]);
//         setFileNames([]);
//       } else {
//         setMessage({
//           text: data.errors?.files?.[0] || data.message || "Failed to add book",
//           type: "error",
//         });
//       }
//     } catch (err) {
//       console.error("Add book error:", err);
//       setMessage({ text: "Network error - check console", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPersonName = async () => {
//     if (cnic.length < 13) {
//       setFetchedName("");
//       return;
//     }
//     setIsFetchingName(true);
//     // Mock or replace with real API
//     setTimeout(() => {
//       setFetchedName(
//         cnic === "4130412345678" ? "Ahmed Ali Khan" : "Member not found"
//       );
//       setIsFetchingName(false);
//     }, 800);
//   };

//   const issueBook = async (uId) => {
//     // if ((isLibrarian && !fetchedName) || !returnDate || !selectedBookId) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/borrow/store`, {
//         method: "POST",
//         headers: authHeaders,
//         body: JSON.stringify({
//           user_id: isLibrarian ? uId : user.id, // Replace with real auth user id
//           cnic_number: cnic,
//           date: isLibrarian ? returnDate : "",
//           library_item_id: selectedBookId,
//           status: isLibrarian ? "borrowed" : "reserved",
//         }),
//       });

//       const data = await res.json();
//       if (data.message?.includes("borrowed")) {
//         setMessage({ text: "Book issued successfully", type: "success" });
//         fetchBooks();
//         setShowIssueModal(false);
//         setCnic("");
//         setFetchedName("");
//         setReturnDate("");
//         setSelectedBookId(null);
//       } else {
//         setMessage({
//           text: data.message || "Failed to issue book",
//           type: "error",
//         });
//       }
//     } catch {
//       setMessage({ text: "Network error", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const returnBook = async (bookId) => {
//     console.log(bookId);
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/borrow/store`, {
//         method: "POST",
//         headers: authHeaders,
//         body: JSON.stringify({
//           library_item_id: bookId,
//           status: "returned",
//         }),
//       });

//       const data = await res.json();
//       if (data.message?.includes("returned")) {
//         setMessage({ text: "Book returned successfully", type: "success" });
//         fetchBooks();
//       } else {
//         setMessage({ text: "Failed to return book", type: "error" });
//       }
//     } catch {
//       setMessage({ text: "Network error", type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredBooks = useMemo(() => {
//     if (!searchQuery) return books;
//     const q = searchQuery.toLowerCase();
//     return books.filter(
//       (b) =>
//         b.title?.toLowerCase().includes(q) ||
//         b.author_name?.toLowerCase().includes(q)
//     );
//   }, [books, searchQuery]);

//   return (
//     <div
//       style={{
//         fontFamily: "'Segoe UI', Roboto, sans-serif",
//         // minHeight: "100vh",
//         // background: "linear-gradient(135deg, #f5f7fa 0%, #e4efe9 100%)",
//         // padding: "clamp(20px, 5vw, 40px) 20px",
//       }}
//     >
//       <div style={{ maxWidth: "97%", margin: "0 auto" }}>
//         {/* Header */}
//         <header
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "flex-start",
//             flexWrap: "wrap",
//             gap: "20px",
//             marginBottom: "40px",
//           }}
//         >
//           <div>
//             <h1
//               style={{
//                 fontSize: "clamp(2.2rem, 5.5vw, 2.8rem)",
//                 fontWeight: "700",
//                 color: "#018f41",
//                 margin: "0 0 8px 0",
//               }}
//             >
//               Library
//             </h1>
//             <p style={{ color: "#555", fontSize: "1.1rem" }}>
//               Manage books, e-journals, and borrowing seamlessly
//             </p>
//           </div>

//           {isLibrarian && (
//             <div
//               style={{
//                 display: "flex",
//                 gap: "16px",
//                 alignItems: "center",
//                 flexWrap: "wrap",
//               }}
//             >
//               {/* <label
//                 style={{ display: "flex", alignItems: "center", color: "#333" }}
//               >
//                 <input
//                   type="checkbox"
//                   checked={isLibrarian}
//                   onChange={() => setIsLibrarian(!isLibrarian)}
//                   style={{ marginRight: "8px", transform: "scale(1.2)" }}
//                 />
//                 Librarian Mode
//               </label> */}

//               <button
//                 onClick={() => setShowAddModal(true)}
//                 style={{
//                   padding: "14px 32px",
//                   background: "#018f41",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "12px",
//                   fontSize: "1.1rem",
//                   fontWeight: "600",
//                   cursor: "pointer",
//                   boxShadow: "0 6px 15px rgba(1,143,65,0.3)",
//                   transition: "all 0.3s",
//                 }}
//               >
//                 + Add New Book
//               </button>
//             </div>
//           )}
//         </header>

//         {/* Search */}
//         <div style={{ marginBottom: "40px", maxWidth: "600px" }}>
//           <input
//             type="text"
//             placeholder="Search by title or author..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             style={{
//               width: "100%",
//               padding: "16px 20px",
//               borderRadius: "16px",
//               border: "2px solid #e0e0e0",
//               fontSize: "1.1rem",
//               background: "white",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
//             }}
//           />
//         </div>

//         {/* Books Grid */}
//         {loading ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "60px 20px",
//               color: "#6b7280",
//             }}
//           >
//             <div
//               style={{
//                 width: 48,
//                 height: 48,
//                 border: "4px solid #e5e7eb",
//                 borderTop: "4px solid #047857",
//                 borderRadius: "50%",
//                 margin: "0 auto 16px",
//                 animation: "spin 1s linear infinite",
//               }}
//             />
//             <p style={{ fontSize: 15, fontWeight: 500 }}>Loading requests…</p>

//             <style>
//               {`
//       @keyframes spin {
//         to { transform: rotate(360deg); }
//       }
//     `}
//             </style>
//           </div>
//         ) : filteredBooks.length === 0 ? (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "120px 20px",
//               color: "#95a5a6",
//             }}
//           >
//             <img
//               src="https://marketplace.canva.com/QeoHo/MAG6mtQeoHo/1/tl/canva-green-book-icon---outline-MAG6mtQeoHo.png"
//               alt="No Books"
//               style={{ width: "120px", height: "120px", marginBottom: "24px" }}
//             />
//             <h3>No books found</h3>
//             <p>
//               {isLibrarian ? "Add your first book above!" : "Check back later."}
//             </p>
//           </div>
//         ) : (
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
//               gap: "24px",
//             }}
//           >
//             {filteredBooks.map((book) => (
//               <div
//                 key={book.id}
//                 style={{
//                   background: "white",
//                   borderRadius: "16px",
//                   overflow: "hidden",
//                   boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
//                   transition: "all 0.3s ease",
//                 }}
//                 onMouseOver={(e) =>
//                   (e.currentTarget.style.transform = "translateY(-6px)")
//                 }
//                 onMouseOut={(e) =>
//                   (e.currentTarget.style.transform = "translateY(0)")
//                 }
//               >
//                 <div
//                   style={{
//                     height: "180px",
//                     background: "#e8f5e9",
//                     position: "relative",
//                   }}
//                 >
//                   <div
//                     style={{
//                       position: "absolute",
//                       top: "16px",
//                       right: "16px",
//                       background:
//                         book.type === "e-journal"
//                           ? "#3498db"
//                           : book.latest_borrow.status !== "returned"
//                           ? "#e74c3c"
//                           : "#018f41",
//                       color: "white",
//                       padding: "6px 12px",
//                       borderRadius: "20px",
//                       fontSize: "0.85rem",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {book.type === "e-journal"
//                       ? "E-Journal"
//                       : book.latest_borrow.status !== "returned"
//                       ? "Borrowed"
//                       : "Available"}
//                   </div>

//                   <div style={{ padding: "20px", textAlign: "center" }}>
//                     {book.type === "book" ? (
//                       <img
//                         src="https://marketplace.canva.com/QeoHo/MAG6mtQeoHo/1/tl/canva-green-book-icon---outline-MAG6mtQeoHo.png"
//                         alt="Book"
//                         style={{
//                           width: "120px",
//                           height: "120px",
//                           objectFit: "contain",
//                         }}
//                       />
//                     ) : (
//                       <img
//                         src="https://static.vecteezy.com/system/resources/thumbnails/034/759/283/small/3d-file-pdf-symbol-icon-illustration-png.png"
//                         alt="E-Journal"
//                         style={{
//                           width: "120px",
//                           height: "120px",
//                           objectFit: "contain",
//                         }}
//                       />
//                     )}
//                     <p
//                       style={{
//                         color: "#018f41",
//                         fontWeight: "600",
//                         marginTop: "12px",
//                       }}
//                     >
//                       {book.type === "book" ? "Book" : "E-Journal"}
//                     </p>
//                   </div>
//                 </div>

//                 <div style={{ padding: "20px" }}>
//                   <div
//                     style={{ display: "flex", justifyContent: "space-between" }}
//                   >
//                     <h3
//                       style={{
//                         fontSize: "1.4rem",
//                         margin: "0 0 8px",
//                         color: "#2c3e50",
//                       }}
//                     >
//                       {book.title}
//                     </h3>
//                     <div
//                       onClick={() => setShowAddModal(true)}
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         cursor: "pointer",
//                       }}
//                     >
//                       <EditIcon style={{ color: "green" }} />
//                       <span style={{ fontSize: "12px", color: "green" }}>
//                         Edit
//                       </span>
//                     </div>
//                   </div>
//                   <p
//                     style={{
//                       color: "#7f8c8d",
//                       margin: "0 0 12px",
//                       fontStyle: "italic",
//                     }}
//                   >
//                     Author: {book.author_name || "Unknown"}
//                   </p>

//                   {book.type === "book" &&
//                     book.latest_borrow.status !== "returned" && (
//                       <p
//                         style={{
//                           color: "#e74c3c",
//                           fontSize: "0.95rem",
//                           margin: "8px 0",
//                         }}
//                       >
//                         Available on:
//                         {new Date(book.latest_borrow.date).toLocaleDateString()}
//                       </p>
//                     )}
//                   {book.type !== "book" && (
//                     <p
//                       style={{
//                         color: "#e74c3c",
//                         fontSize: "0.95rem",
//                         margin: "8px 0",
//                       }}
//                     >
//                       Availbale
//                     </p>
//                   )}

//                   {!isLibrarian &&
//                     book.type === "book" &&
//                     book.latest_borrow.status === "returned" && (
//                       <button
//                         onClick={() => {
//                           setSelectedBookId(book.id);
//                           setShowReserveModal(true);
//                         }}
//                         style={{
//                           width: "100%",
//                           padding: "12px",
//                           background: "#018f41",
//                           color: "white",
//                           border: "none",
//                           borderRadius: "10px",
//                           fontWeight: "600",
//                           cursor: "pointer",
//                           marginTop: "12px",
//                         }}
//                       >
//                         Reserve Book
//                       </button>
//                     )}

//                   {!isLibrarian &&
//                     book.type === "book" &&
//                     book.latest_borrow.status !== "returned" && (
//                       <button
//                         style={{
//                           width: "100%",
//                           padding: "12px",
//                           background: "#grey",
//                           color: "red",
//                           border: "none",
//                           borderRadius: "10px",
//                           fontWeight: "600",
//                           cursor: "pointer",
//                           marginTop: "12px",
//                         }}
//                       >
//                         Book is Reserved
//                       </button>
//                     )}

//                   {isLibrarian &&
//                     book.type === "book" &&
//                     // !book.latest_borrow &&
//                     (book.latest_borrow.status === "returned" ||
//                     book.latest_borrow.status === "reserved" ? (
//                       <button
//                         onClick={() => {
//                           // if (book.latest_borrow.status !== "reserved") {
//                           setSelectedBookId(book.id);
//                           setShowIssueModal(true);
//                           // }
//                           // console.log("abhi reserved hai");
//                         }}
//                         style={{
//                           width: "100%",
//                           padding: "12px",
//                           background:
//                             book.latest_borrow.status !== "reserved"
//                               ? "#018f41"
//                               : "grey",
//                           color: "white",
//                           border: "none",
//                           borderRadius: "10px",
//                           fontWeight: "600",
//                           cursor: "pointer",
//                           marginTop: "12px",
//                         }}
//                       >
//                         {book.latest_borrow.status !== "reserved"
//                           ? isLibrarian
//                             ? "Issue Book"
//                             : "Reserve Book"
//                           : "Confirm Issue"}
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => {
//                           returnBook(book.id);
//                         }}
//                         style={{
//                           width: "100%",
//                           padding: "12px",
//                           background: "rgb(231, 76, 60)",
//                           color: "white",
//                           border: "none",
//                           borderRadius: "10px",
//                           fontWeight: "600",
//                           cursor: "pointer",
//                           marginTop: "12px",
//                         }}
//                       >
//                         Return Confirm
//                       </button>
//                     ))}

//                   {book.type === "e-journal" && book.files?.length > 0 && (
//                     <button
//                       onClick={() => {
//                         const url = `${book.files[0]["url"]}`;
//                         window.open(url, "_blank");
//                       }}
//                       style={{
//                         width: "100%",
//                         padding: "12px",
//                         background: "rgb(40, 80, 123)",
//                         color: "white",
//                         border: "none",
//                         borderRadius: "10px",
//                         fontWeight: "600",
//                         cursor: "pointer",
//                         marginTop: "12px",
//                       }}
//                     >
//                       Read PDF
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {pagination.last_page > 1 && (
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               marginTop: "32px",
//               gap: "12px",
//             }}
//           >
//             {pagination.links.map((link, i) => (
//               <button
//                 key={i}
//                 disabled={!link.url}
//                 onClick={() => {
//                   if (link.url) {
//                     const page = new URL(link.url).searchParams.get("page");
//                     fetchBooks(page);
//                   }
//                 }}
//                 style={{
//                   padding: "10px 16px",
//                   background: link.active ? "#018f41" : "#f1f5f9",
//                   color: link.active ? "white" : "#333",
//                   border: "none",
//                   borderRadius: "8px",
//                   cursor: link.url ? "pointer" : "not-allowed",
//                   opacity: link.url ? 1 : 0.5,
//                 }}
//                 dangerouslySetInnerHTML={{ __html: link.label }}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Add Book Modal */}
//       {/* ==================== ADD BOOK MODAL ==================== */}
//       {showAddModal && (
//         <ModalOverlay>
//           <div style={modalStyles.card}>
//             <div style={modalStyles.header}>
//               <h2 style={modalStyles.title}>Add New Book / E-Journal</h2>
//               <p style={modalStyles.subtitle}>
//                 Add resources to the library catalog
//               </p>
//             </div>

//             <div style={modalStyles.body}>
//               <div style={{ display: "grid", gap: "20px" }}>
//                 {/* Title - iPhone Style */}
//                 <div style={iphoneInputBar}>
//                   <input
//                     placeholder="Book Title *"
//                     value={newTitle}
//                     onChange={(e) => setNewTitle(e.target.value)}
//                     style={iphoneInput}
//                     required
//                   />
//                 </div>

//                 {/* Author - iPhone Style */}
//                 <div style={iphoneInputBar}>
//                   <input
//                     placeholder="Author Name *"
//                     value={newAuthor}
//                     onChange={(e) => setNewAuthor(e.target.value)}
//                     style={iphoneInput}
//                     required
//                   />
//                 </div>

//                 {/* Type Dropdown */}
//                 <select
//                   value={newType}
//                   onChange={(e) => setNewType(e.target.value)}
//                   style={inputStyle}
//                 >
//                   <option value="book">Book (Physical)</option>
//                   <option value="e-journal">E-Journal (PDF)</option>
//                 </select>

//                 {/* RFID - Only for Books */}
//                 {newType === "book" && (
//                   <div style={iphoneInputBar}>
//                     <input
//                       placeholder="RFID Tag (optional)"
//                       value={newRFID}
//                       onChange={(e) => setNewRFID(e.target.value)}
//                       style={iphoneInput}
//                     />
//                   </div>
//                 )}

//                 {/* File Upload - Only for E-Journals */}
//                 {newType === "e-journal" && (
//                   <label style={uploadLabel}>
//                     <input
//                       type="file"
//                       accept="application/pdf"
//                       multiple
//                       onChange={handleFileUpload}
//                       style={{ display: "none" }}
//                     />
//                     {fileNames.length > 0
//                       ? `📎 ${fileNames.length} PDF(s) selected`
//                       : "Upload PDF File(s) *"}
//                   </label>
//                 )}
//               </div>
//             </div>

//             <div style={modalStyles.footer}>
//               <button
//                 onClick={addBook}
//                 disabled={
//                   loading ||
//                   !newTitle.trim() ||
//                   !newAuthor.trim() ||
//                   (newType === "e-journal" && fileNames.length === 0)
//                 }
//                 style={{
//                   ...modalStyles.primaryButton,
//                   opacity:
//                     loading ||
//                     !newTitle.trim() ||
//                     !newAuthor.trim() ||
//                     (newType === "e-journal" && fileNames.length === 0)
//                       ? 0.6
//                       : 1,
//                 }}
//               >
//                 {loading ? "Adding..." : "Add Book"}
//               </button>
//               <button
//                 onClick={() => setShowAddModal(false)}
//                 style={modalStyles.secondaryButton}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </ModalOverlay>
//       )}

//       {/* ==================== ISSUE BOOK MODAL ==================== */}
//       {showIssueModal && (
//         <ModalOverlay>
//           <div style={modalStyles.card}>
//             <div style={modalStyles.header}>
//               <h2 style={modalStyles.title}>Issue Book</h2>
//               <p style={modalStyles.subtitle}>Borrow a book to a member</p>
//             </div>

//             <div style={modalStyles.body}>
//               <div style={{ display: "grid", gap: "20px" }}>
//                 {/* CNIC - iPhone Style */}
//                 <div style={iphoneInputBar}>
//                   <input
//                     placeholder="CNIC Number *"
//                     value={cnic}
//                     onChange={(e) => {
//                       setCnic(e.target.value);
//                       if (e.target.value.length >= 12) verifyCnic();
//                     }}
//                     style={iphoneInput}
//                     required
//                   />
//                 </div>

//                 {/* Name Display */}
//                 <div
//                   style={{
//                     padding: "14px 16px",
//                     background: fetchedName
//                       ? "#e8f5e9"
//                       : error
//                       ? "#ffebee"
//                       : "#f8f9fa",
//                     borderRadius: "12px",
//                     border: `2px solid ${
//                       fetchedName ? "#018f41" : error ? "#e74c3c" : "#e0e0e0"
//                     }`,
//                     color: fetchedName
//                       ? "#018f41"
//                       : error
//                       ? "#c0392b"
//                       : "#95a5a6",
//                     fontWeight: fetchedName || error ? "600" : "normal",
//                     minHeight: "20px",
//                   }}
//                 >
//                   {isFetchingName
//                     ? "Verifying CNIC..."
//                     : fetchedName ||
//                       "Name appears after successful verification"}
//                 </div>

//                 {/* Return Date */}
//                 <div style={iphoneInputBar}>
//                   <input
//                     type="date"
//                     value={returnDate}
//                     onChange={(e) => setReturnDate(e.target.value)}
//                     style={iphoneInput}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div style={modalStyles.footer}>
//               <button
//                 onClick={() => issueBook(fetchedUserId)}
//                 disabled={
//                   !fetchedName || !returnDate || loading || !fetchedUserId
//                 }
//                 style={{
//                   ...modalStyles.primaryButton,
//                   opacity:
//                     fetchedName && returnDate && !loading && fetchedUserId
//                       ? 1
//                       : 0.6,
//                 }}
//               >
//                 {loading ? "Issuing..." : "Issue Book"}
//               </button>
//               <button
//                 onClick={() => setShowIssueModal(false)}
//                 style={modalStyles.secondaryButton}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </ModalOverlay>
//       )}

//       {showReserveModal && (
//         <ModalOverlay>
//           <div style={modalStyles.card}>
//             <div style={modalStyles.header}>
//               <h2 style={modalStyles.title}>Confirm Book Reservation</h2>
//               <p style={modalStyles.subtitle}>
//                 Please review the reservation terms
//               </p>
//             </div>

//             <div style={modalStyles.body}>
//               <div
//                 style={{
//                   textAlign: "center",
//                   marginBottom: "24px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "80px",
//                     height: "80px",
//                     background: "#fef3c7",
//                     borderRadius: "50%",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     margin: "0 auto 20px",
//                   }}
//                 >
//                   <span style={{ fontSize: "36px" }}>📚</span>
//                 </div>

//                 <p
//                   style={{
//                     color: "#444",
//                     lineHeight: "1.7",
//                     fontSize: "1.05rem",
//                   }}
//                 >
//                   You are reserving this book.
//                   <br />
//                   <strong style={{ color: "#d97706" }}>
//                     You must collect it from the library within 24 hours
//                   </strong>
//                   , otherwise the reservation will be automatically cancelled
//                   and the book will become available for others.
//                 </p>
//               </div>

//               {/* Expected Return Date Picker */}
//               {/* <div style={{ marginTop: "24px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "8px",
//                     fontWeight: "600",
//                     color: "#333",
//                   }}
//                 >
//                   When do you plan to return this book?
//                 </label>
//                 <div style={iphoneInputBar}>
//                   <input
//                     type="date"
//                     value={returnDate}
//                     onChange={(e) => setReturnDate(e.target.value)}
//                     min={new Date().toISOString().split("T")[0]} // Can't pick past date
//                     style={iphoneInput}
//                     required
//                   />
//                 </div>
//               </div> */}
//             </div>

//             <div style={modalStyles.footer}>
//               <button
//                 onClick={() => issueBook(user.id)}
//                 disabled={loading}
//                 style={{
//                   ...modalStyles.primaryButton,
//                   opacity: loading ? 0.6 : 1,
//                 }}
//               >
//                 {loading ? "Reserving..." : "Confirm Reservation"}
//               </button>
//               <button
//                 onClick={() => {
//                   setShowReserveModal(false);
//                   setReturnDate(""); // Reset if needed
//                 }}
//                 style={modalStyles.secondaryButton}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </ModalOverlay>
//       )}

//       <style jsx global>{`
//         input:focus,
//         select:focus {
//           outline: none !important;
//           border-color: #018f41 !important;
//           box-shadow: 0 0 0 4px rgba(1, 143, 65, 0.2) !important;
//         }
//         @media (max-width: 768px) {
//           .grid {
//             grid-template-columns: 1fr !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// const ModalOverlay = ({ children }) => (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       background: "rgba(0,0,0,0.6)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 1000,
//       padding: "20px",
//     }}
//   >
//     {children}
//   </div>
// );

// const iphoneInputBar = {
//   display: "flex",
//   alignItems: "center",
//   gap: "12px",
//   background: "#f8f9fa",
//   borderRadius: "24px",
//   padding: "12px 16px",
//   boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//   border: "1px solid #e0e0e0",
// };

// const iphoneInput = {
//   flex: 1,
//   background: "transparent",
//   border: "none",
//   outline: "none",
//   fontSize: "1rem",
//   color: "#333",
//   padding: "8px 0",
// };

// // Reusable styles
// const inputStyle = {
//   // width: "100%",
//   padding: "14px 16px",
//   borderRadius: "20px",
//   border: "2px solid #e0e0e0",
//   fontSize: "1rem",
//   // marginBottom: "16px",
// };

// const primaryButton = {
//   padding: "14px",
//   backgroundColor: "#018f41",
//   color: "white",
//   border: "none",
//   borderRadius: "12px",
//   fontWeight: "600",
//   cursor: "pointer",
//   boxShadow: "0 6px 15px rgba(1,143,65,0.3)",
//   transition: "all 0.3s",
// };

// const secondaryButton = {
//   ...primaryButton,
//   backgroundColor: "#95a5a6",
//   boxShadow: "none",
// };

// const uploadLabel = {
//   display: "block",
//   padding: "20px",
//   backgroundColor: "#f8f9fa",
//   border: "2px dashed #018f41",
//   borderRadius: "12px",
//   textAlign: "center",
//   cursor: "pointer",
//   fontWeight: "600",
//   color: "#018f41",
//   transition: "all 0.3s",
// };
// const modalStyles = {
//   card: {
//     background: "white",
//     borderRadius: "20px",
//     boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
//     overflow: "hidden",
//     width: "100%",
//     maxWidth: "640px",
//     maxHeight: "90vh",
//     display: "flex",
//     flexDirection: "column",
//   },
//   header: {
//     padding: "32px 40px 20px",
//     textAlign: "center",
//     borderBottom: "1px solid #f0f0f0",
//   },
//   title: {
//     fontSize: "1.8rem",
//     fontWeight: "700",
//     color: "#018f41",
//     margin: "0 0 8px 0",
//   },
//   subtitle: { color: "#64748b", fontSize: "1rem" },
//   body: { padding: "32px 40px", flex: 1, overflowY: "auto" },
//   footer: {
//     padding: "24px 40px 40px",
//     display: "flex",
//     gap: "12px",
//     justifyContent: "center",
//     flexWrap: "wrap",
//   },
//   primaryButton: {
//     padding: "14px 32px",
//     background: "#018f41",
//     color: "white",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "1.05rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     boxShadow: "0 6px 20px rgba(1,143,65,0.3)",
//   },
//   secondaryButton: { ...primaryButton, background: "#94a3b8" },
// };

// export default LibraryPage;
