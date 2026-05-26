import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/category", label: "Categories" },
  { to: "/reservations", label: "Reservations" },
  { to: "/my-books", label: "My Books" },
  { to: "/contactus", label: "Contact Us" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login-portal");
  };

  return (
    <>
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          
          {/* LOGO */}
          <Link to="/" style={styles.brand}>
            <div style={styles.logoBox}>
              <img src="/eagle-logo.png" alt="LibNova" style={styles.brandLogo} />
            </div>
            <span style={styles.brandText}>LibNova</span>
          </Link>

          {/* DESKTOP LINKS */}
          <ul style={styles.desktopLinks} className="desktop-nav">
            {NAV_LINKS.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <li key={link.to} style={{ position: "relative" }}>
                  <Link to={link.to} style={{
                    ...styles.navLink,
                    color: isActive ? "#F8FAFC" : "#94A3B8",
                    fontWeight: isActive ? 600 : 500,
                  }} className="nav-item">
                    {link.label}
                    {isActive && (
                      <motion.div layoutId="underline" style={styles.activeUnderline} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* RIGHT ICONS & AUTH */}
          <div style={styles.rightGroup}>

            {/* Profile / Auth */}
            {token ? (
              <div style={{ position: "relative" }}>
                <button 
                  style={styles.profileBtn} 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <img src="https://ui-avatars.com/api/?name=Student&background=EC4899&color=fff" alt="User" style={styles.avatar} />
                  <span style={styles.userName} className="desktop-nav">Student</span>
                  <ChevronDown size={14} color="#94A3B8" className="desktop-nav" />
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={styles.dropdown}
                    >
                      <div style={styles.dropdownHeader}>
                        <p style={styles.dropdownName}>Student User</p>
                        <p style={styles.dropdownEmail}>student@example.com</p>
                      </div>
                      <div style={styles.divider} />
                      <Link to="/user" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <User size={16} /> My Profile
                      </Link>
                      <button style={styles.dropdownItemDanger} onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="desktop-nav" style={{ display: 'flex', gap: '12px' }}>
                <Link to="/login-portal" style={styles.loginBtn}>Log In</Link>
                <Link to="/register" style={styles.signupBtn}>Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} color="#F8FAFC" /> : <Menu size={24} color="#F8FAFC" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={styles.mobileMenu}
          >
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!token && (
              <div style={{ display: 'flex', gap: '12px', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Link to="/login-portal" style={{...styles.loginBtn, flex: 1, textAlign: 'center'}}>Log In</Link>
                <Link to="/register" style={{...styles.signupBtn, flex: 1, textAlign: 'center'}}>Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { font-family: 'Inter', sans-serif; }
        
        @media (min-width: 1024px) {
          .hamburger { display: none !important; }
        }
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
        }
        
        .nav-item:hover { color: #F8FAFC !important; }
        .search-input::placeholder { color: #64748B; }
        
        /* Custom scrollbar for dropdown */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
    </>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    background: "rgba(11, 17, 32, 0.7)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    width: "100%",
  },
  navContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
  },
  logoBox: {
    width: "36px",
    height: "36px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  brandLogo: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
  },
  brandText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F8FAFC",
    letterSpacing: "-0.5px",
  },
  desktopLinks: {
    display: "flex",
    alignItems: "center",
    gap: "36px",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  navLink: {
    textDecoration: "none",
    fontSize: "14px",
    transition: "color 0.2s",
    padding: "8px 0",
    display: "block",
  },
  activeUnderline: {
    position: "absolute",
    bottom: "-2px",
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #8B5CF6, #EC4899)",
    borderRadius: "2px",
    boxShadow: "0 0 10px rgba(236, 72, 153, 0.5)",
  },
  rightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "12px",
    padding: "10px 16px",
    width: "240px",
    transition: "all 0.2s",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  searchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    color: "#F8FAFC",
  },
  iconBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    transition: "background 0.2s",
  },
  badge: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "8px",
    height: "8px",
    background: "#8B5CF6",
    borderRadius: "50%",
    boxShadow: "0 0 8px rgba(139,92,246,0.8)",
  },
  profileBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "100px",
    padding: "4px 14px 4px 4px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8FAFC",
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: 0,
    width: "220px",
    background: "#111827",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  dropdownHeader: {
    padding: "16px",
    background: "rgba(255,255,255,0.02)",
  },
  dropdownName: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8FAFC",
  },
  dropdownEmail: {
    margin: 0,
    fontSize: "12px",
    color: "#94A3B8",
    marginTop: "2px",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    color: "#94A3B8",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.2s, color 0.2s",
    background: "transparent",
    border: "none",
    width: "100%",
    cursor: "pointer",
  },
  dropdownItemDanger: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    color: "#EF4444",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background 0.2s",
    background: "transparent",
    border: "none",
    width: "100%",
    cursor: "pointer",
    textAlign: "left",
  },
  loginBtn: {
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8FAFC",
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "100px",
    background: "rgba(255,255,255,0.05)",
  },
  signupBtn: {
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
    borderRadius: "100px",
    textDecoration: "none",
    boxShadow: "0 0 16px rgba(236, 72, 153, 0.4)",
  },
  hamburger: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  mobileMenu: {
    position: "absolute",
    top: "72px",
    left: 0,
    right: 0,
    background: "#111827",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  mobileLink: {
    display: "block",
    padding: "16px 24px",
    color: "#94A3B8",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
};