import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Edit, Clipboard, Calendar, FileText, Activity, Plus, Save } from 'lucide-react';
import { pacienteService, antecedenteGOService, consultaMedicaService } from '../services/api';
import './Patients.css';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [activeTab, setActiveTab] = useState('resumen');
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  // States for forms
  const [showConsultaForm, setShowConsultaForm] = useState(false);
  const [showAntecedentesForm, setShowAntecedentesForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditingProfile(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        if (!id || id === 'undefined') {
          setLoading(false);
          return;
        }

        if (id === 'nuevo') {
          try {
            // Fetch users to let admin/medic select one to link
            const uRes = await import('../services/api').then(m => m.usuarioService.getAll());
            const usersData = uRes.data?.usuarios || uRes.data || [];
            // Filtrar por los que tienen rol PACIENTE (id_rol 3 o nombre_rol PACIENTE)
            setUsuarios(usersData.filter(u => u.id_rol === 3 || (u.rol && u.rol.nombre_rol === 'PACIENTE')));
          } catch (err) {
            console.error("Error fetching users for linking patient", err);
          }

          setPatient({
            id_usuario: '',
            ocupacion: '',
            estado_civil: '',
            seguro_medico: '',
            tipo_sangre: '',
            observaciones: '',
            referencia: '',
            contacto_emergencia_nombre: '',
            contacto_emergencia_telefono: '',
            contacto_emergencia_parentesco: ''
          });
          setLoading(false);
          return;
        }

        const res = await pacienteService.getById(id);
        const p = res.data?.paciente || res.data;
        setPatient({
          id: p.id_paciente || p.id,
          id_usuario: p.id_usuario,
          nombre: p.usuario?.primer_nombre || p.primer_nombre || p.nombre || '',
          apellido: p.usuario?.primer_apellido || p.primer_apellido || p.apellido || '',
          ci: p.usuario?.ci || p.ci || p.dni || '',
          telefono: p.usuario?.telefono || p.telefono || '',
          fechaNacimiento: p.usuario?.fecha_nacimiento || p.fecha_nacimiento || p.fechaNacimiento || '',
          direccion: p.usuario?.direccion || p.direccion || '',
          estadoCivil: p.estado_civil || p.estadoCivil || '',
          ocupacion: p.ocupacion || '',
          grupoSanguineo: p.tipo_sangre || p.grupoSanguineo || '',
          seguroMedico: p.seguro_medico || p.seguroMedico || '',
          observaciones: p.observaciones || '',
          referencia: p.referencia || '',
          contacto_emergencia_nombre: p.contacto_emergencia_nombre || '',
          contacto_emergencia_telefono: p.contacto_emergencia_telefono || '',
          contacto_emergencia_parentesco: p.contacto_emergencia_parentesco || ''
        });
      } catch (error) {
        console.error("Error fetching patient", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>;

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      // Assuming api maps fields
      const payload = {
        id_usuario: patient.id_usuario,
        ocupacion: patient.ocupacion,
        estado_civil: patient.estado_civil,
        seguro_medico: patient.seguro_medico,
        tipo_sangre: patient.tipo_sangre,
        referencia: patient.referencia,
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre,
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono,
        contacto_emergencia_parentesco: patient.contacto_emergencia_parentesco,
        observaciones: patient.observaciones
      };
      const res = await pacienteService.create(payload);
      setAlertModal({ show: true, message: 'Paciente creado exitosamente', type: 'success' });
      setTimeout(() => navigate('/pacientes'), 1500);
    } catch (error) {
      console.error("Error creating patient", error);
      setAlertModal({ show: true, message: 'Error al crear paciente', type: 'error' });
    }
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    try {
      const patientPayload = {
        ocupacion: patient.ocupacion,
        estado_civil: patient.estadoCivil,
        seguro_medico: patient.seguroMedico,
        tipo_sangre: patient.grupoSanguineo,
        observaciones: patient.observaciones,
        referencia: patient.referencia,
        contacto_emergencia_nombre: patient.contacto_emergencia_nombre,
        contacto_emergencia_telefono: patient.contacto_emergencia_telefono,
        contacto_emergencia_parentesco: patient.contacto_emergencia_parentesco
      };
      await pacienteService.update(patient.id, patientPayload);

      if (patient.id_usuario) {
        const userPayload = {
          primer_nombre: patient.nombre,
          primer_apellido: patient.apellido,
          ci: patient.ci,
          telefono: patient.telefono,
          fecha_nacimiento: patient.fechaNacimiento,
          direccion: patient.direccion
        };
        const { usuarioService } = await import('../services/api');
        await usuarioService.update(patient.id_usuario, userPayload);
      }

      setAlertModal({ show: true, message: 'Perfil de paciente actualizado correctamente', type: 'success' });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error updating patient", error);
      setAlertModal({ show: true, message: 'Error al actualizar el perfil de paciente', type: 'error' });
    }
  };

  const handleCreateAntecedentes = async (e) => {
    e.preventDefault();
    setAlertModal({ show: true, message: 'Antecedentes guardados exitosamente', type: 'success' });
    setShowAntecedentesForm(false);
  };

  const handleCreateConsulta = async (e) => {
    e.preventDefault();
    setAlertModal({ show: true, message: 'Consulta registrada exitosamente', type: 'success' });
    setShowConsultaForm(false);
  };

  if (id === 'nuevo') {
    return (
      <>
        <div className="patient-detail-container animate-fade-in">
          <div className="detail-header">
            <button className="back-btn" onClick={() => navigate('/pacientes')}>
              <ArrowLeft size={20} /> Cancelar
            </button>
          </div>
          <div className="card">
            <h2>Vincular Expediente Clínico</h2>
            <p style={{ color: 'var(--text-muted)' }}>Selecciona un usuario registrado para crearle su expediente médico.</p>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Usuario / Paciente Registrado</label>
                  <select value={patient.id_usuario} onChange={e => setPatient({ ...patient, id_usuario: e.target.value })} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">-- Seleccionar Usuario --</option>
                    {usuarios.map(u => (
                      <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                        {u.primer_nombre || u.nombre} {u.primer_apellido || u.apellido} - CI: {u.ci || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ocupación</label>
                  <input type="text" value={patient.ocupacion} onChange={e => setPatient({ ...patient, ocupacion: e.target.value })} placeholder="Ej. Docente" />
                </div>
                <div className="form-group">
                  <label>Estado Civil</label>
                  <select value={patient.estado_civil} onChange={e => setPatient({ ...patient, estado_civil: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="Soltera">Soltera</option>
                    <option value="Casada">Casada</option>
                    <option value="Divorciada">Divorciada</option>
                    <option value="Viuda">Viuda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Sangre</label>
                  <select value={patient.tipo_sangre} onChange={e => setPatient({ ...patient, tipo_sangre: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                 <div className="form-group">
                  <label>Seguro Médico</label>
                  <input type="text" value={patient.seguro_medico} onChange={e => setPatient({ ...patient, seguro_medico: e.target.value })} placeholder="Ej. SUS, Caja Nacional..." />
                </div>
                <div className="form-group">
                  <label>Referencia / Recomendado por</label>
                  <input type="text" value={patient.referencia} onChange={e => setPatient({ ...patient, referencia: e.target.value })} placeholder="Ej. Dr. Flores" />
                </div>
                <div className="form-group">
                  <label>Nombre Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_nombre} onChange={e => setPatient({ ...patient, contacto_emergencia_nombre: e.target.value })} placeholder="Ej. María Gómez" />
                </div>
                <div className="form-group">
                  <label>Teléfono Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_telefono} onChange={e => setPatient({ ...patient, contacto_emergencia_telefono: e.target.value })} placeholder="Ej. 70712345" />
                </div>
                <div className="form-group">
                  <label>Parentesco Contacto de Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_parentesco} onChange={e => setPatient({ ...patient, contacto_emergencia_parentesco: e.target.value })} placeholder="Ej. Esposo, Madre" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <textarea value={patient.observaciones} onChange={e => setPatient({ ...patient, observaciones: e.target.value })} placeholder="Observaciones o notas iniciales..." rows="3" style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', fontFamily: 'inherit' }}></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                <Save size={16} style={{ marginRight: '8px' }} /> Crear Expediente Clínico
              </button>
            </form>
          </div>
        </div>

        {alertModal.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
            <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
              {alertModal.type === 'error' ? <Activity size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Save size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
              <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
              <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
              <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!patient) {
    return (
      <div className="patient-detail-container animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Paciente no encontrado</h2>
        <p>El paciente que buscas no existe o no se ha cargado correctamente.</p>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes')} style={{ marginTop: '20px' }}>Volver a Pacientes</button>
      </div>
    );
  }

  return (
    <>
      <div className="patient-detail-container animate-fade-in">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/pacientes')}>
            <ArrowLeft size={20} /> Volver
          </button>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => setIsEditingProfile(true)}>
              <Edit size={16} /> Editar Perfil
            </button>
          </div>
        </div>

        {/* Profile Header */}
        {isEditingProfile ? (
          <div className="patient-profile-card card animate-fade-in">
            <h3>Editar Perfil de Paciente</h3>
            <form onSubmit={handleUpdatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Nombre(s) *</label>
                  <input type="text" value={patient.nombre} onChange={e => setPatient({ ...patient, nombre: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Apellido(s) *</label>
                  <input type="text" value={patient.apellido} onChange={e => setPatient({ ...patient, apellido: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>CI</label>
                  <input type="text" value={patient.ci} onChange={e => setPatient({ ...patient, ci: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" value={patient.telefono} onChange={e => setPatient({ ...patient, telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento</label>
                  <input type="date" value={patient.fechaNacimiento} onChange={e => setPatient({ ...patient, fechaNacimiento: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input type="text" value={patient.direccion} onChange={e => setPatient({ ...patient, direccion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ocupación</label>
                  <input type="text" value={patient.ocupacion} onChange={e => setPatient({ ...patient, ocupacion: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Estado Civil</label>
                  <select value={patient.estadoCivil} onChange={e => setPatient({ ...patient, estadoCivil: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="Soltera">Soltera</option>
                    <option value="Casada">Casada</option>
                    <option value="Divorciada">Divorciada</option>
                    <option value="Viuda">Viuda</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de Sangre</label>
                  <select value={patient.grupoSanguineo} onChange={e => setPatient({ ...patient, grupoSanguineo: e.target.value })} style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option value="">Seleccionar</option>
                    <option value="A+">A+</option>
                    <option value="O+">O+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Seguro Médico</label>
                  <input type="text" value={patient.seguroMedico} onChange={e => setPatient({ ...patient, seguroMedico: e.target.value })} placeholder="Ej. SUS, Caja Nacional..." />
                </div>
                <div className="form-group">
                  <label>Referencia</label>
                  <input type="text" value={patient.referencia} onChange={e => setPatient({ ...patient, referencia: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Nombre Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_nombre} onChange={e => setPatient({ ...patient, contacto_emergencia_nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_telefono} onChange={e => setPatient({ ...patient, contacto_emergencia_telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Parentesco Contacto Emergencia</label>
                  <input type="text" value={patient.contacto_emergencia_parentesco} onChange={e => setPatient({ ...patient, contacto_emergencia_parentesco: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <textarea value={patient.observaciones} onChange={e => setPatient({ ...patient, observaciones: e.target.value })} rows="3"></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary"><Save size={16} style={{ marginRight: '8px' }} /> Guardar Cambios</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="patient-profile-card card">
            <div className="profile-header">
              <div className="profile-avatar-lg">
                {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
              </div>
              <div className="profile-titles">
                <h2>{patient.nombre} {patient.apellido}</h2>
                <p>CI: {patient.ci || patient.dni} | Grupo Sanguíneo: <span className="blood-type">{patient.grupoSanguineo || 'N/A'}</span></p>
              </div>
            </div>
            <div className="profile-info-grid">
              <div className="info-group">
                <label>Fecha de Nacimiento</label>
                <p>{patient.fechaNacimiento || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Teléfono</label>
                <p>{patient.telefono || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Dirección</label>
                <p>{patient.direccion || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Ocupación</label>
                <p>{patient.ocupacion || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Estado Civil</label>
                <p>{patient.estadoCivil || patient.estado_civil || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Seguro Médico</label>
                <p>{patient.seguroMedico || patient.seguro_medico || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Referencia</label>
                <p>{patient.referencia || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label>Contacto de Emergencia</label>
                <p>
                  {patient.contacto_emergencia_nombre ? (
                    `${patient.contacto_emergencia_nombre} (${patient.contacto_emergencia_parentesco || 'Sin parentesco'}) - ${patient.contacto_emergencia_telefono || 'Sin tel.'}`
                  ) : 'N/A'}
                </p>
              </div>
              {patient.observaciones && (
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Observaciones</label>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{patient.observaciones}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Medical Records Tabs */}
        <div className="patient-tabs card">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
              <FileText size={16} /> Resumen
            </button>
            <button className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`} onClick={() => setActiveTab('historial')}>
              <Clipboard size={16} /> Antecedentes
            </button>
            <button className={`tab-btn ${activeTab === 'consultas' ? 'active' : ''}`} onClick={() => setActiveTab('consultas')}>
              <Activity size={16} /> Consultas y Recetas
            </button>
          </div>

          <div className="tab-content" style={{ padding: '20px' }}>
            {activeTab === 'resumen' && (
              <div className="resumen-tab">
                <h3>Visión General</h3>
                <p style={{ color: 'var(--text-muted)' }}>Bienvenido al expediente médico. Seleccione las pestañas superiores para ver detalles clínicos.</p>

                <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
                  <div className="card" style={{ flex: 1, backgroundColor: 'rgba(255, 105, 180, 0.05)', border: '1px solid rgba(255, 105, 180, 0.2)' }}>
                    <h4 style={{ color: 'var(--primary-pink)' }}>Última Consulta</h4>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>No hay registros recientes.</p>
                  </div>
                  <div className="card" style={{ flex: 1, backgroundColor: 'rgba(0, 191, 255, 0.05)', border: '1px solid rgba(0, 191, 255, 0.2)' }}>
                    <h4 style={{ color: 'var(--primary-blue)' }}>Próxima Cita</h4>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>No hay citas programadas.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historial' && (
              <div className="historial-tab animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Antecedentes Médicos (Historia Clínica)</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAntecedentesForm(!showAntecedentesForm)}>
                    <Plus size={16} /> {showAntecedentesForm ? 'Cancelar' : 'Agregar Antecedentes'}
                  </button>
                </div>

                {showAntecedentesForm ? (
                  <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                    <h4>Formulario de Antecedentes Gineco-Obstétricos (AGO)</h4>
                    <form onSubmit={handleCreateAntecedentes}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
                        <div className="form-group"><label>Menarca (edad)</label><input type="number" /></div>
                        <div className="form-group"><label>Menopausia (edad)</label><input type="number" /></div>
                        <div className="form-group"><label>Ritmo Menstrual</label><input type="text" placeholder="Ej: 28/4" /></div>
                        <div className="form-group"><label>Gestaciones (G)</label><input type="number" /></div>
                        <div className="form-group"><label>Partos (P)</label><input type="number" /></div>
                        <div className="form-group"><label>Abortos (A)</label><input type="number" /></div>
                        <div className="form-group"><label>Cesáreas (C)</label><input type="number" /></div>
                        <div className="form-group"><label>FUM (Fecha Última Menstruación)</label><input type="date" /></div>
                        <div className="form-group"><label>FPP (Fecha Probable Parto)</label><input type="date" /></div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}><Save size={16} /> Guardar Antecedentes</button>
                    </form>
                  </div>
                ) : (
                  <div className="empty-state-sm">No hay antecedentes registrados aún. Haz clic en "Agregar Antecedentes" para comenzar.</div>
                )}
              </div>
            )}

            {activeTab === 'consultas' && (
              <div className="consultas-tab animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Historial de Consultas Médicas</h3>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowConsultaForm(!showConsultaForm)}>
                    <Plus size={16} /> {showConsultaForm ? 'Cancelar' : 'Nueva Consulta'}
                  </button>
                </div>

                {showConsultaForm ? (
                  <div className="card" style={{ backgroundColor: '#f8f9fa' }}>
                    <h4>Registrar Nueva Consulta</h4>
                    <form onSubmit={handleCreateConsulta}>
                      <div className="form-group" style={{ marginTop: '15px' }}>
                        <label>Motivo de Consulta</label>
                        <textarea rows="3" placeholder="Síntomas principales, razón de la visita..."></textarea>
                      </div>

                      <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Signos Vitales</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                        <div className="form-group"><label>Presión Arterial</label><input type="text" placeholder="120/80" /></div>
                        <div className="form-group"><label>Frecuencia Cardíaca</label><input type="number" placeholder="lpm" /></div>
                        <div className="form-group"><label>Peso (kg)</label><input type="number" /></div>
                        <div className="form-group"><label>Talla (cm)</label><input type="number" /></div>
                      </div>

                      <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Examen Físico y Ginecológico</label>
                        <textarea rows="3"></textarea>
                      </div>

                      <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Diagnóstico (CIE-10 / Texto Libre)</label>
                        <input type="text" />
                      </div>

                      <div className="form-group" style={{ marginTop: '20px' }}>
                        <label>Tratamiento y Receta Médica</label>
                        <textarea rows="4" placeholder="Medicamentos, dosis, indicaciones..."></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ marginTop: '20px' }}><Save size={16} /> Guardar Consulta y Generar Receta</button>
                    </form>
                  </div>
                ) : (
                  <div className="empty-state-sm">No hay consultas registradas.</div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {alertModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            {alertModal.type === 'error' ? <Activity size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Save size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
            <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDetail;
