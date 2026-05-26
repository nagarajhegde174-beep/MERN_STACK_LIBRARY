import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import { EyeOff, Eye } from "lucide-react";

export default function StudentLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(`${Server_URL}users/login`, {
        email: data.email,
        password: data.password,
      });
      const token = res?.data?.token;
      const role  = res?.data?.user?.role;
      if (!token || !role) throw new Error("Invalid login response");

      if (role !== "user") {
        showErrorToast("This login is for students only.");
        return;
      }
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
      showSuccessToast("Welcome back!");
      navigate("/");
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || "Login failed.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* ── LEFT PANEL ── */}
        <div style={styles.leftPanel}>
          <div style={styles.formContainer}>
            <h1 style={styles.title}>Login</h1>
            <p style={styles.subtitle}>Enter your account details</p>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              
              {/* Username / Email */}
              <div style={styles.fieldGroup}>
                <input
                  type="text"
                  placeholder="Username"
                  style={styles.input}
                  {...register("email", { required: "Username is required" })}
                />
                {errors.email && <span style={styles.error}>{errors.email.message}</span>}
              </div>

              {/* Password */}
              <div style={styles.fieldGroup}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Password"
                    style={{...styles.input, paddingRight: "35px"}}
                    {...register("password", { required: "Password is required" })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={styles.eyeBtn}
                  >
                    {showPass ? <Eye size={16} color="#7A7B82" /> : <EyeOff size={16} color="#7A7B82" />}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password.message}</span>}
              </div>

              {/* Forgot Password */}
              <div style={styles.forgotContainer}>
                <Link to="/forgetPassword" style={styles.forgotLink}>Forgot Password?</Link>
              </div>

              {/* Login Button */}
              <button type="submit" disabled={loading} style={styles.loginBtn}>
                {loading ? <span style={styles.spinner} /> : "Login"}
              </button>
            </form>

            {/* Footer / Sign Up */}
            <div style={styles.footerRow}>
              <span style={styles.footerText}>Don't have an account?</span>
              <Link to="/register" style={styles.signupBtn}>Sign up</Link>
            </div>
            
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={styles.rightPanel}>
          <div style={styles.blob1} />
          <div style={styles.blob2} />
          <div style={styles.blob3} />

          <div style={styles.rightContent}>
            <h1 style={styles.rightTitle}>Welcome to<br/>student portal</h1>
            <p style={styles.rightSubtitle}>Login to access your account</p>
            
            <div style={styles.imgWrapper}>
              <img src="/purple-student-illustration.png" alt="Student Illustration" style={styles.illustration} />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        input::placeholder { color: #7A7B82; }
        input:focus { border-bottom: 1px solid #AA78F8 !important; outline: none; }
        button:hover { opacity: 0.9; }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#222327",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "1000px",
    height: "650px",
    backgroundColor: "#1C1D21",
    borderRadius: "24px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
  },
  
  // Left Panel
  leftPanel: {
    width: "45%",
    backgroundColor: "#1F2128",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
  formContainer: {
    width: "100%",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "10px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#7A7B82",
    fontSize: "13px",
    marginBottom: "40px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "10px 0",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid #3A3B40",
    color: "#FFFFFF",
    fontSize: "14px",
    transition: "border-color 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "0",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    alignItems: "center",
  },
  error: {
    color: "#EF4444",
    fontSize: "12px",
    marginTop: "6px",
  },
  forgotContainer: {
    marginTop: "-8px",
    marginBottom: "16px",
  },
  forgotLink: {
    color: "#7A7B82",
    textDecoration: "none",
    fontSize: "12px",
  },
  loginBtn: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#AA78F8",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  footerRow: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "20px",
  },
  footerText: {
    color: "#7A7B82",
    fontSize: "12px",
  },
  signupBtn: {
    backgroundColor: "#2C2D35",
    color: "#C1C2C5",
    textDecoration: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    transition: "background 0.2s",
  },

  // Right Panel
  rightPanel: {
    width: "55%",
    backgroundColor: "#9B63F8",
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
    fontSize: "44px",
    fontWeight: "700",
    lineHeight: "1.1",
    marginBottom: "12px",
    letterSpacing: "-1px",
    marginTop: "40px",
  },
  rightSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "14px",
    marginBottom: "auto",
  },
  imgWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: "40px",
  },
  illustration: {
    width: "90%",
    height: "auto",
    objectFit: "contain",
  },

  // Blobs for background
  blob1: {
    position: "absolute",
    top: "-10%",
    left: "10%",
    width: "300px",
    height: "300px",
    backgroundColor: "#8D53E8",
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    filter: "blur(40px)",
    opacity: 0.6,
  },
  blob2: {
    position: "absolute",
    bottom: "20%",
    right: "-10%",
    width: "400px",
    height: "400px",
    backgroundColor: "#A872FA",
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    filter: "blur(50px)",
    opacity: 0.5,
  },
  blob3: {
    position: "absolute",
    bottom: "0",
    left: "20%",
    width: "250px",
    height: "250px",
    backgroundColor: "#854CE1",
    borderRadius: "50%",
    filter: "blur(60px)",
    opacity: 0.7,
  }
};
