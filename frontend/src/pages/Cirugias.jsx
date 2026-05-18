import React, { useState, useEffect } from 'react';
import { Activity, Plus, Search, Scissors, Calendar, User, Trash2 } from 'lucide-react';
import { cirugiaService } from '../services/api';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cirRes, pacRes, userRes] = await Promise.all([
          cirugiaService.getAll(),
          import('../services/api').then(m => m.pacienteService.getAll()),
          import('../services/api').then(m => m.usuarioService.getAll())
        ]);
        
        const cirData = cirRes.data?.cirugias || cirRes.data || [];
        setCirugias(Array.isArray(cirData) ? cirData : []);

        const pacData = pacRes.data?.pacientes || pacRes.data || [];
        setPacientes(Array.isArray(pacData) ? pacData : []);

        const usersData = userRes.data?.usuarios || userRes.data || [];
        setMedicos(usersData.filter(u => u.id_rol === 2 || (u.rol && u.rol.nombre_rol === 'MEDICO')));
      } catch (error) {
        console.error("Error fetching data for cirugias", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showForm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        id_tipo_cirugia: formData.id_tipo_cirugia || null,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null
      };

      if (editId) {
        await cirugiaService.update(editId, payload);
        setAlertModal({ show: true, message: 'Cirugía actualizada exitosamente', type: 'success' });
      } else {
        await cirugiaService.create(payload);
        setAlertModal({ show: true, message: 'Cirugía programada exitosamente', type: 'success' });
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ id_paciente: '', id_medico: '', id_tipo_cirugia: '', fecha_cirugia: '', hora_inicio: '', hora_fin: '', diagnostico_preoperatorio: '', procedimiento: '', estado_cirugia: 'PROGRAMADA' });
      
      const response = await cirugiaService.getAll();
      const data = response.data?.cirugias || response.data || [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: editId ? 'Error al actualizar cirugía' : 'Error al programar cirugía', type: 'error' });
    }
  };

  const handleEdit = (c) => {
    setFormData({
      id_paciente: c.id_paciente || '',
      id_medico: c.id_medico || '',
      id_tipo_cirugia: c.id_tipo_cirugia || '',
      fecha_cirugia: c.fecha_cirugia || c.fecha_programada || c.fecha || '',
      hora_inicio: c.hora_inicio || c.hora_programada || c.hora || '',
      hora_fin: c.hora_fin || '',
      diagnostico_preoperatorio: c.diagnostico_preoperatorio || '',
      procedimiento: c.procedimiento || '',
      estado_cirugia: c.estado_cirugia || c.estado || 'PROGRAMADA'
    });
    setEditId(c.id_cirugia || c.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmDelete = async () => {
    try {
      // Use import here to avoid circular dependencies if we don't have it at top
      const res = await fetch(`http://localhost:3000/api/cirugias/${deleteModal.id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      setDeleteModal({ show: false, id: null, name: '' });
      // Refetch
      const cirRes = await cirugiaService.getAll();
      const data = cirRes.data?.cirugias || cirRes.data || [];
      setCirugias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error deleting cirugia", error);
      setAlertModal({ show: true, message: 'Error al eliminar cirugía', type: 'error' });
    }
  };

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Programación de Cirugías</h2>
          <p>Gestión de intervenciones quirúrgicas y quirófanos</p>
        </div>
        <button className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #FF9F43, #EA5455)' }} onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditId(null);
            setFormData({ id_paciente: '', id_medico: '', id_tipo_cirugia: '', fecha_cirugia: '', hora_inicio: '', hora_fin: '', diagnostico_preoperatorio: '', procedimiento: '', estado_cirugia: 'PROGRAMADA' });
          }
        }}>
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Programar Cirugía'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>{editId ? 'Editar Cirugía' : 'Programar Nueva Cirugía'}</h4>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group"><label>Paciente</label>
              <select value={formData.id_paciente} onChange={e=>setFormData({...formData, id_paciente: e.target.value})} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <option value="">-- Seleccionar Paciente --</option>
                {pacientes.map(p => (
                  <option key={p.id_paciente || p.id} value={p.id_paciente || p.id}>
                    {p.usuario?.primer_nombre || p.nombre} {p.usuario?.primer_apellido || p.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Médico Especialista</label>
              <select value={formData.id_medico} onChange={e=>setFormData({...formData, id_medico: e.target.value})} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <option value="">-- Seleccionar Médico --</option>
                {medicos.map(m => (
                  <option key={m.id_usuario || m.id} value={m.id_usuario || m.id}>
                    Dr/a. {m.primer_nombre || m.nombre} {m.primer_apellido || m.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Fecha Cirugía</label><input type="date" value={formData.fecha_cirugia} onChange={e=>setFormData({...formData, fecha_cirugia: e.target.value})} required /></div>
            <div className="form-group"><label>Hora Inicio</label><input type="time" value={formData.hora_inicio} onChange={e=>setFormData({...formData, hora_inicio: e.target.value})} required /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Diagnóstico Preoperatorio</label><input type="text" value={formData.diagnostico_preoperatorio} onChange={e=>setFormData({...formData, diagnostico_preoperatorio: e.target.value})} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Procedimiento Quirúrgico (Descripción)</label><input type="text" value={formData.procedimiento} onChange={e=>setFormData({...formData, procedimiento: e.target.value})} /></div>
            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>
              {editId ? 'Actualizar Cirugía' : 'Agendar Cirugía'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar cirugía..." />
          </div>
        </div>

        <div className="patients-grid" style={{ marginTop: '20px' }}>
          {loading ? (
            <p style={{ padding: '20px' }}>Cargando cirugías...</p>
          ) : cirugias.length === 0 ? (
            <p style={{ padding: '20px' }}>No hay cirugías programadas.</p>
          ) : cirugias.map(c => (
            <div key={c.id_cirugia || c.id} className="card" style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ backgroundColor: 'rgba(255, 159, 67, 0.1)', color: '#FF9F43', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  {c.tipo_cirugia || c.tipo}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.quirofano || 'Por Asignar'}</span>
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '10px' }}><User size={16} style={{ display: 'inline', marginRight: '5px' }}/> {c.paciente?.usuario?.primer_nombre || c.paciente?.primer_nombre || c.paciente} {c.paciente?.usuario?.primer_apellido || c.paciente?.primer_apellido || ''}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                <span><Calendar size={14} style={{ display: 'inline', marginRight: '5px' }}/> {c.fecha_cirugia || c.fecha_programada || c.fecha} - {c.hora_inicio || c.hora_programada || c.hora}</span>
                <span><Scissors size={14} style={{ display: 'inline', marginRight: '5px' }}/> Cirujano: {c.medico?.usuario?.primer_nombre || c.medico?.primer_nombre || c.medico_responsable || c.medico}</span>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '8px' }} onClick={() => handleEdit(c)}>Editar</button>
                <button className="btn btn-danger" style={{ fontSize: '12px', padding: '8px' }} onClick={() => setDeleteModal({ show: true, id: c.id_cirugia || c.id, name: `la cirugía de ${c.paciente?.primer_nombre || 'Paciente'}` })}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Cirugía?</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Estás a punto de eliminar <strong>{deleteModal.name}</strong>. Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>Cancelar</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>

    {alertModal.show && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
        <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
          {alertModal.type === 'error' ? <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Activity size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default Cirugias;
