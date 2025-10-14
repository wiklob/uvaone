import { NavLink } from 'react-router-dom';
import { Home, Calendar, MessageSquare, Bell, GraduationCap } from 'lucide-react';
import './GlobalBottomNav.css';

export default function GlobalBottomNav() {
  const navItems = [
    { path: '/', label: 'Dash', Icon: Home },
    { path: '/timeline', label: 'Time', Icon: Calendar },
    { path: '/messages', label: 'Msgs', Icon: MessageSquare },
    { path: '/notifications', label: 'Notif', Icon: Bell },
    { path: '/services', label: 'Serv', Icon: GraduationCap }
  ];

  return (
    <nav className="global-bottom-nav">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">
            <item.Icon size={20} />
          </span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
