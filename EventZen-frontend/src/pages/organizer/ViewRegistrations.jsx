// ================================================================
// FILE 1: ViewRegistrations.jsx
// Location: D:\EventZen-frontend\src\pages\organizer\ViewRegistrations.jsx
// ================================================================
import React, { useState, useEffect } from "react";
import { X, Download, Users, CheckCircle, XCircle, Loader } from "lucide-react";
// import RegistrationTable from "../../components/organizer/RegistrationTable";
import RegistrationTable from "../../components/organizer/RegistrationTable";
import API from "../../services/api";
import "../../styles/Organizer Dashboard/ViewRegistrations.css";

export default function ViewRegistrations({ eventId, eventTitle, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    fetchStats();
  }, [eventId, currentPage]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await API.get(
        `/organizer/events/${eventId}/registrations?page=${currentPage}&size=10`
      );
      
      setRegistrations(response.data.registrations);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
      setError("");
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get(`/organizer/events/${eventId}/registrations/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await API.get(`/organizer/events/${eventId}/export?format=csv`, {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${eventTitle}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      setError("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="view-registrations-modal-overlay" onClick={onClose}>
      <div className="view-registrations-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <Users size={24} className="header-icon" />
            <div>
              <h2>Event Registrations</h2>
              <p className="event-title">{eventTitle}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card stat-total">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalRegistrations}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            <div className="stat-card stat-confirmed">
              <div className="stat-icon">
                <CheckCircle size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.confirmed}</span>
                <span className="stat-label">Confirmed</span>
              </div>
            </div>

            <div className="stat-card stat-cancelled">
              <div className="stat-icon">
                <XCircle size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats.cancelled}</span>
                <span className="stat-label">Cancelled</span>
              </div>
            </div>

            <div className="stat-card stat-capacity">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {stats.totalRegistrations}/{stats.maxCapacity || "∞"}
                </span>
                <span className="stat-label">Capacity</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="actions-bar">
          <button
            className="export-btn"
            onClick={handleExport}
            disabled={exporting || registrations.length === 0}
          >
            {exporting ? (
              <>
                <Loader size={16} className="spinning" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={16} />
                Export CSV
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Registration Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading-state">
              <Loader size={32} className="spinning" />
              <p>Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-icon" />
              <h3>No Registrations Yet</h3>
              <p>No one has registered for this event yet.</p>
            </div>
          ) : (
            <>
              <RegistrationTable registrations={registrations} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </button>

                  <span className="page-info">
                    Page {currentPage + 1} of {totalPages}
                    <span className="total-items">({totalItems} total)</span>
                  </span>

                  <button
                    className="page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}