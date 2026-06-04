import React, { useState, useEffect } from 'react';
import { Activity, Plus, Search, Scissors, Calendar, User, Trash2, X } from 'lucide-react';
import { cirugiaService, pacienteService, medicoService } from '../services/api';
import './Patients.css';

const Cirugias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cirugias, setCirugias] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    id_paciente: '',
    id_medico: '',
    id_tipo_cirugia: '',
    fecha_cirugia: '',
    hora_inicio: '',
    hora_fin: '',
    diagnostico_preoperatorio: '',
    procedimiento: '',
    estado_cirugia: 'PROGRAMADA'
  });

  // Cargar datos iniciales
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [cirRes, pacRes, medRes] = await Promise.all([
        cirugiaService.getAll(),
        pacienteService.getAll(),
        medicoService.getAll()  // ✅ Cambiado: usar medicoService en lugar de usuarioService
      ]);
      
      // Procesar cirugías
      const cirData = cirRes.data?.cirugias || cirRes.data || [];
      setCirugias(Array.isArray(cirData) ? cirData : []);

      // Procesar pacientes
      const pacData = pacRes.data?.pacientes || pacRes.data || [];
      setPacientes(Array.isArray(pacData) ? pacData : []);

      // ✅ Procesar médicos correctamente desde la tabla medicos
      const medicosData = medRes.data?.medicos || medRes.data || [];
      console.log("Médicos cargados:", medicosData);
      setMedicos(Array.isArray(medicosData) ? medicosData : []);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlertModal({ 
        show: true, 
        message: 'Error al cargar los datos', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refrescar después de crear/editar/eliminar
  const refreshCirugias = async () => {
    try {
      const response = await cirugiaService.getAll();
      const data = response.data?.cirugias || response.data || [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error refreshing cirugias:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.id_paciente) {
      setAlertModal({ show: true, message: 'Seleccione un paciente', type: 'error' });
      return;
    }
    if (!formData.id_medico) {
      setAlertModal({ show: true, message: 'Seleccione un médico', type: 'error' });
      return;
    }
    if (!formData.fecha_cirugia) {
      setAlertModal({ show: true, message: 'Ingrese la fecha de cirugía', type: 'error' });
      return;
    }

    try {
      const payload = { 
        id_paciente: formData.id_paciente,
        id_medico: formData.id_medico,  // ✅ Ahora es id_medico de la tabla medicos
        id_tipo_cirugia: formData.id_tipo_cirugia || null,
        fecha_cirugia: formData.fecha_cirugia,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        diagnostico_preoperatorio: formData.diagnostico_preoperatorio || null,
        procedimiento: formData.procedimiento || null,
        estado_cirugia: formData.estado_cirugia
      };

      console.log("Enviando payload:", payload);

      if (editId) {
        await cirugiaService.update(editId, payload);
        setAlertModal({ show: true, message: 'Cirugía actualizada exitosamente', type: 'success' });
      } else {
        await cirugiaService.create(payload);
        setAlertModal({ show: true, message: 'Cirugía programada exitosamente', type: 'success' });
      }

      setShowForm(false);
      setEditId(null);
      resetForm();
      await refreshCirugias();
      
    } catch (error) {
      console.error("Error saving cirugia:", error);
      const errorMsg = error.response?.data?.message || error.message || 'Error al guardar cirugía';
      setAlertModal({ show: true, message: errorMsg, type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      id_paciente: '',
      id_medico: '',
      id_tipo_cirugia: '',
      fecha_cirugia: '',
      hora_inicio: '',
      hora_fin: '',
      diagnostico_preoperatorio: '',
      procedimiento: '',
      estado_cirugia: 'PROGRAMADA'
    });
  };

  const handleEdit = (c) => {
    setFormData({
      id_paciente: c.id_paciente || '',
      id_medico: c.id_medico || '',
      id_tipo_cirugia: c.id_tipo_cirugia || '',
      fecha_cirugia: c.fecha_cirugia?.split('T')[0] || '',
      hora_inicio: c.hora_inicio || '',
      hora_fin: c.hora_fin || '',
      diagnostico_preoperatorio: c.diagnostico_preoperatorio || '',
      procedimiento: c.procedimiento || '',
      estado_cirugia: c.estado_cirugia || 'PROGRAMADA'
    });
    setEditId(c.id_cirugia || c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      await cirugiaService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      await refreshCirugias();
      setAlertModal({ show: true, message: 'Cirugía eliminada correctamente', type: 'success' });
    } catch (error) {
      console.error("Error deleting cirugia:", error);
      setAlertModal({ show: true, message: 'Error al eliminar cirugía', type: 'error' });
    }
  };

  // Filtrar cirugías
  const filteredCirugias = cirugias.filter(c => {
    const pacienteNombre = c.paciente?.usuario?.primer_nombre || c.paciente?.primer_nombre || '';
    const pacienteApellido = c.paciente?.usuario?.primer_apellido || c.paciente?.primer_apellido || '';
    const medicoNombre = c.medico?.usuario?.primer_nombre || c.medico?.nombre || '';
    const searchLower = searchTerm.toLowerCase();
    
    return pacienteNombre.toLowerCase().includes(searchLower) ||
           pacienteApellido.toLowerCase().includes(searchLower) ||
           medicoNombre.toLowerCase().includes(searchLower);
  });

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Programación de Cirugías</h2>
          <p>Gestión de intervenciones quirúrgicas y quirófanos</p>
        </div>
        <button 
          className="btn btn-primary" 
          style={{ background: 'linear-gradient(135deg, #FF9F43, #EA5455)' }} 
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditId(null);
              resetForm();
            }
          }}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />} 
          {showForm ? 'Cancelar' : 'Programar Cirugía'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>{editId ? '✏️ Editar Cirugía' : '➕ Programar Nueva Cirugía'}</h4>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            
            <div className="form-group">
              <label>👤 Paciente *</label>
              <select 
                value={formData.id_paciente} 
                onChange={e => setFormData({...formData, id_paciente: e.target.value})} 
                required 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              >
                <option value="">-- Seleccionar Paciente --</option>
                {pacientes.map(p => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.usuario?.primer_nombre || p.nombre} {p.usuario?.primer_apellido || p.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>👨‍⚕️ Médico Especialista *</label>
              <select 
                value={formData.id_medico} 
                onChange={e => setFormData({...formData, id_medico: e.target.value})} 
                required 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              >
                <option value="">-- Seleccionar Médico --</option>
                {medicos.map(m => (
                  <option key={m.id_medico} value={m.id_medico}>
                    Dr/a. {m.usuario?.primer_nombre || m.nombre} {m.usuario?.primer_apellido || m.apellido} - {m.especialidad || 'Médico'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>📅 Fecha Cirugía *</label>
              <input 
                type="date" 
                value={formData.fecha_cirugia} 
                onChange={e => setFormData({...formData, fecha_cirugia: e.target.value})} 
                required 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>⏰ Hora Inicio</label>
              <input 
                type="time" 
                value={formData.hora_inicio} 
                onChange={e => setFormData({...formData, hora_inicio: e.target.value})} 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              />
            </div>

            <div className="form-group">
              <label>⏰ Hora Fin</label>
              <input 
                type="time" 
                value={formData.hora_fin} 
                onChange={e => setFormData({...formData, hora_fin: e.target.value})} 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>📋 Diagnóstico Preoperatorio</label>
              <input 
                type="text" 
                value={formData.diagnostico_preoperatorio} 
                onChange={e => setFormData({...formData, diagnostico_preoperatorio: e.target.value})} 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>🔪 Procedimiento Quirúrgico</label>
              <input 
                type="text" 
                value={formData.procedimiento} 
                onChange={e => setFormData({...formData, procedimiento: e.target.value})} 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', width: '100%' }}
              />
            </div>

            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>
              {editId ? '✓ Actualizar Cirugía' : '✓ Agendar Cirugía'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar cirugía por paciente o médico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="patients-grid" style={{ marginTop: '20px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div>Cargando cirugías...</div>
            </div>
          ) : filteredCirugias.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p>No hay cirugías programadas.</p>
            </div>
          ) : (
            filteredCirugias.map(c => {
              const pacienteNombre = c.paciente?.usuario?.primer_nombre || c.paciente?.primer_nombre || 'Paciente';
              const pacienteApellido = c.paciente?.usuario?.primer_apellido || c.paciente?.primer_apellido || '';
              const medicoNombre = c.medico?.usuario?.primer_nombre || c.medico?.nombre || 'Médico';
              const medicoApellido = c.medico?.usuario?.primer_apellido || c.medico?.apellido || '';
              
              return (
                <div key={c.id_cirugia} className="card" style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ 
                      backgroundColor: c.estado_cirugia === 'CANCELADA' ? 'rgba(234, 84, 85, 0.1)' : 'rgba(255, 159, 67, 0.1)', 
                      color: c.estado_cirugia === 'CANCELADA' ? '#ea5455' : '#FF9F43', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}>
                      {c.estado_cirugia || 'PROGRAMADA'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      #{c.id_cirugia}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
                    <User size={16} style={{ display: 'inline', marginRight: '5px' }}/> 
                    {pacienteNombre} {pacienteApellido}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <span>
                      <Calendar size={14} style={{ display: 'inline', marginRight: '5px' }}/> 
                      {c.fecha_cirugia} {c.hora_inicio && `- ${c.hora_inicio}`}
                    </span>
                    <span>
                      <Scissors size={14} style={{ display: 'inline', marginRight: '5px' }}/> 
                      Cirujano: Dr/a. {medicoNombre} {medicoApellido}
                    </span>
                    {c.procedimiento && (
                      <span style={{ fontSize: '12px', marginTop: '5px' }}>
                        📝 {c.procedimiento}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, fontSize: '12px', padding: '8px' }} 
                      onClick={() => handleEdit(c)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ fontSize: '12px', padding: '8px' }} 
                      onClick={() => setDeleteModal({ 
                        show: true, 
                        id: c.id_cirugia, 
                        name: `la cirugía de ${pacienteNombre}` 
                      })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Eliminar */}
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
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Cirugía?</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
              Estás a punto de eliminar <strong>{deleteModal.name}</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Modal Alertas */}
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
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : 
            <Activity size={48} color="#28c76f" style={{ marginBottom: '15px' }} />
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

export default Cirugias;