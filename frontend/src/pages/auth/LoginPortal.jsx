import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, BookCopy, Shield } from "lucide-react";

const ROLES = [
  {
    key: "student",
    icon: <GraduationCap size={32} color="#9333ea" />,
    title: "Student",
    subtitle: "Access library & borrow books",
    to: "/login",
  },
  {
    key: "librarian",
    icon: <BookCopy size={32} color="#9333ea" />,
    title: "Librarian",
    subtitle: "Manage issues & member requests",
    to: "/librarian-login",
  },
  {
    key: "admin",
    icon: <Shield size={32} color="#9333ea" />,
    title: "Admin",
    subtitle: "System control & configuration",
    to: "/admin-login",
  },
];

function RoleCardHorizontal({ role, delay }) {
  const [hov, setHov] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(role.to)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        background: hov ? "#ffffff" : "rgba(255, 255, 255, 0.6)",
        border: "1px solid",
        borderColor: hov ? "#c084fc" : "rgba(255, 255, 255, 0.4)",
        borderRadius: "20px",
        padding: "20px 24px",
        cursor: "pointer",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? "0 15px 35px rgba(147, 51, 234, 0.15)" : "0 4px 15px rgba(0,0,0,0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        marginBottom: "16px",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        style={{
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          background: hov ? "#f3e8ff" : "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "20px",
          boxShadow: hov ? "0 8px 20px rgba(147,51,234,0.15)" : "0 4px 10px rgba(0,0,0,0.05)",
          transition: "all 0.3s ease",
        }}
      >
        {role.icon}
      </div>

      <div style={{ flex: 1, textAlign: "left" }}>
        <h3
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            fontSize: "1.2rem",
            color: "#1e1b4b",
            margin: "0 0 4px 0",
          }}
        >
          {role.title}
        </h3>
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.9rem",
            margin: 0,
            fontWeight: 500,
          }}
        >
          {role.subtitle}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "45px",
          height: "45px",
          borderRadius: "50%",
          background: hov ? "#9333ea" : "transparent",
          color: hov ? "#ffffff" : "#9ca3af",
          fontSize: "1.2rem",
          transition: "all 0.3s ease",
        }}
      >
        →
      </div>
    </div>
  );
}

export default function LoginPortal() {
  return (
    <>
      <div className="animated-bg">
        {/* Floating animated orbs in background */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="orb orb-4"></div>
      </div>

      <div style={styles.page}>
        <div style={styles.card}>
          
          {/* ── LEFT PANEL (Glassmorphic) ── */}
          <div style={styles.leftPanel}>
            <div style={styles.contentContainer}>
              
              <div style={{ marginBottom: "3rem", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                  <h1 style={styles.title}>LibNova</h1>
                </div>
                
                <h2 style={{...styles.title, fontSize: "36px", marginBottom: "10px"}}>
                  Welcome back!
                </h2>
                <p style={styles.subtitle}>
                  Select your role to access the portal and manage your account.
                </p>
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                {ROLES.map((role, i) => (
                  <RoleCardHorizontal key={role.key} role={role} delay={i + 1} />
                ))}
              </div>
              
            </div>
          </div>

          {/* ── RIGHT PANEL (Vibrant Gradient) ── */}
          <div style={styles.rightPanel}>
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            <div style={styles.rightContent}>
              <h1 style={styles.rightTitle}>Explore your<br/>library portal</h1>
              <p style={styles.rightSubtitle}>Seamlessly access books, resources, and administrative tools.</p>
              
              <div style={styles.imgWrapper}>
                <img src="/purple-student-illustration.png" alt="Library Portal" style={styles.illustration} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        
        /* Advanced Animated Background */
        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -1;
          background: linear-gradient(-45deg, #e0c3fc, #8ec5fc, #a18cd1, #fbc2eb);
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
          overflow: hidden;
        }

        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Floating Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 10s ease-in-out infinite;
        }
        .orb-1 { width: 400px; height: 400px; background: #9333ea; top: -10%; left: -10%; animation-delay: 0s; }
        .orb-2 { width: 500px; height: 500px; background: #3b82f6; bottom: -20%; right: -10%; animation-delay: -2s; }
        .orb-3 { width: 300px; height: 300px; background: #ec4899; top: 40%; left: 60%; animation-delay: -4s; }
        .orb-4 { width: 450px; height: 450px; background: #8b5cf6; top: -20%; right: 20%; animation-delay: -6s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Poppins', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "1150px",
    height: "720px",
    backgroundColor: "rgba(255, 255, 255, 0.85)", // Glassmorphic card
    backdropFilter: "blur(20px)",
    borderRadius: "32px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
  },
  
  // Left Panel
  leftPanel: {
    width: "45%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  contentContainer: {
    width: "100%",
    maxWidth: "380px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  title: {
    color: "#1e1b4b",
    fontSize: "30px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "15px",
    margin: 0,
    lineHeight: 1.5,
  },

  // Right Panel
  rightPanel: {
    width: "55%",
    background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    overflow: "hidden",
  },
  rightContent: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  rightTitle: {
    color: "#FFFFFF",
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "16px",
    letterSpacing: "-1px",
    marginTop: "40px",
  },
  rightSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "16px",
    fontWeight: 400,
    marginBottom: "auto",
  },
  imgWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: "40px",
    flex: 1,
  },
  illustration: {
    width: "95%",
    maxHeight: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.2))",
  },

  // Blobs inside right panel
  blob1: {
    position: "absolute",
    top: "-10%",
    left: "10%",
    width: "350px",
    height: "350px",
    backgroundColor: "#a855f7",
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    filter: "blur(50px)",
    opacity: 0.8,
  },
  blob2: {
    position: "absolute",
    bottom: "10%",
    right: "-10%",
    width: "450px",
    height: "450px",
    backgroundColor: "#7e22ce",
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    filter: "blur(60px)",
    opacity: 0.6,
  },
  blob3: {
    position: "absolute",
    bottom: "-5%",
    left: "15%",
    width: "250px",
    height: "250px",
    backgroundColor: "#c084fc",
    borderRadius: "50%",
    filter: "blur(50px)",
    opacity: 0.7,
  }
};
