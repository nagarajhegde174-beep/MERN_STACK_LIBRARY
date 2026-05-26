import "../../animations.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Shield,
  Hash,
  Bell,
  BellRing,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Calendar,
  Activity,
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import "./profile.css";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");

  const fetchData = async () => {
    try {
      const [profileRes, resRes, borrowsRes] = await Promise.all([
        axios.get(`${Server_URL}users/profile`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }),
        axios.get(`${Server_URL}reservations/my`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }).catch(() => ({ data: { reservations: [] } })),
        axios.get(`${Server_URL}users/myborrows`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }).catch(() => ({ data: { borrows: [] } }))
      ]);
      setUser(profileRes.data.user);
      
      const resData = resRes.data.reservations || [];
      const activeNotifications = resData.filter(
        r => r.status === "Notified" || r.status === "Fulfilled"
      );
      setNotifications(activeNotifications);
      setBorrows(borrowsRes.data.borrows || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    load();
  }, []);



  if (loading) {
    return (
      <div className="student-profile-loading">
        <div className="student-profile-spinner" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  if (!user?.name) {
    return (
      <div className="student-profile-loading">
        <p style={{ color: "#EF4444" }}>Unable to load profile. Please try again.</p>
      </div>
    );
  }

  const initial = (user.name || "S").charAt(0).toUpperCase();
  const roleLabel = user.role === "user" ? "Student" : user.role;

  return (
    <div className="student-profile-page">
      <div className="student-profile-inner">
        <header className="student-profile-hero">
          <span className="student-profile-badge">
            <Bell size={14} /> My LibNova Account
          </span>
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="student-profile-avatar" 
              style={{ objectFit: 'cover' }} 
            />
          ) : (
            <div className="student-profile-avatar">{initial}</div>
          )}
          <h1>{user.name}</h1>
          <p>Manage your account and track borrowed books.</p>
        </header>

        <div className="student-profile-tabs">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
          >
            Profile Info
          </button>
          <button 
            onClick={() => setActiveTab("books")}
            className={`profile-tab-btn ${activeTab === "books" ? "active" : ""}`}
          >
            My Books
          </button>
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`profile-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          >
            Notifications
            {notifications.length > 0 && (
              <span className="profile-tab-badge">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="student-profile-cards">
            <div className="student-profile-card">
              <span className="student-profile-card-label">
                <User size={14} /> Full Name
              </span>
              <span className="student-profile-card-value">{user.name}</span>
            </div>
            <div className="student-profile-card">
              <span className="student-profile-card-label">
                <Mail size={14} /> Email
              </span>
              <span className="student-profile-card-value">{user.email}</span>
            </div>
            <div className="student-profile-card">
              <span className="student-profile-card-label">
                <Shield size={14} /> Role
              </span>
              <span className="student-profile-card-value capitalize">{roleLabel}</span>
            </div>
            {user.membershipId && (
              <div className="student-profile-card">
                <span className="student-profile-card-label">
                  <Hash size={14} /> Membership ID
                </span>
                <span className="student-profile-card-value">{user.membershipId}</span>
              </div>
            )}
            {user.stream && (
              <div className="student-profile-card">
                <span className="student-profile-card-label">
                  <GraduationCap size={14} /> Stream
                </span>
                <span className="student-profile-card-value">{user.stream}</span>
              </div>
            )}
            {user.year && (
              <div className="student-profile-card">
                <span className="student-profile-card-label">
                  <Calendar size={14} /> Year
                </span>
                <span className="student-profile-card-value">{user.year}</span>
              </div>
            )}
            <div className="student-profile-card">
              <span className="student-profile-card-label">
                <Activity size={14} /> Account Status
              </span>
              <span className="student-profile-card-value" style={{ 
                color: user.status === 'Active' ? '#10B981' : '#EF4444', 
                display: 'flex', alignItems: 'center', gap: '6px' 
              }}>
                {user.status === 'Active' ? <CheckCircle2 size={18} /> : <Shield size={18} />}
                {user.status}
                {user.isRestricted && " (Restricted)"}
              </span>
            </div>
            {user.accountEndDate && (
              <div className="student-profile-card">
                <span className="student-profile-card-label">
                  <Calendar size={14} /> Valid Until
                </span>
                <span className="student-profile-card-value">{new Date(user.accountEndDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="student-profile-notifications">
            {notifications.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map(notif => (
                  <div key={notif._id} className={`notification-item ${notif.status === 'Fulfilled' ? 'fulfilled' : 'pending'}`}>
                    {notif.status === 'Fulfilled' ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <BellRing size={24} />
                    )}
                    <div>
                      <h4 className="notification-title">
                        {notif.status === 'Fulfilled' ? 'Reservation Fulfilled' : 'Book Available'}
                      </h4>
                      <p className="notification-desc">
                        Your reservation for <strong>{notif.bookId?.title}</strong> is {notif.status.toLowerCase()}.
                        {notif.status === 'Notified' && ' Please collect it from the library.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                <Bell size={40} style={{ opacity: 0.2, marginBottom: "10px" }} />
                <p>No new notifications at this time.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "books" && (
          <div className="student-profile-books">
            {borrows.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {borrows.map(borrow => (
                  <div key={borrow._id} className="borrow-item">
                    <img src={borrow.bookId?.coverImage || 'https://via.placeholder.com/70x100?text=No+Cover'} alt="Book Cover" className="borrow-cover" />
                    <div className="borrow-details">
                      <h4 className="borrow-title">{borrow.bookId?.title}</h4>
                      <p className="borrow-author">By {borrow.bookId?.author}</p>
                      <div className="borrow-meta">
                        <span className={`borrow-status ${borrow.status.toLowerCase().replace(' ', '-')}`}>
                          {borrow.status}
                        </span>
                        <span>Issued: {new Date(borrow.issueDate).toLocaleDateString()}</span>
                        {borrow.dueDate && (
                          <span>Due: {new Date(borrow.dueDate).toLocaleDateString()}</span>
                        )}
                        {borrow.fineAmount > 0 && (
                          <span className="borrow-fine">
                            Fine: ₹{borrow.fineAmount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                <BookOpen size={40} style={{ opacity: 0.2, margin: "0 auto 10px", display: "block" }} />
                <p>You haven't borrowed any books yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;
