import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuarioService } from '../services/api';
import { User, Mail, Phone, Calendar, MapPin, Shield, Edit2, Save, X, Lock, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo_electronico: '',
    telefono: '',
    ci: '',
    complemento_ci: '',
    fecha_nacimiento: '',
    sexo: '',
    direccion: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        primer_nombre: user.primer_nombre || user.nombre || '',
        segundo_nombre: user.segundo_nombre || '',
        primer_apellido: user.primer_apellido || user.apellido || '',
        segundo_apellido: user.segundo_apellido || '',
        correo_electronico: user.correo_electronico || user.correoElectronico || '',
        telefono: user.telefono || '',
        ci: user.ci || '',
        complemento_ci: user.complemento_ci || '',
        fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
        sexo: user.sexo || '',
        direccion: user.direccion || ''
      });
    }
  }, [user]);

  const getRoleName = (roleId) => {
    switch(Number(roleId)) {
      case 1: return 'Administrador';
      case 2: return 'Médico';
      case 3: return 'Paciente';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (roleId) => {
    switch(Number(roleId)) {
      case 1: return '#ea5455';
      case 2: return '#0d6efd';
      case 3: return '#28c76f';
      default: return '#6c757d';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userId = user.id_usuario || user.id;
      const payload = {
        primer_nombre: formData.primer_nombre,
        segundo_nombre: formData.segundo_nombre || null,
        primer_apellido: formData.primer_apellido,
        segundo_apellido: formData.segundo_apellido || null,
        correo_electronico: formData.correo_electronico,
        telefono: formData.telefono || null,
        ci: formData.ci || null,
        complemento_ci: formData.complemento_ci || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        sexo: formData.sexo || null,
        direccion: formData.direccion || null
      };
      
      const response = await usuarioService.update(userId, payload);
      
      if (response.data?.usuario) {
        updateUser(response.data.usuario);
      }
      
      setAlertModal({ show: true, message: 'Perfil actualizado exitosamente', type: 'success' });
      setEditMode(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlertModal({ 
        show: true, 
        message: error.response?.data?.message || 'Error al actualizar perfil', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordData.new_password) {
      setAlertModal({ show: true, message: 'Ingrese una nueva contraseña', type: 'error' });
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setAlertModal({ show: true, message: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setAlertModal({ show: true, message: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }
    
    setLoading(true);
    
    try {
      const userId = user.id_usuario || user.id;
      await usuarioService.update(userId, { password: passwordData.new_password });
      
      setAlertModal({ show: true, message: 'Contraseña actualizada exitosamente', type: 'success' });
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      
    } catch (error) {
      console.error("Error changing password:", error);
      setAlertModal({ 
        show: true, 
        message: error.response?.data?.message || 'Error al cambiar contraseña', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const userRoleId = user?.rol?.id_rol || user?.id_rol;

  return (
    <>
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Mi Perfil</h2>
          <p>Gestiona tu información personal y preferencias</p>
        </div>
        {!editMode && (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            <Edit2 size={18} /> Editar Perfil
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          padding: '20px',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${getRoleColor(userRoleId)} 0%, #764ba2 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold'
          }}>
            {(formData.primer_nombre?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '24px' }}>
              {formData.primer_nombre} {formData.primer_apellido}
            </h3>
            <p style={{ margin: '5px 0 0', color: 'var(--text-muted)' }}>
              <Shield size={14} style={{ display: 'inline', marginRight: '5px' }} />
              <span style={{ 
                backgroundColor: getRoleColor(userRoleId),
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'white'
              }}>
                {getRoleName(userRoleId)}
              </span>
            </p>
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleUpdateProfile} style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
                <label>📞 Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
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
                  rows="3"
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditMode(false);
                if (user) {
                  setFormData({
                    primer_nombre: user.primer_nombre || user.nombre || '',
                    segundo_nombre: user.segundo_nombre || '',
                    primer_apellido: user.primer_apellido || user.apellido || '',
                    segundo_apellido: user.segundo_apellido || '',
                    correo_electronico: user.correo_electronico || user.correoElectronico || '',
                    telefono: user.telefono || '',
                    ci: user.ci || '',
                    complemento_ci: user.complemento_ci || '',
                    fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
                    sexo: user.sexo || '',
                    direccion: user.direccion || ''
                  });
                }
              }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Nombre Completo</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  {formData.primer_nombre} {formData.segundo_nombre} {formData.primer_apellido} {formData.segundo_apellido}
                </p>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Correo Electrónico</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  <Mail size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  {formData.correo_electronico}
                </p>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Teléfono</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  <Phone size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  {formData.telefono || 'No especificado'}
                </p>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>CI</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  {formData.ci || 'No especificado'} {formData.complemento_ci && `- ${formData.complemento_ci}`}
                </p>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fecha de Nacimiento</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  <Calendar size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  {formatDate(formData.fecha_nacimiento)}
                </p>
              </div>
              
              <div>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Sexo</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  {formData.sexo || 'No especificado'}
                </p>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Dirección</label>
                <p style={{ margin: '5px 0 0', fontWeight: '500' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  {formData.direccion || 'No especificada'}
                </p>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowPasswordModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Lock size={18} /> Cambiar Contraseña
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Modal Cambiar Contraseña */}
    {showPasswordModal && (
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
        <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '450px', width: '90%', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>🔒 Cambiar Contraseña</h3>
            <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setShowPasswordModal(false)}>
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>🔑 Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>🔑 Confirmar Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  required
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Save size={18} /> {loading ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal de Alerta */}
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

export default Profile;