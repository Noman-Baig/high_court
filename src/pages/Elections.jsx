import React, { useEffect, useState } from "react";
import {
  Save,
  X,
  Loader2,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../auth/Auth";
import { baseUrl } from "../services/base";

const Elections = () => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const API_BASE_URL = `${baseUrl}/${isAdmin ? "admin" : ""}`;
  const API_TOKEN = token;

  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    application_fee: "",
    submission_fee: "",
    start_date: "",
    end_date: "",
  });

  // Position states
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [positionForm, setPositionForm] = useState({
    title: "",
    max_candidates: "",
  });
  const [editingPosition, setEditingPosition] = useState(null);

  // User-specific states
  const [userElectionStatus, setUserElectionStatus] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [applicationFeeTransaction, setApplicationFeeTransaction] =
    useState("");
  const [submissionFeeTransaction, setSubmissionFeeTransaction] = useState("");
  const [documents, setDocuments] = useState({
    vakalatnama: null,
    case_order: null,
    fee_challan_of_bar_card: null,
    bar_certificate: null,
    no_dues_cert_from_high_court: null,
    no_dues_cert_from_sindh_bar: null,
  });
  const [candidates, setCandidates] = useState({});
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const fetchElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/elections`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setElections(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch elections");
      console.error("Error fetching elections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchElections();
    } else {
      fetchUserElections();
    }
  }, [isAdmin]);

  const createElection = async () => {
    if (
      !formData.name ||
      !formData.application_fee ||
      !formData.submission_fee ||
      !formData.start_date ||
      !formData.end_date
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/elections`,
        {
          name: formData.name,
          application_fee: parseFloat(formData.application_fee),
          submission_fee: parseFloat(formData.submission_fee),
          start_date: formData.start_date,
          end_date: formData.end_date,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Election created successfully!");
      setShowCreateModal(false);
      setFormData({
        name: "",
        application_fee: "",
        submission_fee: "",
        start_date: "",
        end_date: "",
      });
      fetchElections();
    } catch (err) {
      console.error("Error creating election:", err);
      alert(err.response?.data?.message || "Failed to create election");
    } finally {
      setLoading(false);
    }
  };

  const toggleElectionStatus = async (election) => {
    setLoading(true);
    try {
      const endpoint = election.is_active ? "disable" : "enable";
      await axios.post(
        `${API_BASE_URL}/elections/${election.id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(
        `Election ${election.is_active ? "disabled" : "enabled"} successfully!`
      );
      fetchElections();
      if (selectedElection?.id === election.id) {
        setSelectedElection({
          ...selectedElection,
          is_active: !election.is_active,
        });
      }
    } catch (err) {
      console.error("Error updating election status:", err);
      alert("Failed to update election status");
    } finally {
      setLoading(false);
    }
  };

  const addPosition = async () => {
    if (!positionForm.title || !positionForm.max_candidates) {
      alert("Please fill all position fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/elections/${selectedElection.id}/positions`,
        {
          title: positionForm.title,
          max_candidates: parseInt(positionForm.max_candidates),
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Position added successfully!");
      setPositionForm({ title: "", max_candidates: "" });
      setShowAddPosition(false);

      // Refresh election data
      const response = await axios.get(`${API_BASE_URL}/elections`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      const updatedElection = response.data.data.find(
        (e) => e.id === selectedElection.id
      );
      setSelectedElection(updatedElection);
      fetchElections();
    } catch (err) {
      console.error("Error adding position:", err);
      alert(err.response?.data?.message || "Failed to add position");
    } finally {
      setLoading(false);
    }
  };

  const updatePosition = async () => {
    if (
      !editingPosition ||
      !editingPosition.title ||
      !editingPosition.max_candidates
    ) {
      alert("Please fill all position fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/elections/positions/${editingPosition.id}`,
        {
          title: editingPosition.title,
          max_candidates: parseInt(editingPosition.max_candidates),
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Position updated successfully!");
      setEditingPosition(null);

      // Refresh election data
      const response = await axios.get(`${API_BASE_URL}/elections`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });
      const updatedElection = response.data.data.find(
        (e) => e.id === selectedElection.id
      );
      setSelectedElection(updatedElection);
      fetchElections();
    } catch (err) {
      console.error("Error updating position:", err);
      alert(err.response?.data?.message || "Failed to update position");
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString()}`;
  };

  // ========== USER-SPECIFIC FUNCTIONS ==========

  // Fetch active elections for user
  const fetchUserElections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}/elections`, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = response.data;
      setElections(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch elections");
      console.error("Error fetching elections:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's election status
  const fetchUserElectionStatus = async (electionId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/elections/${electionId}/status`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      setUserElectionStatus(response.data);
    } catch (err) {
      console.error("Error fetching election status:", err);
      setError(
        err.response?.data?.message || "Failed to fetch election status"
      );
    } finally {
      setLoading(false);
    }
  };

  // Apply for position
  const applyForPosition = async (electionId) => {
    if (!selectedPosition) {
      alert("Please select a position");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/elections/${electionId}/apply`,
        { position_id: selectedPosition },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message || "Application created successfully!");
      fetchUserElectionStatus(electionId);
    } catch (err) {
      console.error("Error applying:", err);
      alert(err.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  // Pay application fee
  const payApplicationFee = async (electionId) => {
    if (!applicationFeeTransaction.trim()) {
      alert("Please enter transaction ID");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/elections/${electionId}/pay-application-fee`,
        { transaction_id: applicationFeeTransaction },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message || "Application fee paid successfully!");
      setApplicationFeeTransaction("");
      fetchUserElectionStatus(electionId);
    } catch (err) {
      console.error("Error paying application fee:", err);
      alert(err.response?.data?.message || "Failed to pay application fee");
    } finally {
      setLoading(false);
    }
  };

  // Submit application with documents
  const submitApplication = async (electionId) => {
    const formData = new FormData();
    formData.append(
      "position_id",
      userElectionStatus.data.application.position_id
    );

    // Check if all documents are uploaded
    const requiredDocs = [
      "vakalatnama",
      "case_order",
      "fee_challan_of_bar_card",
      "bar_certificate",
      "no_dues_cert_from_high_court",
      "no_dues_cert_from_sindh_bar",
    ];

    for (const doc of requiredDocs) {
      if (!documents[doc]) {
        alert(`Please upload ${doc.replace(/_/g, " ")}`);
        return;
      }
      formData.append(doc, documents[doc]);
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/elections/${electionId}/submit-application`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      alert(response.data.message || "Application submitted successfully!");
      setDocuments({
        vakalatnama: null,
        case_order: null,
        fee_challan_of_bar_card: null,
        bar_certificate: null,
        no_dues_cert_from_high_court: null,
        no_dues_cert_from_sindh_bar: null,
      });
      fetchUserElectionStatus(electionId);
    } catch (err) {
      console.error("Error submitting application:", err);
      alert(err.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  // Pay submission fee
  const paySubmissionFee = async (electionId) => {
    if (!submissionFeeTransaction.trim()) {
      alert("Please enter transaction ID");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/elections/${electionId}/pay-submission-fee`,
        { transaction_id: submissionFeeTransaction },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert(response.data.message || "Submission fee paid successfully!");
      setSubmissionFeeTransaction("");
      fetchUserElectionStatus(electionId);
    } catch (err) {
      console.error("Error paying submission fee:", err);
      alert(err.response?.data?.message || "Failed to pay submission fee");
    } finally {
      setLoading(false);
    }
  };

  // Fetch candidates
  const fetchCandidates = async (electionId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/elections/${electionId}/candidates`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      setCandidates(response.data.data || {});
    } catch (err) {
      console.error("Error fetching candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Fetch applications
  const fetchApplications = async (electionId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/elections/${electionId}/applications`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      setApplications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Approve application
  const approveApplication = async (electionId, applicationId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/elections/${electionId}/applications/${applicationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      alert(response.data.message || "Application approved successfully!");
      fetchApplications(electionId);
    } catch (err) {
      console.error("Error approving application:", err);
      alert(err.response?.data?.message || "Failed to approve application");
    } finally {
      setLoading(false);
    }
  };

  // ADMIN: Reject application
  const rejectApplication = async (electionId, applicationId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/elections/${electionId}/applications/${applicationId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );
      alert(response.data.message || "Application rejected successfully!");
      fetchApplications(electionId);
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert(err.response?.data?.message || "Failed to reject application");
    } finally {
      setLoading(false);
    }
  };

  // ========== RENDER FUNCTIONS ==========

  // Render user's election status and actions
  const renderUserElectionView = () => {
    if (!selectedElection) return null;

    const electionData = userElectionStatus?.data;
    const hasApplied = electionData?.has_applied;
    const application = electionData?.application;
    const isCandidate = electionData?.is_candidate;

    return (
      <div
        style={modalOverlay}
        onClick={() => {
          setShowViewModal(false);
          setSelectedElection(null);
          setUserElectionStatus(null);
        }}
      >
        <div
          style={{ ...modalContent, maxWidth: 900 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={modalHeader}>
            <h2 style={modalTitle}>{selectedElection.name}</h2>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedElection(null);
                setUserElectionStatus(null);
              }}
              style={closeBtn}
            >
              <X size={24} />
            </button>
          </div>

          <div style={modalBody}>
            {/* Election Details */}
            <div style={detailsSection}>
              <h3 style={sectionTitle}>Election Details</h3>
              <div style={detailsGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Application Fee:</span>
                  <span style={detailValue}>
                    {formatCurrency(selectedElection.application_fee)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Submission Fee:</span>
                  <span style={detailValue}>
                    {formatCurrency(selectedElection.submission_fee)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Start Date:</span>
                  <span style={detailValue}>
                    {formatDate(selectedElection.start_date)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>End Date:</span>
                  <span style={detailValue}>
                    {formatDate(selectedElection.end_date)}
                  </span>
                </div>
              </div>
            </div>

            {loading && !userElectionStatus ? (
              <div style={centerLoader}>
                <Loader2
                  style={{
                    animation: "spin 1s linear infinite",
                    color: "#018f41",
                  }}
                  size={48}
                />
              </div>
            ) : userElectionStatus ? (
              <>
                {/* SCENARIO 1: Election Inactive */}
                {!userElectionStatus.is_active && (
                  <div style={infoBox}>
                    <Clock size={20} />
                    <div>
                      <strong>Election Not Active</strong>
                      <p>
                        This election is currently inactive. You cannot apply at
                        this time.
                      </p>
                    </div>
                  </div>
                )}

                {/* SCENARIO 2-9: Active Election - Various States */}
                {userElectionStatus.is_active && (
                  <>
                    {/* SCENARIO 2: Not Applied Yet */}
                    {!hasApplied && (
                      <div style={detailsSection}>
                        <h3 style={sectionTitle}>Apply for Position</h3>
                        <div style={formGroup}>
                          <label style={label}>Select Position *</label>
                          <select
                            value={selectedPosition}
                            onChange={(e) =>
                              setSelectedPosition(e.target.value)
                            }
                            style={input}
                          >
                            <option value="">Choose a position...</option>
                            {selectedElection.positions?.map((pos) => (
                              <option key={pos.id} value={pos.id}>
                                {pos.title} (Max Candidates:{" "}
                                {pos.max_candidates})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => applyForPosition(selectedElection.id)}
                          style={submitButton}
                          disabled={loading || !selectedPosition}
                        >
                          {loading ? (
                            <Loader2
                              size={18}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <Plus size={18} />
                          )}
                          Submit Application
                        </button>
                      </div>
                    )}

                    {/* SCENARIO 3: Draft - Pay Application Fee */}
                    {hasApplied &&
                      application.status === "draft" &&
                      !application.application_fee_paid && (
                        <div style={detailsSection}>
                          <div style={statusBadge("#f59e0b")}>
                            <Clock size={18} />
                            <span>Application Fee Required</span>
                          </div>
                          <p style={{ marginTop: 12, color: "#6b7280" }}>
                            Please pay the application fee of{" "}
                            <strong>
                              {formatCurrency(selectedElection.application_fee)}
                            </strong>{" "}
                            to continue.
                          </p>
                          <div style={formGroup}>
                            <label style={label}>Transaction ID *</label>
                            <input
                              type="text"
                              value={applicationFeeTransaction}
                              onChange={(e) =>
                                setApplicationFeeTransaction(e.target.value)
                              }
                              style={input}
                              placeholder="Enter transaction ID"
                            />
                          </div>
                          <button
                            onClick={() =>
                              payApplicationFee(selectedElection.id)
                            }
                            style={submitButton}
                            disabled={
                              loading || !applicationFeeTransaction.trim()
                            }
                          >
                            {loading ? (
                              <Loader2
                                size={18}
                                style={{ animation: "spin 1s linear infinite" }}
                              />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                            Pay Application Fee
                          </button>
                        </div>
                      )}

                    {/* SCENARIO 4-5: Upload Documents */}
                    {hasApplied &&
                      application.status === "draft" &&
                      application.application_fee_paid && (
                        <div style={detailsSection}>
                          <div style={statusBadge("#3b82f6")}>
                            <Upload size={18} />
                            <span>Upload Required Documents</span>
                          </div>
                          <div style={{ marginTop: 20 }}>
                            {[
                              { key: "vakalatnama", label: "Vakalatnama" },
                              { key: "case_order", label: "Case Order" },
                              {
                                key: "fee_challan_of_bar_card",
                                label: "Fee Challan of Bar Card",
                              },
                              {
                                key: "bar_certificate",
                                label: "Bar Certificate",
                              },
                              {
                                key: "no_dues_cert_from_high_court",
                                label: "No Dues Certificate (High Court)",
                              },
                              {
                                key: "no_dues_cert_from_sindh_bar",
                                label: "No Dues Certificate (Sindh Bar)",
                              },
                            ].map((doc) => (
                              <div key={doc.key} style={formGroup}>
                                <label style={label}>{doc.label} *</label>
                                <input
                                  type="file"
                                  onChange={(e) =>
                                    setDocuments({
                                      ...documents,
                                      [doc.key]: e.target.files[0],
                                    })
                                  }
                                  style={input}
                                  accept=".pdf,.jpg,.jpeg,.png"
                                />
                                {documents[doc.key] && (
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "#018f41",
                                      marginTop: 4,
                                    }}
                                  >
                                    ✓ {documents[doc.key].name}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              submitApplication(selectedElection.id)
                            }
                            style={submitButton}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2
                                size={18}
                                style={{ animation: "spin 1s linear infinite" }}
                              />
                            ) : (
                              <Upload size={18} />
                            )}
                            Submit Application
                          </button>
                        </div>
                      )}

                    {/* SCENARIO 6: Submitted - Pay Submission Fee */}
                    {hasApplied &&
                      application.status === "submitted" &&
                      !application.submission_fee_paid && (
                        <div style={detailsSection}>
                          <div style={statusBadge("#8b5cf6")}>
                            <FileText size={18} />
                            <span>Submission Fee Required</span>
                          </div>
                          <p style={{ marginTop: 12, color: "#6b7280" }}>
                            Your application has been submitted. Please pay the
                            submission fee of{" "}
                            <strong>
                              {formatCurrency(selectedElection.submission_fee)}
                            </strong>{" "}
                            for admin review.
                          </p>
                          <div style={formGroup}>
                            <label style={label}>Transaction ID *</label>
                            <input
                              type="text"
                              value={submissionFeeTransaction}
                              onChange={(e) =>
                                setSubmissionFeeTransaction(e.target.value)
                              }
                              style={input}
                              placeholder="Enter transaction ID"
                            />
                          </div>
                          <button
                            onClick={() =>
                              paySubmissionFee(selectedElection.id)
                            }
                            style={submitButton}
                            disabled={
                              loading || !submissionFeeTransaction.trim()
                            }
                          >
                            {loading ? (
                              <Loader2
                                size={18}
                                style={{ animation: "spin 1s linear infinite" }}
                              />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                            Pay Submission Fee
                          </button>
                        </div>
                      )}

                    {/* SCENARIO 7: Under Review */}
                    {hasApplied &&
                      application.status === "submitted" &&
                      application.submission_fee_paid && (
                        <div style={detailsSection}>
                          <div style={statusBadge("#3b82f6")}>
                            <Clock size={18} />
                            <span>Under Review</span>
                          </div>
                          <p style={{ marginTop: 12, color: "#6b7280" }}>
                            Your application is currently under review by the
                            administration. You will be notified once a decision
                            is made.
                          </p>
                        </div>
                      )}

                    {/* SCENARIO 8: Approved */}
                    {hasApplied &&
                      application.status === "approved" &&
                      isCandidate && (
                        <div style={detailsSection}>
                          <div style={statusBadge("#10b981")}>
                            <CheckCircle size={18} />
                            <span>Application Approved</span>
                          </div>
                          <p style={{ marginTop: 12, color: "#6b7280" }}>
                            Congratulations! Your application has been approved.
                            You are now a candidate for this election.
                          </p>
                        </div>
                      )}

                    {/* SCENARIO 9: Rejected */}
                    {hasApplied && application.status === "rejected" && (
                      <div style={detailsSection}>
                        <div style={statusBadge("#ef4444")}>
                          <XCircle size={18} />
                          <span>Application Rejected</span>
                        </div>
                        <p style={{ marginTop: 12, color: "#6b7280" }}>
                          Unfortunately, your application has been rejected by
                          the administration.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : null}

            {/* Candidates List */}
            {Object.keys(candidates).length > 0 && (
              <div style={detailsSection}>
                <h3 style={sectionTitle}>
                  <Users
                    size={20}
                    style={{ display: "inline", marginRight: 8 }}
                  />
                  Approved Candidates
                </h3>
                {Object.entries(candidates).map(([position, candidateList]) => (
                  <div key={position} style={{ marginBottom: 20 }}>
                    <h4 style={{ ...positionTitle, marginBottom: 12 }}>
                      {position}
                    </h4>
                    <div style={positionsListContainer}>
                      {candidateList.map((candidate) => (
                        <div key={candidate.candidate_id} style={{}}>
                          <div style={positionInfo}>
                            <p style={positionTitle}>{candidate.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={modalFooter}>
            <button
              onClick={() => {
                fetchCandidates(selectedElection.id);
              }}
              style={viewBtn}
              disabled={loading}
            >
              <Users size={18} /> View Candidates
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render admin's election management view (existing view)
  const renderAdminElectionView = () => {
    if (!selectedElection) return null;

    return (
      <div style={modalOverlay} onClick={() => setShowViewModal(false)}>
        <div
          style={{ ...modalContent, maxWidth: 900 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={modalHeader}>
            <h2 style={modalTitle}>{selectedElection.name}</h2>
            <button onClick={() => setShowViewModal(false)} style={closeBtn}>
              <X size={24} />
            </button>
          </div>
          <div style={modalBody}>
            {/* Election Details */}
            <div style={detailsSection}>
              <h3 style={sectionTitle}>Election Details</h3>
              <div style={detailsGrid}>
                <div style={detailItem}>
                  <span style={detailLabel}>Application Fee:</span>
                  <span style={detailValue}>
                    {formatCurrency(selectedElection.application_fee)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Submission Fee:</span>
                  <span style={detailValue}>
                    {formatCurrency(selectedElection.submission_fee)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Start Date:</span>
                  <span style={detailValue}>
                    {formatDate(selectedElection.start_date)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>End Date:</span>
                  <span style={detailValue}>
                    {formatDate(selectedElection.end_date)}
                  </span>
                </div>
                <div style={detailItem}>
                  <span style={detailLabel}>Status:</span>
                  <label style={toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={selectedElection.is_active}
                      onChange={() => toggleElectionStatus(selectedElection)}
                      disabled={loading}
                    />
                    <span style={slider}></span>
                  </label>
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: "0.9rem",
                      color: "#6b7280",
                    }}
                  >
                    {selectedElection.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Positions Section */}
            <div style={detailsSection}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={sectionTitle}>
                  Positions ({selectedElection.positions?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddPosition(!showAddPosition)}
                  style={addPositionBtn}
                  disabled={loading}
                >
                  <Plus size={16} /> Add Position
                </button>
              </div>

              {showAddPosition && (
                <div style={positionFormStyle}>
                  <div style={formRow}>
                    <div style={formGroup}>
                      <label style={label}>Position Title *</label>
                      <input
                        type="text"
                        value={positionForm.title}
                        onChange={(e) =>
                          setPositionForm({
                            ...positionForm,
                            title: e.target.value,
                          })
                        }
                        style={input}
                        placeholder="e.g., President"
                      />
                    </div>
                    <div style={formGroup}>
                      <label style={label}>Max Candidates *</label>
                      <input
                        type="number"
                        value={positionForm.max_candidates}
                        onChange={(e) =>
                          setPositionForm({
                            ...positionForm,
                            max_candidates: e.target.value,
                          })
                        }
                        style={input}
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowAddPosition(false);
                        setPositionForm({ title: "", max_candidates: "" });
                      }}
                      style={cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addPosition}
                      style={submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Position
                    </button>
                  </div>
                </div>
              )}

              <div style={positionsListContainer}>
                {!selectedElection.positions ||
                selectedElection.positions.length === 0 ? (
                  <div style={emptyPositions}>No positions added yet</div>
                ) : (
                  selectedElection.positions.map((position) => (
                    <div key={position.id} style={positionCard}>
                      {editingPosition?.id === position.id ? (
                        <>
                          <div style={formRow}>
                            <div style={formGroup}>
                              <label style={label}>Position Title</label>
                              <input
                                type="text"
                                value={editingPosition.title}
                                onChange={(e) =>
                                  setEditingPosition({
                                    ...editingPosition,
                                    title: e.target.value,
                                  })
                                }
                                style={input}
                              />
                            </div>
                            <div style={formGroup}>
                              <label style={label}>Max Candidates</label>
                              <input
                                type="number"
                                value={editingPosition.max_candidates}
                                onChange={(e) =>
                                  setEditingPosition({
                                    ...editingPosition,
                                    max_candidates: e.target.value,
                                  })
                                }
                                style={input}
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              marginTop: 10,
                            }}
                          >
                            <button
                              onClick={() => setEditingPosition(null)}
                              style={cancelButton}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={updatePosition}
                              style={submitButton}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2
                                  size={16}
                                  style={{
                                    animation: "spin 1s linear infinite",
                                  }}
                                />
                              ) : (
                                <Save size={16} />
                              )}
                              Update
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={positionInfo}>
                            <h4 style={positionTitle}>{position.title}</h4>
                            <p style={positionMeta}>
                              Max Candidates: {position.max_candidates}
                            </p>
                            <p style={positionMeta}>
                              Created: {formatDate(position.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingPosition({ ...position })}
                            style={editPositionBtn}
                            disabled={loading}
                          >
                            <Edit2 size={16} /> Edit
                          </button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Applications Review Section */}
            <div style={detailsSection}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={sectionTitle}>
                  Applications ({applications.length})
                </h3>
                <button
                  onClick={() => fetchApplications(selectedElection.id)}
                  style={addPositionBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Eye size={16} />
                  )}
                  Load Applications
                </button>
              </div>

              {applications.length > 0 && (
                <div style={positionsListContainer}>
                  {applications.map((app) => (
                    <div key={app.application_id} style={positionCard}>
                      <div style={positionInfo}>
                        <h4 style={positionTitle}>
                          {app.user?.name || "Unknown"}
                        </h4>
                        <p style={positionMeta}>Position: {app.position}</p>
                        <p style={positionMeta}>Status: {app.status}</p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() =>
                            approveApplication(
                              selectedElection.id,
                              app.application_id
                            )
                          }
                          style={{
                            ...editPositionBtn,
                            background: "#10b981",
                            color: "white",
                            border: "none",
                          }}
                          disabled={loading || app.status === "approved"}
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() =>
                            rejectApplication(
                              selectedElection.id,
                              app.application_id
                            )
                          }
                          style={{
                            ...editPositionBtn,
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                          }}
                          disabled={loading || app.status === "rejected"}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            {isAdmin ? "Elections Management" : "Elections"}
          </h1>
          <p style={{ color: "#555", fontSize: "1.1rem" }}>
            {isAdmin
              ? "Manage all elections and positions"
              : "View and participate in elections"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={createBtn}
            disabled={loading}
          >
            <Plus size={20} /> Start New Election
          </button>
        )}
      </header>

      {error && <div style={errorBox}>Error: {error}</div>}

      <div style={tableCard}>
        <div style={tableHeader}>
          <h3 style={tableTitle}>Elections List</h3>
        </div>

        {loading && !elections.length ? (
          <div style={centerLoader}>
            <Loader2
              style={{ animation: "spin 1s linear infinite", color: "#018f41" }}
              size={48}
            />
            {/* <p style={{ marginTop: 16, color: "#555" }}>Loading elections...</p> */}
          </div>
        ) : elections.length === 0 ? (
          <div style={emptyState}>No elections found</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Election Name</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Application Fee</th>
                <th style={thStyle}>Submission Fee</th>
                <th style={thStyle}>Positions</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((election) => (
                <tr key={election.id} style={getRowStyle()}>
                  <td style={tdStyle}>
                    <div style={nameText}>{election.name}</div>
                    <div style={regDate}>
                      Created: {formatDate(election.created_at)}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={value}>{formatDate(election.start_date)}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={value}>{formatDate(election.end_date)}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={value}>
                      {formatCurrency(election.application_fee)}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={value}>
                      {formatCurrency(election.submission_fee)}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={value}>
                      {election.positions?.length || 0} positions
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {isAdmin ? (
                      <label style={toggleSwitch}>
                        <input
                          type="checkbox"
                          checked={election.is_active}
                          onChange={() => toggleElectionStatus(election)}
                          disabled={loading}
                        />
                        <span style={slider}></span>
                      </label>
                    ) : (
                      <div
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          background: election.is_active
                            ? "#d1fae5"
                            : "#fee2e2",
                          color: election.is_active ? "#065f46" : "#991b1b",
                        }}
                      >
                        {election.is_active ? "Active" : "Inactive"}
                      </div>
                    )}
                    {isAdmin && (
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "#6b7280",
                          marginTop: 4,
                        }}
                      >
                        {election.is_active ? "Active" : "Inactive"}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      onClick={() => {
                        setSelectedElection(election);
                        setShowViewModal(true);
                        if (!isAdmin) {
                          fetchUserElectionStatus(election.id);
                        }
                      }}
                      style={viewBtn}
                      title={
                        isAdmin ? "View election details" : "View and Apply"
                      }
                    >
                      <Eye size={18} /> {isAdmin ? "View" : "View & Apply"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div style={modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <h2 style={modalTitle}>Start New Election</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={closeBtn}
              >
                <X size={24} />
              </button>
            </div>
            <div style={modalBody}>
              <div style={formGroup}>
                <label style={label}>Election Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={input}
                  placeholder="e.g., Lawyers Election 2026"
                />
              </div>
              <div style={formRow}>
                <div style={formGroup}>
                  <label style={label}>Application Fee (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.application_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        application_fee: e.target.value,
                      })
                    }
                    style={input}
                    placeholder="500"
                  />
                </div>
                <div style={formGroup}>
                  <label style={label}>Submission Fee (Rs.) *</label>
                  <input
                    type="number"
                    value={formData.submission_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        submission_fee: e.target.value,
                      })
                    }
                    style={input}
                    placeholder="1000"
                  />
                </div>
              </div>
              <div style={formRow}>
                <div style={formGroup}>
                  <label style={label}>Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    style={input}
                  />
                </div>
                <div style={formGroup}>
                  <label style={label}>End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    style={input}
                  />
                </div>
              </div>
            </div>
            <div style={modalFooter}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={cancelButton}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={createElection}
                style={submitButton}
                disabled={loading}
              >
                {loading ? (
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Plus size={18} />
                )}
                Create Election
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Election Modal - Conditionally render based on role */}
      {showViewModal &&
        selectedElection &&
        (isAdmin ? renderAdminElectionView() : renderUserElectionView())}

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

        /* Toggle switch styles */
        input[type="checkbox"] {
          opacity: 0;
          width: 0;
          height: 0;
        }

        input[type="checkbox"]:checked + span {
          background-color: #018f41;
        }

        input[type="checkbox"]:checked + span:before {
          transform: translateX(26px);
        }

        span.slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }

        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

// ────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────

const pageContainer = {
  fontFamily: "Lato",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "20px",
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
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

const createBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 24px",
  borderRadius: 12,
  border: "none",
  background: "#018f41",
  color: "white",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  boxShadow: "0 4px 12px rgba(1, 143, 65, 0.3)",
};

const viewBtn = {
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
  transition: "all 0.2s",
};

const toggleSwitch = {
  position: "relative",
  display: "inline-block",
  width: 50,
  height: 24,
};

const slider = {
  position: "absolute",
  cursor: "pointer",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "#ccc",
  transition: "0.4s",
  borderRadius: 24,
};

// Modal styles
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "20px",
};

const modalContent = {
  background: "white",
  borderRadius: 20,
  maxWidth: 600,
  width: "100%",
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px 28px",
  borderBottom: "1px solid #e5e7eb",
};

const modalTitle = {
  margin: 0,
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#1a1a1a",
};

const closeBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#6b7280",
  padding: 8,
  borderRadius: 8,
  transition: "all 0.2s",
};

const modalBody = {
  padding: "28px",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  padding: "20px 28px",
  borderTop: "1px solid #e5e7eb",
};

const formGroup = {
  marginBottom: 20,
  flex: 1,
};

const formRow = {
  display: "flex",
  gap: 16,
};

const label = {
  display: "block",
  marginBottom: 8,
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#374151",
};

const input = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "1rem",
  border: "2px solid #e5e7eb",
  borderRadius: 10,
  transition: "all 0.2s",
};

const cancelButton = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#374151",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const submitButton = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  background: "#018f41",
  color: "white",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const detailsSection = {
  marginBottom: 32,
  padding: "20px",
  background: "#f8fafc",
  borderRadius: 12,
};

const sectionTitle = {
  margin: "0 0 16px 0",
  fontSize: "1.1rem",
  fontWeight: 600,
  color: "#1a1a1a",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
};

const detailItem = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const detailLabel = {
  fontSize: "0.85rem",
  color: "#6b7280",
  fontWeight: 500,
};

const detailValue = {
  fontSize: "1rem",
  color: "#1a1a1a",
  fontWeight: 600,
};

const addPositionBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 16px",
  borderRadius: 8,
  border: "none",
  background: "#018f41",
  color: "white",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const positionForm = {
  padding: "16px",
  background: "white",
  borderRadius: 10,
  border: "2px solid #e5e7eb",
  marginBottom: 16,
};

const positionsListContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16,
};

const positionCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  background: "white",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  transition: "all 0.2s",
};

const positionInfo = {
  flex: 1,
};

const positionTitle = {
  margin: "0 0 8px 0",
  fontSize: "1rem",
  fontWeight: 600,
  color: "#1a1a1a",
};

const positionMeta = {
  margin: "4px 0",
  fontSize: "0.85rem",
  color: "#6b7280",
};

const editPositionBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "white",
  color: "#374151",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s",
};

const emptyPositions = {
  padding: "40px 20px",
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "0.95rem",
};

// User-specific styles
const statusBadge = (bgColor) => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  borderRadius: 10,
  background: bgColor,
  color: "white",
  fontWeight: 600,
  fontSize: "0.95rem",
});

const infoBox = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "16px 20px",
  background: "#fef3c7",
  border: "1px solid #fbbf24",
  borderRadius: 12,
  marginBottom: 20,
  color: "#92400e",
};

const positionFormStyle = {
  padding: "16px",
  background: "white",
  borderRadius: 10,
  border: "2px solid #e5e7eb",
  marginBottom: 16,
};

export default Elections;
