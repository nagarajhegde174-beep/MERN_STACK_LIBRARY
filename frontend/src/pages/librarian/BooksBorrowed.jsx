import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { 
  Library, Search, Filter, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Hash,
  Eye, RefreshCcw, MoreHorizontal, User
} from "lucide-react";
import { showSuccessToast, showErrorToast, showInfoToast } from "../../utils/toasthelper";
import "./booksborrowed.css";

export default function BooksBorrowed() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    try {
      const url = Server_URL + "librarian/bookissued"
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error("Error fetching requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);



  // Filter requests
  const filteredRequests = requests.filter(req => {
    const titleMatch = req.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const userMatch = req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || userMatch;
  });

  // Derived Stats
  const totalBorrowed = requests.length;
  const overdueBooks = requests.filter(r => r.status === "Overdue" || new Date(r.dueDate) < new Date()).length;
  const returnedToday = requests.filter(r => r.status === "Returned").length; // Mock metric

  return (
    <div className="borrowed-page">
      <div className="borrowed-container">
        
        {/* ── HERO HEADER ── */}
        <header className="bb-hero-header">
          <div className="bb-title-group">
            <h1 className="bb-title">
              <div className="bb-title-icon"><Library size={22} /></div>
              Books Borrowed
            </h1>
            <p className="bb-subtitle">Manage currently borrowed books and track overdue returns.</p>
          </div>
        </header>

        {/* ── STATS DASHBOARD ── */}
        <div className="bb-stats-grid">
          <div className="bb-stat-card">
            <div className="bb-stat-icon purple"><Library size={20} /></div>
            <div className="bb-stat-info">
              <h4>Total Borrowed</h4>
              <p>{totalBorrowed}</p>
            </div>
          </div>
          <div className="bb-stat-card">
            <div className="bb-stat-icon red"><AlertTriangle size={20} /></div>
            <div className="bb-stat-info">
              <h4>Overdue Books</h4>
              <p>{overdueBooks}</p>
            </div>
          </div>
          <div className="bb-stat-card">
            <div className="bb-stat-icon green"><CheckCircle2 size={20} /></div>
            <div className="bb-stat-info">
              <h4>Returned Today</h4>
              <p>{returnedToday}</p>
            </div>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bb-toolbar">
          <div className="bb-search-wrapper">
            <Search size={18} className="bb-search-icon" />
            <input 
              type="text" 
              className="bb-search-input" 
              placeholder="Search by student name or book title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="bb-action-btn" style={{ width: 'auto', padding: '0 16px', gap: '8px', fontSize: '0.85rem' }}>
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* ── HYBRID ROWS CONTAINER ── */}
        <div className="bb-rows-container">
          {loading ? (
            // Shimmer Loading Skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="bb-row-card" style={{ opacity: 0.5, animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
                  <div>
                    <div style={{ width: 120, height: 14, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 6 }}></div>
                    <div style={{ width: 80, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredRequests.length === 0 ? (
            // Empty State
            <div style={{ textAlign: "center", padding: "4rem", background: "rgba(15,23,42,0.4)", borderRadius: "20px", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <Library size={48} style={{ color: "#4B5563", margin: "0 auto 1rem" }} />
              <h4 style={{ color: "#9CA3AF", fontWeight: "600", margin: 0 }}>No borrowed books found.</h4>
            </div>
          ) : (
            // Hybrid Cards
            filteredRequests.map((req) => {
              const userName = req.userId?.name || "Unknown User";
              const userInitial = userName.charAt(0).toUpperCase();
              
              // Determine status and badge styling
              let badgeClass = "issued";
              let statusText = req.status || "Issued";
              
              if (new Date(req.dueDate) < new Date() && statusText !== "Returned") {
                badgeClass = "overdue";
                statusText = "Overdue";
              } else if (statusText === "Returned") {
                badgeClass = "returned";
              }

              return (
                <div className="bb-row-card" key={req._id}>
                  
                  {/* Left: User Profile */}
                  <div className="bb-user-cell">
                    <div className="bb-avatar-wrapper">
                      <div className="bb-avatar">{userInitial}</div>
                      <div className="bb-online-dot"></div>
                    </div>
                    <div className="bb-user-details">
                      <h5>{userName}</h5>
                      <p>ID: {req.userId?._id?.substring(0, 8) || "N/A"}</p>
                    </div>
                  </div>

                  {/* Center: Book Info */}
                  <div className="bb-book-cell">
                    <div className="bb-book-details">
                      <h5>{req.bookId?.title || "Unknown Book"}</h5>
                      <p>{req.bookId?.category || "Library Book"}</p>
                    </div>
                  </div>

                  {/* Right: Dates & Status */}
                  <div className="bb-timeline-cell">
                    <div className="bb-date-row">
                      <Clock size={12} />
                      Issue: <span>{new Date(req.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="bb-date-row">
                      <Calendar size={12} />
                      Due: <span>{new Date(req.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`bb-badge ${badgeClass}`}>
                        <span className="bb-badge-dot"></span> {statusText}
                      </span>
                    </div>
                  </div>



                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
