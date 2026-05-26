import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Server_URL } from "../../../utils/config";
import { useNavigate, useLocation } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../../../utils/toasthelper";
import { EyeOff, Eye } from "lucide-react";

export default function ResetPassword() {
  const { 
    register, 
    handleSubmit, 
    watch, 
    formState: { errors, isSubmitting } 
  } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(`${Server_URL}users/reset-password`, data);
      showSuccessToast(res.data.message || "Password reset successfully!");
      navigate("/login");
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* ── LEFT PANEL (Form) ── */}
        <div style={styles.leftPanel}>
          <div style={styles.formContainer}>
            <div style={styles.header}>
              <h1 style={styles.title}>New Password</h1>
              <p style={styles.subtitle}>Create a new strong password for your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
              
              {/* Email */}
              <div style={styles.fieldGroup}>
                <input
                  type="email"
                  placeholder="Email Address"
                  style={styles.input}
                  defaultValue={email}
                  readOnly={!!email}
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
                {errors.email && <span style={styles.error}>{errors.email.message}</span>}
              </div>

              {/* New Password */}
              <div style={styles.fieldGroup}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="New Password"
                    style={{...styles.input, paddingRight: "35px"}}
                    {...register("newPassword", {
                      required: "Password is required",
                      minLength: { 
                        value: 6, 
                        message: "Password must be at least 6 characters" 
                      }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={styles.eyeBtn}
                  >
                    {showPass ? <Eye size={16} color="#7A7B82" /> : <EyeOff size={16} color="#7A7B82" />}
                  </button>
                </div>
                {errors.newPassword && <span style={styles.error}>{errors.newPassword.message}</span>}
              </div>

              {/* Confirm Password */}
              <div style={styles.fieldGroup}>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    style={{...styles.input, paddingRight: "35px"}}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => 
                        value === watch("newPassword") || "Passwords do not match"
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={styles.eyeBtn}
                  >
                    {showConfirm ? <Eye size={16} color="#7A7B82" /> : <EyeOff size={16} color="#7A7B82" />}
                  </button>
                </div>
                {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword.message}</span>}
              </div>

              {/* Reset Password Button */}
              <button type="submit" disabled={isSubmitting} style={styles.loginBtn}>
                {isSubmitting ? <span style={styles.spinner} /> : "Reset Password"}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT PANEL (Illustration) ── */}
        <div style={styles.rightPanel}>
          <div style={styles.blob1} />
          <div style={styles.blob2} />
          <div style={styles.blob3} />

          <div style={styles.rightContent}>
            <h1 style={styles.rightTitle}>Almost<br/>Done</h1>
            <p style={styles.rightSubtitle}>Set your new password to regain access</p>
            
            <div style={styles.imgWrapper}>
              <img src="/purple-student-illustration.png" alt="Reset Password Illustration" style={styles.illustration} />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        input::placeholder { color: #7A7B82; }
        input:focus { border-bottom: 1px solid #AA78F8 !important; outline: none; }
        input:read-only { color: #7A7B82; cursor: not-allowed; }
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
    height: "650px", // Fixed height to match login
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
  header: {
    marginBottom: "40px",
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
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
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