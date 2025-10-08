# UvAOne Implementation Notes

## Overview
This document describes the implementation of the Dashboard, My Courses, and Schedule pages with full database integration support.

## What Was Implemented

### 1. Database Types (`src/types/database.ts`)
Complete TypeScript types matching the Supabase database schema including:
- User, Course, CourseEnrollment
- Event, Lesson, Room, Facility
- Assignment, Submission, Material
- Announcement, College, CourseGroup
- Helper types for joined queries (EventWithDetails, AssignmentWithSubmission, etc.)

### 2. Dashboard Page (`src/pages/Dashboard.tsx`)

**Features Implemented:**
- **Today's Schedule** (full width at top)
  - Shows all events scheduled for today
  - Displays course code, title, time, location
  - Indicates online vs. physical classes
  - Shows event type (lecture, lab, tutorial, etc.)

- **Quick Stats Cards**
  - Active Courses count
  - Current GPA
  - Upcoming Deadlines (next 7 days)
  - Credits Progress (earned/total)

- **Upcoming Deadlines**
  - Shows assignments due in next 7-14 days
  - Displays submission status (pending, submitted, graded)
  - Highlights urgent deadlines (≤2 days)
  - Shows grades and feedback for graded work

- **Announcements & Alerts** (merged)
  - Course and college announcements
  - Recent grade notifications (last 7 days)
  - Priority indicators (urgent, high, normal, low)
  - Relative timestamps ("2 hours ago")
  - Course context for each item

**Hook:** `src/hooks/useDashboard.ts`
- Fetches all dashboard data
- Currently uses mock data
- Ready for Supabase integration (queries commented in code)

### 3. My Courses Page (`src/pages/Courses.tsx`)

**Two View Modes:**

#### A. By Course View (Default)
- Grid layout of course cards
- Each card shows:
  - Course code, title, description
  - ECTS credits
  - Period, language, contact hours
  - Pending assignments count
  - Current grade (if available)
  - Quick actions (View Materials, Announcements)

#### B. By Content View (Tab-based)
Four content tabs:

**📝 Assignments Tab**
- All assignments across courses
- Filterable by status (all, upcoming, submitted, graded)
- Shows: title, course, type, points, weight, due date
- Displays submission status and grades
- Shows feedback for graded work

**📚 Materials Tab**
- All course materials in one place
- Grouped by course
- Filterable by type (books, videos, articles, slides)
- "Required Only" checkbox filter
- Shows: title, authors, publication year, availability
- Direct access links
- ISBN numbers for books

**📢 Announcements Tab**
- All course announcements
- Priority badges (urgent, high, normal)
- Course context
- Author information
- Timestamps

**📊 Grades Tab**
- All graded assignments
- Shows grade, percentage, feedback
- Grading date
- Course and assignment context

**Hook:** `src/hooks/useCourses.ts`
- Manages view mode state
- Fetches courses, assignments, materials, announcements
- Currently uses mock data

### 4. Schedule Page (`src/pages/Schedule.tsx`)

**Features:**
- Week view calendar (Monday-Friday, 8AM-6PM)
- Color-coded by course (consistent across app)
- Event type icons (🎓 lecture, 🧪 lab, 👨‍🏫 tutorial, 💼 seminar)
- Shows time, location, course code
- Online vs. physical location indicators
- Navigation: Previous Week, Today, Next Week
- Highlights current day
- Hover effects with event details
- Legend for event types

**Hook:** `src/hooks/useSchedule.ts`
- Fetches events for date range
- Handles recurring events (WEEKLY, MONTHLY, DAILY)
- Expands recurring events into instances
- Filters by user's enrolled courses and groups

### 5. Calendar Page (`src/pages/Calendar.tsx`)

**Features:**
- Multiple view modes: Month, Week, Day, Agenda
- Integrates with database events and assignments
- Shows classes, assignments, exams, personal events
- Color-coded by course (same as Schedule)
- Event filters (toggle classes, assignments, exams, etc.)
- Personal event CRUD (localStorage)
- Navigation controls for each view
- Event selection and details

**Hook:** `src/hooks/useCalendar.ts`
- Fetches database events and assignments for current view
- Converts database events to calendar format
- Manages personal events (localStorage)
- Handles event filtering
- Generates recurring event instances
- Calculates appropriate date ranges for each view mode

## Database Integration

### Current State ✅
All pages are **fully connected to Supabase** with real database queries. The application runs in demo mode with a fixed demo user (Daan Peters).

### Implementation Details

