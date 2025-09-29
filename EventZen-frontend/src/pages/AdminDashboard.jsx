// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  User,
  UserPlus,
  LogOut,
  MoreHorizontal,
  Trash2,
  Edit,
  X,
  Save,
  Loader,
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
  const [adminProfile, setAdminProfile] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editType, setEditType] = useState(""); // "visitor", "organizer", "event"

  // Form state for creating organizer
  const [newOrganizer, setNewOrganizer] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Load data on component mount and section change
  useEffect(() => {
    loadData();
  }, [activeSection]);

  // Load admin profile on mount
  useEffect(() => {
    loadAdminProfile();
  }, []);

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
      }
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
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
      } else {
        await deleteUser(currentItem.id);
        if (editType === "visitor") {
          setVisitors(visitors.filter((v) => v.id !== currentItem.id));
        } else if (editType === "organizer") {
          setOrganizers(organizers.filter((o) => o.id !== currentItem.id));
        }
      }
      setShowDeleteModal(false);
      setSuccess(`${editType} deleted successfully!`);
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ===== Sidebar =====
  const renderSidebar = () => (
    <div className="sidebar">
      <div className="logo-section">
        <div className="logo-box">
          <img src="/src/assets/EZ-logo1.png" alt="logo" className="logo-img" />
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
          onClick={() => setActiveSection("create-organizer")}
        >
          <UserPlus size={18} /> Create Organizer
        </button>
      </nav>
    </div>
  );

  // ===== Topbar =====
  const renderTopbar = () => (
    <div className="topbar">
      <h1>Admin Dashboard</h1>
      <div className="topbar-actions">
        <button className="btn-outline" onClick={() => setShowProfileModal(true)}>
          Profile
        </button>
        <button className="btn-primary" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  // ===== Visitors =====
  const renderVisitors = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <h2>Visitors ({visitors.length})</h2>
        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={32} />
            <p>Loading visitors...</p>
          </div>
        ) : visitors.length === 0 ? (
          <p className="no-data">No visitors found</p>
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
                    <td>{v.id}</td>
                    <td>{v.name}</td>
                    <td>{v.email}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(v, "visitor")}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(v, "visitor")}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

  // ===== Organizers =====
  const renderOrganizers = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <h2>Organizers ({organizers.length})</h2>
        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={32} />
            <p>Loading organizers...</p>
          </div>
        ) : organizers.length === 0 ? (
          <p className="no-data">No organizers found</p>
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
                {organizers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.name}</td>
                    <td>{o.email}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(o, "organizer")}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(o, "organizer")}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

  // ===== Events =====
  const renderEvents = () => (
    <div className="content">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="card">
        <h2>Events ({events.length})</h2>
        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={32} />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="no-data">No events found</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.id}</td>
                    <td>{e.title}</td>
                    <td>{e.organizerName}</td>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td>{e.location}</td>
                    <td>
                      <span className={`status-badge ${e.isActive ? "active" : "inactive"}`}>
                        {e.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(e, "event")}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

  // ===== Create Organizer Form =====
  const renderCreateOrganizer = () => (
    <section className="create-organizer">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-header">
        <h2>Organizer Management</h2>
        <p>Create a new organizer account below</p>
      </div>

      <h3>Create New Organizer</h3>
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
            onClick={() => setNewOrganizer({ name: "", role: "", email: "", password: "" })}
          >
            Clear
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader className="spinner-small" size={16} /> Creating...
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create Organizer
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );

  // ===== Edit Modal =====
  const renderEditModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {editType}</h3>
          <button className="modal-close" onClick={() => setShowEditModal(false)}>
            <X size={20} />
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
              {loading ? <Loader className="spinner-small" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== Delete Confirmation Modal =====
  const renderDeleteModal = () => (
    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Delete</h3>
          <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
            <X size={20} />
          </button>
        </div>

        <p>
          Are you sure you want to delete this {editType}:{" "}
          <strong>{currentItem?.name || currentItem?.title}</strong>?
        </p>
        <p className="warning-text">This action cannot be undone.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn-outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader className="spinner-small" size={16} /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // ===== Profile Modal =====
  const renderProfileModal = () => (
    <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Admin Profile</h3>
          <button className="modal-close" onClick={() => setShowProfileModal(false)}>
            <X size={20} />
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
              {loading ? <Loader className="spinner-small" size={16} /> : <Save size={16} />}
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ===== Content Switcher =====
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
      {renderSidebar()}
      <div className="main">
        {renderTopbar()}
        {renderContent()}
      </div>

      {/* Modals */}
      {showEditModal && renderEditModal()}
      {showDeleteModal && renderDeleteModal()}
      {showProfileModal && renderProfileModal()}
    </div>
  );
};

export default AdminDashboard;