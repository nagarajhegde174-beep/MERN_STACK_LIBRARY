import "../../animations.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast } from "../../utils/toasthelper";
import { FiDollarSign, FiAlertCircle, FiCheckCircle, FiInfo, FiCalendar } from "react-icons/fi";

function MyFines() {
  const [fines, setFines]     = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFines = async () => {
    try {
      const res = await axios.get(`${Server_URL}fines/my`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      setFines(res.data.fines || []);
      setTotalDue(res.data.totalDue || 0);
    } catch (err) {
      showErrorToast("Failed to fetch fines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFines(); }, []);

  if (loading) return (
    <div className="section-viewport" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--secondary-soft)", paddingBottom: "4rem" }}>
      <div className="section-viewport">
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "12px", 
            background: "var(--primary-glow)", 
            padding: "8px 20px", 
            borderRadius: "20px",
            color: "var(--accent-purple)",
            fontWeight: 700,
            fontSize: "0.9rem",
            marginBottom: "1rem"
          }}>
            <FiDollarSign /> FINANCE PORTAL
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary-deep)" }}>My Fines & Dues</h1>
        </div>

        {/* SUMMARY DASHBOARD */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem"
        }}>
          <SummaryCard 
            title="Total Outstanding" 
            value={`₹${totalDue}`} 
            icon={<FiAlertCircle />} 
            color="#ef4444" 
            bg="#fef2f2"
          />
          <SummaryCard 
            title="Unpaid Records" 
            value={fines.filter(f => !f.paidStatus).length} 
            icon={<FiInfo />} 
            color="#f59e0b" 
            bg="#fffbeb"
          />
          <SummaryCard 
            title="Settled Fines" 
            value={fines.filter(f => f.paidStatus).length} 
            icon={<FiCheckCircle />} 
            color="#10b981" 
            bg="#f0fdf4"
          />
        </div>

        {fines.length === 0 ? (
          <div className="cotton-card" style={{ textAlign: "center", padding: "5rem" }}>
            <div style={{ 
              width: "80px", 
              height: "80px", 
              background: "#f0fdf4", 
              color: "#10b981", 
              borderRadius: "50%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}>
              <FiCheckCircle size={40} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary-deep)", marginBottom: "0.5rem" }}>You're All Clear!</h2>
            <p style={{ color: "var(--text-muted)" }}>No outstanding fines or overdue records found.</p>
          </div>
        ) : (
          <div className="cotton-card" style={{ padding: "1.5rem", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "1rem" }}>Book Details</th>
                    <th style={{ padding: "1rem" }}>Timeline</th>
                    <th style={{ padding: "1rem" }}>Days Overdue</th>
                    <th style={{ padding: "1rem" }}>Amount</th>
                    <th style={{ padding: "1rem" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((f) => (
                    <tr key={f._id} style={{ background: "var(--secondary-soft)" }}>
                      <td style={{ padding: "1.5rem", borderRadius: "16px 0 0 16px" }}>
                        <div style={{ fontWeight: 700, color: "var(--primary-deep)" }}>{f.bookId?.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ISBN: {f.bookId?.isbn || "N/A"}</div>
                      </td>
                      <td style={{ padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FiCalendar size={14} /> {f.borrowId?.dueDate ? new Date(f.borrowId.dueDate).toLocaleDateString() : "—"}
                        </div>
                      </td>
                      <td style={{ padding: "1.5rem", fontWeight: 600 }}>{f.daysOverdue} days</td>
                      <td style={{ padding: "1.5rem" }}>
                        <span style={{ fontWeight: 800, color: f.paidStatus ? "var(--text-muted)" : "#ef4444", fontSize: "1.1rem" }}>
                          ₹{f.amount}
                        </span>
                      </td>
                      <td style={{ padding: "1.5rem", borderRadius: "0 16px 16px 0" }}>
                        <span style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: f.paidStatus ? "#f0fdf4" : "#fef2f2",
                          color: f.paidStatus ? "#10b981" : "#ef4444"
                        }}>
                          {f.paidStatus ? "Settled" : "Unpaid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: "2rem", 
          padding: "1.5rem", 
          background: "white", 
          borderRadius: "16px", 
          display: "flex", 
          gap: "12px", 
          alignItems: "center",
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)",
          fontSize: "0.9rem"
        }}>
          <FiInfo size={20} style={{ color: "var(--accent-purple)" }} />
          <p>Fines are automatically calculated after the due date. Please visit the library counter to settle any outstanding dues.</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, color, bg }) {
  return (
    <div className="cotton-card" style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
      <div style={{ 
        width: "56px", 
        height: "56px", 
        background: bg, 
        color: color, 
        borderRadius: "16px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary-deep)" }}>{value}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{title}</div>
      </div>
    </div>
  );
}

export default MyFines;
