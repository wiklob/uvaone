import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useMobileDetect } from './hooks/useMobileDetect';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Calendar from './pages/Calendar';
import Grades from './pages/Grades';
import Messages from './pages/Messages';
import Library from './pages/Library';
import Dining from './pages/Dining';
import Map from './pages/Map';
import Services from './pages/Services';
import Events from './pages/Events';
import Profile from './pages/Profile';
// Mobile pages
import MobileDashboard from './pages/mobile/MobileDashboard';
import MobileMessages from './pages/mobile/MobileMessages';
import MobileNotifications from './pages/mobile/MobileNotifications';
import MobileServices from './pages/mobile/MobileServices';
import MobileCourses from './pages/mobile/MobileCourses';
import MobileCourseDetail from './pages/mobile/MobileCourseDetail';
// Mobile CSS
import './pages/mobile/mobile.css';

function AppContent() {
  const isMobile = useMobileDetect();

  if (isMobile) {
    // Mobile routes - no Layout wrapper, pages handle their own layout
    return (
      <Routes>
        <Route path="/" element={<MobileDashboard />} />
        <Route path="/timeline" element={<Navigate to="/courses/timeline" replace />} />
        <Route path="/messages" element={<MobileMessages />} />
        <Route path="/notifications" element={<MobileNotifications />} />
        <Route path="/services" element={<MobileServices />} />
        <Route path="/courses" element={<MobileCourses />} />
        <Route path="/courses/:tab" element={<MobileCourses />} />
        <Route path="/course/:id" element={<MobileCourseDetail />} />
        <Route path="/course/:id/:tab" element={<MobileCourseDetail />} />
        <Route path="/course/:id/assignment/:itemId" element={<MobileCourseDetail />} />
        <Route path="/course/:id/lesson/:itemId" element={<MobileCourseDetail />} />
        <Route path="/course/:id/announcement/:itemId" element={<MobileCourseDetail />} />
        {/* Fallback routes for desktop-only pages */}
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/library" element={<Library />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/map" element={<Map />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    );
  }

  // Desktop routes - with Layout sidebar
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:tab" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/:id/:tab" element={<CourseDetail />} />
        <Route path="/course/:id/assignment/:itemId" element={<CourseDetail />} />
        <Route path="/course/:id/lesson/:itemId" element={<CourseDetail />} />
        <Route path="/course/:id/announcement/:itemId" element={<CourseDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/grades" element={<Grades />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/library" element={<Library />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/map" element={<Map />} />
        <Route path="/services" element={<Services />} />
        <Route path="/events" element={<Events />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;