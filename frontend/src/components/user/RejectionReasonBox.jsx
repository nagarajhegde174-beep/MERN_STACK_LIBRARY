import { AlertTriangle } from "lucide-react";

export default function RejectionReasonBox({ reason }) {
  if (!reason) return null;

  // Clean up reason text if it's unprofessional or placeholder
  let displayReason = reason;
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes("placeholder") || lowerReason.includes("test") || lowerReason.length < 5) {
    displayReason = "Action denied by library administration. Please contact the front desk for further details.";
  }

  return (
    <div style={{ 
      marginTop: "12px", 
      background: "rgba(255,255,255,0.03)", 
      border: "1px solid rgba(255,255,255,0.06)", 
      borderRadius: "8px", 
      padding: "12px 16px", 
      fontSize: "13px", 
      color: "#94A3B8", 
      display: "flex", 
      alignItems: "flex-start", 
      gap: "10px" 
    }}>
      <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: "1px" }} />
      <div>
        <strong style={{ color: "#F8FAFC", display: "block", marginBottom: "4px" }}>Reason for Rejection:</strong>
        <span style={{ lineHeight: "1.4", display: "block" }}>{displayReason}</span>
      </div>
    </div>
  );
}
