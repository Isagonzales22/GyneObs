import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Download, Loader, Zap, Users, Calendar, Pill, AlertCircle, Stethoscope, Package, UserCheck, BookMarked } from 'lucide-react';
import { reporteService } from '../services/api';
import './Reportes.css';

// Componente de gráfica de barras premium interactiva
const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-msg">Sin datos para mostrar</div>;
  }

  const validData = data.filter(d => d.value !== undefined && d.value !== null);
  if (validData.length === 0) {
    return <div className="no-data-msg">Sin datos válidos</div>;
  }

  const maxValue = Math.max(...validData.map(d => parseInt(d.value) || 0));
  const roundedMax = Math.ceil(maxValue / 5) * 5 || 5;

  // 4 niveles de escala + 0
  const gridlines = [
    roundedMax, 
    Math.round(roundedMax * 0.75), 
    Math.round(roundedMax * 0.5), 
    Math.round(roundedMax * 0.25), 
    0
  ];

  return (
    <div className="chart-container">
      {/* Eje Y con escala numérica */}
      <div className="chart-y-axis">
        {gridlines.map((val, idx) => (
          <span key={idx} className="y-axis-label">{val}</span>
        ))}
      </div>
      
      {/* Área principal de la gráfica */}
      <div className="chart-main-area">
        {/* Líneas de cuadrícula detrás */}
        <div className="chart-gridlines">
          {gridlines.map((_, idx) => (
            <div key={idx} className="gridline-row" />
          ))}
        </div>
        
        {/* Barras e información */}
        <div className="bars-wrapper">
          {validData.map((item, idx) => {
            const val = parseInt(item.value) || 0;
            const barHeightPct = (val / roundedMax) * 100;
            return (
              <div key={idx} className="bar-item">
                {/* Tooltip con valor de la barra */}
                <div className="bar-value-tooltip">{item.value}</div>
                
                {/* Contenedor del riel para la barra */}
                <div className="bar-track">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${barHeightPct}%`,
                      background: `linear-gradient(180deg, ${item.fill || '#667eea'} 0%, rgba(102, 126, 234, 0.4) 100%)`,
                      boxShadow: `0 4px 12px rgba(102, 126, 234, 0.2)`
                    }}
                  />
                </div>
                
                {/* Nombre de la categoría */}
                <div className="bar-name" title={item.name}>{item.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('general');
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    pacienteId: '',
  });
  const [loading, setLoading] = useState(false);
  const [metricas, setMetricas] = useState(null);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  // Cargar métricas cuando cambia el tipo de reporte
  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const response = await reporteService.obtenerMetricas(tipoReporte, filtros.pacienteId);
        if (response.data.ok) {
          setMetricas(response.data.data);
        }
      } catch (error) {
        console.error('Error cargando métricas:', error);
      }
    };
    
    cargarMetricas();
  }, [tipoReporte, filtros.pacienteId]);

  const tiposReporte = [
    { 
      id: 'general', 
      label: 'Reporte General', 
      descripcion: 'Métricas generales de la clínica',
      icon: <BarChart3 size={40} />,
      color: '#ea5455',
      details: 'Visualiza todas las métricas clave del sistema'
    },
    { 
      id: 'historiales', 
      label: 'Historiales Clínicos', 
      descripcion: 'Reporte de historiales clínicos de pacientes',
      icon: <FileText size={40} />,
      color: '#0d6efd',
      details: 'Listado completo de historiales registrados'
    },
    { 
      id: 'citas', 
      label: 'Citas Médicas', 
      descripcion: 'Listado de citas programadas',
      icon: <Calendar size={40} />,
      color: '#ff9f43',
      details: 'Todas las citas y acompañamientos médicos'
    },
    { 
      id: 'recetas', 
      label: 'Recetas Médicas', 
      descripcion: 'Listado de recetas emitidas',
      icon: <Pill size={40} />,
      color: '#764ba2',
      details: 'Todas las recetas expedidas en el período'
    },
    { 
      id: 'pacientes', 
      label: 'Directorio de Pacientes', 
      descripcion: 'Listado completo de pacientes',
      icon: <Users size={40} />,
      color: '#28c76f',
      details: 'Información completa de todos los pacientes'
    },
    { 
      id: 'cirugias', 
      label: 'Cirugías', 
      descripcion: 'Reporte de cirugías realizadas',
      icon: <Stethoscope size={40} />,
      color: '#00bcd4',
      details: 'Historial de todas las intervenciones quirúrgicas'
    },
    { 
      id: 'insumos', 
      label: 'Inventario de Insumos', 
      descripcion: 'Control de medicamentos e insumos médicos',
      icon: <Package size={40} />,
      color: '#9c27b0',
      details: 'Stock actual y movimientos de inventario'
    },
    { 
      id: 'usuarios', 
      label: 'Personal Administrativo', 
      descripcion: 'Listado del personal de la clínica',
      icon: <UserCheck size={40} />,
      color: '#03a9f4',
      details: 'Información de usuarios y personal registrado'
    },
    { 
      id: 'educacion', 
      label: 'Contenido Educativo', 
      descripcion: 'Reporte de materiales educativos',
      icon: <BookMarked size={40} />,
      color: '#4caf50',
      details: 'Contenido educativo para pacientes y usuarios'
    },
  ];

  const handleGenerarReporte = async () => {
    try {
      setLoading(true);

      const response = await reporteService.generarPDF(tipoReporte, filtros);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${tipoReporte}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setAlertModal({ show: true, message: '✓ Reporte generado y descargado exitosamente', type: 'success' });
      setTimeout(() => setAlertModal({ show: false, message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error('Error al generar reporte:', error);
      setAlertModal({
        show: true,
        message: error.response?.data?.message || 'Error al generar el reporte. Intenta nuevamente.',
        type: 'error',
      });
      setTimeout(() => setAlertModal({ show: false, message: '', type: 'success' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const currentReporte = tiposReporte.find(r => r.id === tipoReporte);

  return (
    <div className="reportes-page">
      {/* Header decorativo */}
      <div className="reportes-header">
        <div className="header-content">
          <div className="header-icon">
            <Zap size={40} color="#ea5455" />
          </div>
          <div>
            <h1>Generador de Reportes</h1>
            <p>Descarga reportes profesionales con gráficas, métricas y datos detallados</p>
          </div>
        </div>
      </div>

      <div className="reportes-container">
        {/* Selector de tipos de reporte */}
        <section className="reportes-section">
          <h2 className="section-title">
            <BarChart3 size={24} /> Selecciona el Tipo de Reporte
          </h2>
          <div className="reportes-grid">
            {tiposReporte.map((tipo) => (
              <div
                key={tipo.id}
                className={`reporte-card ${tipoReporte === tipo.id ? 'active' : ''}`}
                onClick={() => setTipoReporte(tipo.id)}
                style={{
                  borderLeftColor: tipoReporte === tipo.id ? tipo.color : '#e9ecef',
                  backgroundColor: tipoReporte === tipo.id ? 'rgba(255,255,255,0.95)' : '#fff',
                }}
              >
                <div className="card-icon" style={{ color: tipo.color }}>
                  {tipo.icon}
                </div>
                <h3>{tipo.label}</h3>
                <p className="card-description">{tipo.descripcion}</p>
                <p className="card-details">{tipo.details}</p>
                {tipoReporte === tipo.id && (
                  <div className="card-badge">
                    <span className="badge-dot"></span> Seleccionado
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Configuración del reporte */}
        <section className="reporte-preview-section">
          {/* Información del reporte */}
          <div className="reporte-info">
            <div className="info-badge" style={{ borderLeftColor: currentReporte?.color }}>
              <div className="badge-icon" style={{ color: currentReporte?.color }}>
                {currentReporte?.icon}
              </div>
              <div className="badge-content">
                <h3>{currentReporte?.label}</h3>
                <p>{currentReporte?.descripcion}</p>
              </div>
            </div>
            <div className="info-metrics">
              {metricas?.metrics ? (
                metricas.metrics.map((metric, idx) => (
                  <div key={idx} className="metric-item">
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value" style={{ color: metric.color }}>
                      {metric.value}
                    </span>
                  </div>
                ))
              ) : (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Cargando...</span>
                    <span className="metric-value">--</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gráficas */}
          {metricas?.chartData && metricas.chartData.length > 0 && (
            <div className="chart-section">
              <h4 className="chart-title">
                <BarChart3 size={18} /> Análisis Visual
              </h4>
              <div className="chart-wrapper">
                <BarChart data={metricas.chartData} />
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="filters-section">
            <h4>
              <AlertCircle size={16} /> Filtros
            </h4>
            <div className="filters-grid">
              <div className="filter-item">
                <label>Desde (Fecha)</label>
                <div className="filter-input-wrapper">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                    placeholder="Fecha de inicio"
                  />
                </div>
              </div>

              <div className="filter-item">
                <label>Hasta (Fecha)</label>
                <div className="filter-input-wrapper">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                    placeholder="Fecha de fin"
                  />
                </div>
              </div>

              {(tipoReporte === 'historiales' || tipoReporte === 'recetas') && (
                <div className="filter-item">
                  <label>ID del Paciente</label>
                  <div className="filter-input-wrapper">
                    <Users size={16} />
                    <input
                      type="text"
                      placeholder="Opcional - Deja vacío para todos"
                      value={filtros.pacienteId}
                      onChange={(e) => setFiltros({ ...filtros, pacienteId: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botón de descarga */}
          <div className="action-section">
            <button
              className={`btn-generate ${loading ? 'loading' : ''}`}
              onClick={handleGenerarReporte}
              disabled={loading}
              style={{ backgroundColor: currentReporte?.color }}
            >
              {loading ? (
                <>
                  <Loader size={20} className="spinner" /> Generando PDF...
                </>
              ) : (
                <>
                  <Download size={20} /> Descargar Reporte en PDF
                </>
              )}
            </button>
            <p className="action-hint">Se descargará como <strong>reporte_{tipoReporte}_{new Date().toISOString().slice(0, 10)}.pdf</strong></p>
          </div>
        </section>
      </div>

      {/* Modal de alerta */}
      {alertModal.show && (
        <div className="modal-overlay" onClick={() => setAlertModal({ ...alertModal, show: false })}>
          <div className={`modal-content modal-${alertModal.type}`}>
            <div className="modal-icon">
              {alertModal.type === 'success' ? '✓' : '!'}
            </div>
            <p>{alertModal.message}</p>
            <button
              className="modal-btn"
              onClick={() => setAlertModal({ ...alertModal, show: false })}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reportes;