**Demo User:**
- Name: Daan Peters (CS student)
- ID: `77777777-7777-7777-7777-777777777777`
- Enrolled in 4 courses: Programming, Algorithms, Web Development, Calculus
- All data fetched from actual Supabase database

**Environment Variables:**
```env
VITE_SUPABASE_URL=https://gxquazeakfxqwiwkrixk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Connected Hooks:**

1. **useDashboard.ts** ✅
   - Fetches enrolled courses from `course_enrollments`
   - Fetches today's events with full joins (event → lesson → course → room → facility)
   - Fetches upcoming assignments with submissions
   - Fetches announcements filtered by user's courses
   - Fetches recent grades from last 7 days
   - Calculates GPA from actual submission grades
   - Merges announcements and grades into single feed

2. **useCourses.ts** ✅
   - Fetches all enrolled courses with counts
   - Fetches all assignments across courses with submission status
   - Fetches all course materials with full details
   - Fetches all announcements from enrolled courses
   - Supports both "by-course" and "by-content" views

3. **useSchedule.ts** ✅
   - Fetches events for enrolled courses only
   - Full joins for course, room, and facility information
   - Client-side expansion of recurring events (WEEKLY, MONTHLY, DAILY)
   - Filters events by date range

4. **useCalendar.ts** ✅
   - Fetches database events and assignments for current view
   - Dynamically calculates date ranges for month/week/day/agenda views
   - Expands recurring events client-side
   - Converts database events to calendar format
   - Manages personal events in localStorage
   - Event filtering by type

**Demo Mode Indicator:**
- Yellow badge in sidebar footer showing "Demo Mode" and current demo user
- Profile updated to show "Daan Peters" instead of "John Doe"

## Key Design Decisions

1. **Database Integration Complete**: All hooks now fetch real data from Supabase instead of using mock data

2. **Demo Mode**: Fixed demo user (Daan Peters) for consistent demonstration without authentication

3. **Consistent Color Coding**: Courses use deterministic color assignment based on course code hash

4. **Merged Announcements & Grades**: Dashboard combines announcements and grade notifications in a single feed

5. **Content-First Navigation**: My Courses offers both course-centric and content-centric views

6. **Recurring Events**: Client-side expansion of WEEKLY/MONTHLY/DAILY recurring events for performance

7. **TypeScript Types**: Complete type safety with database schema types

8. **Read-Only Mode**: No write operations - all dynamic features (add course, submit assignment) are placeholder buttons only

## File Structure
```
src/
├── types/
│   ├── database.ts          # Database schema types
│   ├── calendar.ts          # Calendar-specific types
│   └── index.ts             # Legacy types
├── hooks/
│   ├── useDashboard.ts     # Dashboard data hook
│   ├── useCourses.ts       # Courses data hook
│   ├── useSchedule.ts      # Schedule data hook
│   └── useCalendar.ts      # Calendar data hook (integrated)
├── pages/
│   ├── Dashboard.tsx       # Dashboard page
│   ├── Dashboard.css
│   ├── Courses.tsx         # My Courses page
│   ├── Courses.css
│   ├── Schedule.tsx        # Schedule page
│   ├── Schedule.css
│   ├── Calendar.tsx        # Calendar page (integrated)
│   └── Calendar.css
└── lib/
    └── supabase.ts         # Supabase client
```

## Next Steps

1. **Implement Authentication** (Future)
   - Supabase Auth integration
   - Dynamic user login/logout
   - Row Level Security (RLS) policies
   - Handle login/logout states

2. **Add Write Operations** (Future)
   - Assignment submission functionality
   - Personal event creation/editing/deletion in database
   - Course enrollment management
   - Profile updates

3. **Add RPC Functions** (Optional)
   - GPA calculation (currently done client-side)
   - Attendance percentage
   - Grade statistics
   - Performance optimizations

4. **Enhance Features** (Future)
   - Material downloads
   - Advanced event filtering
   - Search functionality across all content
   - Real-time notification system
   - Email notifications for announcements/grades

## Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173 (or next available port)
```

## Browser Testing

Navigate to:
- **Dashboard**: http://localhost:5178/
- **My Courses**: http://localhost:5178/courses
- **Schedule**: http://localhost:5178/schedule
- **Calendar**: http://localhost:5178/calendar

Toggle between view modes, test filters, and explore all features with the rich mock data.

### Calendar Integration Notes:
- Calendar now uses the same database event structure as Dashboard and Schedule
- Events are automatically converted from database format to calendar format
- Assignments appear as all-day events with due dates
- Personal events (localStorage) still work alongside database events
- All views (month/week/day/agenda) dynamically load appropriate date ranges
- Color coding is consistent across Calendar, Schedule, and Courses pages
