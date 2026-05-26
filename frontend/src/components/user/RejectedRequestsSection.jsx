import { XCircle } from "lucide-react";
import IssuedBookCard from "./IssuedBookCard";

export default function RejectedRequestsSection({ borrows }) {
  const rejectedBorrows = borrows.filter(b => 
    b.status === "borrow_rejected" || 
    b.status === "return_rejected" || 
    b.status === "renewal_rejected" || 
    b.status === "Rejected"
  );

  if (rejectedBorrows.length === 0) return null;

  return (
    <div style={{ marginBottom: "32px" }}>
      <h3 style={{ 
        fontSize: "18px", 
        fontWeight: 600, 
        color: "#F8FAFC", 
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderBottom: "2px solid rgba(255,255,255,0.06)",
        paddingBottom: "8px"
      }}>
        <XCircle size={20} color="#94A3B8" /> Rejected Requests
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {rejectedBorrows.map((b) => (
          <IssuedBookCard 
            key={b._id} 
            borrow={b} 
          />
        ))}
      </div>
    </div>
  );
}
