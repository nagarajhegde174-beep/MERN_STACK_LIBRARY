import { BookOpen } from "lucide-react";
import IssuedBookCard from "./IssuedBookCard";

export default function ActiveBorrowSection({ borrows, onRequestReturn, returningId }) {
  const activeBorrows = borrows.filter(b => 
    b.status === "Issued" || b.status === "Requested Return" || b.status === "Requested"
  );

  if (activeBorrows.length === 0) return null;

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
        <BookOpen size={20} color="#3B82F6" /> Active Borrows
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {activeBorrows.map((b) => (
          <IssuedBookCard 
            key={b._id} 
            borrow={b} 
            onRequestReturn={onRequestReturn} 
            returningId={returningId} 
          />
        ))}
      </div>
    </div>
  );
}
