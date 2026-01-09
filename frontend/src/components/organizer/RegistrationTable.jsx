// ================================================================
// FILE 2: RegistrationTable.jsx
// Location: D:\EventZen-frontend\src\components\organizer\RegistrationTable.jsx
// ================================================================
import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import "../../styles/Organizer Dashboard/RegistrationTable.css";

export default function RegistrationTable({ registrations }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      CONFIRMED: {
        icon: CheckCircle,
        className: "status-confirmed",
        label: "Confirmed",
      },
      CANCELLED: {
        icon: XCircle,
        className: "status-cancelled",
        label: "Cancelled",
      },
      PENDING: {
        icon: Clock,
        className: "status-pending",
        label: "Pending",
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="registration-table-wrapper">
      {/* Desktop Table View */}
      <table className="registration-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Visitor Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Registered At</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id}>
              <td className="reg-id">#{reg.id}</td>
              <td className="visitor-name">{reg.visitorName}</td>
              <td className="visitor-email">{reg.visitorEmail}</td>
              <td className="visitor-phone">{reg.phone || "N/A"}</td>
              <td>{getStatusBadge(reg.status)}</td>
              <td className="reg-date">{formatDate(reg.registeredAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="registration-cards">
        {registrations.map((reg) => (
          <div key={reg.id} className="registration-card">
            <div className="card-header">
              <span className="card-id">#{reg.id}</span>
              {getStatusBadge(reg.status)}
            </div>

            <div className="card-body">
              <div className="card-field">
                <span className="field-label">Name:</span>
                <span className="field-value">{reg.visitorName}</span>
              </div>

              <div className="card-field">
                <span className="field-label">Email:</span>
                <span className="field-value">{reg.visitorEmail}</span>
              </div>

              <div className="card-field">
                <span className="field-label">Phone:</span>
                <span className="field-value">{reg.phone || "N/A"}</span>
              </div>

              <div className="card-field">
                <span className="field-label">Registered:</span>
                <span className="field-value">{formatDate(reg.registeredAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}