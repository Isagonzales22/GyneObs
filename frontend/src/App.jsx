import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UsersRoles from './pages/UsersRoles';
import PatientsList from './pages/PatientsList';
import PatientDetail from './pages/PatientDetail';
import Citas from './pages/Citas';
import Cirugias from './pages/Cirugias';
import Insumos from './pages/Insumos';
import Educacion from './pages/Educacion';
import Profile from './pages/Profile';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary-pink)' }}>Cargando Sistema...</div>;
  return user ? children : <Navigate to="/login" />;
};



function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="usuarios" element={<UsersRoles />} />
        <Route path="pacientes" element={<PatientsList />} />
        <Route path="pacientes/:id" element={<PatientDetail />} />
        <Route path="citas" element={<Citas />} />
        <Route path="historial" element={<PatientDetail />} />
        <Route path="cirugias" element={<Cirugias />} />
        <Route path="insumos" element={<Insumos />} />
        <Route path="educacion" element={<Educacion />} />
        <Route path="perfil" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
