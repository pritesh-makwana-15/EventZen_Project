// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Home,
  Users,
  Calendar,
  UserPlus,
  User,
  LogOut,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  getAdminEvents,
  getAdminOrganizers,
  getAdminVisitors,
  createAdminOrganizer,
  updateAdminOrganizer,
  deleteAdminOrganizer,
  deleteAdminEvent,
  deleteAdminVisitor,
  toggleOrganizerStatus,
} from "../services/api";
import "../styles/Admin Dashborad/AdminDashboard.css";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [visitors, setVisitors] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'view', 'edit', 'delete', 'create'
  const [selectedItem, setSelectedItem] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  // Form state for creating/editing organizer
  const [organizerForm, setOrganizerForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    organization: "",
    active: true,
  });

  // Load data on component mount and section change
  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      switch (activeSection) {
        case "events":
          const eventsData = await getAdminEvents();
          setEvents(eventsData);
          break;
        case "organizers":
          const organizersData = await getAdminOrganizers();
          setOrganizers(organizersData);
          break;
        case "visitors":
          const visitorsData = await getAdminVisitors();
          setVisitors(visitorsData);
          break;
      }
    } catch (err) {
      setError(`Failed to load ${activeSection}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Show notifications
  const showNotification = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(""), 3000);
    }
  };

  // Handle organizer form submission
  const handleOrganizerSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (organizerForm.password !== organizerForm.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (!organizerForm.name || !organizerForm.email || !organizerForm.password) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const organizerData = {
        name: organizerForm.name,
        email: organizerForm.email,
        password: organizerForm.password,
        phone: organizerForm.phone,
        organization: organizerForm.organization,
        active: organizerForm.active,
      };

      if (modalType === "edit") {
        await updateAdminOrganizer(selectedItem.id, organizerData);
        showNotification("Organizer updated successfully");
      } else {
        await createAdminOrganizer(organizerData);
        showNotification("Organizer created successfully");
      }

      // Reset form and close modal
      setOrganizerForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        organization: "",
        active: true,
      });
      setShowModal(false);
      setModalType("");
      setSelectedItem(null);
      
      // Reload organizers data
      if (activeSection === "organizers") {
        loadData();
      }
    } catch (err) {
      setError(`Failed to ${modalType === "edit" ? "update" : "create"} organizer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete actions
  const handleDelete = async (item, type) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    setLoading(true);
    try {
      switch (type) {
        case "event":
          await deleteAdminEvent(item.id);
          setEvents(events.filter(e => e.id !== item.id));
          break;
        case "organizer":
          await deleteAdminOrganizer(item.id);
          setOrganizers(organizers.filter(o => o.id !== item.id));
          break;
        case "visitor":
          await deleteAdminVisitor(item.id);
          setVisitors(visitors.filter(v => v.id !== item.id));
          break;
      }
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (err) {
      setError(`Failed to delete ${type}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle organizer status
  const handleToggleStatus = async (organizer) => {
    setLoading(true);
    try {
      await toggleOrganizerStatus(organizer.id);
      setOrganizers(organizers.map(o => 
        o.id === organizer.id ? { ...o, active: !o.active } : o
      ));
      showNotification(`Organizer ${organizer.active ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      setError(`Failed to update organizer status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open modals
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
    
    if (type === "edit" && item) {
      setOrganizerForm({
        name: item.name || "",
        email: item.email || "",
        password: "",
        confirmPassword: "",
        phone: item.phone || "",
        organization: item.organization || "",
        active: item.active !== undefined ? item.active : true,
      });
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedItem(null);
    setOrganizerForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      organization: "",
      active: true,
    });
  };

  // Filter and search data
  const getFilteredData = () => {
    let data = [];
    switch (activeSection) {
      case "events":
        data = events;
        break;
      case "organizers":
        data = organizers;
        break;
      case "visitors":
        data = visitors;
        break;
      default:
        return [];
    }

    // Apply search filter
    if (searchTerm) {
      data = data.filter(item => {
        const searchFields = [item.name, item.title, item.email].filter(Boolean);
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter for events and organizers
    if (statusFilter !== "all") {
      if (activeSection === "events") {
        data = data.filter(event => {
          if (statusFilter === "active") return event.isActive;
          if (statusFilter === "inactive") return !event.isActive;
          return true;
        });
      } else if (activeSection === "organizers") {
        data = data.filter(organizer => {
          if (statusFilter === "active") return organizer.active;
          if (statusFilter === "inactive") return !organizer.active;
          return true;
        });
      }
    }

    return data;
  };

  // ===== Sidebar =====
  const renderSidebar = () => (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo-box">
          <img src="../src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
        </div>
        <span className="logo-text">EventZen</span>
      </div>

      <nav className="nav-links">
        <button 
          className={`nav-btn ${activeSection === "events" ? "active" : ""}`} 
          onClick={() => setActiveSection("events")}
        >
          <Calendar size={18} /> Events
        </button>
        <button 
          className={`nav-btn ${activeSection === "organizers" ? "active" : ""}`} 
          onClick={() => setActiveSection("organizers")}
        >
          <User size={18} /> Organizers
        </button>
        <button 
          className={`nav-btn ${activeSection === "visitors" ? "active" : ""}`} 
          onClick={() => setActiveSection("visitors")}
        >
          <Users size={18} /> Visitors
        </button>
        <button 
          className={`nav-btn ${activeSection === "create-organizer" ? "active" : ""}`} 
          onClick={() => openModal("create")}
        >
          <UserPlus size={18} /> Add Organizer
        </button>
      </nav>
    </div>
  );

  // ===== Topbar =====
  const renderTopbar = () => (
    <div className="topbar">
      <h1>Admin Dashboard</h1>
      <div className="topbar-actions">
        <button className="btn-outline">Profile</button>
        <button className="btn-primary" onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  // ===== Search and Filter Bar =====
  const renderSearchBar = () => (
    <div className="search-filter-bar">
      <div className="search-box">
        <Search size={16} />
        <input
          type="text"
          placeholder={`Search ${activeSection}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {(activeSection === "events" || activeSection === "organizers") && (
        <div className="filter-box">
          <Filter size={16} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}
    </div>
  );

  // ===== Notifications =====
  const renderNotifications = () => (
    <>
      {error && (
        <div className="notification error">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="notification success">
          <Check size={16} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")}><X size={14} /></button>
        </div>
      )}
    </>
  );

  // ===== Events Table =====
  const renderEvents = () => {
    const filteredEvents = getFilteredData();
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h2>Events ({filteredEvents.length})</h2>
          {renderSearchBar()}
        </div>
        
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Organizer</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.title}</td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.location}</td>
                    <td>{event.organizer?.name || "N/A"}</td>
                    <td>{event.attendeesCount || 0}</td>
                    <td>
                      <span className={`status ${event.isActive ? "active" : "inactive"}`}>
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          onClick={() => openModal("view", event)}
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          onClick={() => openModal("edit", event)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(event, "event")}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ===== Organizers Table =====
  const renderOrganizers = () => {
    const filteredOrganizers = getFilteredData();
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h2>Organizers ({filteredOrganizers.length})</h2>
          <div className="table-header-actions">
            {renderSearchBar()}
            <button 
              className="btn-primary"
              onClick={() => openModal("create")}
            >
              <UserPlus size={16} /> Add Organizer
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading organizers...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Organization</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrganizers.map((organizer) => (
                  <tr key={organizer.id}>
                    <td>{organizer.id}</td>
                    <td>{organizer.name}</td>
                    <td>{organizer.email}</td>
                    <td>{organizer.phone || "N/A"}</td>
                    <td>{organizer.organization || "N/A"}</td>
                    <td>{new Date(organizer.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${organizer.active ? "active" : "inactive"}`}>
                        {organizer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          onClick={() => openModal("view", organizer)}
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-btn edit" 
                          onClick={() => openModal("edit", organizer)}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className={`action-btn ${organizer.active ? "deactivate" : "activate"}`} 
                          onClick={() => handleToggleStatus(organizer)}
                          title={organizer.active ? "Deactivate" : "Activate"}
                        >
                          {organizer.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(organizer, "organizer")}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ===== Visitors Table =====
  const renderVisitors = () => {
    const filteredVisitors = getFilteredData();
    
    return (
      <div className="table-container">
        <div className="table-header">
          <h2>Visitors ({filteredVisitors.length})</h2>
          {renderSearchBar()}
        </div>
        
        {loading ? (
          <div className="loading">Loading visitors...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered Events</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor.id}>
                    <td>{visitor.id}</td>
                    <td>{visitor.name}</td>
                    <td>{visitor.email}</td>
                    <td>{visitor.phone || "N/A"}</td>
                    <td>{visitor.registeredEventsCount || 0}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view" 
                          onClick={() => openModal("view", visitor)}
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(visitor, "visitor")}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // ===== Modal =====
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>
              {modalType === "create" && "Add New Organizer"}
              {modalType === "edit" && "Edit Organizer"}
              {modalType === "view" && `${activeSection.slice(0, -1)} Details`}
              {modalType === "delete" && "Confirm Delete"}
            </h3>
            <button className="modal-close" onClick={closeModal}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {(modalType === "create" || modalType === "edit") && (
              <form onSubmit={handleOrganizerSubmit} className="organizer-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={organizerForm.name}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={organizerForm.email}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, email: e.target.value })}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      value={organizerForm.password}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, password: e.target.value })}
                      placeholder="Enter password"
                      required={modalType === "create"}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      value={organizerForm.confirmPassword}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required={modalType === "create"}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={organizerForm.phone}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization</label>
                    <input
                      type="text"
                      value={organizerForm.organization}
                      onChange={(e) => setOrganizerForm({ ...organizerForm, organization: e.target.value })}
                      placeholder="Enter organization"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={organizerForm.active}
                        onChange={(e) => setOrganizerForm({ ...organizerForm, active: e.target.checked })}
                      />
                      Active Account
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-outline" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Saving..." : (modalType === "edit" ? "Update" : "Create")}
                  </button>
                </div>
              </form>
            )}

            {modalType === "view" && selectedItem && (
              <div className="view-details">
                {activeSection === "events" && (
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Title:</strong> {selectedItem.title}
                    </div>
                    <div className="detail-item">
                      <strong>Description:</strong> {selectedItem.description}
                    </div>
                    <div className="detail-item">
                      <strong>Date:</strong> {new Date(selectedItem.date).toLocaleDateString()}
                    </div>
                    <div className="detail-item">
                      <strong>Location:</strong> {selectedItem.location}
                    </div>
                    <div className="detail-item">
                      <strong>Organizer:</strong> {selectedItem.organizer?.name || "N/A"}
                    </div>
                    <div className="detail-item">
                      <strong>Category:</strong> {selectedItem.category}
                    </div>
                    <div className="detail-item">
                      <strong>Attendees:</strong> {selectedItem.attendeesCount || 0}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {selectedItem.isActive ? "Active" : "Inactive"}
                    </div>
                    <div className="detail-item">
                      <strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {activeSection === "organizers" && (
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Name:</strong> {selectedItem.name}
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong> {selectedItem.email}
                    </div>
                    <div className="detail-item">
                      <strong>Phone:</strong> {selectedItem.phone || "N/A"}
                    </div>
                    <div className="detail-item">
                      <strong>Organization:</strong> {selectedItem.organization || "N/A"}
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong> {selectedItem.active ? "Active" : "Inactive"}
                    </div>
                    <div className="detail-item">
                      <strong>Created:</strong> {new Date(selectedItem.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {activeSection === "visitors" && (
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Name:</strong> {selectedItem.name}
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong> {selectedItem.email}
                    </div>
                    <div className="detail-item">
                      <strong>Phone:</strong> {selectedItem.phone || "N/A"}
                    </div>
                    <div className="detail-item">
                      <strong>Registered Events:</strong> {selectedItem.registeredEventsCount || 0}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===== Main Content Renderer =====
  const renderContent = () => {
    switch (activeSection) {
      case "events":
        return renderEvents();
      case "organizers":
        return renderOrganizers();
      case "visitors":
        return renderVisitors();
      default:
        return renderEvents();
    }
  };

  return (
    <div className="dashboard">
      {renderSidebar()}
      <div className="main">
        {renderTopbar()}
        <div className="content">
          {renderNotifications()}
          {renderContent()}
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default AdminDashboard;