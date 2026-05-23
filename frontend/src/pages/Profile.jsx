import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usuarioService, uploadService } from '../services/api';
import { extractFotoUrl } from '../utils/photo';
import { User, Mail, Phone, Calendar, MapPin, Shield, Edit2, Save, X, Lock, Eye, EyeOff, Camera, Upload, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  
  // Estados para validación de contraseña
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  
  // Estados para cámara y subida de foto
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Función para validar la contraseña
  const validatePassword = (password) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  // Función para verificar si las contraseñas coinciden
  const checkPasswordsMatch = (pass, confirm) => {
    setPasswordsMatch(pass === confirm && pass !== '');
  };

  // Validar si la contraseña es completamente segura
  const isPasswordStrong = () => {
    return Object.values(passwordValidation).every(v => v === true);
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (field, value) => {
    const newPasswordData = { ...passwordData, [field]: value };
    setPasswordData(newPasswordData);
    
    if (field === 'new_password') {
      validatePassword(value);
      checkPasswordsMatch(value, newPasswordData.confirm_password);
    }
    if (field === 'confirm_password') {
      checkPasswordsMatch(newPasswordData.new_password, value);
    }
  };

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

  // Limpiar cámara al desmontar
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Iniciar cámara
  const startCamera = async () => {
    setCapturedPhoto(null);
    setShowCamera(true);
    try {
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 480, height: 480, facingMode: 'user' },
            audio: false
          });
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (innerErr) {
          console.error("Error al acceder a stream de cámara:", innerErr);
          setAlertModal({
            show: true,
            message: 'No se pudo activar la cámara. Verifica los permisos del navegador.',
            type: 'error'
          });
          setShowCamera(false);
        }
      }, 300);
    } catch (err) {
      console.error("Error al iniciar cámara:", err);
      setShowCamera(false);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturedPhoto(null);
  };

  // Capturar foto desde el video
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedPhoto({
            file,
            preview: URL.createObjectURL(blob)
          });
        }
      }, 'image/jpeg', 0.95);
    }
  };

  // Volver a tomar la foto
  const retakePhoto = () => {
    setCapturedPhoto(null);
    setTimeout(() => {
      if (videoRef.current && cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }
    }, 100);
  };

  // Subir la foto (de archivo o cámara) a Cloudinary
  const handleUploadPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const response = await uploadService.uploadProfilePhoto(file);
      const newFotoUrl = extractFotoUrl(response);
      if (newFotoUrl) {
        const userId = user.id_usuario || user.id;
        const updateResponse = await usuarioService.update(userId, { foto_perfil_url: newFotoUrl });
        
        if (updateResponse.data?.usuario) {
          updateUser(updateResponse.data.usuario);
        }
        
        setAlertModal({
          show: true,
          message: 'Foto de perfil actualizada exitosamente.',
          type: 'success'
        });
        
        stopCamera();
      } else {
        throw new Error("No se recibió la URL de la foto");
      }
    } catch (err) {
      console.error("Error al actualizar foto de perfil:", err);
      setAlertModal({
        show: true,
        message: err.response?.data?.message || 'Error al subir la imagen.',
        type: 'error'
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Manejar selección de archivo local
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAlertModal({ show: true, message: 'Por favor, selecciona un archivo de imagen válido.', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setAlertModal({ show: true, message: 'La imagen excede el tamaño máximo permitido de 5MB.', type: 'error' });
        return;
      }
      handleUploadPhoto(file);
    }
  };

  const getRoleName = (roleId) => {
    switch(Number(roleId)) {
      case 1: return 'Administrador';
      case 2: return 'Médico';
      case 3: return 'Paciente';
      case 4: return 'Secretaria';
      default: return 'Usuario';
    }
  };

  const getRoleColor = (roleId) => {
    switch(Number(roleId)) {
      case 1: return '#ea5455';
      case 2: return '#0d6efd';
      case 3: return '#28c76f';
      case 4: return '#764ba2';
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
    
    // Validaciones mejoradas
    if (!passwordData.new_password) {
      setAlertModal({ show: true, message: 'Ingrese una nueva contraseña', type: 'error' });
      return;
    }
    
    if (!isPasswordStrong()) {
      setAlertModal({ 
        show: true, 
        message: 'La contraseña no cumple con todos los requisitos de seguridad', 
        type: 'error' 
      });
      return;
    }
    
    if (!passwordsMatch) {
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
      setPasswordValidation({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      setPasswordsMatch(false);
      
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
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: user?.foto_perfil_url
                ? 'none'
                : `linear-gradient(135deg, ${getRoleColor(userRoleId)} 0%, #764ba2 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 'bold',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '3px solid white',
              position: 'relative'
            }}>
              {user?.foto_perfil_url ? (
                <img 
                  src={user.foto_perfil_url} 
                  alt="Perfil" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                (formData.primer_nombre?.charAt(0) || 'U').toUpperCase()
              )}
              
              {uploadingPhoto && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <RefreshCw className="animate-spin" size={24} />
                </div>
              )}
            </div>
            <div style={{
              position: 'absolute',
              bottom: '-5px',
              right: '-5px',
              display: 'flex',
              gap: '4px',
              zIndex: 3
            }}>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Subir Imagen"
                disabled={uploadingPhoto}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#0d6efd',
                  border: '2px solid white',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  padding: 0
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Upload size={12} />
              </button>
              <button 
                type="button"
                onClick={startCamera}
                title="Usar Cámara"
                disabled={uploadingPhoto}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#28c76f',
                  border: '2px solid white',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  padding: 0
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={12} />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
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

    {/* Modal Cambiar Contraseña con validación mejorada */}
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
        <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '500px', width: '90%', backgroundColor: 'white' }}>
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
                  onChange={(e) => handlePasswordChange('new_password', e.target.value)}
                  required
                  style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: `2px solid ${isPasswordStrong() ? '#28c76f' : '#ddd'}`,
                    width: '100%', 
                    paddingRight: '40px' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Lista de requisitos de contraseña */}
              <div style={{ marginTop: '10px', fontSize: '13px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: '600', fontSize: '12px', color: '#666' }}>
                  La contraseña debe cumplir:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {passwordValidation.length ? <CheckCircle size={14} color="#28c76f" /> : <XCircle size={14} color="#ea5455" />}
                    <span style={{ color: passwordValidation.length ? '#28c76f' : '#666' }}>Mínimo 8 caracteres</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {passwordValidation.uppercase ? <CheckCircle size={14} color="#28c76f" /> : <XCircle size={14} color="#ea5455" />}
                    <span style={{ color: passwordValidation.uppercase ? '#28c76f' : '#666' }}>Una letra mayúscula</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {passwordValidation.lowercase ? <CheckCircle size={14} color="#28c76f" /> : <XCircle size={14} color="#ea5455" />}
                    <span style={{ color: passwordValidation.lowercase ? '#28c76f' : '#666' }}>Una letra minúscula</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {passwordValidation.number ? <CheckCircle size={14} color="#28c76f" /> : <XCircle size={14} color="#ea5455" />}
                    <span style={{ color: passwordValidation.number ? '#28c76f' : '#666' }}>Un número</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', gridColumn: '1 / -1' }}>
                    {passwordValidation.special ? <CheckCircle size={14} color="#28c76f" /> : <XCircle size={14} color="#ea5455" />}
                    <span style={{ color: passwordValidation.special ? '#28c76f' : '#666' }}>Un caracter especial (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>🔑 Confirmar Nueva Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirm_password}
                  onChange={(e) => handlePasswordChange('confirm_password', e.target.value)}
                  required
                  style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    border: `2px solid ${passwordsMatch ? '#28c76f' : '#ddd'}`,
                    width: '100%', 
                    paddingRight: '40px' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordData.confirm_password && (
                <div style={{ marginTop: '5px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {passwordsMatch ? 
                    <><CheckCircle size={12} color="#28c76f" /><span style={{ color: '#28c76f' }}>Las contraseñas coinciden</span></> : 
                    <><XCircle size={12} color="#ea5455" /><span style={{ color: '#ea5455' }}>Las contraseñas no coinciden</span></>
                  }
                </div>
              )}
            </div>
            
            {/* Indicador de fortaleza de contraseña */}
            {passwordData.new_password && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ 
                  height: '4px', 
                  background: '#e0e0e0', 
                  borderRadius: '2px', 
                  overflow: 'hidden',
                  marginBottom: '5px'
                }}>
                  <div style={{ 
                    width: `${Object.values(passwordValidation).filter(v => v === true).length * 20}%`, 
                    height: '100%', 
                    background: isPasswordStrong() ? '#28c76f' : Object.values(passwordValidation).filter(v => v === true).length >= 3 ? '#ff9f43' : '#ea5455',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ fontSize: '11px', margin: 0, color: '#666' }}>
                  Fortaleza: {Object.values(passwordValidation).filter(v => v === true).length === 5 ? 'Muy fuerte' : 
                             Object.values(passwordValidation).filter(v => v === true).length >= 3 ? 'Media' : 'Débil'}
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !isPasswordStrong() || !passwordsMatch}
              >
                <Save size={18} /> {loading ? 'Guardando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal de Cámara */}
    {showCamera && (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1050 
      }}>
        <div className="card animate-fade-in" style={{ 
          padding: '24px', 
          maxWidth: '450px', 
          width: '90%', 
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-pink-hover)' }}>
              <Camera size={20} /> Tomar Foto de Perfil
            </h3>
            <button 
              type="button" 
              onClick={stopCamera}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ 
            width: '100%', 
            aspectRatio: '1', 
            backgroundColor: '#111', 
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
            marginBottom: '20px'
          }}>
            {!capturedPhoto ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: 'scaleX(-1)'
                }}
              />
            ) : (
              <img 
                src={capturedPhoto.preview} 
                alt="Captura" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            )}
            
            {uploadingPhoto && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                gap: '12px',
                zIndex: 4
              }}>
                <RefreshCw className="animate-spin" size={32} />
                <span style={{ fontWeight: '500' }}>Subiendo a Cloudinary...</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
            {!capturedPhoto ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={stopCamera}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={capturePhoto}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Camera size={18} /> Capturar Foto
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={retakePhoto}
                  disabled={uploadingPhoto}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <RefreshCw size={18} /> Volver a Tomar
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleUploadPhoto(capturedPhoto.file)}
                  disabled={uploadingPhoto}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={18} /> Usar Foto
                </button>
              </>
            )}
          </div>
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