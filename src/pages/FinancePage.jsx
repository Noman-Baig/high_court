import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";

const FinancePage = () => {
  const { user, role, token } = useAuth();
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [adminCommittees, setAdminCommittees] = useState([]);

  const isTreasurer =
    role === "treasurer" ? true : role === "admin" ? true : false;
  const [transactions, setTransactions] = useState([
    // fallback dummy data — will be replaced by API
    {
      id: 1,
      type: "Fetching Types ...",
      category: "Fetching Categories ...",
      source: "Fetching Sources ...",
      amount: 0,
      description: "Fetching ...",
      date: "Fetching ...",
    },
    // ... other dummies remain as fallback
  ]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Search & Filter states (unchanged)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Add modal form states (adapted to match your UI structure)
  const [showAddModal, setShowAddModal] = useState(false);
  const [transType, setTransType] = useState("income");
  const [expenseCategory, setExpenseCategory] = useState("welfare");
  const [welfareType, setWelfareType] = useState("medical");
  const [committeeName, setCommitteeName] = useState("");
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Required extra fields for API
  const [cnicForAnnualFee, setCnicForAnnualFee] = useState("");
  const [committeeId, setCommitteeId] = useState("");
  const [welfareClaimId, setWelfareClaimId] = useState("");

  // Format amount (unchanged)
  const formatAmount = (num) => {
    if (num >= 1000000000) return `Rs. ${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `Rs. ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `Rs. ${(num / 1000).toFixed(1)}K`;
    return `Rs. ${num.toLocaleString()}`;
  };

  // Summary calculations (unchanged)
  const totalBalance = useMemo(() => {
    return transactions.reduce(
      (sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount),
      0
    );
  }, [transactions]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.get(`${baseUrl}/admin/finance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = res?.data ?? {};
      const items = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : payload.results ?? payload.items ?? [];

      const mapped = items.map((item) => {
        const st = item.source_type ?? "";
        let category = "other";
        let sourceName = item.title ?? item.source ?? "Unknown";
        let extra = {};

        if (st === "annual_fee") {
          category = "membership";
          sourceName = item.title ?? "Annual Fee";
          if (item.cnic) extra.cnic = item.cnic;
        } else if (st === "donation") {
          category = "donation";
          sourceName = item.title ?? "Donation";
        } else if (st === "committee_expense") {
          category = "committee";
          sourceName =
            item.title ?? item.committee?.name ?? "Committee Expense";
          extra.committeeName =
            item.committee?.name ?? item.committee_name ?? "";
        } else if (st === "welfare_expense") {
          category = "welfare";
          sourceName =
            item.title ?? item.welfare_claim?.title ?? "Welfare Expense";
          extra.welfareType =
            item.welfare_claim?.type ?? item.welfare_type ?? "other";
        }

        return {
          id:
            item.id ??
            item.transaction_id ??
            Math.random().toString(36).slice(2),
          type: item.transaction_type === "funding" ? "income" : "expense",
          category,
          source: sourceName,
          amount: Number(item.amount ?? 0),
          description: item.remarks ?? item.description ?? "",
          date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
          ...extra,
        };
      });

      setTransactions(mapped.length > 0 ? mapped : transactions); // keep dummy if empty
    } catch (err) {
      console.error("API fetch error:", err);
      setMessage({
        text: "Could not load transactions. Showing sample data.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchAllCommittees = async () => {
      setLoadingCommittees(true);
      try {
        const res = await fetch(`${baseUrl}/committee`, {
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
  }, [token]);

  // Submit new transaction to API
  const submitTransaction = async () => {
    if (!source || !amount || parseFloat(amount) <= 0) {
      setMessage({ text: "Source and valid amount required", type: "error" });
      return;
    }

    let sourceType = "other_expense";
    if (transType === "income") {
      if (
        source.toLowerCase().includes("membership") ||
        source.toLowerCase().includes("annual")
      ) {
        sourceType = "annual_fee";
      } else if (source.toLowerCase().includes("donation")) {
        sourceType = "donation";
      } else {
        sourceType = "other_funding";
      }
    } else {
      if (expenseCategory === "welfare") sourceType = "welfare_expense";
      else if (expenseCategory === "committee")
        sourceType = "committee_expense";
      else sourceType = "other_expense";
    }

    const payload = {
      transaction_type: transType === "income" ? "funding" : "expense",
      source_type: sourceType,
      title: source,
      remarks: description || null,
      amount: parseInt(amount, 10),
    };

    if (sourceType === "annual_fee" && cnicForAnnualFee) {
      payload.cnic = cnicForAnnualFee;
    }
    if (sourceType === "committee_expense" && committeeId) {
      payload.committee_id = committeeId;
    }
    if (sourceType === "welfare_expense" && welfareClaimId) {
      payload.welfare_claim_id = welfareClaimId;
    }

    try {
      const res = await axios.post(
        "https://gextoncloud.com/gexton_hcba_new/public/api/admin/finance/create",
        payload,
        {
          headers: {
            Authorization: `Bearer 9|mqhpEaoPovjIpVSXn19lmVddyuJ7qrcuytoAvt518dba0e12`,
          },
        }
      );

      // Map the newly created item and add to top
      const created = res?.data ?? {};
      const newTrans = {
        id: created.id ?? Date.now(),
        type: transType,
        category:
          expenseCategory === "welfare"
            ? "welfare"
            : expenseCategory === "committee"
            ? "committee"
            : transType === "income"
            ? sourceType === "annual_fee"
              ? "membership"
              : "donation"
            : "other",
        source,
        amount: parseFloat(amount),
        description: description || "No description",
        date: new Date().toLocaleDateString("en-GB"),
        ...(expenseCategory === "welfare" ? { welfareType } : {}),
        ...(expenseCategory === "committee"
          ? { committeeName: committeeName || source }
          : {}),
      };

      setTransactions([newTrans, ...transactions]);
      setMessage({ text: "Transaction added successfully", type: "success" });
      setShowAddModal(false);
      resetForm();
      // Optional: re-fetch full list
      // fetchTransactions();
    } catch (err) {
      console.error("Create error:", err);
      setMessage({
        text: err?.response?.data?.message || "Failed to add transaction",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setTransType("income");
    setExpenseCategory("welfare");
    setWelfareType("medical");
    setCommitteeName("");
    setSource("");
    setAmount("");
    setDescription("");
    setCnicForAnnualFee("");
    setCommitteeId("");
    setWelfareClaimId("");
    setMessage({ text: "", type: "" });
  };

  // Filter logic (unchanged)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.committeeName &&
          t.committeeName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "all" || t.type === filterType;
      let matchesCategory = true;

      if (filterCategory === "welfare-medical")
        matchesCategory =
          t.category === "welfare" && t.welfareType === "medical";
      else if (filterCategory === "welfare-death")
        matchesCategory = t.category === "welfare" && t.welfareType === "death";
      else if (filterCategory === "welfare-other")
        matchesCategory = t.category === "welfare" && t.welfareType === "other";
      else if (filterCategory.startsWith("committee:"))
        matchesCategory = t.committeeName === filterCategory.slice(10);
      else if (filterCategory !== "all")
        matchesCategory = t.category === filterCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, filterType, filterCategory]);

  const committeeNames = useMemo(() => {
    return [
      ...new Set(
        transactions
          .filter((t) => t.category === "committee")
          .map((t) => t.committeeName)
      ),
    ];
  }, [transactions]);

  const getTypeBadge = (type) => {
    return type === "income" ? (
      <span
        style={{
          background: "#018f41",
          color: "white",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "0.8rem",
          fontWeight: "600",
        }}
      >
        + Income
      </span>
    ) : (
      <span
        style={{
          background: "#e74c3c",
          color: "white",
          padding: "4px 10px",
          borderRadius: "12px",
          fontSize: "0.8rem",
          fontWeight: "600",
        }}
      >
        - Expense
      </span>
    );
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
      boxShadow: "0 6px 20px rgba(1,143,65,0.3)",
    },
    secondaryButton: { ...primaryButton, background: "#94a3b8" },
  };

  return (
    <div
      style={{
        fontFamily: "Lato",
      }}
    >
      <div style={{ maxWidth: "97%", margin: "0 auto" }}>
        {/* Header – unchanged */}
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
              Treasury Management
            </h1>
            <p style={{ color: "#555", fontSize: "1.1rem" }}>
              Track all income and expenses of the bar association
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
            {isTreasurer && (
              <button
                onClick={() => setShowAddModal(true)}
                style={primaryButton}
              >
                + Add Transaction
              </button>
            )}
          </div>
        </header>

        {message.text && (
          <div
            style={{
              padding: "12px 20px",
              marginBottom: "24px",
              borderRadius: "12px",
              background: message.type === "success" ? "#e8f5e9" : "#ffebee",
              color: message.type === "success" ? "#2e7d32" : "#c62828",
              fontWeight: "500",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Summary Cards – unchanged */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#7f8c8d",
                    margin: "0 0 8px 0",
                    fontSize: "0.95rem",
                  }}
                >
                  Current Balance
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#018f41",
                  }}
                >
                  {formatAmount(totalBalance)}
                </h2>
              </div>
            </div>
          </div>
          {/* Total Income & Expenses cards remain identical */}
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#7f8c8d",
                    margin: "0 0 8px 0",
                    fontSize: "0.95rem",
                  }}
                >
                  Total Income
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#018f41",
                  }}
                >
                  {formatAmount(totalIncome)}
                </h2>
              </div>
            </div>
          </div>
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#7f8c8d",
                    margin: "0 0 8px 0",
                    fontSize: "0.95rem",
                  }}
                >
                  Total Expenses
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.8rem",
                    fontWeight: "700",
                    color: "#e74c3c",
                  }}
                >
                  {formatAmount(totalExpense)}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters – unchanged */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "32px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by source, committee, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInput}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={filterSelect}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="membership">Membership Fees</option>
            <option value="donation">Donations</option>
            <optgroup label="Welfare">
              <option value="welfare-medical">Medical</option>
              <option value="welfare-death">Death</option>
              <option value="welfare-other">Other</option>
            </optgroup>
            {committeeNames.length > 0 && (
              <optgroup label="Committees">
                {committeeNames.map((name) => (
                  <option key={name} value={`committee:${name}`}>
                    {name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Transactions List */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
            <h3 style={{ margin: 0, color: "#2c3e50" }}>
              {loading ? "Loading Transactions..." : "Transaction History"}
            </h3>
          </div>
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
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
                <p style={{ fontSize: 15, fontWeight: 500 }}>
                  Loading requests…
                </p>

                <style>
                  {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
                </style>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                  color: "#95a5a6",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📊</div>
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      {getTypeBadge(t.type)}
                      <span style={{ fontWeight: "600", color: "#2c3e50" }}>
                        {t.source.toUpperCase()}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "#7f8c8d",
                        fontSize: "0.9rem",
                      }}
                    >
                      {t.description.toUpperCase()}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.3rem",
                        fontWeight: "700",
                        color: t.type === "income" ? "#018f41" : "#e74c3c",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"} {formatAmount(t.amount)}
                    </p>
                    <small style={{ color: "#95a5a6" }}>{t.date}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal – fields expanded for API requirements */}
      {showAddModal && (
        <ModalOverlay>
          <div style={modalStyles.card}>
            <div style={modalStyles.header}>
              <h2 style={modalStyles.title}>Add New Transaction</h2>
              <p style={modalStyles.subtitle}>
                Record income or expense in treasury
              </p>
            </div>

            <div style={modalStyles.body}>
              {message.text && (
                <div
                  style={{
                    padding: "12px 16px",
                    marginBottom: "20px",
                    borderRadius: "12px",
                    background:
                      message.type === "success" ? "#e8f5e9" : "#ffebee",
                    color: message.type === "success" ? "#2e7d32" : "#c62828",
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  {message.text}
                </div>
              )}

              <div style={{ display: "grid", gap: "20px" }}>
                {/* Transaction Type */}
                <select
                  value={transType}
                  onChange={(e) => {
                    setTransType(e.target.value);
                    if (e.target.value === "income")
                      setExpenseCategory("welfare");
                  }}
                  style={inputStyle}
                >
                  <option value="income">Income (Funds Received)</option>
                  <option value="expense">Expense (Funds Given)</option>
                </select>

                {/* CNIC for Annual Fee (Income) */}
                {transType === "income" && (
                  <div style={iphoneInputBar}>
                    <input
                      placeholder="CNIC (required for Annual Fee)"
                      value={cnicForAnnualFee}
                      onChange={(e) => setCnicForAnnualFee(e.target.value)}
                      style={iphoneInput}
                    />
                  </div>
                )}

                {/* Expense Category */}
                {transType === "expense" && (
                  <>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="welfare">Welfare Assistance</option>
                      <option value="committee">Committee Expense</option>
                      <option value="other">Other Expense</option>
                    </select>

                    {/* Welfare Type */}
                    {expenseCategory === "welfare" && (
                      <>
                        <select
                          value={welfareType}
                          onChange={(e) => setWelfareType(e.target.value)}
                          style={inputStyle}
                        >
                          <option value="medical">Hospital Medical</option>
                          <option value="death">Candle Death/Funeral</option>
                          <option value="other">Other</option>
                        </select>
                        <div style={iphoneInputBar}>
                          <input
                            placeholder="Welfare Claim ID (required)"
                            value={welfareClaimId}
                            onChange={(e) => setWelfareClaimId(e.target.value)}
                            style={iphoneInput}
                          />
                        </div>
                      </>
                    )}

                    {/* Committee Fields */}
                    {/* {expenseCategory === "committee" && (
                      <>
                        <div style={iphoneInputBar}>
                          <input
                            placeholder="Committee Name (e.g. Annual Dinner Committee)"
                            value={committeeName}
                            onChange={(e) => setCommitteeName(e.target.value)}
                            style={iphoneInput}
                          />
                        </div>
                        <div style={iphoneInputBar}>
                          <input
                            placeholder="Committee ID (required)"
                            value={committeeId}
                            onChange={(e) => setCommitteeId(e.target.value)}
                            style={iphoneInput}
                          />
                        </div>
                      </>
                    )} */}
                    {expenseCategory === "committee" && (
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

                        {adminCommittees.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}

                {/* Source / Title */}
                <div style={iphoneInputBar}>
                  <input
                    placeholder={
                      transType === "income"
                        ? "Source (e.g. Membership Fees, Donation)"
                        : "Purpose / Title *"
                    }
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Amount */}
                <div style={iphoneInputBar}>
                  <input
                    type="number"
                    placeholder="Amount (PKR) *"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={iphoneInput}
                    required
                  />
                </div>

                {/* Description */}
                <div style={iphoneInputBar}>
                  <textarea
                    placeholder="Description / Remarks (Optional)"
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
                  />
                </div>
              </div>
            </div>

            <div style={modalStyles.footer}>
              <button
                onClick={submitTransaction}
                disabled={
                  loading || !source || !amount || parseFloat(amount) <= 0
                }
                style={{
                  ...modalStyles.primaryButton,
                  opacity:
                    loading || !source || !amount || parseFloat(amount) <= 0
                      ? 0.6
                      : 1,
                }}
              >
                {loading ? "Saving..." : "Add Transaction"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
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
  flex: 1,
  fontFamily: "Lato",
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: "1rem",
  color: "#333",
  padding: "8px 0",
};

// ────────────────────────────────────────────────
//  All styles remain 100% unchanged from your original
// ────────────────────────────────────────────────
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

const secondaryButton = {
  ...primaryButton,
  backgroundColor: "#95a5a6",
  flex: 1,
};

const searchInput = {
  flex: 1,
  fontFamily: "Lato",
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
  width: "100%",
  fontFamily: "Lato",
  padding: "14px 16px",
  borderRadius: "20px",
  border: "2px solid #e0e0e0",
  fontSize: "1rem",
};

export default FinancePage;
