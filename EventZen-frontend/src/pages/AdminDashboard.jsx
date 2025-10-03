// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  User,
  UserPlus,
  LogOut,
  Trash2,
  Edit,
  X,
  Save,
  Loader,
  Eye,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Admin Dashborad/AdminDashboard.css";
import {
  getAllOrganizers,
  getAllVisitors,
  getAllEventsAdmin,
  deleteUser,
  deleteEventAdmin,
  createOrganizer,
  updateUser,
  getAdminProfile,
  updateAdminProfile,
} from "../services/adminService";
import { logout } from "../services/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [visitors, setVisitors] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    organizer: "",
    category: "",
    type: "",
    status: "",
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editType, setEditType] = useState("");

  // Form states
  const [newOrganizer, setNewOrganizer] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadData();
  }, [activeSection]);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, events]);

  const loadAdminProfile = async () => {
    try {
      const profile = await getAdminProfile();
      setAdminProfile(profile);
      setProfileForm({
        name: profile.name,
        email: profile.email,
        password: "",
      });
    } catch (err) {
      console.error("Error loading admin profile:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeSection === "visitors") {
        const data = await getAllVisitors();
        setVisitors(data);
      } else if (activeSection === "organizers") {
        const data = await getAllOrganizers();
        setOrganizers(data);
      } else if (activeSection === "events") {
        const data = await getAllEventsAdmin();
        setEvents(data);
        setFilteredEvents(data);
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    if (filters.organizer) {
      filtered = filtered.filter((e) =>
        e.organizerName?.toLowerCase().includes(filters.organizer.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter((e) =>
        e.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.type) {
      filtered = filtered.filter((e) =>
        e.eventType?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    if (filters.status) {
      filtered = filtered.filter((e) => getEventStatus(e) === filters.status);
    }

    setFilteredEvents(filtered);
  };

  const resetFilters = () => {
    setFilters({
      organizer: "",
      category: "",
      type: "",
      status: "",
    });
  };

  const getEventStatus = (event) => {
    if (!event.date) return "Unknown";
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today ? "Upcoming" : "Completed";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getOrganizerEventCount = (organizerId) => {
    return events.filter((e) => e.organizerId === organizerId).length;
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createOrganizer(newOrganizer);
      setSuccess("Organizer created successfully!");
      setNewOrganizer({ name: "", role: "", email: "", password: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data || "Failed to create organizer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");
    try {
      if (editType === "event") {
        await deleteEventAdmin(currentItem.id);
        setEvents(events.filter((e) => e.id !== currentItem.id));
        setSuccess("Event deleted successfully!");
      } else {
        await deleteUser(currentItem.id);
        if (editType === "visitor") {
          setVisitors(visitors.filter((v) => v.id !== currentItem.id));
        } else if (editType === "organizer") {
          setOrganizers(organizers.filter((o) => o.id !== currentItem.id));
        }
        setSuccess(`${editType} deleted successfully!`);
      }
      setShowDeleteModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to delete ${editType}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updatedUser = await updateUser(currentItem.id, editForm);

      if (editType === "visitor") {
        setVisitors(visitors.map((v) => (v.id === currentItem.id ? updatedUser : v)));
      } else if (editType === "organizer") {
        setOrganizers(organizers.map((o) => (o.id === currentItem.id ? updatedUser : o)));
      }

      setShowEditModal(false);
      setSuccess("Updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await updateAdminProfile(profileForm);
      setAdminProfile(updated);
      setShowProfileModal(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item, type) => {
    setCurrentItem(item);
    setEditType(type);
    setEditForm({
      name: item.name || item.title,
      email: item.email || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (item, type) => {
    setCurrentItem(item);
    setEditType(type);
    setShowDeleteModal(true);
  };

  const openEventDetailModal = (event) => {
    setCurrentItem(event);
    setShowEventDetailModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // sidebrAdmin
  const rendersidebrAdmin = () => (
    <div className="sidebrAdmin">
      <div className="logo-section">
        <div className="logo-box">
          <img src="/src/assets/EZ-logo1.png" alt="logo" className="logo-img-admin" />
        </div>
        <span className="logo-text">EventZen</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${activeSection === "events" ? "active" : ""}`}
          onClick={() => setActiveSection("events")}
        >
          <Calendar size={20} />
          <div className="nav-btn-content">
            <span>Events</span>
            <span className="nav-count">{events.length}</span>
          </div>
        </button>
        <button
          className={`nav-btn ${activeSection === "organizers" ? "active" : ""}`}
          onClick={() => setActiveSection("organizers")}
        >
          <User size={20} />
          <div className="nav-btn-content">
            <span>Organizers</span>
            <span className="nav-count">{organizers.length}</span>
          </div>
        </button>
        <button
          className={`nav-btn ${activeSection === "visitors" ? "active" : ""}`}
          onClick={() => setActiveSection("visitors")}
        >
          <Users size={20} />
          <div className="nav-btn-content">
            <span>Visitors</span>
            <span className="nav-count">{visitors.length}</span>
          </div>
        </button>
        <button
          className={`nav-btn ${activeSection === "create-organizer" ? "active" : ""}`}
          onClick={() => setActiveSection("create-organizer")}
        >
          <UserPlus size={20} /> Create Organizer
        </button>
      </nav>
    </div>
  );

  // Topbar
  const renderTopbar = () => (
    <div className="topbar">
      <h1>Admin Dashboard</h1>
      <div className="topbar-actions">
        <button className="btn-outline" onClick={() => setShowProfileModal(true)}>
          <User size={18} />
          Profile
        </button>
        <button className="btn-primary" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  // Events with Filters
  const renderEvents = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Events Overview</h2>
          <span className="card-count">{filteredEvents.length} Total</span>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>
              <Filter size={14} /> Organizer
            </label>
            <input
              type="text"
              placeholder="Search by organizer"
              value={filters.organizer}
              onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {[...new Set(events.map((e) => e.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button className="btn-reset" onClick={resetFilters}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={40} />
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="no-data">
            <Calendar size={48} />
            <p>No events found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Attendees</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e) => (
                  <tr key={e.id}>
                    <td className="td-id">{e.id}</td>
                    <td className="td-title">{e.title}</td>
                    <td>{e.organizerName}</td>
                    <td>{formatDate(e.date)}</td>
                    <td>{e.category || "N/A"}</td>
                    <td>
                      <span className={`type-badge ${e.eventType?.toLowerCase()}`}>
                        {e.eventType || "Public"}
                      </span>
                    </td>
                    <td>
                      {e.currentAttendees || 0}/{e.maxAttendees || "∞"}
                    </td>
                    <td>
                      <span className={`status-badge ${getEventStatus(e).toLowerCase()}`}>
                        {getEventStatus(e)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => openEventDetailModal(e)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(e, "event")}
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
    </div>
  );

  // Organizers
  const renderOrganizers = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Organizers</h2>
          <span className="card-count">{organizers.length} Total</span>
        </div>
        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={40} />
            <p>Loading organizers...</p>
          </div>
        ) : organizers.length === 0 ? (
          <div className="no-data">
            <User size={48} />
            <p>No organizers found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Total Events</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((o) => (
                  <tr key={o.id}>
                    <td className="td-id">{o.id}</td>
                    <td className="td-name">{o.name}</td>
                    <td>{o.email}</td>
                    <td>
                      <span className="event-count-badge">
                        {getOrganizerEventCount(o.id)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEditModal(o, "organizer")}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(o, "organizer")}
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
    </div>
  );

  // Visitors
  const renderVisitors = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Visitors</h2>
          <span className="card-count">{visitors.length} Total</span>
        </div>
        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={40} />
            <p>Loading visitors...</p>
          </div>
        ) : visitors.length === 0 ? (
          <div className="no-data">
            <Users size={48} />
            <p>No visitors found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}>
                    <td className="td-id">{v.id}</td>
                    <td className="td-name">{v.name}</td>
                    <td>{v.email}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEditModal(v, "visitor")}
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(v, "visitor")}
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
    </div>
  );

  // Create Organizer Form
  const renderCreateOrganizer = () => (
    <section className="create-organizer">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-header">
        <div className="form-header-icon">
          <UserPlus size={32} />
        </div>
        <h2>Create New Organizer</h2>
        <p>Add a new organizer to manage events</p>
      </div>

      <form className="organizer-form" onSubmit={handleCreateOrganizer}>
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={newOrganizer.name}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, name: e.target.value })
              }
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="form-group">
            <label>Role (Optional)</label>
            <select
              value={newOrganizer.role}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="Event Manager">Event Manager</option>
              <option value="Senior Designer">Senior Designer</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Planner">Planner</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={newOrganizer.email}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, email: e.target.value })
              }
              placeholder="Enter email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={newOrganizer.password}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, password: e.target.value })
              }
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() =>
              setNewOrganizer({ name: "", role: "", email: "", password: "" })
            }
          >
            Clear Form
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader className="spinner-small" size={18} /> Creating...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Create Organizer
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );

  // Event Detail Modal
  const renderEventDetailModal = () => (
    <div className="modal-overlay" onClick={() => setShowEventDetailModal(false)}>
      <div className="modal-content event-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Event Details</h3>
          <button className="modal-close" onClick={() => setShowEventDetailModal(false)}>
            <X size={22} />
          </button>
        </div>

        {currentItem && (
          <div className="event-details">
            {currentItem.imageUrl && (
              <div className="detail-row detail-row-image">
                {/* <strong>Image:</strong> */}
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="event-detail-image"
                />
              </div>
            )}
            <div className="detail-row">
              <strong>Title:</strong>
              <span>{currentItem.title}</span>
            </div>
            <div className="detail-row">
              <strong>Description:</strong>
              <span>{currentItem.description || "No description"}</span>
            </div>
            <div className="detail-row">
              <strong>Organizer:</strong>
              <span>{currentItem.organizerName}</span>
            </div>
            <div className="detail-row">
              <strong>Date:</strong>
              <span>{formatDate(currentItem.date)}</span>
            </div>
            <div className="detail-row">
              <strong>Location:</strong>
              <span>{currentItem.location || "N/A"}</span>
            </div>
            <div className="detail-row">
              <strong>Privet Code:</strong>
              <span>{currentItem.privateCode || "N/A"}</span>
            </div>
            <div className="detail-row">
              <strong>Category:</strong>
              <span>{currentItem.category || "N/A"}</span>
            </div>
            <div className="detail-row">
              <strong>Type:</strong>
              <span className={`type-badge ${currentItem.eventType?.toLowerCase()}`}>
                {currentItem.eventType || "Public"}
              </span>
            </div>
            <div className="detail-row">
              <strong>Attendees:</strong>
              <span>
                {currentItem.currentAttendees || 0} / {currentItem.maxAttendees || "Unlimited"}
              </span>
            </div>
            <div className="detail-row">
              <strong>Status:</strong>
              <span className={`status-badge ${getEventStatus(currentItem).toLowerCase()}`}>
                {getEventStatus(currentItem)}
              </span>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowEventDetailModal(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Modal
  const renderEditModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {editType}</h3>
          <button className="modal-close" onClick={() => setShowEditModal(false)}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password (leave empty to keep current)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader className="spinner-small" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete Modal
  const renderDeleteModal = () => (
    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
      <div className="modal-content modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          <p>
            Are you sure you want to delete this {editType}:{" "}
            <strong>{currentItem?.name || currentItem?.title}</strong>?
          </p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader className="spinner-small" size={18} /> : <Trash2 size={18} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Profile Modal
  const renderProfileModal = () => (
    <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Admin Profile</h3>
          <button className="modal-close" onClick={() => setShowProfileModal(false)}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>New Password (leave empty to keep current)</label>
            <input
              type="password"
              value={profileForm.password}
              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={() => setShowProfileModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader className="spinner-small" size={18} /> : <Save size={18} />}
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Content Switcher
  const renderContent = () => {
    switch (activeSection) {
      case "visitors":
        return renderVisitors();
      case "organizers":
        return renderOrganizers();
      case "events":
        return renderEvents();
      case "create-organizer":
        return renderCreateOrganizer();
      default:
        return renderEvents();
    }
  };

  return (
    <div className="dashboard">
      {rendersidebrAdmin()}
      <div className="main">
        {renderTopbar()}
        {renderContent()}
      </div>

      {showEditModal && renderEditModal()}
      {showDeleteModal && renderDeleteModal()}
      {showProfileModal && renderProfileModal()}
      {showEventDetailModal && renderEventDetailModal()}
    </div>
  );
};

export default AdminDashboard;