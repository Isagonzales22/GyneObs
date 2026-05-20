import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../images/logotipo/LOGOTIPO.png';
import servicio1 from '../images/publicidad/publicidad1.jpg?url';
import servicio2 from '../images/publicidad/publicidad2.jpg?url';
import servicio3 from '../images/publicidad/publicidad3.jpg?url';
import videoPublicidad from '../images/publicidad/videopublicidad.mp4';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
  const servicios = [servicio1, servicio2, servicio3];

  // Manejador profesional para imágenes rotas
  const handleImageError = (e, type = 'generic') => {
    if (type === 'logo') {
      e.target.src = 'https://placehold.co/400x400/0B3B5C/white?text=GyneObs';
      e.target.style.objectFit = 'contain';
      e.target.style.padding = '12px';
    } else if (type === 'hero') {
      e.target.src = 'https://placehold.co/1200x600/f0f4f8/0B3B5C?text=Dra.+Andrea+Nathalia';
    } else {
      e.target.src = 'https://placehold.co/800x500/e2e8f0/0B3B5C?text=Servicios+Médicos';
    }
    e.target.style.objectFit = 'cover';
  };

  return (
    <div className="home-container">
      {/* Header Profesional */}
      <header className="home-nav">
        <div className="nav-left">
          <img 
            src={logo} 
            alt="GyneObs" 
            className="nav-logo" 
            onError={(e) => handleImageError(e, 'logo')}
          />
          <div className="clinic-info">
            <h3 className="clinic-name">GyneObs</h3>
            <span className="doctor-title">Dra. Andrea Nathalia</span>
          </div>
        </div>
        <nav className="nav-right">
          <Link to="/login" className="btn btn-outline">
            <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
          </Link>
          <Link to="/register" className="btn btn-primary">
            <i className="fas fa-user-plus"></i> Crear Cuenta
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="home-main">
        {/* Hero Section - Video tamaño reducido */}
        <section className="hero">
          <div className="hero-text">
            <span className="hero-badge">
              <i className="fas fa-star-of-life"></i> Excelencia en Salud Femenina
            </span>
            <h1>Tu salud, <span className="highlight">nuestra prioridad</span></h1>
            <p>Más de 3 años cuidando de ti y tu familia. Atención personalizada con calidez, tecnología de vanguardia y el respaldo de la Dra. Andrea Nathalia, especialista en Ginecología, Obstetricia y Medicina Materno Fetal.</p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-large">
                <i className="fas fa-calendar-check"></i> Agendar Cita
              </Link>
              <Link to="/login" className="btn btn-secondary">
                <i className="fas fa-users"></i> Área de Pacientes
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <video 
              className="hero-video" 
              autoPlay 
              loop 
              muted 
              playsInline
              src={videoPublicidad}
              onError={(e) => {
                e.target.style.display = 'none';
                const fallbackImg = document.createElement('img');
                fallbackImg.src = servicio2;
                fallbackImg.alt = "Dra. Andrea Nathalia";
                fallbackImg.onerror = () => handleImageError(fallbackImg, 'hero');
                e.target.parentElement.appendChild(fallbackImg);
                e.target.remove();
              }}
            />
          </div>
        </section>

        {/* Especialidades */}
        <section className="specialties-section">
          <div className="section-header">
            <h2><i className="fas fa-stethoscope"></i> Nuestras Especialidades</h2>
            <p>Atención médica integral y personalizada para cada etapa de tu vida</p>
          </div>
          <div className="specialties-grid">
            <div className="specialty-card">
              <div className="specialty-icon">
                <i className="fas fa-female"></i>
              </div>
              <h3>Ginecología</h3>
              <p>Prevención, diagnóstico y tratamiento de la salud femenina con equipos de última generación y el cuidado que mereces.</p>
              <div className="specialty-tag">
                <i className="fas fa-clipboard-list"></i> Consultas mensuales
              </div>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">
                <i className="fas fa-baby-carriage"></i>
              </div>
              <h3>Obstetricia</h3>
              <p>Acompañamiento profesional durante el embarazo, parto humanizado y postparto con calidez y excelencia médica.</p>
              <div className="specialty-tag">
                <i className="fas fa-heartbeat"></i> Controles prenatales
              </div>
            </div>
            <div className="specialty-card">
              <div className="specialty-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3>Medicina Materno Fetal</h3>
              <p>Cuidado especializado para embarazos de alto riesgo, diagnóstico fetal avanzado y bienestar integral para mamá y bebé.</p>
              <div className="specialty-tag">
                <i className="fas fa-microscope"></i> Ecografías 4D
              </div>
            </div>
          </div>
        </section>

        {/* Nuestros Servicios - Imágenes completas sin cortes */}
        <section className="services-section">
          <div className="section-header">
            <h2><i className="fas fa-hospital-user"></i> Nuestros Servicios</h2>
            <p>Conoce las soluciones médicas que ofrecemos para tu bienestar</p>
          </div>
          <div className="services-grid">
            {servicios.map((src, i) => (
              <div className="service-card" key={i}>
                <div className="service-image-wrapper">
                  <img 
                    src={src} 
                    alt={`Servicio médico ${i+1}`} 
                    onError={(e) => handleImageError(e, 'service')}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ventajas y Beneficios */}
        <section className="benefits-section">
          <div className="section-header">
            <h2><i className="fas fa-award"></i> ¿Por qué elegirnos?</h2>
            <p>Compromiso, experiencia y tecnología a tu servicio</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <i className="fas fa-calendar-check"></i>
              <h3>Agenda Rápida</h3>
              <p>Reserva tu cita en minutos, sin complicaciones</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-clock"></i>
              <h3>Puntualidad</h3>
              <p>Respetamos tu tiempo, atención sin esperas</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-microscope"></i>
              <h3>Tecnología Avanzada</h3>
              <p>Equipos de última generación para diagnósticos precisos</p>
            </div>
            <div className="benefit-card">
              <i className="fas fa-shield-alt"></i>
              <h3>Confidencialidad</h3>
              <p>Tus datos médicos están seguros con nosotros</p>
            </div>
          </div>
        </section>

        {/* Contacto y Ubicación */}
        <section className="contact-section">
          <div className="section-header">
            <h2><i className="fas fa-envelope"></i> Contáctanos</h2>
            <p>Estamos ubicados para brindarte la mejor atención</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <strong><i className="fas fa-calendar-alt"></i> Reserva tu consulta</strong>
                  <p><strong>69414169</strong> / 4393968</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="far fa-clock"></i>
                </div>
                <div>
                  <strong><i className="fas fa-hourglass-half"></i> Horarios de Atención</strong>
                  <p>Lunes a Viernes: 14:00 a 20:00</p>
                  <p>Sábados: 9:00 a 11:00</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <strong><i className="fas fa-location-dot"></i> Ubicación</strong>
                  <p>Av. Oquendo S/N, Edificio Torres Soffer I</p>
                  <p>Piso 7, Consultorio 709</p>
                  <p>Cochabamba, Bolivia</p>
                </div>
              </div>
            </div>

            <div className="contact-map">
              <div className="map-container">
                <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px', // altura fija
                    overflow: 'hidden',
                    borderRadius: '12px'
                }}
                >
                <iframe
                    title="ubicacion-gyneobs"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-66.1611540774771,-17.394586263565826,-66.1461540774771,-17.374586263565826&layer=mapnik&marker=-17.384586263565826,-66.1511540774771"
                    style={{
                    border: 0,
                    width: '100%',
                    height: '100%'
                    }}
                    allowFullScreen
                    loading="lazy"
                />

                {/* Capa sutil */}
                <div
                    style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '40px',
                    background:
                        'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))',
                    pointerEvents: 'none'
                    }}
                />
                </div>
              </div>
              <p className="coords">
                <i className="fas fa-map-pin"></i> Edificio Torres Soffer I, Piso 7 - Consultorio 709
              </p>
              <p className="coords-small">
                <i className="fas fa-info-circle"></i> Referencia: Av. Oquendo, frente a la Plaza Principal
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-left">
            <p><i className="far fa-copyright"></i> {new Date().getFullYear()} GyneObs — Dra. Andrea Nathalia</p>
            <p className="footer-sub">
              <i className="fas fa-female"></i> Ginecología · 
              <i className="fas fa-baby-carriage"></i> Obstetricia · 
              <i className="fas fa-heartbeat"></i> Medicina Materno Fetal
            </p>
          </div>
          <div className="footer-links">
            <a href="#"><i className="fas fa-lock"></i> Privacidad</a>
            <a href="#"><i className="fas fa-file-alt"></i> Términos</a>
            <a href="#"><i className="fas fa-headset"></i> Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;