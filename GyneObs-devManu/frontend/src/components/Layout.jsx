import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Users, Calendar, Clipboard, 
  Activity, Package, BookOpen, Pill, LogOut, Menu, X, User
} from 'lucide-react';
import { getRolDisplayName } from '../utils/roles';
import UserAvatar from './UserAvatar';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const basePath = '/app';

  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} />, roles: [1, 2, 3, 4] },
    { path: '/pacientes', label: 'Pacientes', icon: <Users size={20} />, roles: [1, 2, 4] },
    { path: '/citas', label: 'Citas Médicas', icon: <Calendar size={20} />, roles: [1, 2, 4] },
    { path: '/historial', label: 'Historial Clínico', icon: <Clipboard size={20} />, roles: [1, 2] },
    { path: '/cirugias', label: 'Cirugías', icon: <Activity size={20} />, roles: [1, 2] },
    { path: '/insumos', label: 'Insumos', icon: <Package size={20} />, roles: [1, 2] },
    { path: '/educacion', label: 'Educación', icon: <BookOpen size={20} />, roles: [1, 2, 3] },
    { path: '/recetas', label: 'Recetas', icon: <Pill size={20} />, roles: [1, 2, 3] },
    { path: '/usuarios', label: 'Gestión de Personal', icon: <Users size={20} />, roles: [1] },
    { path: '/perfil', label: 'Mi Perfil', icon: <User size={20} />, roles: [1, 2, 3, 4] },
  ];

  const navItems = allNavItems.filter(item => {
    const userRoleId = user?.rol?.id_rol || user?.id_rol;
    return item.roles.includes(Number(userRoleId));
  });

  const isAdmin = user?.rol?.id_rol === 1 || user?.id_rol === 1;
  const isMedico = user?.rol?.id_rol === 2 || user?.id_rol === 2;
  const isSecretaria = user?.rol?.id_rol === 4 || user?.id_rol === 4;

  return (
    <div className="layout-container">
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
              to={`${basePath}${item.path}`} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={item.label}
              end={item.path === '/'}
            >
              {item.icon}
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-role-badge" style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }}>
            {sidebarOpen && (
              <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
                Rol: {getRolDisplayName(user)}
              </small>
            )}
          </div>
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={20} />
            {sidebarOpen && <span className="nav-label">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="top-header glass-panel">
          <div className="header-title">
            <h3>Bienvenido, {user?.primer_nombre || user?.nombre || 'Usuario'}</h3>
          </div>
          <div className="user-profile">
            <NavLink to={`${basePath}/perfil`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserAvatar user={user} size={40} />
              <div className="user-info">
                <span className="user-name">
                  {user?.primer_nombre || user?.nombre} {user?.primer_apellido || user?.apellido}
                </span>
                <span className="user-role" style={{ 
                  backgroundColor: isAdmin ? '#ea5455' : (isMedico ? '#0d6efd' : (isSecretaria ? '#764ba2' : '#28c76f')),
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'white'
                }}>
                  {getRolDisplayName(user)}
                </span>
              </div>
            </NavLink>
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