// ================================================================
// FILE 5: TicketPreviewModal.jsx
// Location: D:\EventZen-frontend\src\components\organizer\TicketPreviewModal.jsx
// ================================================================
import React, { useState } from "react";
import { X, Download, Loader, FileText } from "lucide-react";
import API from "../../services/api";
import "../../styles/Organizer Dashboard/TicketPreviewModal.css";

export default function TicketPreviewModal({ eventId, eventTitle, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/organizer/events/${eventId}/ticket/preview`,
        {
          responseType: "blob",
        }
      );

      // Create blob URL for preview
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error("Error loading ticket preview:", err);
      setError("Failed to load ticket preview");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        `/organizer/events/${eventId}/ticket/preview`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${eventTitle}_ticket_preview.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading ticket:", err);
      setError("Failed to download ticket preview");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load preview on mount
  React.useEffect(() => {
    handlePreview();
  }, []);

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div className="ticket-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ticket-header">
          <div className="header-content">
            <FileText size={24} />
            <div>
              <h3>Ticket Preview</h3>
              <p className="event-title">{eventTitle}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="ticket-actions">
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={16} className="spinning" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="ticket-error" role="alert">
            {error}
          </div>
        )}

        {/* PDF Preview */}
        <div className="ticket-preview-container">
          {loading && !pdfUrl ? (
            <div className="ticket-loading">
              <Loader size={48} className="spinning" />
              <p>Generating ticket preview...</p>
            </div>
          ) : error && !pdfUrl ? (
            <div className="ticket-error-state">
              <FileText size={48} />
              <p>{error}</p>
              <button className="retry-btn" onClick={handlePreview}>
                Retry
              </button>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="pdf-iframe"
              title="Ticket Preview"
            />
          ) : null}
        </div>

        {/* Footer Info */}
        <div className="ticket-footer">
          <p className="info-text">
            ℹ️ This is a sample ticket preview. Actual tickets will be generated
            when visitors register for your event.
          </p>
        </div>
      </div>
    </div>
  );
}