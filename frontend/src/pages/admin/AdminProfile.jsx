import { useEffect, useState } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Shield, 
  Hash, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  Library,
  Inbox
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import "./adminprofile.css";

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real Statistics State
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeMembers: 0,
    booksIssued: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getAuthToken()}` };
        
        // 1. Fetch Profile
        const resProfile = await axios.get(`${Server_URL}users/profile`, { headers });
        setUser(resProfile.data.user || resProfile.data);

        // 2. Fetch Users (for active members)
        try {
          const resUsers = await axios.get(`${Server_URL}users`, { headers });
          if (!resUsers.data.error) {
            const usersList = resUsers.data.user || [];
            const membersCount = usersList.filter(u => u.role === "user").length;
            setStats(prev => ({ ...prev, activeMembers: membersCount }));
          }
        } catch (e) { console.error(e); }

        // 3. Fetch Books
        try {
          const resBooks = await axios.get(`${Server_URL}books`, { headers });
          if (!resBooks.data.error) {
            setStats(prev => ({ ...prev, totalBooks: resBooks.data.totalBooks || 0 }));
          }
        } catch (e) { console.error(e); }

        // 4. Fetch Home Stats (for issued books)
        try {
          const resHome = await axios.get(`${Server_URL}home`, { headers });
          if (!resHome.data.error) {
            const borrowed = resHome.data.borrowedCount ?? resHome.data.issuedCount ?? 0;
            setStats(prev => ({ ...prev, booksIssued: borrowed }));
          }
        } catch (e) { console.error(e); }

        // 5. Fetch Pending Requests
        try {
          const resIssues = await axios.get(`${Server_URL}librarian/issuerequest`, { headers });
          if (!resIssues.data.error && resIssues.data.requests) {
            setStats(prev => ({ ...prev, pendingRequests: resIssues.data.requests.length }));
          }
        } catch (e) { console.error(e); }

      } catch (e) {
        console.error("Profile data fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="ap-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  if (!user || !user.name) {
    return (
      <div className="ap-page-wrapper" style={{ textAlign: "center", padding: "3rem" }}>
        <p style={{ color: "var(--sa-accent-red)", fontWeight: 600, fontSize: "1.2rem" }}>Unable to load your profile.</p>
      </div>
    );
  }

  const roleLabel =
    user.role === "admin" ? "Administrator" : user.role === "librarian" ? "Librarian" : user.role;

  const avatarSrc = user.profilePicture || "/admin-avatar.png";

  return (
    <div className="ap-page-wrapper">
      <div className="ap-content">
        
        {/* ── PROFILE HERO SECTION ── */}
        <div className="ap-hero-card">
          <div className="ap-avatar-ring">
            <img src={avatarSrc} alt="Avatar" className="ap-avatar-img" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"; }} />
          </div>
          <h1 className="ap-hero-name">{user.name}</h1>
          <p className="ap-hero-title">System {roleLabel}</p>
          <div className="ap-hero-badge">
            <ShieldCheck size={16} /> {user.role === "admin" ? "Super Admin Access" : "Staff Access"}
          </div>
        </div>

        {/* ── ACCOUNT INFORMATION ── */}
        <div>
          <h2 className="ap-stats-title">Account Information</h2>
          <div className="ap-details-grid" style={{ marginTop: '20px' }}>
            
            <div className="ap-info-card">
              <div className="ap-info-icon"><User size={20} /></div>
              <div className="ap-info-content">
                <span className="ap-info-label">Full Name</span>
                <span className="ap-info-value">{user.name}</span>
              </div>
            </div>

            <div className="ap-info-card">
              <div className="ap-info-icon"><Mail size={20} /></div>
              <div className="ap-info-content">
                <span className="ap-info-label">Email Address</span>
                <span className="ap-info-value">{user.email}</span>
              </div>
            </div>

            <div className="ap-info-card">
              <div className="ap-info-icon"><Shield size={20} /></div>
              <div className="ap-info-content">
                <span className="ap-info-label">Access Level</span>
                <span className="ap-info-value" style={{ textTransform: "capitalize" }}>{roleLabel}</span>
              </div>
            </div>

            {user.membershipId && (
              <div className="ap-info-card">
                <div className="ap-info-icon"><Hash size={20} /></div>
                <div className="ap-info-content">
                  <span className="ap-info-label">Membership ID</span>
                  <span className="ap-info-value">{user.membershipId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── STATISTICS SECTION ── */}
        <div>
          <h2 className="ap-stats-title">System Overview</h2>
          <div className="ap-stats-grid" style={{ marginTop: '20px' }}>
            
            <div className="ap-stat-card">
              <BookOpen className="ap-stat-bg-icon" />
              <BookOpen size={24} className="ap-stat-icon-small c1" />
              <span className="ap-stat-value">{stats.totalBooks.toLocaleString()}</span>
              <span className="ap-stat-label">Total Books</span>
            </div>

            <div className="ap-stat-card">
              <Users className="ap-stat-bg-icon" />
              <Users size={24} className="ap-stat-icon-small c2" />
              <span className="ap-stat-value">{stats.activeMembers.toLocaleString()}</span>
              <span className="ap-stat-label">Active Members</span>
            </div>

            <div className="ap-stat-card">
              <Library className="ap-stat-bg-icon" />
              <Library size={24} className="ap-stat-icon-small c3" />
              <span className="ap-stat-value">{stats.booksIssued.toLocaleString()}</span>
              <span className="ap-stat-label">Books Issued</span>
            </div>

            <div className="ap-stat-card">
              <Inbox className="ap-stat-bg-icon" />
              <Inbox size={24} className="ap-stat-icon-small c4" />
              <span className="ap-stat-value">{stats.pendingRequests.toLocaleString()}</span>
              <span className="ap-stat-label">Pending Requests</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
