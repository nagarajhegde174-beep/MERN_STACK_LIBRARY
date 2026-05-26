import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ClipboardList, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import "../../animations.css";
import "./allreservations.css";

const STATUS_CONFIG = {
  Pending:   { color: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", glow: "rgba(251, 191, 36, 0.4)", icon: Clock, label: "Pending" },
  Notified:  { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", glow: "rgba(56, 189, 248, 0.4)", icon: Bell, label: "Notified" },
  Fulfilled: { color: "#34d399", bg: "rgba(52, 211, 153, 0.15)", glow: "rgba(52, 211, 153, 0.4)", icon: CheckCircle2, label: "Fulfilled" },
  Cancelled: { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)", glow: "rgba(148, 163, 184, 0.4)", icon: XCircle, label: "Cancelled" },
  Expired:   { color: "#f87171", bg: "rgba(248, 113, 113, 0.15)", glow: "rgba(248, 113, 113, 0.4)", icon: AlertCircle, label: "Expired" },
};

export default function AllReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("All");
  const [search, setSearch]             = useState("");
  const headers = { Authorization: `Bearer ${getAuthToken()}` };

  const fetchReservations = async () => {
    setLoading(true);
    try { 
      const r = await axios.get(`${Server_URL}reservations`, { headers }); 
      setReservations(r.data.reservations || []); 
    }
    catch { showErrorToast("Failed to fetch reservations"); }
    finally { setLoading(false); }
  };

  const notifyMember = async (bookId) => {
    try { 
      const r = await axios.put(`${Server_URL}reservations/notify/${bookId}`, {}, { headers }); 
      showSuccessToast(r.data.message); 
      fetchReservations(); 
    }
    catch (e) { showErrorToast(e.response?.data?.message || "Failed to notify"); }
  };

  const fulfillReservation = async (id) => {
    try {
      const r = await axios.put(`${Server_URL}reservations/fulfill/${id}`, {}, { headers });
      showSuccessToast(r.data.message);
      fetchReservations();
    } catch (e) {
      showErrorToast(e.response?.data?.message || "Failed to fulfill");
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const statuses  = ["All", "Pending", "Notified", "Fulfilled", "Cancelled", "Expired"];
  
  const filtered = reservations.filter(r => {
    const matchesFilter = filter === "All" || r.status === filter;
    const matchesSearch = 
      r.bookId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.membershipId?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCount = (s) => s === "All" ? reservations.length : reservations.filter(r => r.status === s).length;

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px", background: "#020617", minHeight: "100vh" }}>
      <div className="preloader-spinner" />
    </div>
  );

  return (
    <div className="ar-page">
      <div className="ar-container">
        
        {/* Hero Header */}
        <header className="ar-hero-header">
          <div className="ar-header-content">
            <h1>Reservation Queue</h1>
            <p>Monitor requests and notify members when books become available.</p>
          </div>
          <div className="ar-badge-purple">
            <ClipboardList size={18} />
            {reservations.length} Active Requests
          </div>
        </header>

        {/* Stats Grid */}
        <div className="ar-stats-grid">
          {[
            { label: "Pending", status: "Pending", icon: Clock },
            { label: "Notified", status: "Notified", icon: Bell },
            { label: "Fulfilled", status: "Fulfilled", icon: CheckCircle2 },
            { label: "Cancelled", status: "Cancelled", icon: XCircle },
            { label: "Expired", status: "Expired", icon: AlertCircle }
          ].map(item => {
            const config = STATUS_CONFIG[item.status];
            return (
              <div 
                key={item.label} 
                className="ar-stat-card"
                style={{ 
                  '--stat-color': config.color,
                  '--stat-bg': config.bg,
                  '--stat-glow': config.glow
                }}
              >
                <div className="ar-stat-header">
                  <div className="ar-stat-icon-wrap">
                    <item.icon size={22} />
                  </div>
                  <span className="ar-stat-label">{item.label}</span>
                </div>
                <span className="ar-stat-value">{getCount(item.status)}</span>
              </div>
            );
          })}
        </div>

        {/* Filters & Search Bar */}
        <div className="ar-filters-container">
          <div className="ar-tabs">
            {statuses.map(s => (
              <button 
                key={s} 
                onClick={() => setFilter(s)}
                className={`ar-tab ${filter === s ? 'active' : ''}`}
              >
                {s} <span className="ar-tab-count">{getCount(s)}</span>
              </button>
            ))}
          </div>
          
          <div className="ar-search-wrap">
            <input
              type="text"
              className="ar-search-input"
              placeholder="Search book or member..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="ar-search-icon" />
          </div>
        </div>

        {/* Main List Area */}
        {filtered.length === 0 ? (
          <div className="ar-empty-card">
            <AlertTriangle size={48} color="#64748b" style={{ marginBottom:"12px" }} />
            <h3 style={{ color: "#f8fafc", margin: "0 0 8px" }}>No Reservations Found</h3>
            <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0 }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="ar-rows-container">
            {filtered.map((r) => {
              const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.Cancelled;
              const StatusIcon = config.icon;
              const userInitial = (r.userId?.name || "U").charAt(0).toUpperCase();

              return (
                <div key={r._id} className="ar-row-card">
                  
                  {/* Left: Book Details */}
                  <div className="ar-book-cell">
                    <div className="ar-book-icon">
                      <BookOpen size={20} />
                    </div>
                    <div className="ar-book-details">
                      <h5>{r.bookId?.title || "Unknown Book"}</h5>
                      <p>ISBN: {r.bookId?.isbn || "N/A"}</p>
                    </div>
                  </div>

                  {/* Center-Left: Member Information */}
                  <div className="ar-member-cell">
                    <div className="ar-member-avatar">
                      {userInitial}
                    </div>
                    <div className="ar-member-details">
                      <h5>{r.userId?.name || "Unknown Member"}</h5>
                      <p>ID: {r.userId?.membershipId || "N/A"}</p>
                    </div>
                  </div>

                  {/* Center-Right: Timeline */}
                  <div className="ar-timeline-cell">
                    <Calendar size={16} />
                    {new Date(r.reservationDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>

                  {/* Right: Status Badge */}
                  <div>
                    <span 
                      className="ar-status-badge"
                      style={{ 
                        background: config.bg, 
                        color: config.color,
                        borderColor: config.color,
                        boxShadow: `0 0 10px ${config.bg}`
                      }}
                    >
                      <StatusIcon size={14} /> {config.label}
                    </span>
                  </div>

                  {/* Far-Right: Action Buttons */}
                  <div className="ar-actions-cell">
                    {r.status === "Pending" && (
                      <button 
                        onClick={() => notifyMember(r.bookId?._id)} 
                        className="ar-btn notify"
                      >
                        <Bell size={16} /> Notify
                      </button>
                    )}
                    {r.status === "Notified" && (
                      <button
                        onClick={() => fulfillReservation(r._id)}
                        className="ar-btn fulfill"
                      >
                        <CheckCircle2 size={16} /> Fulfill
                      </button>
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
