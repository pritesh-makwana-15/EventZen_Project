// ================================================================
// FILE: src/components/Visitor dashboard/TicketDownloadButton.jsx
// PURPOSE: Button to download ticket PDF
// ================================================================

import React, { useState } from "react";
import { Download, Loader } from "lucide-react";
import { downloadTicketPDF } from "../../services/visitorService";

export default function TicketDownloadButton({ ticketId, eventTitle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!ticketId) {
      setError("Ticket not available");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Download PDF blob
      const blob = await downloadTicketPDF(ticketId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${eventTitle || "event"}-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading ticket:", err);
      setError(err.response?.data?.error || "Failed to download ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vis-ticket-download-wrapper">
      <button
        onClick={handleDownload}
        disabled={loading || !ticketId}
        className="vis-btn vis-btn-primary-visitor"
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? (
          <>
            <Loader size={16} className="vis-spinner" />
            Downloading...
          </>
        ) : (
          <>
            <Download size={16} />
            Download Ticket
          </>
        )}
      </button>

      {error && (
        <p className="vis-ticket-error" style={{ 
          color: "#c33", 
          fontSize: "12px", 
          marginTop: "5px" 
        }}>
          {error}
        </p>
      )}
    </div>
  );
}