import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { BookOpen, Clock, AlertTriangle } from "lucide-react";

export default function UserDashboardStats() {
  const [stats, setStats] = useState({
    activeBorrows: 0,
    overdue: 0,
    reservations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${getAuthToken()}` };
        
        const [borrowsRes, reservationsRes] = await Promise.all([
          axios.get(`${Server_URL}users/myborrows`, { headers }).catch(() => ({ data: { borrows: [] } })),
          axios.get(`${Server_URL}reservations/my`, { headers }).catch(() => ({ data: { reservations: [] } }))
        ]);

        const borrowsData = borrowsRes.data.borrows || borrowsRes.data.requests || [];
        const reservationsData = reservationsRes.data.reservations || [];

        let activeBorrows = 0;
        let overdue = 0;

        borrowsData.forEach(b => {
          if (b.status === "Issued") {
            activeBorrows++;
            if (new Date() > new Date(b.dueDate)) {
              overdue++;
            }
          }
        });

        const activeReservations = reservationsData.filter(
          r => r.status === "Pending" || r.status === "Notified"
        ).length;

        setStats({
          activeBorrows,
          overdue,
          reservations: activeReservations,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div style={{ height: "100px" }} />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
      {/* Active Borrows */}
      <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6", padding: "12px", borderRadius: "10px" }}>
          <BookOpen size={24} />
        </div>
        <div>
          <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.9rem", fontWeight: 600 }}>Active Borrows</p>
          <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.8rem" }}>{stats.activeBorrows}</h3>
        </div>
      </div>

      {/* Total Reservations */}
      <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ background: "rgba(236,72,153,0.15)", color: "#EC4899", padding: "12px", borderRadius: "10px" }}>
          <Clock size={24} />
        </div>
        <div>
          <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.9rem", fontWeight: 600 }}>Active Reservations</p>
          <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.8rem" }}>{stats.reservations}</h3>
        </div>
      </div>

      {/* Overdue */}
      <div style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", padding: "12px", borderRadius: "10px" }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.9rem", fontWeight: 600 }}>Overdue Books</p>
          <h3 style={{ margin: 0, color: "#F8FAFC", fontSize: "1.8rem" }}>{stats.overdue}</h3>
        </div>
      </div>
    </div>
  );
}
