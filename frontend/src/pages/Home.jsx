import React, { useEffect, useRef, useState } from 'react';
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
  
  // Estado para el testimonio actual (carrusel)
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Estado para el menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estado para navbar sticky (siempre visible)
  const [isNavSticky, setIsNavSticky] = useState(false);

  // Testimonios de pacientes
  const testimonials = [
    {
      name: "María González",
      role: "Paciente de Ginecología",
      text: "La Dra. Andrea es una profesional excepcional. Su calidez y conocimiento me hicieron sentir segura desde la primera consulta. Totalmente recomendada.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      name: "Carolina Méndez",
      role: "Mamá primeriza",
      text: "Gracias a su seguimiento durante mi embarazo, todo salió perfecto. El parto fue una experiencia hermosa y segura. ¡Infinitas gracias!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
      name: "Laura Fernández",
      role: "Paciente de Medicina Fetal",
      text: "Excelente atención, tecnología de punta y un trato humano inigualable. Me explicaron cada detalle de mi embarazo de alto riesgo.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
      name: "Ana Lucía Torres",
      role: "Paciente frecuente",
      text: "El consultorio es muy acogedor, el personal es amable y la doctora se toma el tiempo necesario para resolver todas mis dudas.",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/4.jpg"
    }
  ];

  // Navegación del carrusel
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000); // Cambia cada 5 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Cerrar menú al hacer clic en un enlace
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Efecto para el navbar sticky - se activa inmediatamente al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsNavSticky(true);
      } else {
        setIsNavSticky(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Coordenadas de la clínica
  const clinicLat = -17.384586263565826;
  const clinicLng = -66.1511540774771;

  // Referencia para el mapa
  const mapRef = useRef(null);
  const markerRef = useRef(null);

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

  // Inicializar mapa con Leaflet
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      if (window.L && !mapRef.current) {
        const map = window.L.map('clinic-map').setView([clinicLat, clinicLng], 17);
        mapRef.current = map;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        const pinkIcon = window.L.divIcon({
          className: 'custom-pin',
          html: `<div style="
            position: relative;
            width: 40px;
            height: 40px;
            background-color: #FF69B4;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            cursor: pointer;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              color: white;
              font-size: 18px;
            ">
              <i class="fas fa-female" style="color: white;"></i>
            </div>
          </div>
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background-color: #FF69B4;
            border-radius: 50%;
          "></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        markerRef.current = window.L.marker([clinicLat, clinicLng], { icon: pinkIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; font-family: 'Poppins', sans-serif;">
              <strong style="color: #FF69B4;">🩷 GyneObs</strong><br/>
              Dra. Andrea Nathalia<br/>
              <small>Av. Oquendo S/N, Edificio Torres Soffer I<br/>Piso 7, Consultorio 709</small>
            </div>
          `)
          .openPopup();
      }
    };
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const leafletLink = document.querySelector('link[href*="leaflet"]');
      const leafletScript = document.querySelector('script[src*="leaflet"]');
      if (leafletLink) leafletLink.remove();
      if (leafletScript) leafletScript.remove();
    };
  }, [clinicLat, clinicLng]);

  // Función para centrar el mapa
  const centerMap = () => {
    if (mapRef.current) {
      mapRef.current.setView([clinicLat, clinicLng], 17);
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="home-container">
      {/* Header Profesional con navbar siempre visible */}
      <header className={`home-nav ${isNavSticky ? 'sticky' : ''}`}>
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
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <nav className={`nav-right ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
            <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
          </Link>
          <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
            <i className="fas fa-user-plus"></i> Crear Cuenta
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="home-main">
        {/* Hero Section */}
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

        {/* Nuestros Servicios */}
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

        {/* Testimonios de Pacientes (Carrusel Mejorado) */}
        <section className="testimonials-section">
          <div className="section-header">
            <h2><i className="fas fa-comments"></i> Lo que dicen nuestras pacientes</h2>
            <p>Historias reales, experiencias que inspiran confianza</p>
          </div>
          
          <div className="testimonials-carousel">
            <button onClick={prevTestimonial} className="carousel-btn prev-btn">
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="testimonial-card">
              <div className="testimonial-image">
                <div className="image-wrapper">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/120x120/FF69B4/white?text=🌸';
                    }}
                  />
                  <div className="quote-icon">
                    <i className="fas fa-quote-right"></i>
                  </div>
                </div>
              </div>
              <div className="testimonial-content">
                <div className="testimonial-rating">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <p className="testimonial-text">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <h4 className="testimonial-name">{testimonials[currentTestimonial].name}</h4>
                <p className="testimonial-role">{testimonials[currentTestimonial].role}</p>
                <div className="testimonial-decoration">
                  <i className="fas fa-female"></i>
                  <i className="fas fa-heart"></i>
                  <i className="fas fa-female"></i>
                </div>
              </div>
            </div>
            
            <button onClick={nextTestimonial} className="carousel-btn next-btn">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
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
                    height: '400px',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    zIndex: 1
                  }}
                >
                  <div 
                    id="clinic-map" 
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      borderRadius: '12px'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '15px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button 
                    onClick={centerMap}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#FF69B4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff4d9e';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF69B4';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    <i className="fas fa-crosshairs"></i>
                    Centrar Mapa
                  </button>
                  
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#764ba2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#5a357d';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#764ba2';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    <i className="fab fa-google"></i>
                    Cómo llegar (Google Maps)
                  </a>
                </div>
              </div>
              <p className="coords">
                <i className="fas fa-map-pin" style={{ color: '#FF69B4' }}></i> Edificio Torres Soffer I, Piso 7 - Consultorio 709
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