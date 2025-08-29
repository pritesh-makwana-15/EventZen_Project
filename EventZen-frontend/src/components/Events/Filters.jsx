// src/components/Filters.jsx
import React from "react";
import "../../styles/Events styling/filter.css"

export default function Filters({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
}) {
   // Reset all filters
  const handleReset = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setLocationFilter("");
  };

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Search by event name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  <option value="">All Categories</option>
  <option value="Music">Music</option>
  <option value="Technology">Technology</option>
  <option value="Business">Business</option>
  <option value="Food">Food</option>
  <option value="Dance">Dance</option>
  <option value="Art">Art</option>
  <option value="Sports">Sports</option>
  <option value="Education">Education</option>
  <option value="Entertainment">Entertainment</option>
  <option value="Wellness">Wellness</option>
  <option value="Literature">Literature</option>
  <option value="Comedy">Comedy</option>
  <option value="Photography">Photography</option>
  <option value="Fashion">Fashion</option>
  <option value="Gaming">Gaming</option>
  <option value="Adventure">Adventure</option>
  <option value="Science">Science</option>
  <option value="Cultural">Cultural</option>
  <option value="Festival">Festival</option>
  <option value="Theatre">Theatre</option>
  <option value="Travel">Travel</option>
  <option value="Environment">Environment</option>
</select>


      <select
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
      >
        <option value="">All Locations</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Delhi">Delhi</option>
        <option value="Bangalore">Bangalore</option>
        <option value="Pune">Pune</option>
        <option value="Chennai">Chennai</option>
        <option value="Hyderabad">Hyderabad</option>
        <option value="Goa">Goa</option>
        <option value="Kolkata">Kolkata</option>
      </select>

      <div className="filter-buttons">
        {/* <button onClick={handleSearch}>Search</button> */}
        <button className="reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
