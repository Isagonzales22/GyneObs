import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import { insumoService } from '../services/api';
import './Patients.css';

const Insumos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock_actual: '',
    unidad_medida: '',
    stock_minimo: '',
    fecha_vencimiento: '',
    id_categoria_insumo: ''
  });

  useEffect(() => {
    const fetchInsumos = async () => {
      try {
        const response = await insumoService.getAll();
        const data = response.data?.insumos || response.data || [];
        setInsumos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching insumos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsumos();
  }, [showForm]); // Refetch when form closes (after creating)

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await insumoService.create(formData);
      setAlertModal({ show: true, message: 'Insumo registrado', type: 'success' });
      setShowForm(false);
      setFormData({ nombre: '', descripcion: '', stock_actual: '', unidad_medida: '', stock_minimo: '', fecha_vencimiento: '', id_categoria_insumo: '' });
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al registrar insumo', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    try {
      await insumoService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      const res = await insumoService.getAll();
      const data = res.data?.insumos || res.data || [];
      setInsumos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al eliminar insumo', type: 'error' });
    }
  };

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Inventario e Insumos</h2>
          <p>Control de stock clínico y médico</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> {showForm ? 'Cancelar' : 'Nuevo Artículo'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>Registrar Nuevo Insumo</h4>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group"><label>Nombre del Insumo</label><input type="text" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} required /></div>
            <div className="form-group"><label>Descripción</label><input type="text" value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} /></div>
            <div className="form-group"><label>Stock Inicial</label><input type="number" value={formData.stock_actual} onChange={e=>setFormData({...formData, stock_actual: e.target.value})} required /></div>
            <div className="form-group"><label>Unidad de Medida (Ej. Cajas)</label><input type="text" value={formData.unidad_medida} onChange={e=>setFormData({...formData, unidad_medida: e.target.value})} required /></div>
            <div className="form-group"><label>Nivel Mínimo (Alerta)</label><input type="number" value={formData.stock_minimo} onChange={e=>setFormData({...formData, stock_minimo: e.target.value})} required /></div>
            <div className="form-group"><label>Fecha de Caducidad</label><input type="date" value={formData.fecha_vencimiento} onChange={e=>setFormData({...formData, fecha_vencimiento: e.target.value})} /></div>
            <div className="form-group"><label>Categoría</label>
              <select value={formData.id_categoria_insumo || ''} onChange={e=>setFormData({...formData, id_categoria_insumo: parseInt(e.target.value)})} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <option value="">-- Seleccionar --</option>
                <option value="1">Medicamentos</option>
                <option value="2">Material Estéril</option>
                <option value="3">Equipamiento</option>
                <option value="4">Limpieza</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>Guardar Insumo</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="list-toolbar">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar insumo..." />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Artículo</th>
              <th style={{ padding: '12px' }}>Categoría</th>
              <th style={{ padding: '12px' }}>Stock Actual</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{padding: '20px', textAlign: 'center'}}>Cargando...</td></tr> : 
             insumos.length === 0 ? <tr><td colSpan="4" style={{padding: '20px', textAlign: 'center'}}>No hay insumos registrados.</td></tr> :
             insumos.map(i => {
              const isLow = i.stock_actual <= i.stock_minimo;
              return (
                <tr key={i.id_insumo || i.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}><Package size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--text-muted)' }}/>{i.nombre}</td>
                  <td style={{ padding: '12px' }}>{i.categoria?.nombre || i.categoria_insumo?.nombre || i.categoria || 'N/A'}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{i.stock_actual !== undefined ? i.stock_actual : i.stock} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>{i.unidad_medida || i.unidad}</span></td>
                  <td style={{ padding: '12px' }}>
                    {isLow ? (
                      <span style={{ color: '#ea5455', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                        <AlertTriangle size={14} /> Stock Bajo
                      </span>
                    ) : (
                      <span style={{ color: '#28c76f', fontSize: '12px', fontWeight: 'bold' }}>Adecuado</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => setDeleteModal({ show: true, id: i.id_insumo || i.id, name: i.nombre })}>
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
            <h3>¿Eliminar Insumo?</h3>
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
          {alertModal.type === 'error' ? <AlertTriangle size={48} color="#ea5455" style={{ marginBottom: '15px' }} /> : <Package size={48} color="#28c76f" style={{ marginBottom: '15px' }} />}
          <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>{alertModal.message}</p>
          <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => setAlertModal({ show: false, message: '', type: 'success' })}>Aceptar</button>
        </div>
      </div>
    )}
    </>
  );
};

export default Insumos;
