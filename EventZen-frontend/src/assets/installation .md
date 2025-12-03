# 📅 EventZen Admin Calendar - Installation Guide

## 🎯 Overview
This guide will help you integrate the Admin Calendar feature into your existing EventZen application.

---

## 📦 Step 1: Install Required NPM Packages

Open your terminal in the frontend directory and run:

```bash
cd D:\EventZen-frontend
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

**Package Details:**
- `@fullcalendar/react` - React wrapper for FullCalendar
- `@fullcalendar/daygrid` - Month view plugin
- `@fullcalendar/timegrid` - Week and day view plugins
- `@fullcalendar/interaction` - Click and hover interactions

---

## 📁 Step 2: Create New Frontend Files

Create these new files with the code from the artifacts:

### 2.1 Create Admin Calendar Page
```
D:\EventZen-frontend\src\pages\admin\AdminCalendarPage.jsx
```
✅ Copy code from artifact: **AdminCalendarPage.jsx**

### 2.2 Create Calendar Components Directory
```bash
mkdir D:\EventZen-frontend\src\components\calendar
```

### 2.3 Create Calendar Components
```
D:\EventZen-frontend\src\components\calendar\CalendarView.jsx
```
✅ Copy code from artifacts: **CalendarView.jsx - Part 1/2** and **Part 2/2**

```
D:\EventZen-frontend\src\components\calendar\CalendarToolbar.jsx
```
✅ Copy code from artifact: **CalendarToolbar.jsx**

```
D:\EventZen-frontend\src\components\calendar\EventModal.jsx
```
✅ Copy code from artifacts: **EventModal.jsx - Part 1/2** and **Part 2/2**

### 2.4 Create Calendar CSS
```
D:\EventZen-frontend\src\styles\calendar.css
```
✅ Copy code from artifacts: **calendar.css - Part 1/3**, **Part 2/3**, and **Part 3/3**

---

## 🔄 Step 3: Update Existing Frontend Files

### 3.1 Update AppRoutes.jsx
**File:** `D:\EventZen-frontend\src\AppRoutes.jsx`

✅ Replace entire file with code from artifact: **AppRoutes.jsx - Updated with Calendar Route**

### 3.2 Update adminService.js
**File:** `D:\EventZen-frontend\src\services\adminService.js`

✅ Replace entire file with code from artifact: **adminService.js - Updated with Calendar APIs**

### 3.3 Update Sidebar (in AdminDashboard.jsx)

**File:** `D:\EventZen-frontend\src\pages\AdminDashboard.jsx`

Find the `renderSidebarAdmin()` function and add the Calendar button after the Analytics button:

```javascript
<button
  className={`ad-nav-btn ${activeSection === "calendar" ? "ad-active" : ""}`}
  onClick={() => {
    navigate("/admin/calendar"); // Navigate to calendar route
    setSidebarOpen(false);
  }}
  aria-label="Calendar View"
>
  <Calendar size={20} />
  <div className="ad-nav-btn-content">
    <span>Calendar</span>
  </div>
</button>
```

---

## 🔧 Step 4: Update Backend Files

### 4.1 Update EventController.java
**File:** `D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\EventController.java`

✅ Replace entire file with code from artifact: **EventController.java - Calendar Endpoints Added**

### 4.2 Update EventServiceImpl.java
**File:** `D:\EventZen-backend\eventzen\src\main\java\com\eventzen\service\impl\EventServiceImpl.java`

✅ Add the new methods from artifact: **EventServiceImpl.java - Calendar Methods Added**

**Important:** Don't replace the entire file, just add these new methods:
- `getEventsForCalendar()`
- `getAllCategories()`
- `getAllCities()`
- `adminUpdateEvent()`

Add these imports at the top:
```java
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.Collections;
```

### 4.3 Update EventRepository.java
**File:** `D:\EventZen-backend\eventzen\src\main\java\com\eventzen\repository\EventRepository.java`

✅ Replace entire file with code from artifact: **EventRepository.java - Calendar Queries Added**

### 4.4 (Optional) Add Database Migration
**File:** `D:\EventZen-backend\eventzen\src\main\resources\db\migration\V3__events_calendar_indexes.sql`

✅ Create new file with code from artifact: **V3__events_calendar_indexes.sql**

This improves calendar query performance. If you don't use Flyway, run the SQL manually in your database.

---

## ✅ Step 5: Verify Installation

### 5.1 Check File Structure
Your project should now have:

```
EventZen-frontend/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       └── AdminCalendarPage.jsx ✅ NEW
│   ├── components/
│   │   └── calendar/ ✅ NEW FOLDER
│   │       ├── CalendarView.jsx ✅ NEW
│   │       ├── CalendarToolbar.jsx ✅ NEW
│   │       └── EventModal.jsx ✅ NEW
│   ├── services/
│   │   └── adminService.js ✅ UPDATED
│   ├── styles/
│   │   └── calendar.css ✅ NEW
│   └── AppRoutes.jsx ✅ UPDATED

EventZen-backend/
└── src/main/java/com/eventzen/
    ├── controller/
    │   └── EventController.java ✅ UPDATED
    ├── service/impl/
    │   └── EventServiceImpl.java ✅ UPDATED
    └── repository/
        └── EventRepository.java ✅ UPDATED
```

### 5.2 Start Both Servers

**Backend:**
```bash
cd D:\EventZen-backend\eventzen
mvn spring-boot:run
```

**Frontend:**
```bash
cd D:\EventZen-frontend
npm run dev
```

### 5.3 Test the Calendar

1. Login as Admin
2. Navigate to Admin Dashboard
3. Click **Calendar** in the sidebar
4. You should see the calendar view with all events
5. Test filters, view switching, and event editing

---

## 🎨 Features Implemented

✅ **Calendar Views:**
- Month View (default)
- Week View
- Day View

✅ **Filters:**
- Filter by Category
- Filter by City
- Filter by Organizer
- Filter by Event Type (Public/Private)

✅ **Event Interactions:**
- Hover tooltip showing event details
- Click event to open edit modal
- Admin can edit all fields
- All events visible (public, private, completed, upcoming)

✅ **Design:**
- Matches existing admin dashboard theme
- Fully responsive (mobile, tablet, desktop)
- Smooth animations and transitions

✅ **Restrictions:**
- ❌ No drag & drop
- ❌ No resize
- ❌ No drag to change date/time
- ✅ Editing ONLY through modal

---

## 🐛 Troubleshooting

### Issue: Calendar not loading
**Solution:** Check browser console for errors. Verify FullCalendar packages are installed.

### Issue: "Cannot find module @fullcalendar/react"
**Solution:** Run `npm install` again in the frontend directory.

### Issue: Backend 404 on /admin/events/calendar
**Solution:** Verify EventController.java has the `@GetMapping("/admin/calendar")` endpoint.

### Issue: Events not displaying
**Solution:** Check backend console for SQL errors. Verify Event entity has startDate/endDate fields.

### Issue: Calendar styling broken
**Solution:** Verify calendar.css is imported in AdminCalendarPage.jsx

---

## 📚 Additional Notes

1. **Date/Time Format:** Backend expects `yyyy-MM-dd` for dates and `HH:mm` for times
2. **Timezone:** Calendar uses local timezone by default
3. **Performance:** Database indexes are recommended for large datasets
4. **Security:** All calendar endpoints require ADMIN role authentication

---

## 🎉 You're Done!

Your EventZen Admin Calendar is now fully integrated! Admin users can now:
- View all events in a beautiful calendar interface
- Switch between month, week, and day views
- Filter events by multiple criteria
- Edit any event through the modal interface

Enjoy your new calendar feature! 🎊