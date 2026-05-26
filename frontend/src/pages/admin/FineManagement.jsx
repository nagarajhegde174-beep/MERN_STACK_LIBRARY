import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import { Search, Wallet, CheckCircle2, Clock, FileText, Check, Trash2, WalletCards } from "lucide-react";
import "../../animations.css";
import "./finemanagement.css";

export default function FineManagement() {
  const [fines, setFines]     = useState([]);
  const [stats, setStats]     = useState({ totalAmount:0, totalCollected:0, totalPending:0 });
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${getAuthToken()}` };

  const fetchFines = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${Server_URL}fines`, { headers });
      setFines(r.data.fines || []);
      setStats({ totalAmount:r.data.totalAmount||0, totalCollected:r.data.totalCollected||0, totalPending:r.data.totalPending||0 });
    } catch { showErrorToast("Failed to fetch fines"); }
    finally { setLoading(false); }
  };

  const markPaid = async (id) => {
    try { 
      const r = await axios.put(`${Server_URL}fines/pay/${id}`, {}, { headers }); 
      showSuccessToast(r.data.message); 
      fetchFines(); 
    } catch (e) { showErrorToast(e.response?.data?.message || "Failed to mark as paid"); }
  };

  const waiveFine = async (id) => {
    if (!window.confirm("Are you sure you want to waive this fine? This action cannot be undone.")) return;
    try { 
      const r = await axios.delete(`${Server_URL}admin/fines/${id}/waive`, { headers }); 
      showSuccessToast(r.data.message); 
      fetchFines(); 
    } catch (e) { showErrorToast(e.response?.data?.message || "Failed to waive fine"); }
  };

  useEffect(() => { fetchFines(); }, []);

  const displayed = fines.filter(f => {
    const matchesFilter = filter === "all" ? true : filter === "paid" ? f.paidStatus : !f.paidStatus;
    if (!matchesFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (f.memberId?.name || "").toLowerCase().includes(q) ||
      (f.memberId?.email || "").toLowerCase().includes(q) ||
      (f.bookId?.title || "").toLowerCase().includes(q)
    );
  });

  const statCards = [
    { label: "Total Fines",   val: `₹${stats.totalAmount}`,    icon: Wallet,     bg: "rgba(249, 115, 22, 0.15)",  color: "#f97316", glow: "rgba(249, 115, 22, 0.4)" },
    { label: "Collected",     val: `₹${stats.totalCollected}`, icon: CheckCircle2, bg: "rgba(16, 185, 129, 0.15)", color: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
    { label: "Pending",       val: `₹${stats.totalPending}`,   icon: Clock,      bg: "rgba(234, 179, 8, 0.15)",   color: "#eab308", glow: "rgba(234, 179, 8, 0.4)" },
    { label: "Total Records", val: fines.length,               icon: FileText,   bg: "rgba(59, 130, 246, 0.15)",  color: "#3b82f6", glow: "rgba(59, 130, 246, 0.4)" },
  ];

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px", background: "#020617", minHeight: "100vh" }}>
      <div className="preloader-spinner" />
    </div>
  );

  return (
    <div className="fm-page">
      <div className="fm-texture"></div>
      
      <div className="fm-container">
        {/* Header */}
        <header className="fm-hero-header">
          <div className="fm-badge-icon">
            <WalletCards size={16} /> Finance
          </div>
          <h1 className="fm-title">Fine Management</h1>
          <p className="fm-subtitle">Monitor system-wide fines, verify payments, and clear outstanding balances.</p>
        </header>

        {/* Stats Grid */}
        <div className="fm-stats-grid">
          {statCards.map(c => (
            <div 
              key={c.label} 
              className="fm-stat-card"
              style={{
                '--fm-accent': c.color,
                '--fm-accent-bg': c.bg,
                '--fm-accent-glow': c.glow
              }}
            >
              <div className="fm-stat-header">
                <span className="fm-stat-label">{c.label}</span>
                <div className="fm-stat-icon">
                  <c.icon size={20} />
                </div>
              </div>
              <div className="fm-stat-value">{c.val}</div>
              
              <div className="fm-stat-progress">
                <div className="fm-stat-progress-bar"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="fm-filters-container">
          <div className="fm-tabs">
            {[
              { val: "all", label: "All Fines" },
              { val: "unpaid", label: "Unpaid" },
              { val: "paid", label: "Paid" }
            ].map((tab) => (
              <button 
                key={tab.val} 
                className={`fm-tab ${filter === tab.val ? 'active' : ''}`}
                onClick={() => setFilter(tab.val)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="fm-search-wrap">
            <input
              type="text"
              className="fm-search-input"
              placeholder="Search by name, email, or book..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="fm-search-icon" />
          </div>
        </div>

        {/* Ledger Rows Area */}
        <div className="fm-rows-container">
          {displayed.length === 0 ? (
            <div className="fm-empty-card">
              <div className="fm-empty-icon">
                <WalletCards size={40} />
              </div>
              <h3>No fine records available</h3>
              <p>All payments are currently cleared or none match your search criteria.</p>
            </div>
          ) : (
            displayed.map((f) => (
              <div key={f._id} className="fm-row-card">
                
                {/* Member Info */}
                <div className="fm-cell">
                  <span className="fm-member-name">{f.memberId?.name || "Unknown Member"}</span>
                  <span className="fm-member-id">{f.memberId?.membershipId || "No ID"}</span>
                </div>

                {/* Book Info & Overdue */}
                <div className="fm-cell">
                  <span className="fm-book-title">{f.bookId?.title || "Unknown Book"}</span>
                  <span className="fm-overdue-badge">{f.daysOverdue} Days Overdue</span>
                </div>

                {/* Amount */}
                <div className="fm-cell" style={{ alignItems: 'flex-start' }}>
                  <span className={`fm-amount ${f.paidStatus ? 'paid' : ''}`}>
                    ₹{f.amount}
                  </span>
                </div>

                {/* Status & Actions */}
                <div className="fm-status-cell">
                  {f.paidStatus ? (
                    <span className="fm-status-pill paid">
                      <CheckCircle2 size={14} /> Paid
                    </span>
                  ) : (
                    <>
                      <span className="fm-status-pill unpaid">
                        <Clock size={14} /> Unpaid
                      </span>
                      
                      {!f.isActive ? (
                        <>
                          <button className="fm-btn pay" onClick={() => markPaid(f._id)}>
                            <Check size={14} /> Pay
                          </button>
                          <button className="fm-btn waive" onClick={() => waiveFine(f._id)}>
                            <Trash2 size={14} /> Waive
                          </button>
                        </>
                      ) : (
                        <span className="fm-issued-text">Book Issued</span>
                      )}
                    </>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}