import { useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showErrorToast } from "../../utils/toasthelper";
import "./AdminDashboard.css";
import { FileText, Download, AlertTriangle, CheckCircle2, Clock, Check } from "lucide-react";

const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const downloadReport = async () => {
    setLoading(true);
    setDone(false);
    try {
      const res = await axios.get(`${Server_URL}reports/overdue-pdf`, {
        headers: headers(),
        responseType: "blob",
      });

      const url      = window.URL.createObjectURL(new Blob([res.data], { type:"application/pdf" }));
      const link     = document.createElement("a");
      const today    = new Date().toISOString().slice(0,10);
      link.href      = url;
      link.download  = `overdue-report-${today}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      showErrorToast("Failed to generate report. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-title-wrapper">
          <div className="title-icon-box">
            <FileText size={28} />
          </div>
          <div>
            <h2>Analytics & Reports</h2>
            <p>Generate and download enterprise library reports securely.</p>
          </div>
        </div>
      </div>

      {/* Report Card */}
      <div className="report-glass-card">
        {/* Glowing Gradient Orb in background */}
        <div className="rgc-glow-orb"></div>

        {/* Icon + Title */}
        <div className="rgc-header">
          <div className="rgc-icon-container">
            <AlertTriangle size={24} />
          </div>
          <div className="rgc-title-text">
            <h3>Overdue Books Report</h3>
            <p>Complete ledger of students exceeding the 10-day overdue threshold</p>
          </div>
        </div>

        {/* What's included */}
        <div className="rgc-details">
          <h4 className="rgc-details-title">REPORT INCLUDES</h4>
          <div className="rgc-checklist">
            {[
              "Student Name, Year, and Stream/Course",
              "Book Title and Author",
              "Original Due Date",
              "Number of Overdue Days",
              "Fine Amount (₹ per day)",
              "Total Fine Summary",
            ].map(item => (
              <div key={item} className="rgc-check-item">
                <Check size={16} className="check-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Download button */}
        <button
          className={`premium-download-btn ${loading ? 'loading' : ''}`}
          onClick={downloadReport}
          disabled={loading}
        >
          {loading ? (
            <><Clock size={18} className="spin" /> Generating PDF...</>
          ) : (
            <><Download size={18} /> Generate PDF Report</>
          )}
        </button>

        {done && (
          <div className="report-success-toast">
            <CheckCircle2 size={16} /> Report downloaded successfully
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="floating-notice-panel">
        <AlertTriangle size={18} className="notice-icon" />
        <p>
          This report is generated in real-time. Students with books overdue by fewer than 10 days will <strong>not</strong> appear. Fine rate calculations are strictly based on the current system configuration.
        </p>
      </div>
    </div>
  );
}
