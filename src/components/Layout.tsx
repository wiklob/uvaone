import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="app-title">UvA<span>One</span></h1>
          <p className="app-subtitle">University of Amsterdam</p>
        </div>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📚</span>
            <span>My Courses</span>
          </NavLink>

          <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📅</span>
            <span>Schedule</span>
          </NavLink>

          <NavLink to="/grades" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📊</span>
            <span>Grades</span>
          </NavLink>

          <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">💬</span>
            <span>Messages</span>
          </NavLink>

          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📖</span>
            <span>Library</span>
          </NavLink>

          <NavLink to="/dining" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🍽️</span>
            <span>Dining</span>
          </NavLink>

          <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🗺️</span>
            <span>Campus Map</span>
          </NavLink>

          <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🎓</span>
            <span>Services</span>
          </NavLink>

          <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🎉</span>
            <span>Events</span>
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <NavLink to="/profile" className="profile-link">
            <div className="profile-avatar">JD</div>
            <div className="profile-info">
              <div className="profile-name">John Doe</div>
              <div className="profile-id">Student ID: 12345678</div>
            </div>
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}