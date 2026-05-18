import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api';
import { Shield, User, Search, Edit2, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UsersRoles = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const roleMap = {
    'ADMINISTRADOR': 1,
    'MEDICO': 2,
    'PACIENTE': 3,
    'ENFERMERA': 4,
    'RECEPCIONISTA': 5
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers().finally(() => setLoading(false));
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usuarioService.getAll();
      const data = response.data?.usuarios || response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleRoleChange = async (userId, newRoleName) => {
    try {
      const id_rol = roleMap[newRoleName];
      if (!id_rol) throw new Error("Rol inválido");
      
      await usuarioService.update(userId, { id_rol });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating role", error);
      setAlertModal({ show: true, message: 'No se pudo actualizar el rol', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await usuarioService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar", error);
      setAlertModal({ show: true, message: 'Error al eliminar usuario', type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const rol = u.rol?.nombre_rol || u.rol || '';
    const nombre = u.primer_nombre || u.nombre || '';
    const apellido = u.primer_apellido || u.apellido || '';
    
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
           apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rol.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const rolName = user?.rol?.nombre_rol || user?.rol;

  if (rolName !== 'ADMINISTRADOR') {
    return (
      <div className="card animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <Shield size={48} color="var(--btn-danger)" style={{ marginBottom: '20px' }} />
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos de administrador para ver esta sección.</p>
      </div>
    );
  }

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Gestión de Personal</h2>
          <p>Administración de usuarios y roles del sistema</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar personal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Cargando usuarios...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Personal</th>
                <th style={{ padding: '12px' }}>Correo</th>
                <th style={{ padding: '12px' }}>Rol</th>
                <th style={{ padding: '12px' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <tr key={u.id_usuario || u.id || i} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                      {(u.primer_nombre || u.nombre)?.charAt(0)}{(u.primer_apellido || u.apellido)?.charAt(0)}
                    </div>
                    <span>{u.primer_nombre || u.nombre} {u.primer_apellido || u.apellido}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{u.correo_electronico || u.correoElectronico}</td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={u.rol?.nombre_rol || u.rol}
                      onChange={(e) => handleRoleChange(u.id_usuario || u.id, e.target.value)}
                      style={{ 
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '500',
                        backgroundColor: (u.rol?.nombre_rol || u.rol) === 'ADMINISTRADOR' ? 'rgba(255, 105, 180, 0.1)' : 'rgba(0, 191, 255, 0.1)',
                        color: (u.rol?.nombre_rol || u.rol) === 'ADMINISTRADOR' ? 'var(--primary-pink-hover)' : 'var(--primary-blue-hover)',
                        border: '1px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                      <option value="MEDICO">MEDICO</option>
                      <option value="ENFERMERA">ENFERMERA</option>
                      <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                      <option value="PACIENTE">PACIENTE</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: u.estado || u.activo ? '#28c76f' : '#ea5455', fontWeight: '500' }}>
                      {u.estado || u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => setDeleteModal({ show: true, id: u.id_usuario || u.id, name: `${u.primer_nombre || u.nombre} ${u.primer_apellido || u.apellido}` })}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Usuario?</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Estás a punto de eliminar al usuario <strong>{deleteModal.name}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>

    {alertModal.show && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
        <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
          {alertModal.type === 'error' ? <Shield size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <User size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default UsersRoles;
