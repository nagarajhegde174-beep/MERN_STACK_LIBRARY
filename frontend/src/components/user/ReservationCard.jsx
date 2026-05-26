import { Clock, CheckCircle2, XCircle, Calendar, Trash2 } from "lucide-react";

export default function ReservationCard({ reservation, onCancel, cancelingId }) {
  const isPending = reservation.status === "Pending";
  const isNotified = reservation.status === "Notified";
  const isCancelled = reservation.status === "Cancelled";
  const isFulfilled = reservation.status === "Fulfilled";
  const isExpired = reservation.status === "Expired";

  let bg = "#fef9c3";
  let color = "#854d0e";
  let border = "#fde68a";
  let Icon = Clock;
  let label = reservation.status;

  if (isPending) {
    bg = "rgba(234, 179, 8, 0.15)"; color = "#EAB308"; border = "rgba(234, 179, 8, 0.3)"; Icon = Clock; label = "Waiting List";
  } else if (isNotified) {
    bg = "rgba(245, 158, 11, 0.15)"; color = "#F59E0B"; border = "rgba(245, 158, 11, 0.3)"; Icon = CheckCircle2; label = "Ready for Pickup";
  } else if (isFulfilled) {
    bg = "rgba(34, 197, 94, 0.15)"; color = "#22C55E"; border = "rgba(34, 197, 94, 0.3)"; Icon = CheckCircle2; label = "Approved/Fulfilled";
  } else if (isCancelled || isExpired) {
    bg = "rgba(239, 68, 68, 0.15)"; color = "#EF4444"; border = "rgba(239, 68, 68, 0.3)"; Icon = XCircle; label = isCancelled ? "Cancelled" : "Expired";
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "18px 20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
      display: "flex", gap: "16px", alignItems: "flex-start"
    }}>
      {/* Book Cover Image */}
      <div style={{ flexShrink: 0, width: "60px", height: "85px", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {reservation.bookId?.coverImage ? (
          <img 
            src={reservation.bookId.coverImage} 
            alt={reservation.bookId.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : (
          <div style={{ color: "#64748B" }}><Clock size={24} /></div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <p style={{ fontWeight: 600, color: "#F8FAFC", fontSize: "16px", margin: "0 0 4px" }}>
              {reservation.bookId?.title || "Unknown Book"}
            </p>
          {reservation.bookId?.author && (
            <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>by {reservation.bookId.author}</p>
          )}
        </div>

        <span style={{
          background: bg, color, border: `1px solid ${border}`,
          padding: "4px 12px", borderRadius: "999px",
          fontSize: "12px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          <Icon size={12} /> {label}
        </span>
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
        {reservation.createdAt && (
          <span style={{ fontSize: "13px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={13} /> Reserved On: {new Date(reservation.createdAt).toDateString()}
          </span>
        )}
      </div>

      {(isPending || isNotified) && (
        <div style={{ marginTop: "14px" }}>
          <button
            onClick={() => onCancel(reservation._id)}
            disabled={cancelingId === reservation._id}
            style={{
              background: "rgba(239,68,68,0.15)", color: "#EF4444",
              border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px",
              padding: "8px 18px", cursor: "pointer",
              fontWeight: 600, fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px"
            }}
          >
            <Trash2 size={14} />
            {cancelingId === reservation._id ? "Canceling..." : "Cancel Reservation"}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
