import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Calendar, Clipboard, 
  Activity, Package, BookOpen, LogOut, Menu, X 
} from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/pacientes', label: 'Pacientes', icon: <Users size={20} /> },
    { path: '/citas', label: 'Citas Médicas', icon: <Calendar size={20} /> },
    { path: '/historial', label: 'Historial Clínico', icon: <Clipboard size={20} /> },
    { path: '/cirugias', label: 'Cirugías', icon: <Activity size={20} /> },
    { path: '/insumos', label: 'Insumos', icon: <Package size={20} /> },
    { path: '/educacion', label: 'Educación', icon: <BookOpen size={20} /> },
    { path: '/usuarios', label: 'Personal (Admin)', icon: <Users size={20} /> },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'} glass-panel`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">GO</div>
            {sidebarOpen && <h2>GyneObs</h2>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
            >
              {item.icon}
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={20} />
            {sidebarOpen && <span className="nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="top-header glass-panel">
          <div className="header-title">
            <h3>Bienvenido, {user?.nombre || 'Doctor'}</h3>
          </div>
          <div className="user-profile">
            <div className="avatar">{user?.nombre?.charAt(0) || 'D'}</div>
            <div className="user-info">
              <span className="user-name">{user?.primer_nombre || user?.nombre} {user?.primer_apellido || user?.apellido}</span>
              <span className="user-role">{user?.rol?.nombre_rol || 'Médico'}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
