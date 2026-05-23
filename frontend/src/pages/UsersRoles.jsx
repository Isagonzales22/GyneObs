import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api';
import { Shield, Search, Trash2, Plus, X, Save, Edit2, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker';
import UserAvatar from '../components/UserAvatar';

const UsersRoles = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [formData, setFormData] = useState({
    id_rol: '',
    correo_electronico: '',
    password: '',
    confirmPassword: '',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    ci: '',
    complemento_ci: '',
    telefono: '',
    fecha_nacimiento: '',
    sexo: '',
    direccion: ''
  });

  const roleMap = {
    'ADMINISTRADOR': 1,
    'MEDICO': 2,
    'PACIENTE': 3,
    'SECRETARIA': 4
  };

  const getCurrentRole = (usuario) => {
    if (usuario.rol?.nombre_rol) {
      if (usuario.rol.nombre_rol.startsWith('MEDICO')) return 'MEDICO';
      if (usuario.rol.nombre_rol.startsWith('PACIENTE')) return 'PACIENTE';
      if (usuario.rol.nombre_rol.startsWith('SECRETARIA')) return 'SECRETARIA';
      return usuario.rol.nombre_rol;
    }
    if (typeof usuario.rol === 'string') {
      if (usuario.rol.startsWith('MEDICO')) return 'MEDICO';
      if (usuario.rol.startsWith('PACIENTE')) return 'PACIENTE';
      if (usuario.rol.startsWith('SECRETARIA')) return 'SECRETARIA';
      return usuario.rol;
    }
    if (usuario.id_rol) {
      if (Number(usuario.id_rol) === 1) return 'ADMINISTRADOR';
      if (Number(usuario.id_rol) === 2) return 'MEDICO';
      if (Number(usuario.id_rol) === 3) return 'PACIENTE';
      if (Number(usuario.id_rol) === 4) return 'SECRETARIA';
      const roleEntry = Object.entries(roleMap).find(([_, id]) => id === Number(usuario.id_rol));
      if (roleEntry) return roleEntry[0];
    }
    return 'PACIENTE';
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usuarioService.getAll();
      
      let usersData = [];
      if (response.data?.usuarios) {
        usersData = response.data.usuarios;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users", error);
      setAlertModal({ 
        show: true, 
        message: 'Error al cargar los usuarios', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (!formData.id_rol) {
      setAlertModal({ show: true, message: 'Seleccione un rol', type: 'error' });
      return;
    }
    if (!formData.correo_electronico) {
      setAlertModal({ show: true, message: 'Ingrese un correo electrónico', type: 'error' });
      return;
    }
    if (!formData.password) {
      setAlertModal({ show: true, message: 'Ingrese una contraseña', type: 'error' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setAlertModal({ show: true, message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    if (formData.password.length < 6) {
      setAlertModal({ show: true, message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    if (!formData.primer_nombre) {
      setAlertModal({ show: true, message: 'Ingrese el primer nombre', type: 'error' });
      return;
    }
    if (!formData.primer_apellido) {
      setAlertModal({ show: true, message: 'Ingrese el primer apellido', type: 'error' });
      return;
    }

    try {
      const payload = {
        id_rol: parseInt(formData.id_rol),
        correo_electronico: formData.correo_electronico,
        password: formData.password,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre || null,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido || null,
        ci: formData.ci || null,
        complemento_ci: formData.complemento_ci || null,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        sexo: formData.sexo || null,
        direccion: formData.direccion || null,
        foto_perfil_url: fotoPerfilUrl || null,
      };

      await usuarioService.create(payload);
      
      setAlertModal({ show: true, message: 'Usuario creado exitosamente', type: 'success' });
      setShowCreateModal(false);
      resetForm();
      await fetchUsers();
      
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMsg = error.response?.data?.message || 'Error al crear usuario';
      setAlertModal({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    try {
      const payload = {
        id_rol: parseInt(formData.id_rol),
        correo_electronico: formData.correo_electronico,
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre || null,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido || null,
        ci: formData.ci || null,
        complemento_ci: formData.complemento_ci || null,
        telefono: formData.telefono || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        sexo: formData.sexo || null,
        direccion: formData.direccion || null,
        foto_perfil_url: fotoPerfilUrl || null,
      };

      // Si hay contraseña nueva, incluirla
      if (formData.password) {
        if (formData.password.length < 6) {
          setAlertModal({ show: true, message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setAlertModal({ show: true, message: 'Las contraseñas no coinciden', type: 'error' });
          return;
        }
        payload.password = formData.password;
      }

      await usuarioService.update(editingUser.id_usuario || editingUser.id, payload);
      
      setAlertModal({ show: true, message: 'Usuario actualizado exitosamente', type: 'success' });
      setShowEditModal(false);
      setEditingUser(null);
      resetForm();
      await fetchUsers();
      
    } catch (error) {
      console.error("Error editing user:", error);
      const errorMsg = error.response?.data?.message || 'Error al actualizar usuario';
      setAlertModal({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const openEditModal = (user) => {
    const userId = user.id_usuario || user.id;
    const userRole = getCurrentRole(user);
    const roleId = roleMap[userRole] || user.id_rol || '';
    
    setEditingUser(user);
    setFormData({
      id_rol: roleId.toString(),
      correo_electronico: user.correo_electronico || user.correoElectronico || '',
      password: '',
      confirmPassword: '',
      primer_nombre: user.primer_nombre || user.nombre || '',
      segundo_nombre: user.segundo_nombre || '',
      primer_apellido: user.primer_apellido || user.apellido || '',
      segundo_apellido: user.segundo_apellido || '',
      ci: user.ci || '',
      complemento_ci: user.complemento_ci || '',
      telefono: user.telefono || '',
      fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
      sexo: user.sexo || '',
      direccion: user.direccion || ''
    });
    setFotoPerfilUrl(user.foto_perfil_url || null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFotoPerfilUrl(null);
    setFormData({
      id_rol: '',
      correo_electronico: '',
      password: '',
      confirmPassword: '',
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      ci: '',
      complemento_ci: '',
      telefono: '',
      fecha_nacimiento: '',
      sexo: '',
      direccion: ''
    });
  };

  const handleRoleChange = async (userId, newRoleName) => {
    if (updatingUserId === userId) return;
    
    const id_rol = roleMap[newRoleName];
    if (!id_rol) {
      setAlertModal({ show: true, message: 'Rol inválido', type: 'error' });
      return;
    }
    
    try {
      setUpdatingUserId(userId);
      
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if ((user.id_usuario || user.id) === userId) {
            return {
              ...user,
              rol: { ...user.rol, nombre_rol: newRoleName },
              id_rol: id_rol
            };
          }
          return user;
        })
      );
      
      await usuarioService.update(userId, { id_rol });
      
      setAlertModal({ 
        show: true, 
        message: `Rol actualizado a ${newRoleName} correctamente`, 
        type: 'success' 
      });
      
      await fetchUsers();
      
    } catch (error) {
      console.error("Error updating role", error);
      await fetchUsers();
      setAlertModal({ 
        show: true, 
        message: error.response?.data?.message || 'No se pudo actualizar el rol', 
        type: 'error' 
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      await usuarioService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      await fetchUsers();
      setAlertModal({ show: true, message: 'Usuario desactivado correctamente', type: 'success' });
    } catch (error) {
      console.error("Error al eliminar", error);
      setAlertModal({ show: true, message: 'Error al eliminar usuario', type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const rol = getCurrentRole(u);
    const nombre = u.primer_nombre || u.nombre || '';
    const apellido = u.primer_apellido || u.apellido || '';
    const email = u.correo_electronico || u.correoElectronico || '';
    
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
           apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
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
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar personal por nombre, rol o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div>Cargando usuarios...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Personal</th>
                  <th style={{ padding: '12px' }}>Correo</th>
                  <th style={{ padding: '12px' }}>Rol</th>
                  <th style={{ padding: '12px' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const userId = u.id_usuario || u.id;
                    const currentRole = getCurrentRole(u);
                    const isUpdating = updatingUserId === userId;
                    const nombreCompleto = `${u.primer_nombre || u.nombre || ''} ${u.primer_apellido || u.apellido || ''}`.trim();
                    const email = u.correo_electronico || u.correoElectronico || '';
                    const estado = u.estado !== undefined ? u.estado : (u.activo !== undefined ? u.activo : true);
                    
                    return (
                      <tr key={userId} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserAvatar user={u} size={32} fallbackName={nombreCompleto} />
                          <span>{nombreCompleto || 'Sin nombre'}</span>
                        </td>
                        <td style={{ padding: '12px' }}>{email}</td>
                        <td style={{ padding: '12px' }}>
                          <select 
                            value={currentRole}
                            onChange={(e) => handleRoleChange(userId, e.target.value)}
                            disabled={isUpdating}
                            style={{ 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: '600',
                              backgroundColor: currentRole === 'ADMINISTRADOR' ? 'rgba(255, 105, 180, 0.15)' : 
                                            currentRole === 'MEDICO' ? 'rgba(0, 191, 255, 0.15)' :
                                            currentRole === 'PACIENTE' ? 'rgba(40, 199, 111, 0.15)' :
                                            'rgba(118, 75, 162, 0.15)',
                              color: currentRole === 'ADMINISTRADOR' ? '#d63384' : 
                                     currentRole === 'MEDICO' ? '#0d6efd' :
                                     currentRole === 'PACIENTE' ? '#28c76f' :
                                     '#764ba2',
                              border: '1px solid rgba(0,0,0,0.1)',
                              cursor: isUpdating ? 'wait' : 'pointer',
                              opacity: isUpdating ? 0.6 : 1,
                              transition: 'all 0.2s'
                            }}
                          >
                            <option value="ADMINISTRADOR">👑 ADMINISTRADOR</option>
                            <option value="MEDICO">👨‍⚕️ MEDICO</option>
                            <option value="PACIENTE">🩺 PACIENTE</option>
                            <option value="SECRETARIA">💼 SECRETARIA</option>
                          </select>
                          {isUpdating && (
                            <span style={{ marginLeft: '8px', fontSize: '11px', color: '#666' }}>
                              Actualizando...
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: estado ? 'rgba(40, 199, 111, 0.15)' : 'rgba(234, 84, 85, 0.15)',
                            color: estado ? '#28c76f' : '#ea5455'
                          }}>
                            {estado ? 'ACTIVO' : 'INACTIVO'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="btn btn-secondary" 
                              style={{ 
                                padding: '6px', 
                                width: '32px',
                                height: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px'
                              }} 
                              onClick={() => openEditModal(u)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ 
                                padding: '6px', 
                                width: '32px',
                                height: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px'
                              }} 
                              onClick={() => setDeleteModal({ 
                                show: true, 
                                id: userId, 
                                name: nombreCompleto || 'este usuario' 
                              })}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      {showCreateModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{ 
            padding: '30px', 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>➕ Crear Nuevo Usuario</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px' }} 
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <ProfilePhotoPicker
                value={fotoPerfilUrl}
                onChange={setFotoPerfilUrl}
                label="Foto de perfil (opcional)"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                <div className="form-group">
                  <label>👤 Rol *</label>
                  <select
                    value={formData.id_rol}
                    onChange={(e) => setFormData({...formData, id_rol: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  >
                    <option value="">-- Seleccionar Rol --</option>
                    <option value="1">👑 ADMINISTRADOR</option>
                    <option value="2">👨‍⚕️ MEDICO</option>
                    <option value="3">🩺 PACIENTE</option>
                    <option value="4">💼 SECRETARIA</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>📧 Correo Electrónico *</label>
                  <input
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) => setFormData({...formData, correo_electronico: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🔒 Contraseña *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🔒 Confirmar Contraseña *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Primer Nombre *</label>
                  <input
                    type="text"
                    value={formData.primer_nombre}
                    onChange={(e) => setFormData({...formData, primer_nombre: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Segundo Nombre</label>
                  <input
                    type="text"
                    value={formData.segundo_nombre}
                    onChange={(e) => setFormData({...formData, segundo_nombre: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Primer Apellido *</label>
                  <input
                    type="text"
                    value={formData.primer_apellido}
                    onChange={(e) => setFormData({...formData, primer_apellido: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Segundo Apellido</label>
                  <input
                    type="text"
                    value={formData.segundo_apellido}
                    onChange={(e) => setFormData({...formData, segundo_apellido: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🆔 CI</label>
                  <input
                    type="text"
                    value={formData.ci}
                    onChange={(e) => setFormData({...formData, ci: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📎 Complemento CI</label>
                  <input
                    type="text"
                    value={formData.complemento_ci}
                    onChange={(e) => setFormData({...formData, complemento_ci: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📞 Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🎂 Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>⚥ Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>📍 Dirección</label>
                  <textarea
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    rows="2"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {showEditModal && editingUser && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          overflowY: 'auto'
        }}>
          <div className="card animate-fade-in" style={{ 
            padding: '30px', 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>✏️ Editar Usuario</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '6px' }} 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleEditUser}>
              <ProfilePhotoPicker
                value={fotoPerfilUrl}
                onChange={setFotoPerfilUrl}
                label="Foto de perfil"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                <div className="form-group">
                  <label>👤 Rol *</label>
                  <select
                    value={formData.id_rol}
                    onChange={(e) => setFormData({...formData, id_rol: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  >
                    <option value="">-- Seleccionar Rol --</option>
                    <option value="1">👑 ADMINISTRADOR</option>
                    <option value="2">👨‍⚕️ MEDICO</option>
                    <option value="3">🩺 PACIENTE</option>
                    <option value="4">💼 SECRETARIA</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>📧 Correo Electrónico *</label>
                  <input
                    type="email"
                    value={formData.correo_electronico}
                    onChange={(e) => setFormData({...formData, correo_electronico: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🔒 Nueva Contraseña (opcional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Dejar en blanco para no cambiar"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🔒 Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Dejar en blanco para no cambiar"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Primer Nombre *</label>
                  <input
                    type="text"
                    value={formData.primer_nombre}
                    onChange={(e) => setFormData({...formData, primer_nombre: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Segundo Nombre</label>
                  <input
                    type="text"
                    value={formData.segundo_nombre}
                    onChange={(e) => setFormData({...formData, segundo_nombre: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Primer Apellido *</label>
                  <input
                    type="text"
                    value={formData.primer_apellido}
                    onChange={(e) => setFormData({...formData, primer_apellido: e.target.value})}
                    required
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📛 Segundo Apellido</label>
                  <input
                    type="text"
                    value={formData.segundo_apellido}
                    onChange={(e) => setFormData({...formData, segundo_apellido: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🆔 CI</label>
                  <input
                    type="text"
                    value={formData.ci}
                    onChange={(e) => setFormData({...formData, ci: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📎 Complemento CI</label>
                  <input
                    type="text"
                    value={formData.complemento_ci}
                    onChange={(e) => setFormData({...formData, complemento_ci: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>📞 Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>🎂 Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>

                <div className="form-group">
                  <label>⚥ Sexo</label>
                  <select
                    value={formData.sexo}
                    onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  >
                    <option value="">-- Seleccionar --</option>
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>📍 Dirección</label>
                  <textarea
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    rows="2"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                  resetForm();
                }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {deleteModal.show && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Desactivar Usuario?</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
              Estás a punto de desactivar al usuario <strong>{deleteModal.name}</strong>. 
              El usuario no podrá acceder al sistema pero sus datos se conservarán.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Sí, Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Modal de alerta */}
    {alertModal.show && (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1100 
      }}>
        <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
          {alertModal.type === 'error' ? 
            <Shield size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : 
            <User size={48} color="#28c76f" style={{ marginBottom: '15px' }} />
          }
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }} 
            onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}
          >
            Aceptar
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default UsersRoles;