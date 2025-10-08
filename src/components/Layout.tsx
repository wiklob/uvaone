import { useState, useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Calendar,
  BarChart3,
  MessageSquare,
  Library,
  UtensilsCrossed,
  Map,
  GraduationCap,
  PartyPopper,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="layout">
      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="header-content">
            <img src="/logo/logo_new_white.png" alt="UvA Logo" className="sidebar-logo" />
            {!isCollapsed && (
              <button
                className="toggle-btn"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="nav-links">
          {isCollapsed && (
            <button
              className="toggle-btn-collapsed"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
            >
              <span className="nav-icon"><PanelRightClose size={20} /></span>
            </button>
          )}
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Dashboard">
            <span className="nav-icon"><Home size={20} /></span>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="My Courses">
            <span className="nav-icon"><BookOpen size={20} /></span>
            {!isCollapsed && <span>My Courses</span>}
          </NavLink>

          <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Schedule">
            <span className="nav-icon"><Calendar size={20} /></span>
            {!isCollapsed && <span>Schedule</span>}
          </NavLink>

          <NavLink to="/grades" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Grades">
            <span className="nav-icon"><BarChart3 size={20} /></span>
            {!isCollapsed && <span>Grades</span>}
          </NavLink>

          <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Messages">
            <span className="nav-icon"><MessageSquare size={20} /></span>
            {!isCollapsed && <span>Messages</span>}
          </NavLink>

          <NavLink to="/library" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Library">
            <span className="nav-icon"><Library size={20} /></span>
            {!isCollapsed && <span>Library</span>}
          </NavLink>

          <NavLink to="/dining" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Dining">
            <span className="nav-icon"><UtensilsCrossed size={20} /></span>
            {!isCollapsed && <span>Dining</span>}
          </NavLink>

          <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Campus Map">
            <span className="nav-icon"><Map size={20} /></span>
            {!isCollapsed && <span>Campus Map</span>}
          </NavLink>

          <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Services">
            <span className="nav-icon"><GraduationCap size={20} /></span>
            {!isCollapsed && <span>Services</span>}
          </NavLink>

          <NavLink to="/events" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} title="Events">
            <span className="nav-icon"><PartyPopper size={20} /></span>
            {!isCollapsed && <span>Events</span>}
          </NavLink>
        </div>

        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="demo-mode-badge">
              <span className="demo-badge-icon">👤</span>
              <div className="demo-badge-content">
                <div className="demo-badge-title">Demo Mode</div>
                <div className="demo-badge-user">Daan Peters</div>
              </div>
            </div>
          )}
          <NavLink to="/profile" className="profile-link" title="Profile">
            <div className="profile-avatar">DP</div>
            {!isCollapsed && (
              <div className="profile-info">
                <div className="profile-name">Daan Peters</div>
                <div className="profile-id">Student ID: 77777777</div>
              </div>
            )}
          </NavLink>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}