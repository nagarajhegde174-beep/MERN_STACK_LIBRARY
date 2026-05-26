import "../../animations.css";
import "./librarianrequest.css"; // <-- New Premium CSS
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import { getAuthToken } from "../../utils/auth";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, User,
  BookOpen, Calendar, ChevronDown, ChevronUp, Lock
} from "lucide-react";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

// ── Minimum date = tomorrow ──────────────────────────────────────────────────
function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function LibrarianRequests() {
  const [requests,     setRequests]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionId,     setActionId]     = useState(null);
  const [showReject,   setShowReject]   = useState({});
  const [rejectReason, setRejectReason] = useState({});
  const [dueDates,     setDueDates]     = useState({});

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${Server_URL}librarian/issuerequest`, { headers: headers() });
      setRequests(res.data.requests || []);
    } catch {
      showErrorToast("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── APPROVE ───────────────────────────────────────────────────────────────
  const approveRequest = async (id) => {
    const dueDate = dueDates[id];
    if (!dueDate) return showErrorToast("Please select a due date before approving");

    setActionId(id);
    try {
      const res = await axios.put(
        `${Server_URL}librarian/approverequest/${id}`,
        { dueDate },
        { headers: headers() }
      );
      showSuccessToast(res.data.message || "Book issued successfully!");
      fetchRequests();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to approve request");
    } finally {
      setActionId(null);
    }
  };

  // ── REJECT ────────────────────────────────────────────────────────────────
  const rejectRequest = async (id) => {
    const reason = rejectReason[id];
    if (!reason || reason.trim() === "")
      return showErrorToast("Please enter a rejection reason");

    setActionId(id);
    try {
      const res = await axios.put(
        `${Server_URL}librarian/rejectrequest/${id}`,
        { reason },
        { headers: headers() }
      );
      showSuccessToast(res.data.message || "Request rejected");
      fetchRequests();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionId(null);
      setShowReject(prev => ({ ...prev, [id]: false }));
    }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}>
      <div className="preloader-spinner" />
    </div>
  );

  return (
    <div className="lr-page">
      <div className="lr-container">
        
        {/* Hero Header */}
        <header className="lr-hero-header">
          <div className="lr-title-group">
            <h1 className="lr-title">
              <div className="lr-title-icon"><BookOpen size={22} /></div>
              Issue Requests
            </h1>
            <p className="lr-subtitle">Manage incoming library book requests in the approval queue.</p>
          </div>
        </header>

        {requests.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>
            <CheckCircle2 size={48} style={{ marginBottom:"12px" }} />
            <p style={{ fontSize:"16px" }}>No pending requests.</p>
          </div>
        ) : (
          <div className="lr-rows-container">
            {requests.map((req) => {
              const user = req.userId || {};
              const book = req.bookId || {};
              const isRestricted  = user.isRestricted;
              const isExpired     = user.accountExpired;
              
              const userInitial = (user.name || "U").charAt(0).toUpperCase();

              // Badge Setup
              let badgeClass = "requested";
              let badgeText = "Pending";
              if (req.status === "Issued") { badgeClass = "issued"; badgeText = "Approved"; }
              if (req.status === "Rejected") { badgeClass = "rejected"; badgeText = "Rejected"; }

              return (
                <div key={req._id} className="lr-row-card">
                  
                  {/* Left: User Profile */}
                  <div className="lr-user-cell">
                    <div className="lr-avatar-wrapper">
                      <div className="lr-avatar">{userInitial}</div>
                      <div className="lr-online-dot"></div>
                    </div>
                    <div className="lr-user-details">
                      <h5>{user.name || "N/A"}</h5>
                      <p>
                        <User size={12} /> {user.email}
                      </p>
                      {(user.year || user.stream) && (
                        <p style={{ marginTop: '4px' }}>
                          <BookOpen size={12} /> Year {user.year} &bull; {user.stream}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center: Book Info */}
                  <div className="lr-book-cell">
                    <img 
                      src={book.coverImage || "https://images.unsplash.com/photo-1543005139-014524090bb0?w=200"} 
                      alt="Book Cover" 
                      className="lr-book-cover"
                    />
                    <div className="lr-book-details">
                      <h5>{book.title || "Unknown Book"}</h5>
                      <p>{book.category || "Library Book"}</p>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="lr-actions-cell">
                    
                    <div className="lr-status-row">
                      <span className={`lr-badge ${badgeClass}`}>
                        <span className="lr-badge-dot"></span> {badgeText}
                      </span>
                    </div>

                    {/* Alerts directly in the action cell for compactness */}
                    {isRestricted && (
                      <div className="lr-glass-alert red">
                        <Lock size={16} /> Restricted: Overdue Books
                      </div>
                    )}
                    
                    {isExpired && (
                      <div className="lr-glass-alert orange">
                        <AlertTriangle size={16} /> Account Expired
                      </div>
                    )}

                    {/* Pending Action Controls */}
                    {req.status === "Requested" && !isRestricted && !isExpired && (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end', marginTop: '8px' }}>
                        
                        <div className="lr-date-picker-wrap">
                          <label>
                            <Calendar size={14} /> Due Date:
                          </label>
                          <input
                            type="date"
                            min={tomorrowStr()}
                            value={dueDates[req._id] || ""}
                            onChange={(e) => setDueDates(prev => ({ ...prev, [req._id]: e.target.value }))}
                            className="lr-date-input"
                          />
                        </div>

                        <div className="lr-buttons-row">
                          <button
                            className="lr-btn approve"
                            onClick={() => approveRequest(req._id)}
                            disabled={actionId === req._id || !dueDates[req._id]}
                          >
                            <CheckCircle2 size={16} />
                            {actionId === req._id ? "Approving..." : "Approve"}
                          </button>
                          
                          <button
                            className="lr-btn reject"
                            onClick={() => setShowReject(prev => ({ ...prev, [req._id]: !prev[req._id] }))}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason Form */}
                    {showReject[req._id] && req.status === "Requested" && (
                      <div className="lr-reject-box">
                        <label>Reason for Rejection *</label>
                        <textarea
                          rows={2}
                          className="lr-reject-input"
                          placeholder="e.g. Book is reserved..."
                          value={rejectReason[req._id] || ""}
                          onChange={(e) => setRejectReason(prev => ({ ...prev, [req._id]: e.target.value }))}
                        />
                        <button
                          className="lr-btn confirm-reject"
                          onClick={() => rejectRequest(req._id)}
                          disabled={actionId === req._id}
                        >
                          {actionId === req._id ? "Rejecting..." : "Confirm Reject"}
                        </button>
                      </div>
                    )}

                    {/* Show Reason if Already Rejected */}
                    {req.status === "Rejected" && req.rejectionReason && (
                      <div className="lr-glass-alert red" style={{ width: '100%', justifyContent: 'flex-end', background: 'transparent', border: 'none', padding: '0', marginTop: '4px' }}>
                        <span><strong style={{color: '#fca5a5'}}>Reason:</strong> {req.rejectionReason}</span>
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
