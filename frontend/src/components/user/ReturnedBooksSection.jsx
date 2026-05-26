import { CheckCircle2 } from "lucide-react";
import IssuedBookCard from "./IssuedBookCard";

export default function ReturnedBooksSection({ borrows }) {
  const returnedBorrows = borrows.filter(b => b.status === "Returned");

  if (returnedBorrows.length === 0) return null;

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
        <CheckCircle2 size={20} color="#94A3B8" /> Returned History
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {returnedBorrows.map((b) => (
          <IssuedBookCard 
            key={b._id} 
            borrow={b} 
          />
        ))}
      </div>
    </div>
  );
}
