import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, Search, CheckCircle, XCircle, Clock3, Trash2 } from 'lucide-react';
import './Patients.css'; // Reusing some base styles

import { citaService, pacienteService, medicoService } from '../services/api';

const Citas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [citas, setCitas] = useState([]);
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
    tipo_cita: '',
    fecha_cita: '',
    hora_cita: '',
    motivo: '',
    estado: 'PROGRAMADA'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citasRes, pacRes, medRes] = await Promise.all([
          citaService.getAll(),
          pacienteService.getAll(),
          medicoService.getAll()
        ]);
        
        const citasData = citasRes.data?.citas || citasRes.data || [];
        setCitas(Array.isArray(citasData) ? citasData : []);

        const pacData = pacRes.data?.pacientes || pacRes.data || [];
        setPacientes(Array.isArray(pacData) ? pacData : []);

        const medicosData = medRes.data?.medicos || medRes.data || [];
        setMedicos(Array.isArray(medicosData) ? medicosData : []);
      } catch (error) {
        console.error("Error fetching data for citas", error);
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
        id_paciente: formData.id_paciente,
        id_medico: formData.id_medico,
        id_tipo_consulta: null,
        fecha_cita: formData.fecha_cita,
        hora_inicio: formData.hora_cita || null,
        hora_fin: formData.hora_cita || null,
        motivo: formData.motivo,
        observaciones: formData.tipo_cita ? `Tipo: ${formData.tipo_cita}` : '',
        estado_cita: formData.estado
      };

      if (editId) {
        await citaService.update(editId, payload);
        setAlertModal({ show: true, message: 'Cita actualizada exitosamente', type: 'success' });
      } else {
        await citaService.create(payload);
        setAlertModal({ show: true, message: 'Cita agendada exitosamente', type: 'success' });
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ id_paciente: '', id_medico: '', tipo_cita: '', fecha_cita: '', hora_cita: '', motivo: '', estado: 'PROGRAMADA' });
      
      const response = await citaService.getAll();
      const data = response.data?.citas || response.data || [];
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: editId ? 'Error al actualizar cita' : 'Error al agendar cita', type: 'error' });
    }
  };

  const handleEdit = (cita) => {
    setFormData({
      id_paciente: cita.id_paciente || '',
      id_medico: cita.id_medico || '',
      tipo_cita: cita.tipoConsulta?.nombre || cita.tipo_cita || cita.tipo || '',
      fecha_cita: cita.fecha_cita || cita.fecha || '',
      hora_cita: cita.hora_inicio || cita.hora || '',
      motivo: cita.motivo || '',
      estado: cita.estado_cita || cita.estado || 'PROGRAMADA'
    });
    setEditId(cita.id_cita || cita.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'Estado') return;
    try {
      await citaService.update(id, { estado_cita: newStatus.toUpperCase() });
      setAlertModal({ show: true, message: 'Estado actualizado', type: 'success' });
      const response = await citaService.getAll();
      const data = response.data?.citas || response.data || [];
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al actualizar estado', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await citaService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      // Refetch citas manually
      const response = await citaService.getAll();
      const data = response.data?.citas || response.data || [];
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error deleting cita", error);
      setAlertModal({ show: true, message: 'Error al eliminar cita', type: 'error' });
    }
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'PROGRAMADA': return { bg: 'rgba(0, 191, 255, 0.1)', color: 'var(--primary-blue)', icon: <Clock3 size={16}/> };
      case 'COMPLETADA': return { bg: 'rgba(40, 199, 111, 0.1)', color: '#28c76f', icon: <CheckCircle size={16}/> };
      case 'CANCELADA': return { bg: 'rgba(234, 84, 85, 0.1)', color: '#ea5455', icon: <XCircle size={16}/> };
      default: return { bg: '#eee', color: '#666', icon: null };
    }
  };

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Citas Médicas</h2>
          <p>Agenda y control de pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setShowForm(!showForm);
          if (showForm) {
            setEditId(null);
            setFormData({ id_paciente: '', id_medico: '', tipo_cita: '', fecha_cita: '', hora_cita: '', motivo: '', estado: 'PROGRAMADA' });
          }
        }}>
          <Plus size={18} /> {showForm ? 'Cancelar' : 'Agendar Cita'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>{editId ? 'Editar Cita' : 'Agendar Nueva Cita'}</h4>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group"><label>Tipo de Cita</label><input type="text" value={formData.tipo_cita} onChange={e=>setFormData({...formData, tipo_cita: e.target.value})} placeholder="Ej: Control Prenatal" required /></div>
            <div className="form-group"><label>Fecha</label><input type="date" value={formData.fecha_cita} onChange={e=>setFormData({...formData, fecha_cita: e.target.value})} required /></div>
            <div className="form-group"><label>Hora</label><input type="time" value={formData.hora_cita} onChange={e=>setFormData({...formData, hora_cita: e.target.value})} required /></div>
            <div className="form-group"><label>Motivo</label><input type="text" value={formData.motivo} onChange={e=>setFormData({...formData, motivo: e.target.value})} /></div>
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
                  <option key={m.id_medico} value={m.id_medico}>
                    Dr/a. {m.usuario?.primer_nombre || m.nombre} {m.usuario?.primer_apellido || m.apellido} - {m.especialidad || 'Médico'}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>
              {editId ? 'Actualizar Cita' : 'Guardar Cita'}
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
              placeholder="Buscar por paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" className="btn btn-secondary" style={{ padding: '8px 12px' }} defaultValue="2026-05-20" />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Paciente</th>
              <th style={{ padding: '12px' }}>Fecha y Hora</th>
              <th style={{ padding: '12px' }}>Tipo de Cita</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center'}}>Cargando...</td></tr> : 
             citas.length === 0 ? <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center'}}>No hay citas registradas.</td></tr> :
             citas.map(cita => {
              const statusStyle = getStatusColor(cita.estado_cita || cita.estado);
              return (
                <tr key={cita.id_cita || cita.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500' }}>
                    <User size={18} color="var(--primary-pink)" /> {cita.paciente?.usuario?.primer_nombre || cita.paciente?.primer_nombre || 'Paciente'} {cita.paciente?.usuario?.primer_apellido || cita.paciente?.primer_apellido || 'No Asignado'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CalendarIcon size={14} color="var(--text-muted)"/> {cita.fecha_cita || cita.fecha}
                      <Clock size={14} color="var(--text-muted)" style={{ marginLeft: '10px' }}/> {cita.hora_inicio || cita.hora}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>{cita.tipoConsulta?.nombre || cita.tipo_cita || cita.tipo || 'General'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      backgroundColor: statusStyle.bg, color: statusStyle.color,
                      display: 'inline-flex', alignItems: 'center', gap: '6px'
                    }}>
                      {statusStyle.icon} {cita.estado_cita || cita.estado}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <select 
                      className="btn btn-secondary" 
                      style={{ padding: '6px', fontSize: '12px' }}
                      onChange={(e) => handleStatusChange(cita.id_cita || cita.id, e.target.value)}
                      value={cita.estado_cita || cita.estado}
                    >
                      <option value="PROGRAMADA">Programada</option>
                      <option value="COMPLETADA">Completada</option>
                      <option value="CANCELADA">Cancelada</option>
                    </select>
                    <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleEdit(cita)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => setDeleteModal({ show: true, id: cita.id_cita || cita.id, name: `la cita de ${cita.paciente?.usuario?.primer_nombre || cita.paciente?.primer_nombre || 'Paciente'}` })}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Cita?</h3>
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
          {alertModal.type === 'error' ? <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <CalendarIcon size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default Citas;
