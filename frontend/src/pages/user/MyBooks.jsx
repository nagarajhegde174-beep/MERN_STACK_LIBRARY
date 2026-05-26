import "../../animations.css";
import "./reservations.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import { BookOpen, Lock, AlertTriangle, Info } from "lucide-react";
import ActiveBorrowSection from "../../components/user/ActiveBorrowSection";
import ReturnedBooksSection from "../../components/user/ReturnedBooksSection";
import RejectedRequestsSection from "../../components/user/RejectedRequestsSection";
import UserDashboardStats from "../../components/user/UserDashboardStats";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function MyBooks() {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [returning, setReturning] = useState(null);

  const fetchData = async () => {
    try {
      const [borrowsRes, profileRes] = await Promise.all([
        axios.get(`${Server_URL}users/myborrows`, { headers: headers() }),
        axios.get(`${Server_URL}users/profile`, { headers: headers() }),
      ]);
      setBorrows(borrowsRes.data.borrows || borrowsRes.data.requests || []);
      setUserInfo(profileRes.data.user || profileRes.data);
    } catch {
      showErrorToast("Failed to fetch your books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const requestReturn = async (id) => {
    setReturning(id);
    try {
      const res = await axios.put(`${Server_URL}users/returnrequest/${id}`, {}, { headers: headers() });
      showSuccessToast(res.data.message || "Return requested");
      fetchData();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to request return");
    } finally {
      setReturning(null);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
      <div className="preloader-spinner" />
    </div>
  );

  const isRestricted = userInfo?.isRestricted;
  const isExpired = userInfo?.accountExpired;
  const accountEnd = userInfo?.accountEndDate;

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <UserDashboardStats />

      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "10px" }}>
          <BookOpen size={24} color="#8B5CF6" /> Borrowed Books
        </h2>
      </div>

      {/* Restriction banner */}
      {isRestricted && (
        <div style={{
          background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px",
          padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px"
        }}>
          <Lock size={18} color="#EF4444" />
          <div>
            <p style={{ fontWeight: 700, color: "#FCA5A5", margin: 0 }}>Account Restricted</p>
            <p style={{ color: "#F87171", fontSize: "13px", margin: 0 }}>
              You have overdue book(s). You cannot make new requests until all overdue books are returned.
            </p>
          </div>
        </div>
      )}

      {/* Account expiry banner */}
      {isExpired && (
        <div style={{
          background: "rgba(249, 115, 22, 0.1)", border: "1px solid rgba(249, 115, 22, 0.3)", borderRadius: "10px",
          padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px"
        }}>
          <AlertTriangle size={18} color="#F97316" />
          <div>
            <p style={{ fontWeight: 700, color: "#FDBA74", margin: 0 }}>Account Expired</p>
            <p style={{ color: "#FB923C", fontSize: "13px", margin: 0 }}>
              Your library membership expired on{" "}
              <strong>{accountEnd ? new Date(accountEnd).toDateString() : "N/A"}</strong>.
              Please contact the library to renew.
            </p>
          </div>
        </div>
      )}

      {/* Account validity info */}
      {accountEnd && !isExpired && (
        <div style={{
          background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "10px",
          padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px"
        }}>
          <Info size={15} color="#38BDF8" />
          <span style={{ fontSize: "13px", color: "#7DD3FC" }}>
            Your membership is valid until <strong>{new Date(accountEnd).toDateString()}</strong>
          </span>
        </div>
      )}

      {borrows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
          <BookOpen size={48} style={{ marginBottom: "12px", margin: "0 auto", display: "block" }} />
          <p style={{ fontSize: "16px" }}>You don't have any issued books at the moment.</p>
        </div>
      ) : (
        <div>
          <ActiveBorrowSection borrows={borrows} onRequestReturn={requestReturn} returningId={returning} />
          <ReturnedBooksSection borrows={borrows} />
          <RejectedRequestsSection borrows={borrows} />
        </div>
      )}
    </div>
  );
}
