import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, User, Eye, EyeOff, CheckCircle, XCircle, Phone, MapPin, Calendar, IdCard } from 'lucide-react';
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
  const navigate = useNavigate();
  const { register } = useAuth();

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
      // Preparar datos para el backend (sin foto)
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
        foto_perfil_url: null
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
      
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
};

export default Register;