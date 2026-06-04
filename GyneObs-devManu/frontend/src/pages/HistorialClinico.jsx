import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Phone, Calendar, Clipboard, Heart, Activity, ChevronRight, Clock, FileText } from 'lucide-react';
import { pacienteService } from '../services/api';

const HistorialClinico = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await pacienteService.getAll();
        const data = response.data?.pacientes || response.data || [];
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching patients', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => {
    const nombre = p.usuario?.primer_nombre || p.primer_nombre || p.nombre || '';
    const apellido = p.usuario?.primer_apellido || p.primer_apellido || p.apellido || '';
    const dni = p.usuario?.ci || p.ci || p.dni || '';
    return (
      nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dni.includes(searchTerm)
    );
  });

  const getInitials = (patient) => {
    const n = patient.usuario?.primer_nombre || patient.primer_nombre || patient.nombre || '?';
    const a = patient.usuario?.primer_apellido || patient.primer_apellido || patient.apellido || '?';
    return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
  };

  const getAge = (patient) => {
    const dob = patient.usuario?.fecha_nacimiento || patient.fecha_nacimiento || patient.fechaNacimiento;
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const gradients = [
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '32px 36px',
        marginBottom: '28px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', right: '80px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '12px', display: 'flex' }}>
              <Clipboard size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700 }}>Historial Clínico</h2>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Registros médicos de todos los pacientes</p>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 20px', backdropFilter: 'blur(10px)' }}>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Pacientes</p>
              <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700 }}>{patients.length}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '12px 20px', backdropFilter: 'blur(10px)' }}>
              <p style={{ margin: 0, fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Con Expediente</p>
              <p style={{ margin: '4px 0 0', fontSize: '28px', fontWeight: 700 }}>{patients.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: '1px solid rgba(0,0,0,0.06)',
      }}>
        <Search size={20} color="#999" />
        <input
          type="text"
          placeholder="Buscar paciente por nombre, apellido o CI..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            fontSize: '15px',
            color: '#333',
            background: 'transparent',
          }}
        />
        {searchTerm && (
          <span style={{ fontSize: '12px', color: '#999', background: '#f0f0f0', borderRadius: '20px', padding: '3px 10px' }}>
            {filteredPatients.length} resultado{filteredPatients.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px', color: '#999' }}>
          <Activity size={40} style={{ animation: 'spin 1.2s linear infinite' }} color="#764ba2" />
          <p style={{ fontSize: '15px' }}>Cargando expedientes clínicos...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <Clipboard size={56} color="#ddd" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#555', marginBottom: '8px' }}>Sin resultados</h3>
          <p>No se encontraron pacientes con ese criterio de búsqueda.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {filteredPatients.map((patient, index) => {
            const nombre = patient.usuario?.primer_nombre || patient.primer_nombre || patient.nombre || '';
            const apellido = patient.usuario?.primer_apellido || patient.primer_apellido || patient.apellido || '';
            const ci = patient.usuario?.ci || patient.ci || patient.dni || '';
            const telefono = patient.usuario?.telefono || patient.telefono || '';
            const age = getAge(patient);
            const gradient = gradients[index % gradients.length];
            const fotoUrl = patient.usuario?.foto_perfil_url;

            return (
              <div
                key={patient.id_paciente || patient.id}
                onClick={() => navigate(`/app/pacientes/${patient.id_paciente || patient.id}`, { state: { defaultTab: 'resumen' } })}
                style={{
                  background: 'white',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.13)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)';
                }}
              >
                {/* Card top strip */}
                <div style={{ height: '6px', background: gradient }} />

                <div style={{ padding: '20px' }}>
                  {/* Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: fotoUrl ? 'none' : gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '20px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                    }}>
                      {fotoUrl ? (
                        <img src={fotoUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : getInitials(patient)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {nombre} {apellido}
                      </h3>
                      {age && (
                        <span style={{ fontSize: '12px', color: '#888', marginTop: '2px', display: 'block' }}>
                          {age} años
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={13} color="#764ba2" />
                      </div>
                      <span>CI: <strong>{ci || 'No registrado'}</strong></span>
                    </div>
                    {telefono && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f0fff4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Phone size={13} color="#28c76f" />
                        </div>
                        <span>{telefono}</span>
                      </div>
                    )}
                    {patient.tipo_sangre && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#555' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fff0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Heart size={13} color="#ea5455" />
                        </div>
                        <span>Tipo: <strong>{patient.tipo_sangre}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/app/pacientes/${patient.id_paciente || patient.id}`, { state: { defaultTab: 'resumen' } }); }}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(118, 75, 162, 0.2)',
                        background: 'rgba(118, 75, 162, 0.06)',
                        color: '#764ba2',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Clipboard size={13} /> Historia
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/app/pacientes/${patient.id_paciente || patient.id}`, { state: { defaultTab: 'consultas' } }); }}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '10px',
                        border: '1px solid rgba(13, 110, 253, 0.2)',
                        background: 'rgba(13, 110, 253, 0.06)',
                        color: '#0d6efd',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Activity size={13} /> Consultas
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/app/pacientes/${patient.id_paciente || patient.id}`); }}
                      style={{
                        width: '36px',
                        padding: '9px',
                        borderRadius: '10px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: '#f8f9fa',
                        color: '#555',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistorialClinico;
