// ================================================================
// FILE: src/components/Visitor dashboard/TicketDownloadButton.jsx (FIXED)
// ================================================================

import React, { useState } from "react";
import { Download, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { downloadTicketPDF } from "../../services/visitorService";

export default function TicketDownloadButton({ registrationId, eventTitle }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    if (!registrationId) {
      setError("Registration ID not available");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      console.log("📥 Downloading ticket for registration:", registrationId);

      // Download PDF blob using registrationId
      const blob = await downloadTicketPDF(registrationId);

      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error("Received empty file");
      }

      console.log("✅ Ticket downloaded, size:", blob.size, "bytes");

      // Sanitize filename
      const sanitizedTitle = (eventTitle || "event")
        .replace(/[^a-zA-Z0-9-_]/g, "_")
        .substring(0, 50);

      const filename = `Ticket_${sanitizedTitle}_${registrationId}.pdf`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      // Show success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      console.log("✅ Ticket download complete:", filename);

    } catch (err) {
      console.error("❌ Error downloading ticket:", err);

      // User-friendly error messages
      let errorMsg = "Failed to download ticket";

      if (err.response?.status === 403) {
        errorMsg = "Access denied. You can only download your own tickets.";
      } else if (err.response?.status === 404) {
        errorMsg = "Ticket not found. Please contact support.";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }

      setError(errorMsg);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vis-ticket-download-wrapper">
      <button
        onClick={handleDownload}
        disabled={loading || !registrationId}
        className="vis-btn-view"
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading || !registrationId ? "not-allowed" : "pointer",
          background: success ? "#10b981" : "#667eea",
          position: "relative",
          transition: "all 0.3s ease"
        }}
        title={
          !registrationId
            ? "Ticket not available"
            : loading
              ? "Downloading..."
              : "Download your ticket PDF"
        }
      >
        {loading ? (
          <>
            <Loader size={14} className="vis-spinner" style={{
              animation: "spin 1s linear infinite"
            }} />
            <span>Downloading...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle size={14} />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <Download size={14} />
            <span>Ticket</span>
          </>
        )}
      </button>

      {error && (
        <div
          className="vis-ticket-error"
          style={{
            color: "#dc2626",
            fontSize: "11px",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            animation: "fadeIn 0.3s ease"
          }}
        >
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}