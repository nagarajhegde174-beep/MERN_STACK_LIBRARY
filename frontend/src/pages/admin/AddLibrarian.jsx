import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Search,
  Trash2,
  Info,
  Users,
  Image as ImageIcon
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./staffaccounts.css"; // The new premium CSS file

export default function AddLibrarian() {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const headers = { Authorization: `Bearer ${getAuthToken()}` };

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Server_URL}admin/librarians`, { headers });
      setLibrarians(res.data.librarians || []);
    } catch {
      showErrorToast("Failed to load librarians");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", "librarian");
      
      if (data.profilePicture && data.profilePicture.length > 0) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      await axios.post(`${Server_URL}admin/addlibrarian`, formData, { 
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });
      showSuccessToast("Librarian account created successfully!");
      reset();
      fetchLibrarians();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Registration Failed!");
    }
  };

  const deleteLibrarian = async (id) => {
    if (!window.confirm("Remove this librarian account?")) return;
    try {
      await axios.delete(`${Server_URL}admin/librarian/${id}`, { headers });
      showSuccessToast("Librarian removed");
      fetchLibrarians();
    } catch (error) {
      showErrorToast(error.response?.data?.message || "Failed to delete");
    }
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const filtered = librarians.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sa-page-wrapper">
      <div className="sa-content">
        
        {/* HERO HEADER */}
        <header className="sa-header">
          <div className="sa-badge">
            <UserPlus size={14} /> Staff Management
          </div>
          <h1 className="sa-title">Staff Accounts</h1>
          <p className="sa-subtitle">View all registered librarians or provision new administrative staff accounts.</p>
        </header>

        {/* TAB SWITCHER */}
        <div className="sa-tab-container">
          <div className="sa-tab-group">
            <button
              className={`sa-tab-btn ${activeTab === "list" ? "active" : ""}`}
              onClick={() => setActiveTab("list")}
            >
              <Users size={18} /> Registered Librarians
            </button>
            <button
              className={`sa-tab-btn ${activeTab === "add" ? "active" : ""}`}
              onClick={() => setActiveTab("add")}
            >
              <UserPlus size={18} /> Add New Librarian
            </button>
          </div>
        </div>

        {/* TAB CONTENT: LIST */}
        {activeTab === "list" && (
          <div className="sa-glass-card">
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                Active Accounts ({librarians.length})
              </h2>
              
              <div className="sa-search-wrapper" style={{ margin: 0, width: "100%", maxWidth: "350px" }}>
                <input
                  type="text"
                  className="sa-search-input"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={18} className="sa-search-icon" />
              </div>
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
                <div className="sa-spinner" />
              </div>
            ) : (
              <div className="sa-table-container">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Librarian</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="sa-empty">
                            <Info size={40} />
                            <h3>No librarians found</h3>
                            <p>No staff members matched your search criteria.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((l) => (
                        <tr key={l._id}>
                          <td>
                            <div className="sa-cell-main">
                              <div className="sa-avatar">
                                {l.name?.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ display: "flex", flexDirection: "column" }}>
                                <span>{l.name}</span>
                                <span className="sa-cell-sub">{l.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`sa-status-pill ${l.status === "Active" ? "active" : "inactive"}`}>
                              {l.status || "Active"}
                            </span>
                          </td>
                          <td style={{ color: "var(--sa-text-muted)" }}>
                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="sa-del-btn"
                              onClick={() => deleteLibrarian(l._id)}
                              title="Remove librarian"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: ADD NEW */}
        {activeTab === "add" && (
          <div className="sa-glass-card sa-form-wrapper">
            <div className="sa-form-header">
              <h2>Register New Staff</h2>
              <p>Create a new librarian account with dashboard access.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div className="sa-form-group">
                <label className="sa-label">
                  <User size={16} /> Full Name
                </label>
                <div className="sa-input-wrapper">
                  <input
                    type="text"
                    className="sa-input"
                    placeholder="e.g. John Doe"
                    {...register("name", { required: "Full name is required" })}
                  />
                  <User size={18} className="sa-input-icon" />
                </div>
                {errors.name && (
                  <span className="sa-error">
                    <AlertCircle size={14} /> {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div className="sa-form-group">
                <label className="sa-label">
                  <Mail size={16} /> Email Address
                </label>
                <div className="sa-input-wrapper">
                  <input
                    type="email"
                    className="sa-input"
                    placeholder="librarian@college.edu"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Invalid email format",
                      },
                    })}
                  />
                  <Mail size={18} className="sa-input-icon" />
                </div>
                {errors.email && (
                  <span className="sa-error">
                    <AlertCircle size={14} /> {errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="sa-form-group">
                <label className="sa-label">
                  <Lock size={16} /> Account Password
                </label>
                <div className="sa-input-wrapper">
                  <input
                    type="password"
                    className="sa-input"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters required",
                      },
                    })}
                  />
                  <Lock size={18} className="sa-input-icon" />
                </div>
                {errors.password && (
                  <span className="sa-error">
                    <AlertCircle size={14} /> {errors.password.message}
                  </span>
                )}
              </div>

              {/* Profile Picture */}
              <div className="sa-form-group">
                <label className="sa-label">
                  <ImageIcon size={16} /> Profile Picture (Optional)
                </label>
                <div className="sa-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    className="sa-input"
                    style={{ padding: "0.5rem 1rem 0.5rem 2.8rem" }}
                    {...register("profilePicture")}
                  />
                  <ImageIcon size={18} className="sa-input-icon" />
                </div>
              </div>

              <button type="submit" className="sa-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="sa-spinner" /> Processing Registration...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={20} /> Register Librarian <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
