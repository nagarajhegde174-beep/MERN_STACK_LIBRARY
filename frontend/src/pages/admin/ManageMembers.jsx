import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import "../../animations.css";
import "./managemembers.css";
import {
  Users, Search, ToggleLeft, ToggleRight,
  CalendarRange, Lock, ChevronDown, ChevronUp,
  AlertTriangle, X
} from "lucide-react";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function ManageMembers() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState({}); // { [id]: boolean }
  const [validity, setValidity] = useState({}); // { [id]: { start, end } }
  const [saving,   setSaving]   = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${Server_URL}admin/members`, { headers: headers() });
      setMembers(res.data.members || []);
    } catch {
      showErrorToast("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const toggleStatus = async (id) => {
    try {
      const res = await axios.put(`${Server_URL}admin/users/${id}/toggle`, {}, { headers: headers() });
      showSuccessToast(res.data.message);
      fetchMembers();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to toggle");
    }
  };

  const saveValidity = async (id) => {
    const v = validity[id] || {};
    if (!v.end) return showErrorToast("End date is required");
    setSaving(id);
    try {
      await axios.put(`${Server_URL}admin/members/${id}/validity`,
        { accountStartDate: v.start, accountEndDate: v.end },
        { headers: headers() }
      );
      showSuccessToast("Account validity updated");
      fetchMembers();
      setExpanded(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to save validity");
    } finally {
      setSaving(null);
    }
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.membershipId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px", background: "#020617", minHeight: "100vh" }}>
      <div className="preloader-spinner" />
    </div>
  );

  return (
    <div className="mm-page">
      <div className="mm-container">
        
        {/* Hero Header */}
        <header className="mm-hero-header">
          <h1 className="mm-title">
            <div className="mm-title-icon"><Users size={22} /></div>
            Manage Members
          </h1>
          
          <div className="mm-search-wrap">
            <input
              type="text"
              className="mm-search-input"
              placeholder="Search name, email, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search size={18} className="mm-search-icon" />
          </div>
        </header>

        {/* Content Area */}
        {filtered.length === 0 ? (
          <div className="mm-empty-card">
            <Users size={48} color="#64748b" style={{ marginBottom:"12px" }} />
            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No members found.</p>
          </div>
        ) : (
          <div className="mm-rows-container">
            {filtered.map((m) => {
              const isActive    = m.status === "Active";
              const isExpired   = m.accountExpired;
              const isRestricted = m.isRestricted;
              const showValidity = expanded[m._id];
              const v = validity[m._id] || {
                start: m.accountStartDate ? m.accountStartDate.slice(0,10) : "",
                end:   m.accountEndDate   ? m.accountEndDate.slice(0,10)   : "",
              };
              
              const userInitial = (m.name || "U").charAt(0).toUpperCase();

              return (
                <div key={m._id} className="mm-row-card">
                  
                  {/* Left: User Identity */}
                  <div className="mm-user-cell">
                    <div className="mm-avatar">
                      {userInitial}
                      {isActive && <div className="mm-online-dot"></div>}
                    </div>
                    <div className="mm-user-details">
                      <h5>{m.name}</h5>
                      <p>
                        {m.email} &bull; {m.membershipId} 
                        {(m.year || m.stream) && (
                          <span>&bull; Year {m.year} / {m.stream}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Center: Badges & Dates */}
                  <div className="mm-badges-cell">
                    <div className="mm-tags-row">
                      {isRestricted && (
                        <span className="mm-tag restricted">
                          <Lock size={12} /> Restricted
                        </span>
                      )}
                      {isExpired && (
                        <span className="mm-tag expired">
                          <AlertTriangle size={12} /> Expired
                        </span>
                      )}
                      {!isRestricted && !isExpired && (
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Good Standing</span>
                      )}
                    </div>
                    
                    {m.accountEndDate && (
                      <div className="mm-date">
                        {isExpired ? (
                          <span style={{ color: '#ef4444' }}>Expired: </span>
                        ) : (
                          <span>Valid until: </span>
                        )}
                        {new Date(m.accountEndDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="mm-actions-cell">
                    
                    <button 
                      className={`mm-status-btn ${isActive ? 'active' : 'inactive'}`}
                      onClick={() => toggleStatus(m._id)}
                    >
                      {isActive ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}
                      {isActive ? "Active" : "Inactive"}
                    </button>

                    <button
                      className="mm-btn-validity"
                      onClick={() => setExpanded(prev => ({ ...prev, [m._id]: !prev[m._id] }))}
                    >
                      <CalendarRange size={16}/>
                      Set Validity
                      {showValidity ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                  </div>

                  {/* Account Validity Form (collapsible) */}
                  {showValidity && (
                    <div className="mm-validity-pane">
                      <h4 className="mm-validity-title">Update Account Validity Period</h4>
                      <div className="mm-validity-form">
                        
                        <div className="mm-input-group">
                          <label>Start Date</label>
                          <input
                            type="date"
                            className="mm-date-input"
                            value={v.start}
                            onChange={e => setValidity(prev => ({
                              ...prev, [m._id]: { ...v, start: e.target.value }
                            }))}
                          />
                        </div>
                        
                        <div className="mm-input-group">
                          <label>End Date <span>*</span></label>
                          <input
                            type="date"
                            className="mm-date-input"
                            value={v.end}
                            onChange={e => setValidity(prev => ({
                              ...prev, [m._id]: { ...v, end: e.target.value }
                            }))}
                          />
                        </div>

                        <button
                          className="mm-btn-save"
                          onClick={() => saveValidity(m._id)}
                          disabled={saving === m._id}
                        >
                          {saving === m._id ? "Saving..." : "Save Changes"}
                        </button>
                        
                        <button
                          className="mm-btn-close"
                          onClick={() => setExpanded(prev => ({ ...prev, [m._id]: false }))}
                        >
                          <X size={20}/>
                        </button>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
