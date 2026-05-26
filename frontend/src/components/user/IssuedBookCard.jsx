import { Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import RejectionReasonBox from "./RejectionReasonBox";

export default function IssuedBookCard({ borrow, onRequestReturn, returningId }) {
  const isIssued = borrow.status === "Issued";
  const isOverdue = (isIssued || borrow.status === "Requested Return") && new Date() > new Date(borrow.dueDate);
  const isRequestedReturn = borrow.status === "Requested Return";
  const isRequested = borrow.status === "Requested";
  const isReturned = borrow.status === "Returned";
  const isBorrowRejected = borrow.status === "borrow_rejected" || borrow.status === "Rejected";
  const isReturnRejected = borrow.status === "return_rejected";
  const isRenewalRejected = borrow.status === "renewal_rejected";
  const isAnyRejected = isBorrowRejected || isReturnRejected || isRenewalRejected;

  // Determine badge colors based on Issued Book specific logic
  let bg = "rgba(56, 189, 248, 0.15)";
  let color = "#38BDF8";
  let border = "rgba(56, 189, 248, 0.3)";
  let Icon = Clock;
  let label = borrow.status;

  if (isRequested) {
    bg = "rgba(59, 130, 246, 0.15)"; color = "#3B82F6"; border = "rgba(59, 130, 246, 0.3)"; Icon = Clock; label = "Pending Approval";
  } else if (isIssued) {
    if (isOverdue) {
      bg = "rgba(239, 68, 68, 0.15)"; color = "#EF4444"; border = "rgba(239, 68, 68, 0.3)"; Icon = AlertTriangle; label = "Overdue";
    } else {
      bg = "rgba(34, 197, 94, 0.15)"; color = "#22C55E"; border = "rgba(34, 197, 94, 0.3)"; Icon = CheckCircle2; label = "Active";
    }
  } else if (isReturned) {
    bg = "rgba(148, 163, 184, 0.15)"; color = "#94A3B8"; border = "rgba(148, 163, 184, 0.3)"; Icon = CheckCircle2; label = "Returned";
  } else if (isRequestedReturn) {
    if (isOverdue) {
      bg = "rgba(239, 68, 68, 0.15)"; color = "#EF4444"; border = "rgba(239, 68, 68, 0.3)"; Icon = AlertTriangle; label = "Pending Return (Overdue)";
    } else {
      bg = "rgba(249, 115, 22, 0.15)"; color = "#F97316"; border = "rgba(249, 115, 22, 0.3)"; Icon = Clock; label = "Pending Return";
    }
  } else if (isAnyRejected) {
    bg = "rgba(148, 163, 184, 0.15)"; color = "#94A3B8"; border = "rgba(148, 163, 184, 0.3)"; Icon = AlertTriangle; 
    if (isBorrowRejected) label = "Borrow Request Rejected";
    if (isReturnRejected) label = "Return Request Rejected";
    if (isRenewalRejected) label = "Renewal Rejected";
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", borderRadius: "12px",
      border: `1px solid ${isOverdue ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.06)"}`,
      padding: "18px 20px",
      boxShadow: isOverdue ? "0 0 0 2px rgba(239, 68, 68, 0.2)" : "0 4px 16px rgba(0,0,0,0.3)",
      display: "flex", gap: "16px", alignItems: "flex-start"
    }}>
      {/* Book Cover Image */}
      <div style={{ flexShrink: 0, width: "60px", height: "85px", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {borrow.bookId?.coverImage ? (
          <img 
            src={borrow.bookId.coverImage} 
            alt={borrow.bookId.title} 
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
              {borrow.bookId?.title || "Unknown Book"}
            </p>
          {borrow.bookId?.author && (
            <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>by {borrow.bookId.author}</p>
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
        {borrow.issueDate && (
          <span style={{ fontSize: "13px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={13} /> Issued: {new Date(borrow.issueDate).toDateString()}
          </span>
        )}
        {borrow.dueDate && (
          <span style={{ fontSize: "13px", color: isOverdue ? "#EF4444" : "#94A3B8", fontWeight: isOverdue ? 600 : 400, display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={13} /> Due: {new Date(borrow.dueDate).toDateString()}
          </span>
        )}
        {isReturned && borrow.returnDate && (
          <span style={{ fontSize: "13px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={13} /> Returned: {new Date(borrow.returnDate).toDateString()}
          </span>
        )}
      </div>

      {isAnyRejected && borrow.rejectionReason && (
        <RejectionReasonBox reason={borrow.rejectionReason} />
      )}

      {borrow.fineAmount > 0 && (
        <div style={{ marginTop: "10px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", color: "#F87171", fontWeight: 600 }}>
          ⚠️ Fine: ₹{borrow.fineAmount} {isReturned ? "(Finalized)" : ""} {borrow.overdueDays > 0 && ` | Overdue by ${borrow.overdueDays} day(s)`}
        </div>
      )}

      {isIssued && (
        <div style={{ marginTop: "14px" }}>
          <button
            onClick={() => onRequestReturn(borrow._id)}
            disabled={returningId === borrow._id}
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)", color: "#fff",
              border: "none", borderRadius: "8px",
              padding: "8px 18px", cursor: "pointer",
              fontWeight: 600, fontSize: "13px",
              boxShadow: "0 2px 8px rgba(236, 72, 153, 0.3)"
            }}
          >
            {returningId === borrow._id ? "Requesting..." : "Request Return"}
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
