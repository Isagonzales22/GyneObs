import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, Trash2, MinusCircle, Edit2 } from 'lucide-react';
import { insumoService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Patients.css';

const Insumos = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInsumoId, setEditingInsumoId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [withdrawModal, setWithdrawModal] = useState({ show: false, id: null, name: '', stockActual: 0, cantidad: 1 });
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

  // Verificar roles por id_rol (1=administrador, 2=médico, 3=paciente, 4=secretaria)
  const userRoleId = Number(user?.rol?.id_rol ?? user?.id_rol);
  const isAdmin = userRoleId === 1;
  const isMedic = userRoleId === 2;
  const isSecretaria = userRoleId === 4;

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    try {
      setLoading(true);
      const response = await insumoService.getAll();
      console.log("Respuesta del servidor:", response.data);
      const data = response.data?.insumos || response.data || [];
      setInsumos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching insumos", error);
      showAlert('Error al cargar insumos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlertModal({ show: true, message, type });
    setTimeout(() => {
      setAlertModal({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        stock_actual: parseInt(formData.stock_actual),
        stock_minimo: parseInt(formData.stock_minimo),
        id_categoria_insumo: parseInt(formData.id_categoria_insumo)
      };
      if (isEditing) {
        await insumoService.update(editingInsumoId, payload);
        showAlert('Insumo actualizado correctamente', 'success');
      } else {
        await insumoService.create(payload);
        showAlert('Insumo registrado correctamente', 'success');
      }
      setShowForm(false);
      setIsEditing(false);
      setEditingInsumoId(null);
      setFormData({ 
        nombre: '', descripcion: '', stock_actual: '', 
        unidad_medida: '', stock_minimo: '', 
        fecha_vencimiento: '', id_categoria_insumo: '' 
      });
      await fetchInsumos();
    } catch (error) {
      console.error(error);
      showAlert(error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'registrar'} insumo`, 'error');
    }
  };

  const openEditForm = (i) => {
    setIsEditing(true);
    setEditingInsumoId(i.id_insumo || i.id);
    setFormData({
      nombre: i.nombre || '',
      descripcion: i.descripcion || '',
      stock_actual: i.stock_actual !== undefined ? i.stock_actual.toString() : (i.stock !== undefined ? i.stock.toString() : ''),
      unidad_medida: i.unidad_medida || i.unidad || '',
      stock_minimo: i.stock_minimo !== undefined ? i.stock_minimo.toString() : (i.min_stock !== undefined ? i.min_stock.toString() : ''),
      fecha_vencimiento: i.fecha_vencimiento ? i.fecha_vencimiento.split('T')[0] : '',
      id_categoria_insumo: i.id_categoria_insumo || i.id_categoria || ''
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingInsumoId(null);
    setFormData({ 
      nombre: '', descripcion: '', stock_actual: '', 
      unidad_medida: '', stock_minimo: '', 
      fecha_vencimiento: '', id_categoria_insumo: '' 
    });
  };

  const handleWithdraw = async () => {
    const { id, cantidad, name, stockActual } = withdrawModal;
    
    if (cantidad <= 0) {
      showAlert('La cantidad debe ser mayor a 0', 'error');
      return;
    }
    
    if (cantidad > stockActual) {
      showAlert(`Stock insuficiente. Solo hay ${stockActual} unidades disponibles`, 'error');
      return;
    }

    try {
      const newStock = stockActual - cantidad;
      console.log(`Retirando ${cantidad} de ${name}. Nuevo stock: ${newStock}`);
      
      // Usar el método update con el ID correcto
      const response = await insumoService.update(id, { stock_actual: newStock });
      console.log("Respuesta del servidor:", response.data);
      
      showAlert(`Se retiraron ${cantidad} unidades de ${name}`, 'success');
      setWithdrawModal({ show: false, id: null, name: '', stockActual: 0, cantidad: 1 });
      await fetchInsumos(); // Recargar la lista
    } catch (error) {
      console.error("Error al retirar insumo:", error);
      showAlert(error.response?.data?.message || 'Error al retirar insumo', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await insumoService.delete(deleteModal.id);
      showAlert('Insumo eliminado correctamente', 'success');
      setDeleteModal({ show: false, id: null, name: '' });
      await fetchInsumos();
    } catch (error) {
      console.error(error);
      showAlert(error.response?.data?.message || 'Error al eliminar insumo', 'error');
    }
  };

  const filteredInsumos = insumos.filter(i => 
    i.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.categoria_insumo?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div className="header-text">
          <h2>Inventario e Insumos</h2>
          <p>
            {isAdmin 
              ? 'Control total de stock - Administrador' 
              : isMedic 
              ? 'Retiro de insumos médicos - Solo consulta y consumo'
              : isSecretaria
              ? 'Visualización de inventario'
              : 'Gestión de insumos'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                setShowForm(true);
              }
            }}>
              <Plus size={18} /> {showForm ? 'Cancelar' : 'Nuevo Artículo'}
            </button>
          )}
        </div>
      </div>

      {isAdmin && showForm && (
        <div className="card animate-fade-in" style={{ backgroundColor: '#f8f9fa' }}>
          <h4>{isEditing ? 'Editar Insumo' : 'Registrar Nuevo Insumo'}</h4>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div className="form-group">
              <label>Nombre del Insumo *</label>
              <input type="text" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <input type="text" value={formData.descripcion} onChange={e=>setFormData({...formData, descripcion: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Stock Inicial *</label>
              <input type="number" value={formData.stock_actual} onChange={e=>setFormData({...formData, stock_actual: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Unidad de Medida *</label>
              <input type="text" placeholder="Ej. Unidades, Cajas, mL" value={formData.unidad_medida} onChange={e=>setFormData({...formData, unidad_medida: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Stock Mínimo (Alerta) *</label>
              <input type="number" value={formData.stock_minimo} onChange={e=>setFormData({...formData, stock_minimo: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Fecha de Vencimiento</label>
              <input type="date" value={formData.fecha_vencimiento} onChange={e=>setFormData({...formData, fecha_vencimiento: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Categoría *</label>
              <select value={formData.id_categoria_insumo || ''} onChange={e=>setFormData({...formData, id_categoria_insumo: e.target.value})} required style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                <option value="">-- Seleccionar --</option>
                <option value="1">Medicamentos</option>
                <option value="2">Material Estéril</option>
                <option value="3">Equipamiento</option>
                <option value="4">Limpieza</option>
                <option value="5">Instrumental Quirúrgico</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ gridColumn: '1 / -1', justifySelf: 'start', marginTop: '10px' }}>
              {isEditing ? 'Guardar Cambios' : 'Guardar Insumo'}
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
              placeholder="Buscar insumo por nombre o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '12px' }}>Artículo</th>
              <th style={{ padding: '12px' }}>Categoría</th>
              <th style={{ padding: '12px' }}>Stock Actual</th>
              <th style={{ padding: '12px' }}>Stock Mínimo</th>
              <th style={{ padding: '12px' }}>Estado</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>Cargando insumos...</td></tr>
            ) : filteredInsumos.length === 0 ? (
              <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>No hay insumos registrados.</td></tr>
            ) : (
              filteredInsumos.map(i => {
                const stockActual = i.stock_actual !== undefined ? i.stock_actual : i.stock;
                const stockMinimo = i.stock_minimo !== undefined ? i.stock_minimo : i.min_stock;
                const isLow = stockActual <= stockMinimo;
                const isCritical = stockActual === 0;
                const isExpired = i.fecha_vencimiento && new Date(i.fecha_vencimiento) < new Date();
                const insumoId = i.id_insumo || i.id;
                
                return (
                  <tr key={insumoId} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: '500' }}>
                      <Package size={16} style={{ display: 'inline', marginRight: '8px', color: 'var(--text-muted)' }}/>
                      {i.nombre}
                      {isExpired && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', backgroundColor: '#ea5455', color: 'white', padding: '2px 6px', borderRadius: '12px' }}>
                          VENCIDO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>{i.categoria?.nombre || i.categoria_insumo?.nombre || i.categoria || 'N/A'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: isCritical ? '#ea5455' : 'inherit' }}>
                      {stockActual} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>{i.unidad_medida || i.unidad}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{stockMinimo} {i.unidad_medida || i.unidad}</td>
                    <td style={{ padding: '12px' }}>
                      {isCritical ? (
                        <span style={{ color: '#ea5455', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                          <AlertTriangle size={14} /> AGOTADO
                        </span>
                      ) : isLow ? (
                        <span style={{ color: '#ff9f43', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                          <AlertTriangle size={14} /> Stock Bajo
                        </span>
                      ) : (
                        <span style={{ color: '#28c76f', fontSize: '12px', fontWeight: 'bold' }}>✓ Disponible</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {isMedic && stockActual > 0 && !isExpired && (
                          <button 
                            className="btn-withdraw" 
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#ff9f43', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              fontSize: '13px'
                            }}
                            onClick={() => setWithdrawModal({ 
                              show: true, 
                              id: insumoId, 
                              name: i.nombre, 
                              stockActual: stockActual,
                              cantidad: 1 
                            })}
                          >
                            <MinusCircle size={14} /> Retirar
                          </button>
                        )}
                        
                        {isMedic && stockActual === 0 && (
                          <button 
                            disabled
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#ccc', 
                              color: '#666', 
                              border: 'none', 
                              borderRadius: '8px', 
                              fontSize: '13px',
                              cursor: 'not-allowed'
                            }}
                            title="Producto agotado"
                          >
                            <MinusCircle size={14} /> Sin Stock
                          </button>
                        )}

                        {isMedic && isExpired && stockActual > 0 && (
                          <button 
                            disabled
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#ccc', 
                              color: '#666', 
                              border: 'none', 
                              borderRadius: '8px', 
                              fontSize: '13px',
                              cursor: 'not-allowed'
                            }}
                            title="Producto vencido no puede ser retirado"
                          >
                            <MinusCircle size={14} /> Producto Vencido
                          </button>
                        )}

                        {isAdmin && (
                          <>
                            <button 
                              className="btn-secondary" 
                              style={{ 
                                padding: '6px', 
                                backgroundColor: '#4b5563', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              onClick={() => openEditForm(i)}
                              title="Editar Insumo"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn-danger" 
                              style={{ 
                                padding: '6px', 
                                backgroundColor: '#ea5455', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              onClick={() => setDeleteModal({ show: true, id: insumoId, name: i.nombre })}
                              title="Eliminar Insumo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para retirar insumos */}
      {withdrawModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            <MinusCircle size={48} color="#ff9f43" style={{ marginBottom: '15px' }} />
            <h3>Retirar Insumo</h3>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
              Retirar <strong>{withdrawModal.name}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Stock actual: <strong>{withdrawModal.stockActual}</strong> unidades
            </p>
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', textAlign: 'left', marginBottom: '8px', fontWeight: '500' }}>
                Cantidad a retirar:
              </label>
              <input 
                type="number" 
                min="1" 
                max={withdrawModal.stockActual}
                value={withdrawModal.cantidad}
                onChange={(e) => setWithdrawModal({...withdrawModal, cantidad: parseInt(e.target.value) || 1})}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setWithdrawModal({ show: false, id: null, name: '', stockActual: 0, cantidad: 1 })}
                style={{ padding: '10px 20px' }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-warning" 
                onClick={handleWithdraw}
                style={{ backgroundColor: '#ff9f43', color: 'white', padding: '10px 20px' }}
              >
                Confirmar Retiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
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

    {/* Modal de alerta tipo toast */}
    {alertModal.show && (
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1100, animation: 'slideInRight 0.3s ease' }}>
        <div style={{ 
          padding: '16px 24px', 
          borderRadius: '12px', 
          backgroundColor: alertModal.type === 'error' ? '#ea5455' : '#28c76f',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {alertModal.type === 'error' ? <AlertTriangle size={20} /> : <Package size={20} />}
          <span>{alertModal.message}</span>
        </div>
      </div>
    )}
    </>
  );
};

export default Insumos;