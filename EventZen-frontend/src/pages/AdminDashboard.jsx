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
  Upload,
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
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);

  // Filter states for Events (enhanced)
  const [filters, setFilters] = useState({
    organizer: "",
    category: "",
    type: "",
    status: "",
    eventName: "", // NEW: Search by event name
  });

  // Filter states for Organizers (NEW)
  const [organizerFilters, setOrganizerFilters] = useState({
    id: "",
    name: "",
  });

  // Filter states for Visitors (NEW)
  const [visitorFilters, setVisitorFilters] = useState({
    id: "",
    name: "",
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editType, setEditType] = useState("");

  // Profile editing state (NEW for enhanced profile)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [newOrganizer, setNewOrganizer] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // NEW: Confirm password field
  });

  // Password validation error (NEW)
  const [passwordError, setPasswordError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    imageUrl: "",
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

  // NEW: Apply organizer filters
  useEffect(() => {
    applyOrganizerFilters();
  }, [organizerFilters, organizers]);

  // NEW: Apply visitor filters
  useEffect(() => {
    applyVisitorFilters();
  }, [visitorFilters, visitors]);

  const loadAdminProfile = async () => {
    try {
      const profile = await getAdminProfile();
      setAdminProfile(profile);
      setProfileForm({
        name: profile.name,
        email: profile.email,
        password: "",
        mobileNumber: profile.mobileNumber || "",
        imageUrl: profile.imageUrl || "",
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
        setFilteredVisitors(data);
      } else if (activeSection === "organizers") {
        const data = await getAllOrganizers();
        setOrganizers(data);
        setFilteredOrganizers(data);
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

  // Enhanced filter application for Events
  const applyFilters = () => {
    let filtered = [...events];

    // Filter by organizer name
    if (filters.organizer) {
      filtered = filtered.filter((e) =>
        e.organizerName?.toLowerCase().includes(filters.organizer.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((e) =>
        e.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Filter by event type (public/private)
    if (filters.type) {
      filtered = filtered.filter((e) =>
        e.eventType?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter((e) => getEventStatus(e) === filters.status);
    }

    // NEW: Filter by event name/title
    if (filters.eventName) {
      filtered = filtered.filter((e) =>
        e.title?.toLowerCase().includes(filters.eventName.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  // NEW: Apply organizer filters
  const applyOrganizerFilters = () => {
    let filtered = [...organizers];

    // Filter by organizer ID (exact match)
    if (organizerFilters.id) {
      filtered = filtered.filter((o) =>
        o.id.toString() === organizerFilters.id.toString()
      );
    }

    // Filter by organizer name (partial match)
    if (organizerFilters.name) {
      filtered = filtered.filter((o) =>
        o.name?.toLowerCase().includes(organizerFilters.name.toLowerCase())
      );
    }

    setFilteredOrganizers(filtered);
  };

  // NEW: Apply visitor filters
  const applyVisitorFilters = () => {
    let filtered = [...visitors];

    // Filter by visitor ID (exact match)
    if (visitorFilters.id) {
      filtered = filtered.filter((v) =>
        v.id.toString() === visitorFilters.id.toString()
      );
    }

    // Filter by visitor name (partial match)
    if (visitorFilters.name) {
      filtered = filtered.filter((v) =>
        v.name?.toLowerCase().includes(visitorFilters.name.toLowerCase())
      );
    }

    setFilteredVisitors(filtered);
  };

  const resetFilters = () => {
    setFilters({
      organizer: "",
      category: "",
      type: "",
      status: "",
      eventName: "",
    });
  };

  // NEW: Reset organizer filters
  const resetOrganizerFilters = () => {
    setOrganizerFilters({
      id: "",
      name: "",
    });
  };

  // NEW: Reset visitor filters
  const resetVisitorFilters = () => {
    setVisitorFilters({
      id: "",
      name: "",
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

  // Enhanced Create Organizer with confirm password validation
  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setPasswordError("");

    // Validate password match
    if (newOrganizer.password !== newOrganizer.confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Send only required fields (no confirmPassword or role)
      const organizerData = {
        name: newOrganizer.name,
        email: newOrganizer.email,
        password: newOrganizer.password,
      };

      await createOrganizer(organizerData);
      setSuccess("Organizer created successfully!");
      setNewOrganizer({ name: "", email: "", password: "", confirmPassword: "" });
      setPasswordError("");
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

  // NEW: Enhanced profile image upload
  const handleProfileImageUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      // You'll need to implement this upload endpoint
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      setProfileForm((prev) => ({ ...prev, imageUrl: data.url }));
      setError("");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await updateAdminProfile(profileForm);
      setAdminProfile(updated);
      setIsEditingProfile(false);
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

  // Sidebar
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
          aria-label="View Events"
          aria-current={activeSection === "events" ? "page" : undefined}
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
          aria-label="View Organizers"
          aria-current={activeSection === "organizers" ? "page" : undefined}
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
          aria-label="View Visitors"
          aria-current={activeSection === "visitors" ? "page" : undefined}
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
          aria-label="Create New Organizer"
          aria-current={activeSection === "create-organizer" ? "page" : undefined}
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
        <button
          className="btn-outline"
          onClick={() => {
            setShowProfileModal(true);
            setIsEditingProfile(false);
          }}
          aria-label="View Profile"
        >
          <User size={18} />
          Profile
        </button>
        <button className="btn-primary" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  // Events with Enhanced Filters
  const renderEvents = () => (
    <div className="content">
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Events Overview</h2>
          <span className="card-count">{filteredEvents.length} Total</span>
        </div>

        {/* Enhanced Filters Section */}
        <div className="filters-section" role="search" aria-label="Event Filters">
          {/* NEW: Event Name Search */}
          <div className="filter-group">
            <label htmlFor="filter-event-name">
              <Filter size={14} /> Event Name
            </label>
            <input
              id="filter-event-name"
              type="text"
              placeholder="Search by event name"
              value={filters.eventName}
              onChange={(e) => setFilters({ ...filters, eventName: e.target.value })}
              aria-label="Search events by name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-organizer">
              <Filter size={14} /> Organizer
            </label>
            <input
              id="filter-organizer"
              type="text"
              placeholder="Search by organizer"
              value={filters.organizer}
              onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}
              aria-label="  Search events by organizer name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-category">Category</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              aria-label="Filter events by category"
            >
              <option value="">All Categories</option>
              {[...new Set(events.map((e) => e.category))].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Enhanced Type Filter with explicit options */}
          <div className="filter-group">
            <label htmlFor="filter-type">Type</label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              aria-label="Filter events by type"
              className={filters.type ? "filter-selected" : ""}
            >
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-status">Status</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              aria-label="Filter events by status"
            >
              <option value="">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            className="btn-reset"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
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
            <p>No events found matching your filters.</p>
            {(filters.eventName || filters.organizer || filters.category || filters.type || filters.status) && (
              <button className="btn-outline" onClick={resetFilters}>
                Clear Filters
              </button>
            )}
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
                  <th>Attendees</th>
                  <th>Type</th>
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
                      {e.currentAttendees || 0}/{e.maxAttendees || "∞"}
                    </td>
                    <td>
                      <span className={`type-badge ${e.eventType?.toLowerCase()}`}>
                        {e.eventType || "Public"}
                      </span>
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
                          aria-label={`View details for ${e.title}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(e, "event")}
                          title="Delete"
                          aria-label={`Delete ${e.title}`}
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

  // Organizers with NEW Filters
  const renderOrganizers = () => (
    <div className="content">
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Organizers</h2>
          <span className="card-count">{filteredOrganizers.length} Total</span>
        </div>

        {/* NEW: Organizer Filters */}
        <div className="filters-section" role="search" aria-label="Organizer Filters">
          <div className="filter-group">
            <label htmlFor="organizer-filter-id">
              <Filter size={14} /> Organizer ID
            </label>
            <input
              id="organizer-filter-id"
              type="text"
              placeholder="Search by ID (exact)"
              value={organizerFilters.id}
              onChange={(e) => setOrganizerFilters({ ...organizerFilters, id: e.target.value })}
              aria-label="Search organizers by ID"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="organizer-filter-name">
              <Filter size={14} /> Organizer Name
            </label>
            <input
              id="organizer-filter-name"
              type="text"
              placeholder="Search by name"
              value={organizerFilters.name}
              onChange={(e) => setOrganizerFilters({ ...organizerFilters, name: e.target.value })}
              aria-label="Search organizers by name"
            />
          </div>

          <button
            className="btn-reset"
            onClick={resetOrganizerFilters}
            aria-label="Reset organizer filters"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={40} />
            <p>Loading organizers...</p>
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div className="no-data">
            <User size={48} />
            <p>No organizers found matching your filters.</p>
            {(organizerFilters.id || organizerFilters.name) && (
              <button className="btn-outline" onClick={resetOrganizerFilters}>
                Clear Filters
              </button>
            )}
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
                {filteredOrganizers.map((o) => (
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
                          aria-label={`Edit ${o.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(o, "organizer")}
                          title="Delete"
                          aria-label={`Delete ${o.name}`}
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

  // Visitors with NEW Filters
  const renderVisitors = () => (
    <div className="content">
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>Visitors</h2>
          <span className="card-count">{filteredVisitors.length} Total</span>
        </div>

        {/* NEW: Visitor Filters */}
        <div className="filters-section" role="search" aria-label="Visitor Filters">
          <div className="filter-group">
            <label htmlFor="visitor-filter-id">
              <Filter size={14} /> Visitor ID
            </label>
            <input
              id="visitor-filter-id"
              type="text"
              placeholder="Search by ID (exact)"
              value={visitorFilters.id}
              onChange={(e) => setVisitorFilters({ ...visitorFilters, id: e.target.value })}
              aria-label="Search visitors by ID"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="visitor-filter-name">
              <Filter size={14} /> Visitor Name
            </label>
            <input
              id="visitor-filter-name"
              type="text"
              placeholder="Search by name"
              value={visitorFilters.name}
              onChange={(e) => setVisitorFilters({ ...visitorFilters, name: e.target.value })}
              aria-label="Search visitors by name"
            />
          </div>

          <button
            className="btn-reset"
            onClick={resetVisitorFilters}
            aria-label="Reset visitor filters"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <Loader className="spinner" size={40} />
            <p>Loading visitors...</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="no-data">
            <Users size={48} />
            <p>No visitors found matching your filters.</p>
            {(visitorFilters.id || visitorFilters.name) && (
              <button className="btn-outline" onClick={resetVisitorFilters}>
                Clear Filters
              </button>
            )}
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
                {filteredVisitors.map((v) => (
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
                          aria-label={`Edit ${v.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => openDeleteModal(v, "visitor")}
                          title="Delete"
                          aria-label={`Delete ${v.name}`}
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

  // Create Organizer Form - UPDATED: No Role field, Added Confirm Password, New Layout
  const renderCreateOrganizer = () => (
    <section className="create-organizer">
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      {success && <div className="alert alert-success" role="alert">{success}</div>}
      {passwordError && <div className="alert alert-error" role="alert">{passwordError}</div>}

      <div className="form-header">
        <div className="form-header-icon">
          <UserPlus size={32} />
        </div>
        <h2>Create New Organizer</h2>
        <p>Add a new organizer to manage events</p>
      </div>

      <form className="organizer-form" onSubmit={handleCreateOrganizer}>
        {/* Row 1: Name and Email side-by-side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="organizer-name">Full Name *</label>
            <input
              id="organizer-name"
              type="text"
              value={newOrganizer.name}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, name: e.target.value })
              }
              placeholder="Enter full name"
              required
              aria-required="true"
            />
          </div>
          <div className="form-group">
            <label htmlFor="organizer-email">Email *</label>
            <input
              id="organizer-email"
              type="email"
              value={newOrganizer.email}
              onChange={(e) =>
                setNewOrganizer({ ...newOrganizer, email: e.target.value })
              }
              placeholder="Enter email"
              required
              aria-required="true"
            />
          </div>
        </div>

        {/* Row 2: Password and Confirm Password side-by-side */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="organizer-password">Password *</label>
            <input
              id="organizer-password"
              type="password"
              value={newOrganizer.password}
              onChange={(e) => {
                setNewOrganizer({ ...newOrganizer, password: e.target.value });
                setPasswordError("");
              }}
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
              aria-required="true"
              aria-describedby={passwordError ? "password-error" : undefined}
            />
          </div>
          <div className="form-group">
            <label htmlFor="organizer-confirm-password">Confirm Password *</label>
            <input
              id="organizer-confirm-password"
              type="password"
              value={newOrganizer.confirmPassword}
              onChange={(e) => {
                setNewOrganizer({ ...newOrganizer, confirmPassword: e.target.value });
                setPasswordError("");
              }}
              placeholder="Re-enter password"
              required
              minLength={6}
              aria-required="true"
              aria-describedby={passwordError ? "password-error" : undefined}
            />
          </div>
        </div>

        {/* Inline password error display */}
        {passwordError && (
          <div id="password-error" className="inline-error" role="alert">
            {passwordError}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setNewOrganizer({ name: "", email: "", password: "", confirmPassword: "" });
              setPasswordError("");
            }}
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
          <button
            className="modal-close"
            onClick={() => setShowEventDetailModal(false)}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {currentItem && (
          <div className="event-details">
            {currentItem.imageUrl && (
              <div className="detail-row detail-row-image">
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
              <strong>Category:</strong>
              <span>{currentItem.category || "N/A"}</span>
            </div>
            <div className="detail-row">
              <strong>Type:</strong>
              <span className={`type-badge ${currentItem.eventType?.toLowerCase()}`}>
                {currentItem.eventType || "Public"}
              </span>
            </div>
            {currentItem.eventType === "PRIVATE" && currentItem.privateCode && (
              <div className="detail-row">
                <strong>Private Code:</strong>
                <span className="private-code">{currentItem.privateCode}</span>
              </div>
            )}
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
          <button
            className="btn-outline"
            onClick={() => setShowEventDetailModal(false)}
          >
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
          <button
            className="modal-close"
            onClick={() => setShowEditModal(false)}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label htmlFor="edit-name">Name *</label>
            <input
              id="edit-name"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">Email *</label>
            <input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-password">New Password (leave empty to keep current)</label>
            <input
              id="edit-password"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Enter new password"
              minLength={6}
            />
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setShowEditModal(false)}
            >
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
          <button
            className="modal-close"
            onClick={() => setShowDeleteModal(false)}
            aria-label="Close modal"
          >
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

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <div className="modal-actions">
          <button
            className="btn-outline"
            onClick={() => setShowDeleteModal(false)}
          >
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

  // Enhanced Profile Modal with View/Edit modes
  const renderProfileModal = () => (
    <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
      <div
        className="modal-content profile-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Admin Profile</h3>
          <button
            className="modal-close"
            onClick={() => {
              setShowProfileModal(false);
              setIsEditingProfile(false);
              setError("");
            }}
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="alert">{success}</div>}

        <div className="profile-container">
          {!isEditingProfile ? (
            /* View Mode */
            <div className="profile-view-card">
              <div className="profile-avatar-wrapper">
                <img
                  src={adminProfile?.imageUrl || "/src/assets/EZ-logo1.png"}
                  alt="Admin Profile"
                  className="profile-avatar"
                />
              </div>
              <div className="profile-details">
                <h3 className="profile-name">{adminProfile?.name || "Admin"}</h3>
                <p className="profile-email">{adminProfile?.email || ""}</p>
                <span className="role-badge">Admin</span>
                <div className="profile-meta">
                  <div className="meta-item">
                    <span className="meta-label">Mobile:</span>
                    <span className="meta-value">
                      {adminProfile?.mobileNumber || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="btn-primary"
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit size={18} /> Edit Profile
              </button>
            </div>
          ) : (
            /* Edit Mode */
            <form className="profile-edit-form" onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Profile Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleProfileImageUpload(file);
                    }}
                    className="file-input"
                    id="profile-image-upload"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="profile-image-upload" className="upload-label">
                    <Upload size={18} />
                    {uploadingImage
                      ? "Uploading..."
                      : profileForm.imageUrl
                      ? "Change Image"
                      : "Upload Image"}
                  </label>
                  {profileForm.imageUrl && (
                    <div className="image-preview profile-preview">
                      <img src={profileForm.imageUrl} alt="Profile preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">
                  Name *
                </label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">
                  Email (Cannot be changed)
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input disabled"
                  value={profileForm.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-mobile">
                  Mobile Number
                </label>
                <input
                  id="profile-mobile"
                  type="tel"
                  className="form-input"
                  value={profileForm.mobileNumber || ""}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, mobileNumber: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-password">
                  New Password (leave empty to keep current)
                </label>
                <input
                  id="profile-password"
                  type="password"
                  className="form-input"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, password: e.target.value })
                  }
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="spinner-small" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setError("");
                    loadAdminProfile();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
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