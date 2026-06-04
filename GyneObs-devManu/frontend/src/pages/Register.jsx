import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, User, Eye, EyeOff, CheckCircle, XCircle, Phone, MapPin, Calendar, IdCard, Camera, Upload, RefreshCw, X, Save } from 'lucide-react';
import { uploadService } from '../services/api';
import { extractFotoUrl } from '../utils/photo';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    correo_electronico: '',
    password: '',
    confirmPassword: '',
    ci: '',
    complemento_ci: '',
    telefono: '',
    fecha_nacimiento: '',
    sexo: '',
    direccion: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para foto de perfil en registro
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();
  const { register } = useAuth();

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
          setError('No se pudo activar la cámara. Verifica los permisos del navegador.');
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
      
      // Dibujar imagen invertida horizontalmente (espejo)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Limpiar transformación
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

  // Subir la foto a Cloudinary
  const handleUploadPhoto = async (file) => {
    setUploadingPhoto(true);
    setError('');
    try {
      const response = await uploadService.uploadProfilePhoto(file);
      const url = extractFotoUrl(response);
      if (url) {
        setFotoPerfilUrl(url);
        stopCamera();
      } else {
        throw new Error("No se recibió la URL de la foto");
      }
    } catch (err) {
      console.error("Error al subir foto de perfil:", err);
      setError(err.response?.data?.message || 'Error al subir la imagen a Cloudinary.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Manejar selección de archivo local
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen excede el tamaño máximo permitido de 5MB.');
        return;
      }
      handleUploadPhoto(file);
    }
  };

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(v => v === true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validaciones
    if (!formData.primer_nombre) {
      setError('El primer nombre es obligatorio');
      return;
    }
    if (!formData.primer_apellido) {
      setError('El primer apellido es obligatorio');
      return;
    }
    if (!formData.correo_electronico) {
      setError('El correo electrónico es obligatorio');
      return;
    }
    if (!formData.password) {
      setError('La contraseña es obligatoria');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!isPasswordValid()) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }
    
    setIsLoading(true);

    try {
      // Preparar datos para el backend
      const userData = {
        id_rol: 3,
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
        foto_perfil_url: fotoPerfilUrl
      };

      console.log("Enviando datos al backend:", userData);

      const result = await register(userData);
      
      if (result.success) {
        setSuccess('Cuenta creada exitosamente. Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error en registro:", err);
      setError('Error al crear la cuenta. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px', 
      fontSize: '12px', 
      marginTop: '5px',
      color: met ? '#28c76f' : '#ff6b6b'
    }}>
      {met ? <CheckCircle size={14} /> : <XCircle size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="login-container">
      <div className="login-card glass-panel animate-fade-in" style={{ maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="login-header">
          <div className="login-logo">
            <UserPlus size={40} color="white" />
          </div>
          <h2>Crear Cuenta</h2>
          <p>Regístrate como paciente en GyneObs</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="error-message" style={{ backgroundColor: 'rgba(40, 199, 111, 0.1)', color: '#28c76f' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Selector de Foto de Perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '95px',
              height: '95px',
              borderRadius: '50%',
              background: fotoPerfilUrl
                ? 'none'
                : 'linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-blue) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 'bold',
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              border: '3px solid white',
              position: 'relative'
            }}>
              {fotoPerfilUrl ? (
                <img 
                  src={fotoPerfilUrl} 
                  alt="Perfil" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <User size={48} />
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
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--primary-blue)' }}
                disabled={uploadingPhoto}
              >
                <Upload size={13} /> Subir Imagen
              </button>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={startCamera}
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--primary-blue)' }}
                disabled={uploadingPhoto}
              >
                <Camera size={13} /> Usar Cámara
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Primer Nombre *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="primer_nombre"
                  placeholder="Ej. Ana"
                  value={formData.primer_nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Segundo Nombre</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="segundo_nombre"
                  placeholder="Ej. María"
                  value={formData.segundo_nombre}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Primer Apellido *</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="primer_apellido"
                  placeholder="Ej. Silva"
                  value={formData.primer_apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Segundo Apellido</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="segundo_apellido"
                  placeholder="Ej. Pérez"
                  value={formData.segundo_apellido}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico *</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="correo_electronico"
                placeholder="paciente@email.com"
                value={formData.correo_electronico}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>CI</label>
              <div className="input-with-icon">
                <IdCard className="input-icon" size={18} />
                <input
                  type="text"
                  name="ci"
                  placeholder="12345678"
                  value={formData.ci}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Complemento CI</label>
              <input
                type="text"
                name="complemento_ci"
                placeholder="LP"
                value={formData.complemento_ci}
                onChange={handleChange}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Teléfono</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={18} />
                <input
                  type="tel"
                  name="telefono"
                  placeholder="71234567"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Fecha Nacimiento</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" size={18} />
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label>Sexo</label>
              <select
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="">-- Seleccionar --</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMENINO">Femenino</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Dirección</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={18} />
                <input
                  type="text"
                  name="direccion"
                  placeholder="Av. Siempre Viva 123"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña *</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
              </button>
            </div>
            
            {formData.password.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <PasswordRequirement met={passwordValidation.minLength} text="Mínimo 8 caracteres" />
                <PasswordRequirement met={passwordValidation.hasUpperCase} text="Al menos una mayúscula" />
                <PasswordRequirement met={passwordValidation.hasLowerCase} text="Al menos una minúscula" />
                <PasswordRequirement met={passwordValidation.hasNumber} text="Al menos un número" />
                <PasswordRequirement met={passwordValidation.hasSpecialChar} text="Al menos un carácter especial (!@#$%^&*)" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña *</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={isLoading || (formData.password.length > 0 && !isPasswordValid())}
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/login" style={{ fontSize: '14px' }}>¿Ya tienes cuenta? Iniciar Sesión</Link>
          </div>
        </form>
      </div>
      
      {/* Modal de Cámara para Registro */}
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
            maxWidth: '430px', 
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

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
};

export default Register;