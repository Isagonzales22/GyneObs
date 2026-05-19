import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Phone, Calendar, ChevronRight, Trash2, Edit } from 'lucide-react';
import { pacienteService } from '../services/api';
import './Patients.css';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated fetch for demonstration if API fails or is not ready
    const fetchPatients = async () => {
      try {
        const response = await pacienteService.getAll();
        const data = response.data?.pacientes || response.data || [];
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching patients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    fetchPatients();
  }, []);

  const confirmDelete = async () => {
    try {
      await pacienteService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      // Fetch again
      const response = await pacienteService.getAll();
      const data = response.data?.pacientes || response.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error deleting patient", error);
      setAlertModal({ show: true, message: 'Error al eliminar el paciente', type: 'error' });
    }
  };

  const filteredPatients = patients.filter(p => {
    const nombre = p.usuario?.primer_nombre || p.primer_nombre || p.nombre || '';
    const apellido = p.usuario?.primer_apellido || p.primer_apellido || p.apellido || '';
    const dni = p.usuario?.ci || p.ci || p.dni || '';
    
    return nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
           apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dni.includes(searchTerm);
  });

  return (
    <>
    <div className="patients-container animate-fade-in">
      <div className="page-header">
        <div className="header-text">
          <h2>Pacientes</h2>
          <p>Gestión del directorio de pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pacientes/nuevo')}>
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div className="card list-card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, apellido o CI..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando pacientes...</div>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map(patient => (
              <div 
                key={patient.id_paciente || patient.id} 
                className="patient-card"
                onClick={() => navigate(`/pacientes/${patient.id_paciente || patient.id}`)}
              >
                <div className="patient-avatar">
                  <User size={24} />
                </div>
                <div className="patient-info">
                  <h3>{patient.usuario?.primer_nombre || patient.primer_nombre || patient.nombre} {patient.usuario?.primer_apellido || patient.primer_apellido || patient.apellido}</h3>
                  <div className="patient-details">
                    <span>CI: {patient.usuario?.ci || patient.ci || patient.dni || 'N/A'}</span>
                    <span><Phone size={12} /> {patient.usuario?.telefono || patient.telefono || 'Sin registrar'}</span>
                    <span><Calendar size={12} /> {patient.usuario?.fecha_nacimiento || patient.fecha_nacimiento || patient.fechaNacimiento ? new Date(patient.usuario?.fecha_nacimiento || patient.fecha_nacimiento || patient.fechaNacimiento).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="action-icon" style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary" style={{ padding: '6px', display: 'flex', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); navigate(`/pacientes/${patient.id_paciente || patient.id}?edit=true`); }} title="Editar Paciente">
                    <Edit size={18} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px', display: 'flex', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, id: patient.id_paciente || patient.id, name: `${patient.usuario?.primer_nombre || patient.primer_nombre || patient.nombre} ${patient.usuario?.primer_apellido || patient.primer_apellido || patient.apellido}` }); }} title="Eliminar Paciente">
                    <Trash2 size={18} />
                  </button>
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="empty-state">
                <User size={48} />
                <p>No se encontraron pacientes</p>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Paciente?</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Estás a punto de eliminar el expediente del paciente <strong>{deleteModal.name}</strong>. Esta acción no se puede deshacer.</p>
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
          {alertModal.type === 'error' ? <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <User size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default PatientsList;
