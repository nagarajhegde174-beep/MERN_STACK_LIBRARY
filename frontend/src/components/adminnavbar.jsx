import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [booksOpen,   setBooksOpen]   = useState(false);
  const [adminOpen,   setAdminOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const booksTimer = useRef(null);
  const adminTimer = useRef(null);
  const profileRef = useRef(null);
  const token    = localStorage.getItem("authToken");
  const role     = localStorage.getItem("role");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login-portal");
  };

  // Close profile on outside click
  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close all menus on route change
  useEffect(() => {
    setBooksOpen(false); setAdminOpen(false); setProfileOpen(false); setMenuOpen(false);
  }, [location.pathname]);

  // Delay-based hover to prevent flicker when moving mouse between trigger and menu
  const openBooks  = () => { clearTimeout(booksTimer.current); setBooksOpen(true); };
  const closeBooks = () => { booksTimer.current = setTimeout(() => setBooksOpen(false), 150); };
  const openAdmin  = () => { clearTimeout(adminTimer.current); setAdminOpen(true); };
  const closeAdmin = () => { adminTimer.current = setTimeout(() => setAdminOpen(false), 150); };

  const isActive = (p) => location.pathname === p;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes acDrop {
          from { opacity:0; transform:translateY(-10px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .acn-nav {
          font-family:'Plus Jakarta Sans',sans-serif;
          background:linear-gradient(135deg,#0f172a,#164e63,#0f766e);
          border-bottom:1px solid rgba(34,211,238,.25);
          padding:0 2rem;
          position:sticky; top:0; z-index:1000;
          box-shadow:0 4px 24px rgba(15,23,42,.35);
          height:64px; display:flex; align-items:center;
        }
        .acn-brand {
          display:flex; align-items:center; gap:10px;
          text-decoration:none; color:#fff;
          font-weight:800; font-size:1.05rem;
          letter-spacing:-.01em; flex-shrink:0;
          transition:opacity .25s ease;
        }
        .acn-brand:hover { opacity:.92; text-decoration:none; color:#ecfeff; }
        .acn-brand-logo {
          width:36px; height:36px; flex-shrink:0;
          object-fit:contain;
          filter:drop-shadow(0 2px 8px rgba(34,211,238,.4));
          transition:filter .3s ease, transform .3s ease;
        }
        .acn-brand:hover .acn-brand-logo {
          filter:drop-shadow(0 0 10px rgba(236,254,255,.9)) drop-shadow(0 0 18px rgba(34,211,238,.7));
          transform:scale(1.06);
        }
        .acn-link {
          font-family:'Plus Jakarta Sans',sans-serif;
          color:rgba(255,255,255,.72); text-decoration:none;
          font-size:.875rem; font-weight:500;
          padding:7px 13px; border-radius:10px;
          display:flex; align-items:center; gap:5px;
          white-space:nowrap; cursor:pointer;
          border:none; background:transparent;
          transition:color .18s,background .18s,box-shadow .18s;
          line-height:1;
        }
        .acn-link:hover, .acn-link.active {
          color:#ecfeff !important;
          background:rgba(34,211,238,.18) !important;
          box-shadow:0 0 12px rgba(34,211,238,.15);
          text-decoration:none;
        }
        .acn-link.active {
          background:#fff !important;
          color:#0f766e !important;
          font-weight:600;
        }
        .acn-chevron {
          font-size:.45rem; opacity:.6;
          display:inline-block; transition:transform .2s; margin-left:2px;
        }
        .acn-dd-wrap { position:relative; list-style:none; }
        .acn-dd {
          position:absolute; top:calc(100% + 4px); left:0;
          background:#fff; border:1px solid rgba(15,118,110,.15); border-radius:18px;
          min-width:215px; list-style:none; margin:0; padding:6px;
          box-shadow:0 16px 40px rgba(15,118,110,.18);
          z-index:9999; animation:acDrop .18s cubic-bezier(.34,1.56,.64,1) both;
        }
        .acn-dd-end { left:auto; right:0; }
        .acn-di {
          display:flex; align-items:center; gap:8px;
          width:100%; padding:9px 14px; color:#475569;
          text-decoration:none; font-size:.875rem; font-weight:500;
          border-radius:12px; background:transparent; border:none;
          text-align:left; cursor:pointer;
          font-family:'Plus Jakarta Sans',sans-serif;
          white-space:nowrap; transition:background .14s,color .14s;
        }
        .acn-di:hover { background:rgba(34,211,238,.12); color:#0f766e; text-decoration:none; }
        .acn-di.red:hover { background:rgba(239,68,68,.07); color:#ef4444; }
        .acn-hr { height:1px; background:rgba(15,118,110,.12); border:none; margin:5px 8px; }
        .acn-mlink {
          display:block; padding:10px 14px; color:#334155; text-decoration:none;
          font-size:.9rem; font-weight:500; border-radius:12px;
          font-family:'Plus Jakarta Sans',sans-serif;
          transition:background .14s,color .14s;
          border:none; background:none; width:100%; text-align:left; cursor:pointer;
        }
        .acn-mlink:hover { background:rgba(34,211,238,.12); color:#0f766e; text-decoration:none; }
        .acn-profile-btn {
          display:flex; align-items:center; gap:6px;
          background:rgba(255,255,255,.1);
          border:1px solid rgba(34,211,238,.35);
          border-radius:12px; color:#ecfeff;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:.85rem; font-weight:600;
          padding:7px 14px; cursor:pointer; white-space:nowrap;
          transition:background .2s,border-color .2s,box-shadow .2s;
        }
        .acn-profile-btn:hover {
          background:rgba(34,211,238,.2);
          border-color:rgba(34,211,238,.6);
          box-shadow:0 0 14px rgba(34,211,238,.25);
        }
        .acn-login-btn {
          background:linear-gradient(135deg,#0f766e,#22d3ee);
          border:none; color:#fff; border-radius:12px;
          padding:7px 18px; font-size:.85rem;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-weight:700; text-decoration:none;
          display:inline-flex; align-items:center;
          box-shadow:0 4px 14px rgba(34,211,238,.35);
          white-space:nowrap;
        }
        .acn-ham {
          background:rgba(255,255,255,.1); border:1px solid rgba(34,211,238,.35); border-radius:10px;
          display:flex; flex-direction:column; justify-content:center;
          align-items:center; gap:5px; height:38px; width:42px;
          cursor:pointer; padding:0; flex-shrink:0;
        }
        .acn-bar {
          background:#22d3ee; height:2px; width:18px;
          border-radius:99px; display:block;
          transition:all .3s cubic-bezier(.34,1.56,.64,1);
        }
        .acn-mobile-panel {
          background:linear-gradient(120deg,#ecfeff,#d1fae5,#a5f3fc);
          border-bottom:1px solid rgba(15,118,110,.15);
          box-shadow:0 8px 24px rgba(15,118,110,.12);
          padding:10px 1.5rem 14px;
          display:flex; flex-direction:column; gap:2px;
          z-index:999; position:relative;
        }
        @media(min-width:993px){ .acn-ham { display:none !important; } }
        @media(max-width:992px){ .acn-desktop { display:none !important; } }
      `}</style>

      <nav className="acn-nav">
        <div style={{maxWidth:1400,margin:"0 auto",width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"1rem"}}>

          {/* Brand */}
          <Link to="/admin" className="acn-brand">
            <img src="/eagle-logo.png" alt="LibNova" className="acn-brand-logo" />
            LibNova
          </Link>

          {/* Desktop nav */}
          <ul className="acn-desktop" style={{display:"flex",alignItems:"center",gap:2,listStyle:"none",margin:0,padding:0,flexWrap:"nowrap"}}>
            <li style={{listStyle:"none"}}>
              <Link to="/admin" className={`acn-link${isActive("/admin")?" active":""}`}>Dashboard</Link>
            </li>

            {/* Books dropdown */}
            <li className="acn-dd-wrap" onMouseEnter={openBooks} onMouseLeave={closeBooks}>
              <span className={`acn-link${booksOpen?" active":""}`} style={{userSelect:"none"}}>
                Books <span className="acn-chevron" style={{transform:booksOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
              </span>
              {booksOpen && (
                <ul className="acn-dd" onMouseEnter={openBooks} onMouseLeave={closeBooks}>
                  <li><Link to="/admin/addbook"  className="acn-di">➕ Add Book</Link></li>
                  <li><Link to="/admin/viewbook" className="acn-di">📖 View Books</Link></li>
                </ul>
              )}
            </li>

            {role === "librarian" && <>
              <li style={{listStyle:"none"}}><Link to="/admin/issuerequest"  className={`acn-link${isActive("/admin/issuerequest") ?" active":""}`}>Issue Requests</Link></li>
              <li style={{listStyle:"none"}}><Link to="/admin/returnrequest" className={`acn-link${isActive("/admin/returnrequest")?" active":""}`}>Return Requests</Link></li>
            </>}

            <li style={{listStyle:"none"}}>
              <Link to="/admin/issued" className={`acn-link${isActive("/admin/issued")?" active":""}`}>Books Borrowed</Link>
            </li>

            {/* Admin dropdown */}
            {role === "admin" && (
              <li className="acn-dd-wrap" onMouseEnter={openAdmin} onMouseLeave={closeAdmin}>
                <span className={`acn-link${adminOpen?" active":""}`} style={{userSelect:"none"}}>
                  Admin <span className="acn-chevron" style={{transform:adminOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
                </span>
                {adminOpen && (
                  <ul className="acn-dd" onMouseEnter={openAdmin} onMouseLeave={closeAdmin}>
                    <li><Link to="/admin/addlibrarian"  className="acn-di">➕ Add Librarian</Link></li>
                    <li><Link to="/admin/members"       className="acn-di">👥 Manage Members</Link></li>
                    <li><hr className="acn-hr"/></li>
                    <li><Link to="/admin/issuerequest"  className="acn-di">📥 Issue Requests</Link></li>
                    <li><Link to="/admin/returnrequest" className="acn-di">📤 Return Requests</Link></li>
                    <li><hr className="acn-hr"/></li>
                    <li><Link to="/admin/reservations"  className="acn-di">📋 Reservations</Link></li>
                    <li><Link to="/admin/fines"         className="acn-di">💰 Fine Management</Link></li>
                    <li><Link to="/admin/fine-config"   className="acn-di">⚙️ Fine Config</Link></li>
                    <li><hr className="acn-hr"/></li>
                    <li><Link to="/admin/reports"       className="acn-di">📊 Reports</Link></li>
                  </ul>
                )}
              </li>
            )}

            {role === "librarian" && (
              <li style={{listStyle:"none"}}><Link to="/admin/reports" className={`acn-link${isActive("/admin/reports")?" active":""}`}>📊 Reports</Link></li>
            )}
          </ul>

          {/* Right side */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8,flexShrink:0}}>
            {token ? (
              <div style={{position:"relative"}} ref={profileRef}>
                <button type="button" className="acn-profile-btn" onClick={() => setProfileOpen(v=>!v)}>
                  👤 Profile <span className="acn-chevron" style={{transform:profileOpen?"rotate(180deg)":"rotate(0)"}}>▼</span>
                </button>
                {profileOpen && (
                  <ul className="acn-dd acn-dd-end" style={{minWidth:170}}>
                    <li><Link to="/admin" className="acn-di" onClick={()=>setProfileOpen(false)}>🏠 Dashboard</Link></li>
                    <li><hr className="acn-hr"/></li>
                    <li><button className="acn-di red" onClick={()=>{handleLogout();setProfileOpen(false);}}>🚪 Logout</button></li>
                  </ul>
                )}
              </div>
            ) : (
              <Link to="/admin-login" style={{background:"linear-gradient(135deg,#c4b5fd,#93c5fd)",border:"none",color:"#2a2050",borderRadius:12,padding:"7px 18px",fontSize:".85rem",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,textDecoration:"none",display:"inline-flex",alignItems:"center",boxShadow:"0 4px 14px rgba(139,92,246,.28)",whiteSpace:"nowrap"}}>Login</Link>
            )}
            <button className="acn-ham" onClick={()=>setMenuOpen(v=>!v)}>
              <span className="acn-bar" style={{transform:menuOpen?"translateY(7px) rotate(45deg)":"none"}}/>
              <span className="acn-bar" style={{opacity:menuOpen?0:1}}/>
              <span className="acn-bar" style={{transform:menuOpen?"translateY(-7px) rotate(-45deg)":"none"}}/>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="acn-mobile-panel">
          <Link to="/admin"             className="acn-mlink" onClick={()=>setMenuOpen(false)}>🏠 Dashboard</Link>
          <Link to="/admin/addbook"     className="acn-mlink" onClick={()=>setMenuOpen(false)}>➕ Add Book</Link>
          <Link to="/admin/viewbook"    className="acn-mlink" onClick={()=>setMenuOpen(false)}>📖 View Books</Link>
          <Link to="/admin/issued"      className="acn-mlink" onClick={()=>setMenuOpen(false)}>📚 Books Borrowed</Link>
          {role==="librarian"&&<>
            <Link to="/admin/issuerequest"  className="acn-mlink" onClick={()=>setMenuOpen(false)}>📥 Issue Requests</Link>
            <Link to="/admin/returnrequest" className="acn-mlink" onClick={()=>setMenuOpen(false)}>📤 Return Requests</Link>
          </>}
          {role==="admin"&&<>
            <hr className="acn-hr" style={{margin:"6px 0"}}/>
            <Link to="/admin/addlibrarian"  className="acn-mlink" onClick={()=>setMenuOpen(false)}>➕ Add Librarian</Link>
            <Link to="/admin/members"       className="acn-mlink" onClick={()=>setMenuOpen(false)}>👥 Manage Members</Link>
            <Link to="/admin/issuerequest"  className="acn-mlink" onClick={()=>setMenuOpen(false)}>📥 Issue Requests</Link>
            <Link to="/admin/returnrequest" className="acn-mlink" onClick={()=>setMenuOpen(false)}>📤 Return Requests</Link>
            <Link to="/admin/reservations"  className="acn-mlink" onClick={()=>setMenuOpen(false)}>📋 Reservations</Link>
            <Link to="/admin/fines"         className="acn-mlink" onClick={()=>setMenuOpen(false)}>💰 Fine Management</Link>
            <Link to="/admin/fine-config"   className="acn-mlink" onClick={()=>setMenuOpen(false)}>⚙️ Fine Config</Link>
            <Link to="/admin/reports"       className="acn-mlink" onClick={()=>setMenuOpen(false)}>📊 Reports</Link>
          </>}
          {role==="librarian"&&<Link to="/admin/reports" className="acn-mlink" onClick={()=>setMenuOpen(false)}>📊 Reports</Link>}
          {token&&<>
            <hr className="acn-hr" style={{margin:"6px 0"}}/>
            <button className="acn-mlink" style={{color:"#ef4444"}} onClick={()=>{handleLogout();setMenuOpen(false);}}>🚪 Logout</button>
          </>}
        </div>
      )}
    </>
  );
}
