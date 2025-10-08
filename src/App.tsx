import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Calendar from './pages/Calendar';
import Grades from './pages/Grades';
import Messages from './pages/Messages';
import Library from './pages/Library';
import Dining from './pages/Dining';
import Map from './pages/Map';
import Services from './pages/Services';
import Events from './pages/Events';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/schedule" element={<Calendar />} />
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
    </Router>
  );
}

export default App;