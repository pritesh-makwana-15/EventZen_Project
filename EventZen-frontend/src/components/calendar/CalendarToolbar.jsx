// ================================================================
// FILE: D:\EventZen-frontend\src\components\calendar\CalendarToolbar.jsx
// Calendar Toolbar - View switcher, navigation, and filters
// ================================================================

import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Filter, RotateCcw } from "lucide-react";

const CalendarToolbar = ({
  currentView,
  currentDate,
  filters,
  categories,
  cities,
  organizers,
  onViewChange,
  onNavigate,
  onFilterChange,
}) => {
  
  const formatTitle = () => {
    const options = { year: 'numeric', month: 'long' };
    if (currentView === 'timeGridWeek') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (currentView === 'timeGridDay') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      });
    }
    return currentDate.toLocaleDateString('en-US', options);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const resetFilters = () => {
    onFilterChange({
      category: "",
      city: "",
      organizerId: "",
      eventType: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="cal-toolbar">
      {/* Navigation Section */}
      <div className="cal-toolbar-nav">
        <button 
          className="cal-btn cal-btn-icon"
          onClick={() => onNavigate('prev')}
          title="Previous"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button 
          className="cal-btn cal-btn-today"
          onClick={() => onNavigate('today')}
        >
          <Calendar size={18} />
          Today
        </button>
        
        <button 
          className="cal-btn cal-btn-icon"
          onClick={() => onNavigate('next')}
          title="Next"
        >
          <ChevronRight size={20} />
        </button>
        
        <h2 className="cal-toolbar-title">{formatTitle()}</h2>
      </div>

      {/* View Switcher */}
      <div className="cal-toolbar-views">
        <button
          className={`cal-btn cal-btn-view ${currentView === 'dayGridMonth' ? 'cal-active' : ''}`}
          onClick={() => onViewChange('dayGridMonth')}
        >
          Month
        </button>
        <button
          className={`cal-btn cal-btn-view ${currentView === 'timeGridWeek' ? 'cal-active' : ''}`}
          onClick={() => onViewChange('timeGridWeek')}
        >
          Week
        </button>
        <button
          className={`cal-btn cal-btn-view ${currentView === 'timeGridDay' ? 'cal-active' : ''}`}
          onClick={() => onViewChange('timeGridDay')}
        >
          Day
        </button>
      </div>

      {/* Filters Section */}
      <div className="cal-toolbar-filters">
        <div className="cal-filter-group">
          <Filter size={16} />
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="cal-filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="cal-filter-group">
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="cal-filter-select"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="cal-filter-group">
          <select
            value={filters.organizerId}
            onChange={(e) => handleFilterChange('organizerId', e.target.value)}
            className="cal-filter-select"
          >
            <option value="">All Organizers</option>
            {organizers.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        <div className="cal-filter-group">
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="cal-filter-select"
          >
            <option value="">All Types</option>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="cal-btn cal-btn-reset"
            onClick={resetFilters}
            title="Reset Filters"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default CalendarToolbar;