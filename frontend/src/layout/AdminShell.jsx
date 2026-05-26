import { Outlet, Link, NavLink } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BarChart3,
  LogOut,
  ClipboardList,
  BookPlus,
  Table as TableIcon,
  Inbox,
  RotateCcw,
  Library,
  Wallet,
  Settings,
  Bell,
  Search,
  ChevronDown,
  UserCircle
} from "lucide-react";
import AdminFooter from "../components/AdminFooter";
import { Server_URL } from "../utils/config";
import { getAuthToken } from "../utils/auth";
import "../pages/admin/AdminDashboard.css";
import "./adminheader.css"; // New Premium Header CSS

export default function AdminShell() {
  const role = localStorage.getItem("role");
  const [profile, setProfile] = useState({ name: role === "librarian" ? "Librarian" : "Administrator", role: role || "admin" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const linkClass = ({ isActive }) =>
    `admin-nav-btn${isActive ? " active" : ""}`;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin-login";
  };

  // Fetch admin profile to display real name and picture
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${Server_URL}users/profile`, {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        });
        if (res.data && (res.data.user || res.data.name)) {
          const u = res.data.user || res.data;
          setProfile({ name: u.name, role: u.role || role, profilePicture: u.profilePicture });
        }
      } catch (e) {
        console.error("Profile fetch error:", e);
      }
    };
    fetchProfile();
  }, [role]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarSrc = profile.profilePicture || (role === "librarian" ? "https://ui-avatars.com/api/?name=Librarian&background=0D8ABC&color=fff" : "/admin-avatar.png");

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link to="/admin" className="sidebar-logo">
          <div className="logo-box">
            <img src="/eagle-logo.png" alt="LibNova eagle logo" className="logo-img" />
          </div>
          <span className="logo-text">LibNova</span>
        </Link>

        <nav className="admin-sidebar-nav">
          <p className="sidebar-section-label">General</p>
          <ul className="admin-nav">
            <li className="admin-nav-item">
              <NavLink to="/admin" end className={linkClass}>
                <LayoutDashboard className="nav-icon" /> Dashboard
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/reports" className={linkClass}>
                <BarChart3 className="nav-icon" /> Reports
              </NavLink>
            </li>
          </ul>

          <p className="sidebar-section-label">Books</p>
          <ul className="admin-nav">
            <li className="admin-nav-item">
              <NavLink to="/admin/viewbook" className={linkClass}>
                <TableIcon className="nav-icon" /> View Books
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/addbook" className={linkClass}>
                <BookPlus className="nav-icon" /> Add Book
              </NavLink>
            </li>
            <li className="admin-nav-item">
              <NavLink to="/admin/issued" className={linkClass}>
                <Library className="nav-icon" /> Books Borrowed
              </NavLink>
            </li>
          </ul>

          {(role === "librarian" || role === "admin") && (
            <>
              <p className="sidebar-section-label">Requests</p>
              <ul className="admin-nav">
                <li className="admin-nav-item">
                  <NavLink to="/admin/issuerequest" className={linkClass}>
                    <Inbox className="nav-icon" /> Issue Requests
                  </NavLink>
                </li>
                <li className="admin-nav-item">
                  <NavLink to="/admin/returnrequest" className={linkClass}>
                    <RotateCcw className="nav-icon" /> Return Requests
                  </NavLink>
                </li>
              </ul>
            </>
          )}

          {(role === "librarian" || role === "admin") && (
            <>
              <p className="sidebar-section-label">Management</p>
              <ul className="admin-nav">
                <li className="admin-nav-item">
                  <NavLink to="/admin/members" className={linkClass}>
                    <Users className="nav-icon" /> Manage Members
                  </NavLink>
                </li>
                <li className="admin-nav-item">
                  <NavLink to="/admin/reservations" className={linkClass}>
                    <ClipboardList className="nav-icon" /> Reservations
                  </NavLink>
                </li>
                <li className="admin-nav-item">
                  <NavLink to="/admin/fines" className={linkClass}>
                    <Wallet className="nav-icon" /> Fine Management
                  </NavLink>
                </li>
                <li className="admin-nav-item">
                  <NavLink to="/admin/fine-config" className={linkClass}>
                    <Settings className="nav-icon" /> Fine Settings
                  </NavLink>
                </li>
                {role === "admin" && (
                  <li className="admin-nav-item">
                    <NavLink to="/admin/addlibrarian" className={linkClass}>
                      <UserCheck className="nav-icon" /> Add Librarian
                    </NavLink>
                  </li>
                )}
              </ul>
            </>
          )}

          <div className="sidebar-footer">
            <button type="button" className="admin-nav-btn sidebar-logout" onClick={handleLogout}>
              <LogOut className="nav-icon" /> Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        {/* TOP HEADER */}
        <header className="admin-top-header">
          <div className="header-left">
            <div>
              <h2 className="header-title">
                {profile.role === "librarian" ? "Librarian Dashboard" : "Admin Dashboard"}
              </h2>
              <p className="header-subtitle">LibNova Management System</p>
            </div>
          </div>
          
          <div className="header-center">
            <div className="header-search-box">
              <input type="text" className="header-search-input" placeholder="Search across dashboard..." />
              <Search size={18} className="header-search-icon" />
            </div>
          </div>
          <div className="header-right">
            {/* Profile Dropdown Widget */}
            <div className="profile-widget-container" ref={dropdownRef}>
              <div 
                className={`profile-widget ${isDropdownOpen ? 'open' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="profile-avatar-wrapper">
                  <img src={avatarSrc} alt="Avatar" className="profile-avatar" onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff"; }} />
                  <div className="profile-status-dot" />
                </div>
                <div className="profile-info">
                  <span className="profile-name">{profile.name}</span>
                  <span className="profile-role">{profile.role}</span>
                </div>
                <ChevronDown size={16} className="profile-arrow" />
              </div>

              {/* Dropdown Menu */}
              <div className={`profile-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                <Link to="/admin/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                  <UserCircle size={18} /> My Profile
                </Link>
                <div className="dropdown-divider" />
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="section-viewport">
          <Outlet context={{ profile }} />
        </div>
        <AdminFooter />
      </main>
    </div>
  );
}
