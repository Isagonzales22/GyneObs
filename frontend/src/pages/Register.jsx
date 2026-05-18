import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, User, Shield, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import './Login.css'; // Reusing Login CSS for consistency

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correoElectronico: '',
    contrasena: '',
    rol: 'PACIENTE'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  // Validación de contraseña
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
    
    if (name === 'contrasena') {
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
    
    // Validar contraseña antes de enviar
    if (!isPasswordValid()) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }
    
    setIsLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      setSuccess('Cuenta creada exitosamente. Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  // Componente para mostrar requisitos de contraseña
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
      <div className="login-card glass-panel animate-fade-in" style={{ maxWidth: '450px' }}>
        <div className="login-header">
          <div className="login-logo">
            <UserPlus size={40} color="white" />
          </div>
          <h2>Crear Cuenta</h2>
          <p>Registrar nuevo personal de GyneObs</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="error-message" style={{ backgroundColor: 'rgba(40, 199, 111, 0.1)', color: '#28c76f' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ej. Ana"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Apellido</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Ej. Silva"
                  value={formData.apellido}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                name="correoElectronico"
                placeholder="doctor@clinica.com"
                value={formData.correoElectronico}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="••••••••"
                value={formData.contrasena}
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
            
            {/* Mostrar requisitos solo si hay algo escrito */}
            {formData.contrasena.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <PasswordRequirement 
                  met={passwordValidation.minLength} 
                  text="Mínimo 8 caracteres" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasUpperCase} 
                  text="Al menos una mayúscula" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasLowerCase} 
                  text="Al menos una minúscula" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasNumber} 
                  text="Al menos un número" 
                />
                <PasswordRequirement 
                  met={passwordValidation.hasSpecialChar} 
                  text="Al menos un carácter especial (!@#$%^&*)" 
                />
              </div>
            )}
          </div>

          {/* Rol es PACIENTE por defecto, el administrador lo cambia luego */}
          <input type="hidden" name="rol" value="PACIENTE" />

          <button 
            type="submit" 
            className="btn btn-primary login-btn" 
            disabled={isLoading || (formData.contrasena.length > 0 && !isPasswordValid())}
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