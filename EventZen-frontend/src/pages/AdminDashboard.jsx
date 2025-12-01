// ================================================================
// FILE: src/pages/AdminDashboard.jsx (PART 1/2)
// 🆕 UPDATED: Added mobile menu, organizer filter, Analytics integration, profile image upload fix
// Changes:
// - Mobile hamburger menu with open/close
// - Organizer click redirects to Events with filter
// - Analytics section integrated
// - Profile image upload with preview
// - Date/Time utilities imported and used
// ================================================================

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
  CircleX,
  ChartBarStacked,
  Menu
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
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage";
import { 
  formatDateDDMMYYYY, 
  formatTimeAMPM, 
  sortEventsByDateTime,
  getEventStatus 
} from "../utils/dateTime";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("events");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🆕 NEW: Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [visitors, setVisitors] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);

  // 🆕 NEW: Organizer filter from Analytics/Organizers page
  const [organizerFilter, setOrganizerFilter] = useState(null);

  // Filter states for Events
  const [filters, setFilters] = useState({
    organizer: "",
    category: "",
    type: "",
    status: "",
    eventName: "",
  });

  // Filter states for Organizers
  const [organizerFilters, setOrganizerFilters] = useState({
    id: "",
    name: "",
  });

  // Filter states for Visitors
  const [visitorFilters, setVisitorFilters] = useState({
    id: "",
    name: "",
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editType, setEditType] = useState("");

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Form states
  const [newOrganizer, setNewOrganizer] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    imageUrl: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    loadData();
  }, [activeSection]);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, events, organizerFilter]);

  useEffect(() => {
    applyOrganizerFilters();
  }, [organizerFilters, organizers]);

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
        mobileNumber: profile.mobileNumber || "",
        imageUrl: profile.imageUrl || "",
      });
      setImagePreview(profile.imageUrl || null);
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
        setFilteredEvents(sortEventsByDateTime(data));
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

    // 🆕 NEW: Apply organizer filter if set
    if (organizerFilter) {
      filtered = filtered.filter((e) => e.organizerId === organizerFilter.id);
    }

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

    if (filters.eventName) {
      filtered = filtered.filter((e) =>
        e.title?.toLowerCase().includes(filters.eventName.toLowerCase())
      );
    }

    // 🆕 UPDATED: Sort filtered events
    setFilteredEvents(sortEventsByDateTime(filtered));
  };

  const applyOrganizerFilters = () => {
    let filtered = [...organizers];

    if (organizerFilters.id) {
      filtered = filtered.filter((o) =>
        o.id.toString() === organizerFilters.id.toString()
      );
    }

    if (organizerFilters.name) {
      filtered = filtered.filter((o) =>
        o.name?.toLowerCase().includes(organizerFilters.name.toLowerCase())
      );
    }

    setFilteredOrganizers(filtered);
  };

  const applyVisitorFilters = () => {
    let filtered = [...visitors];

    if (visitorFilters.id) {
      filtered = filtered.filter((v) =>
        v.id.toString() === visitorFilters.id.toString()
      );
    }

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
    setOrganizerFilter(null);
  };

  const resetOrganizerFilters = () => {
    setOrganizerFilters({
      id: "",
      name: "",
    });
  };

  const resetVisitorFilters = () => {
    setVisitorFilters({
      id: "",
      name: "",
    });
  };

  const getOrganizerEventCount = (organizerId) => {
    return events.filter((e) => e.organizerId === organizerId).length;
  };

  // 🆕 NEW: Handle organizer click - redirect to Events with filter
  const handleOrganizerClick = (organizer) => {
    setOrganizerFilter(organizer);
    setActiveSection("events");
    setSidebarOpen(false);
  };

  // 🆕 NEW: Clear organizer filter
  const clearOrganizerFilter = () => {
    setOrganizerFilter(null);
  };

  const handleCreateOrganizer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setPasswordError("");

    if (newOrganizer.password !== newOrganizer.confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
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

  // Continued in Part 2...
  // ================================================================
// FILE: src/pages/AdminDashboard.jsx (PART 2/2)
// Continuation from Part 1 - Handlers and Render Functions
// ================================================================

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

  // 🆕 UPDATED: Profile image upload with preview
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
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("file", file);

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
      const updated = await updateAdminProfile({
        name: profileForm.name,
        mobileNumber: profileForm.mobileNumber,
        imageUrl: profileForm.imageUrl,
      });
      
      setAdminProfile(updated);
      setImagePreview(updated.imageUrl || null);

      if (passwordForm.currentPassword && passwordForm.newPassword) {
        try {
          await fetch("/api/users/password", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              currentPassword: passwordForm.currentPassword,
              newPassword: passwordForm.newPassword,
            }),
          });

          setSuccess("Profile and password updated successfully!");
          setPasswordForm({ currentPassword: "", newPassword: "" });
        } catch (passErr) {
          console.error("Error updating password:", passErr);
          setError("Failed to update password. Please check your current password.");
          setLoading(false);
          return;
        }
      } else {
        setSuccess("Profile updated successfully!");
      }

      setIsEditingProfile(false);
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

  // Default event images
  const defaultImages = {
    Technology: "https://via.placeholder.com/400x200/667eea/ffffff?text=Technology",
    Business: "https://via.placeholder.com/400x200/f59e0b/ffffff?text=Business",
    Music: "https://via.placeholder.com/400x200/ec4899/ffffff?text=Music",
    Health: "https://via.placeholder.com/400x200/10b981/ffffff?text=Health",
    Food: "https://via.placeholder.com/400x200/f97316/ffffff?text=Food",
    Art: "https://via.placeholder.com/400x200/8b5cf6/ffffff?text=Art",
    Community: "https://via.placeholder.com/400x200/3b82f6/ffffff?text=Community",
    Entertainment: "https://via.placeholder.com/400x200/ef4444/ffffff?text=Entertainment",
    Education: "https://via.placeholder.com/400x200/06b6d4/ffffff?text=Education",
    Sports: "https://via.placeholder.com/400x200/84cc16/ffffff?text=Sports",
    Other: "https://via.placeholder.com/400x200/6b7280/ffffff?text=Event"
  };

  // 🆕 UPDATED: Sidebar with mobile support
  const renderSidebarAdmin = () => (
    <div className={`ad-sidebarAdmin ${sidebarOpen ? 'ad-open' : ''}`}>
      {/* 🆕 NEW: Close button for mobile */}
      <button 
        className="ad-sidebar-close-btn"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <X size={24} />
      </button>

      <div className="ad-logo-section">
        <div className="ad-logo-box">
          <img src="/src/assets/EZ-logo1.png" alt="logo" className="ad-logo-img-admin" />
        </div>
        <span className="ad-logo-text">EventZen</span>
      </div>

      <nav className="ad-nav-links">
        <button
          className={`ad-nav-btn ${activeSection === "events" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("events");
            setSidebarOpen(false);
          }}
          aria-label="View Events"
        >
          <Calendar size={20} />
          <div className="ad-nav-btn-content">
            <span>Events</span>
            <span className="ad-nav-count">{events.length}</span>
          </div>
        </button>
        <button
          className={`ad-nav-btn ${activeSection === "organizers" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("organizers");
            setSidebarOpen(false);
          }}
          aria-label="View Organizers"
        >
          <User size={20} />
          <div className="ad-nav-btn-content">
            <span>Organizers</span>
            <span className="ad-nav-count">{organizers.length}</span>
          </div>
        </button>
        <button
          className={`ad-nav-btn ${activeSection === "visitors" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("visitors");
            setSidebarOpen(false);
          }}
          aria-label="View Visitors"
        >
          <Users size={20} />
          <div className="ad-nav-btn-content">
            <span>Visitors</span>
            <span className="ad-nav-count">{visitors.length}</span>
          </div>
        </button>
        <button
          className={`ad-nav-btn ${activeSection === "create-organizer" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("create-organizer");
            setSidebarOpen(false);
          }}
          aria-label="Create New Organizer"
        >
          <UserPlus size={20} /> Create Organizer
        </button>
        <button
          className={`ad-nav-btn ${activeSection === "profile" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("profile");
            setIsEditingProfile(false);
            setSidebarOpen(false);
          }}
          aria-label="View Profile"
        >
          <User size={20} /> Profile
        </button>
        <button
          className={`ad-nav-btn ${activeSection === "analytics" ? "ad-active" : ""}`}
          onClick={() => {
            setActiveSection("analytics");
            setSidebarOpen(false);
          }}
          aria-label="View Analytics"
        >
          <ChartBarStacked size={20} />
          <div className="ad-nav-btn-content">
            <span>Analytics</span>
          </div>
        </button>
      </nav>
    </div>
  );

  // 🆕 UPDATED: Topbar with hamburger menu
  const renderTopbar = () => (
    <div className="ad-topbar">
      {/* 🆕 NEW: Hamburger menu button */}
      <button 
        className="ad-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>
      
      <h1>Admin Dashboard</h1>
      <div className="ad-topbar-actions">
        <button className="ad-btn-primary" onClick={handleLogout} aria-label="Logout">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  // Render functions continue in Part 3 (Events, Organizers, Visitors sections)...
  // ================================================================
// FILE: src/pages/AdminDashboard.jsx (PART 3/5)
// Events and Organizers Render Functions
// 🆕 UPDATED: Added 4 new date/time columns, organizer filter display, organizer click handler
// ================================================================

  // 🆕 UPDATED: Events Section with new date/time columns and organizer filter
  const renderEvents = () => (
    <div className="ad-content">
      {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}
      {success && <div className="ad-alert ad-alert-success" role="alert">{success}</div>}

      <div className="ad-card">
        <div className="ad-card-header">
          <h2>Events Overview</h2>
          <span className="ad-card-count">{filteredEvents.length} Total</span>
        </div>

        {/* 🆕 NEW: Organizer filter indicator */}
        {organizerFilter && (
          <div className="ad-active-filter">
            <span>
              <Filter size={16} />
              Filtered by Organizer: <strong>{organizerFilter.name}</strong> (ID: {organizerFilter.id})
            </span>
            <button 
              className="ad-btn-clear-filter"
              onClick={clearOrganizerFilter}
              title="Clear filter"
            >
              <X size={16} /> Clear
            </button>
          </div>
        )}

        <div className="ad-filters-section" role="search" aria-label="Event Filters">
          <div className="ad-filter-group">
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

          <div className="ad-filter-group">
            <label htmlFor="filter-organizer">
              <Filter size={14} /> Organizer
            </label>
            <input
              id="filter-organizer"
              type="text"
              placeholder="Search by organizer"
              value={filters.organizer}
              onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}
              aria-label="Search events by organizer name"
            />
          </div>

          <div className="ad-filter-group">
            <label htmlFor="filter-category">
              <ChartBarStacked size={14} /> Category
            </label>
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

          <div className="ad-filter-group">
            <label htmlFor="filter-type">Type</label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              aria-label="Filter events by type"
              className={filters.type ? "ad-filter-selected" : ""}
            >
              <option value="">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="ad-filter-group">
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
            className="ad-btn-reset"
            onClick={resetFilters}
            aria-label="Reset all filters"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="ad-loading-container">
            <Loader className="ad-spinner" size={40} />
            <p>Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="ad-no-data">
            <Calendar size={48} />
            <p>No events found matching your filters.</p>
            {(filters.eventName || filters.organizer || filters.category || filters.type || filters.status || organizerFilter) && (
              <button className="ad-btn-outline" onClick={resetFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="ad-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Organizer</th>
                  {/* 🆕 NEW: Date/Time columns */}
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
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
                    <td className="ad-td-id">{e.id}</td>
                    <td>
                      <img 
                        src={e.imageUrl || defaultImages[e.category] || defaultImages["Other"]} 
                        alt={`${e.title} event image`}
                        className="ad-org-event-thumbnail"
                      />
                    </td>
                    <td className="ad-td-title">{e.title}</td>
                    <td>{e.organizerName}</td>
                    {/* 🆕 NEW: Display formatted dates and times */}
                    <td>{formatDateDDMMYYYY(e.startDate || e.date)}</td>
                    <td>{formatDateDDMMYYYY(e.endDate || e.date)}</td>
                    <td>{formatTimeAMPM(e.startTime)}</td>
                    <td>{formatTimeAMPM(e.endTime)}</td>
                    <td>{e.category || "N/A"}</td>
                    <td>
                      {e.currentAttendees || 0}/{e.maxAttendees || "∞"}
                    </td>
                    <td>
                      <span className={`ad-type-badge ${e.eventType?.toLowerCase()}`}>
                        {e.eventType || "Public"}
                      </span>
                    </td>
                    <td>
                      <span className={`ad-status-badge ${getEventStatus(e).toLowerCase()}`}>
                        {getEventStatus(e)}
                      </span>
                    </td>
                    <td>
                      <div className="ad-action-buttons">
                        <button
                          className="ad-btn-icon ad-btn-view"
                          onClick={() => openEventDetailModal(e)}
                          title="View Details"
                          aria-label={`View details for ${e.title}`}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="ad-btn-icon ad-btn-delete"
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

  // 🆕 UPDATED: Organizers Section with click handler
  const renderOrganizers = () => (
    <div className="ad-content">
      {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}
      {success && <div className="ad-alert ad-alert-success" role="alert">{success}</div>}

      <div className="ad-card">
        <div className="ad-card-header">
          <h2>Organizers</h2>
          <span className="ad-card-count">{filteredOrganizers.length} Total</span>
        </div>

        <div className="ad-filters-section" role="search" aria-label="Organizer Filters">
          <div className="ad-filter-group">
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

          <div className="ad-filter-group">
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
            className="ad-btn-reset"
            onClick={resetOrganizerFilters}
            aria-label="Reset organizer filters"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="ad-loading-container">
            <Loader className="ad-spinner" size={40} />
            <p>Loading organizers...</p>
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div className="ad-no-data">
            <User size={48} />
            <p>No organizers found matching your filters.</p>
            {(organizerFilters.id || organizerFilters.name) && (
              <button className="ad-btn-outline" onClick={resetOrganizerFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="ad-table-wrapper">
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
                  <tr 
                    key={o.id}
                    className="ad-organizer-row"
                    onClick={() => handleOrganizerClick(o)}
                    style={{ cursor: 'pointer' }}
                    title={`Click to view events by ${o.name}`}
                  >
                    <td className="ad-td-id">{o.id}</td>
                    <td className="ad-td-name">{o.name}</td>
                    <td>{o.email}</td>
                    <td>
                      <span className="ad-event-count-badge">
                        {getOrganizerEventCount(o.id)}
                      </span>
                    </td>
                    <td>
                      <div className="ad-action-buttons">
                        <button
                          className="ad-btn-icon ad-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(o, "organizer");
                          }}
                          title="Edit"
                          aria-label={`Edit ${o.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="ad-btn-icon ad-btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(o, "organizer");
                          }}
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

  // Continues in Part 4...
  // ================================================================
// FILE: src/pages/AdminDashboard.jsx (PART 4/5)
// Visitors, Create Organizer, Profile, and Modal Render Functions
// 🆕 UPDATED: Profile with image preview, Event modal with date/time
// ================================================================

  // Visitors Section (unchanged structure, just included for completeness)
  const renderVisitors = () => (
    <div className="ad-content">
      {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}
      {success && <div className="ad-alert ad-alert-success" role="alert">{success}</div>}

      <div className="ad-card">
        <div className="ad-card-header">
          <h2>Visitors</h2>
          <span className="ad-card-count">{filteredVisitors.length} Total</span>
        </div>

        <div className="ad-filters-section" role="search" aria-label="Visitor Filters">
          <div className="ad-filter-group">
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

          <div className="ad-filter-group">
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
            className="ad-btn-reset"
            onClick={resetVisitorFilters}
            aria-label="Reset visitor filters"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        {loading ? (
          <div className="ad-loading-container">
            <Loader className="ad-spinner" size={40} />
            <p>Loading visitors...</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
          <div className="ad-no-data">
            <Users size={48} />
            <p>No visitors found matching your filters.</p>
            {(visitorFilters.id || visitorFilters.name) && (
              <button className="ad-btn-outline" onClick={resetVisitorFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="ad-table-wrapper">
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
                    <td className="ad-td-id">{v.id}</td>
                    <td className="ad-td-name">{v.name}</td>
                    <td>{v.email}</td>
                    <td>
                      <div className="ad-action-buttons">
                        <button
                          className="ad-btn-icon ad-btn-edit"
                          onClick={() => openEditModal(v, "visitor")}
                          title="Edit"
                          aria-label={`Edit ${v.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="ad-btn-icon ad-btn-delete"
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

  // Create Organizer Form (unchanged)
  const renderCreateOrganizer = () => (
    <section className="ad-create-organizer">
      {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}
      {success && <div className="ad-alert ad-alert-success" role="alert">{success}</div>}
      {passwordError && <div className="ad-alert ad-alert-error" role="alert">{passwordError}</div>}

      <div className="ad-form-header">
        <div className="ad-form-header-icon">
          <UserPlus size={28} />
        </div>
        <h2>Create New Organizer</h2>
      </div>

      <form className="ad-organizer-form" onSubmit={handleCreateOrganizer}>
        <div className="ad-form-row">
          <div className="ad-form-group">
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
          <div className="ad-form-group">
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

        <div className="ad-form-row">
          <div className="ad-form-group">
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
            />
          </div>
          <div className="ad-form-group">
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
            />
          </div>
        </div>

        {passwordError && (
          <div id="password-error" className="ad-inline-error" role="alert">
            {passwordError}
          </div>
        )}

        <div className="ad-form-actions">
          <button
            type="button"
            className="ad-btn-outline"
            onClick={() => {
              setNewOrganizer({ name: "", email: "", password: "", confirmPassword: "" });
              setPasswordError("");
            }}
          >
            Clear Form
          </button>
          <button type="submit" className="ad-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader className="ad-spinner-small" size={18} /> Creating...
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

  // 🆕 UPDATED: Profile Section with image preview
  const renderProfile = () => (
    <section className="ad-profile-page">
      <div className="ad-content">
        {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}
        {success && <div className="ad-alert ad-alert-success" role="alert">{success}</div>}

        <div className="ad-profile-container">
          {!isEditingProfile ? (
            <div className="ad-profile-view-card">
              <div className="ad-profile-avatar-wrapper">
                <img 
                  src={imagePreview || adminProfile?.imageUrl || "/src/assets/EZ-logo1.png"} 
                  alt="Admin Profile" 
                  className="ad-profile-avatar"
                />
              </div>
              <div className="ad-profile-details">
                <h3 className="ad-profile-name">{adminProfile?.name || "Admin"}</h3>
                <p className="ad-profile-email">{adminProfile?.email || ""}</p>
                <span className="ad-role-badge">Admin</span>
                <div className="ad-profile-meta">
                  <div className="ad-meta-item">
                    <span className="ad-meta-label">Mobile:</span>
                    <span className="ad-meta-value">
                      {adminProfile?.mobileNumber || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className="ad-btn ad-btn-primary-visitor" 
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit size={18} /> Edit Profile
              </button>
            </div>
          ) : (
            <form className="ad-profile-edit-form" onSubmit={handleProfileUpdate}>
              <div className="ad-form-group ad-full-width">
                <label className="ad-form-label">Profile Image</label>
                <div className="ad-image-upload-area">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      handleProfileImageUpload(file);
                    }}
                    className="ad-file-input"
                    id="admin-profile-image-upload"
                    disabled={uploadingImage}
                  />
                  <label htmlFor="admin-profile-image-upload" className="ad-upload-label">
                    <Upload size={18} />
                    {uploadingImage
                      ? "Uploading..."
                      : imagePreview
                      ? "Change Image"
                      : "Upload Image"}
                  </label>
                  {/* 🆕 NEW: Image preview */}
                  {imagePreview && (
                    <div className="ad-image-preview ad-profile-preview">
                      <img src={imagePreview} alt="Profile preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="ad-form-row-profile">
                <div className="ad-form-col">
                  <label className="ad-form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="ad-form-input"
                    required
                  />
                </div>
                
                <div className="ad-form-col">
                  <label className="ad-form-label">Email (Cannot be changed)</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="ad-form-input ad-disabled"
                  />
                </div>
              </div>

              <div className="ad-form-row-profile">
                <div className="ad-form-col">
                  <label className="ad-form-label">Mobile Number</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={profileForm.mobileNumber || ""}
                    onChange={(e) => setProfileForm({...profileForm, mobileNumber: e.target.value})}
                    placeholder="+91 9876543210"
                    className="ad-form-input"
                  />
                </div>
                
                <div className="ad-form-col">
                  <label className="ad-form-label">Role</label>
                  <input
                    type="text"
                    value="ADMIN"
                    disabled
                    className="ad-form-input ad-disabled"
                  />
                </div>
              </div>

              <div className="ad-password-section">
                <p className="ad-section-subtitle">Leave empty to keep your current password</p>
                
                <div className="ad-form-row-profile">
                  <div className="ad-form-col">
                    <label className="ad-form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                      className="ad-form-input"
                    />
                  </div>
                  
                  <div className="ad-form-col">
                    <label className="ad-form-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="Enter new password (min 6 characters)"
                      className="ad-form-input"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
              
              <div className="ad-form-actions-profile">
                <button type="submit" className="ad-btn ad-btn-primary-visitor" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader className="ad-spinner-small" size={18} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="ad-btn ad-btn-secondary"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setError("");
                    setPasswordForm({ currentPassword: "", newPassword: "" });
                    loadAdminProfile();
                  }}
                >
                  <CircleX size={18} />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );

  // 🆕 NEW: Analytics Section
  const renderAdminAnalyticsPage = () => (
    <AdminAnalyticsPage />
  );

  // Modals continue in Part 5...
  // ================================================================
// FILE: src/pages/AdminDashboard.jsx (PART 5/5)
// Modals and Main Return Statement
// 🆕 UPDATED: Event detail modal with date/time display
// ================================================================

  // 🆕 UPDATED: Event Detail Modal with date/time
  const renderEventDetailModal = () => (
    <div className="ad-modal-overlay" onClick={() => setShowEventDetailModal(false)}>
      <div
        className="ad-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="ad-modal-close"
          onClick={() => setShowEventDetailModal(false)}
          aria-label="Close modal"
        >
          ×
        </button>

        {currentItem && (
          <div className="ad-modal-body">
            <div className="ad-modal-header">
              <img
                src={currentItem.imageUrl || defaultImages[currentItem.category] || defaultImages["Other"]}
                alt={currentItem.title}
                className="ad-event-detail-image"
              />
              <h2>{currentItem.title}</h2>
            </div>

            <div className="ad-event-info">
              <p><strong>Category:</strong> {currentItem.category || "N/A"}</p>
              {/* 🆕 NEW: Display formatted date/time */}
              <p><strong>Start Date:</strong> {formatDateDDMMYYYY(currentItem.startDate || currentItem.date)}</p>
              <p><strong>End Date:</strong> {formatDateDDMMYYYY(currentItem.endDate || currentItem.date)}</p>
              <p><strong>Start Time:</strong> {formatTimeAMPM(currentItem.startTime)}</p>
              <p><strong>End Time:</strong> {formatTimeAMPM(currentItem.endTime)}</p>
              <p><strong>Location:</strong> {currentItem.location || "N/A"}</p>
              <p><strong>Organizer:</strong> {currentItem.organizerName}</p>
              {currentItem.maxAttendees && (
                <p><strong>Capacity:</strong> {currentItem.currentAttendees || 0} / {currentItem.maxAttendees}</p>
              )}
              <p><strong>Type:</strong> {currentItem.eventType === "PRIVATE" ? "🔒 Private" : "🌐 Public"}</p>
              {currentItem.eventType === "PRIVATE" && currentItem.privateCode && (
                <p><strong>Private Code:</strong> <span className="ad-private-code">{currentItem.privateCode}</span></p>
              )}
              <p><strong>Status:</strong>
                <span className={`ad-status-badge ${getEventStatus(currentItem).toLowerCase()}`}>
                  {getEventStatus(currentItem)}
                </span>
              </p>
            </div>

            <div className="ad-modal-description">
              <h3>About this Event</h3>
              <p>{currentItem.description || "No description available."}</p>
            </div>
          </div>
        )}

        <div className="ad-modal-footer">
          <button
            className="ad-btn-close"
            onClick={() => setShowEventDetailModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Modal (unchanged)
  const renderEditModal = () => (
    <div className="ad-modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="ad-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <h3>Edit {editType}</h3>
        </div>

        <form onSubmit={handleEdit}>
          <div className="ad-form-group">
            <label htmlFor="edit-name">Name *</label>
            <input
              id="edit-name"
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />
          </div>

          <div className="ad-form-group">
            <label htmlFor="edit-email">Email *</label>
            <input
              id="edit-email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="ad-form-group">
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

          {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}

          <div className="ad-modal-actions">
            <button
              type="button"
              className="ad-btn-outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="ad-btn-primary" disabled={loading}>
              {loading ? <Loader className="ad-spinner-small" size={18} /> : <Save size={18} />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Delete Modal (unchanged)
  const renderDeleteModal = () => (
    <div className="ad-modal-overlay" onClick={() => setShowDeleteModal(false)}>
      <div className="ad-modal-content ad-modal-danger" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <h3>Confirm Delete</h3>
        </div>

        <div className="ad-modal-body">
          <p>
            Are you sure you want to delete this {editType}:{" "}
            <strong>{currentItem?.name || currentItem?.title}</strong>?
          </p>
          <p className="ad-warning-text">This action cannot be undone.</p>
        </div>

        {error && <div className="ad-alert ad-alert-error" role="alert">{error}</div>}

        <div className="ad-modal-actions">
          <button
            className="ad-btn-outline"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button className="ad-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader className="ad-spinner-small" size={18} /> : <Trash2 size={18} />}
            Delete
          </button>
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
      case "profile":
        return renderProfile();
      case "analytics":
        return renderAdminAnalyticsPage();
      default:
        return renderEvents();
    }
  };

  // 🆕 UPDATED: Main Return with mobile overlay
  return (
    <div className="ad-dashboard">
      {/* 🆕 NEW: Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="ad-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {renderSidebarAdmin()}
      <div className="ad-main">
        {renderTopbar()}
        {renderContent()}
      </div>

      {/* Modals */}
      {showEditModal && renderEditModal()}
      {showDeleteModal && renderDeleteModal()}
      {showEventDetailModal && renderEventDetailModal()}
    </div>
  );
};

export default AdminDashboard;