import "../../animations.css";
import "./reservations.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import { Clock } from "lucide-react";
import ReservationCard from "../../components/user/ReservationCard";
import UserDashboardStats from "../../components/user/UserDashboardStats";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${Server_URL}reservations/my`, { headers: headers() });
      setReservations(res.data.reservations || []);
    } catch {
      showErrorToast("Failed to fetch your reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const requestCancel = async (id) => {
    setCanceling(id);
    try {
      const res = await axios.delete(`${Server_URL}reservations/cancel/${id}`, { headers: headers() });
      showSuccessToast(res.data.message || "Reservation cancelled");
      fetchData();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setCanceling(null);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
      <div className="preloader-spinner" />
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <UserDashboardStats />

      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={24} color="#8B5CF6" /> Reservation Notifications
        </h2>
      </div>

      {reservations.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <Clock size={48} style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "16px" }}>You have no active or past reservations.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {reservations.map((r) => (
            <ReservationCard 
              key={r._id} 
              reservation={r} 
              onCancel={requestCancel} 
              cancelingId={canceling} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
