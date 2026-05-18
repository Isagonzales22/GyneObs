import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, Upload, Trash2 } from 'lucide-react';
import { contenidoEducativoService } from '../services/api';
import './Patients.css';

const Educacion = () => {
  const [contenidos, setContenidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_contenido: 'Documento',
    enlace_url: '',
    id_creador: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contRes, uRes] = await Promise.all([
          contenidoEducativoService.getAll(),
          import('../services/api').then(m => m.usuarioService.getAll())
        ]);
        const data = contRes.data?.contenidos || contRes.data || [];
        setContenidos(Array.isArray(data) ? data : []);

        const usersData = uRes.data?.usuarios || uRes.data || [];
        setUsuarios(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showForm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await contenidoEducativoService.create(formData);
      setAlertModal({ show: true, message: 'Material educativo subido exitosamente', type: 'success' });
      setShowForm(false);
      setFormData({ titulo: '', descripcion: '', tipo_contenido: 'Documento', enlace_url: '', id_creador: '' });
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al subir material', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      // In case we don't have it exported, fetch direct
      const res = await fetch(`http://localhost:3000/api/contenidos-educativos/${deleteModal.id}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('Delete failed');
      setDeleteModal({ show: false, id: null, name: '' });
      
      const contRes = await contenidoEducativoService.getAll();
      const data = contRes.data?.contenidos || contRes.data || [];
      setContenidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al eliminar material', type: 'error' });
    }
  };

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Contenido Educativo</h2>
          <p>Material de apoyo para pacientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Upload size={18} /> {showForm ? 'Cancelar' : 'Subir Material'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>Subir Nuevo Material</h4>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group"><label>Título</label><input type="text" value={formData.titulo} onChange={e=>setFormData({...formData, titulo: e.target.value})} required /></div>
            <div className="form-group"><label>Tipo de Contenido</label>
              <select value={formData.tipo_contenido} onChange={e=>setFormData({...formData, tipo_contenido: e.target.value})} style={{ padding: '12px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', width: '100%' }}>
                <option value="Documento">Documento / Artículo</option>
                <option value="Video">Video</option>
                <option value="Infografia">Infografía</option>
              </select>
            </div>
            <div className="form-group"><label>Enlace / URL</label><input type="text" value={formData.enlace_url} onChange={e=>setFormData({...formData, enlace_url: e.target.value})} placeholder="https://..." required /></div>
            <div className="form-group"><label>Creador (Usuario)</label>
              <select value={formData.id_creador} onChange={e=>setFormData({...formData, id_creador: e.target.value})} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <option value="">-- Seleccionar Usuario --</option>
                {usuarios.map(u => (
                  <option key={u.id_usuario || u.id} value={u.id_usuario || u.id}>
                    {u.primer_nombre || u.nombre} {u.primer_apellido || u.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Descripción</label><textarea value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} rows="3"></textarea></div>
            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>Guardar Material</button>
          </form>
        </div>
      )}

      <div className="patients-grid">
        {loading ? (
          <p style={{ padding: '20px' }}>Cargando materiales...</p>
        ) : contenidos.length === 0 ? (
          <p style={{ padding: '20px' }}>No hay contenidos educativos disponibles.</p>
        ) : contenidos.map(c => (
          <div key={c.id_contenido || c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            <div style={{ padding: '15px', backgroundColor: 'var(--primary-blue-light)', color: 'white', borderRadius: '12px' }}>
              {c.tipo_contenido === 'Video' ? <Video size={24}/> : <FileText size={24}/>}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{c.titulo}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.tipo_contenido || c.tipo} • Subido por: {c.creador?.primer_nombre || c.autor || 'Clínica'}</p>
            </div>
            <button className="btn btn-danger" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => setDeleteModal({ show: true, id: c.id_contenido || c.id, name: c.titulo })}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {deleteModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            <h3>¿Eliminar Material?</h3>
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
          {alertModal.type === 'error' ? <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <BookOpen size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default Educacion;
