import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, Activity, Package, Clock, TrendingUp } from 'lucide-react';
import { pacienteService, citaService, cirugiaService, insumoService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { esPaciente, getRolDisplayName } from '../utils/roles';
import './Dashboard.css';

const inicioDelDia = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const filtrarProximasCitas = (citas) => {
  const hoy = inicioDelDia();
  return (Array.isArray(citas) ? citas : [])
    .filter((c) => {
      const estado = (c.estado_cita || c.estado || 'PROGRAMADA').toUpperCase();
      if (['CANCELADA', 'COMPLETADA', 'FINALIZADA'].includes(estado)) return false;
      const fecha = new Date(c.fecha_cita);
      return !isNaN(fecha.getTime()) && fecha >= hoy;
    })
    .sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));
};

const formatearProximaCita = (cita) => {
  if (!cita) return 'Ninguna';
  const fecha = new Date(cita.fecha_cita);
  const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = cita.hora_inicio || cita.hora_cita || '';
  return `${fechaStr}${hora ? ` · ${hora}` : ''}`;
};

const DashboardCard = ({ title, value, icon, color, trend }) => (
  <div className="dashboard-card card">
    <div className="card-icon" style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, color: color }}>
      {icon}
    </div>
    <div className="card-info">
      <h3>{title}</h3>
      <div className="card-value-row">
        <span className="value">{value}</span>
        {trend && (
          <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={14} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    pacientes: 0,
    citas: 0,
    cirugias: 0,
    insumosBajos: 0
  });
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  const rolName = user?.rol?.nombre_rol || 'SIN_ROL';
  const isPacienteUser = esPaciente(user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (rolName === 'ADMINISTRADOR' || rolName === 'MEDICO' || rolName === 'SECRETARIA') {
          // Fetch counts (Simulated by getting arrays and counting for now)
          const [pacientesRes, citasRes, cirugiasRes, insumosRes] = await Promise.all([
            pacienteService.getAll().catch(()=>({data:[]})),
            citaService.getAll().catch(()=>({data:[]})),
            cirugiaService.getAll().catch(()=>({data:[]})),
            insumoService.getAll().catch(()=>({data:[]}))
          ]);

          const pacientesData = pacientesRes.data?.pacientes || pacientesRes.data || [];
          const citasData = citasRes.data?.citas || citasRes.data || [];
          const cirugiasData = cirugiasRes.data?.cirugias || cirugiasRes.data || [];
          const insumosData = insumosRes.data?.insumos || insumosRes.data || [];

          // Calcular stats
          const insumosCriticos = Array.isArray(insumosData) ? insumosData.filter(i => i.cantidad_stock <= i.nivel_minimo).length : 0;
          
          setStats({
            pacientes: Array.isArray(pacientesData) ? pacientesData.length : 0,
            citas: Array.isArray(citasData) ? citasData.length : 0,
            cirugias: Array.isArray(cirugiasData) ? cirugiasData.length : 0,
            insumosBajos: insumosCriticos
          });

          // Citas de "hoy" (simulado usando las primeras 5 para no complicar la demo)
          setCitasHoy(Array.isArray(citasData) ? citasData.slice(0, 5) : []);
        } else if (isPacienteUser) {
          const citasRes = await citaService.getAll().catch(() => ({ data: [] }));
          const citasData = citasRes.data?.citas || citasRes.data || [];
          const proximas = filtrarProximasCitas(citasData);
          setCitasHoy(proximas);

          setStats({
            pacientes: 0,
            citas: Array.isArray(citasData) ? citasData.length : 0,
            cirugias: 0,
            insumosBajos: 0,
            proximaCita: formatearProximaCita(proximas[0]),
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [rolName, isPacienteUser]);

  const renderAdminStats = () => (
    <div className="stats-grid">
      <DashboardCard title="Pacientes Totales" value={stats.pacientes} icon={<Users size={24} />} color="#FF69B4" trend={12} />
      <DashboardCard title="Citas Programadas" value={stats.citas} icon={<Calendar size={24} />} color="#00BFFF" trend={5} />
      <DashboardCard title="Cirugías Pendientes" value={stats.cirugias} icon={<Activity size={24} />} color="#FF9F43" />
      <DashboardCard title="Insumos Bajos" value={stats.insumosBajos} icon={<Package size={24} />} color="#EA5455" trend={-2} />
    </div>
  );

  const renderMedicoStats = () => (
    <div className="stats-grid">
      <DashboardCard title="Mis Pacientes" value={stats.pacientes} icon={<Users size={24} />} color="#FF69B4" />
      <DashboardCard title="Mis Citas de Hoy" value={stats.citas} icon={<Calendar size={24} />} color="#00BFFF" />
      <DashboardCard title="Mis Cirugías" value={stats.cirugias} icon={<Activity size={24} />} color="#FF9F43" />
    </div>
  );

  const renderSecretariaStats = () => (
    <div className="stats-grid">
      <DashboardCard title="Pacientes Registrados" value={stats.pacientes} icon={<Users size={24} />} color="#FF69B4" trend={12} />
      <DashboardCard title="Citas Programadas" value={stats.citas} icon={<Calendar size={24} />} color="#764ba2" trend={5} />
    </div>
  );

  const renderPacienteStats = () => (
    <div className="stats-grid">
      <DashboardCard title="Mi Próxima Cita" value={stats.proximaCita || 'Ninguna'} icon={<Calendar size={24} />} color="#00BFFF" />
      <DashboardCard title="Mis Citas Totales" value={stats.citas} icon={<Clock size={24} />} color="#FF69B4" />
    </div>
  );

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h2>Bienvenido/a, {user?.primer_nombre || 'Usuario'}</h2>
        <p>Panel de {getRolDisplayName(user)}</p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Cargando datos del sistema...</div>
      ) : (
        <>
          {rolName === 'ADMINISTRADOR' && renderAdminStats()}
          {rolName === 'MEDICO' && renderMedicoStats()}
          {rolName === 'SECRETARIA' && renderSecretariaStats()}
          {isPacienteUser && renderPacienteStats()}

          {(rolName === 'ADMINISTRADOR' || rolName === 'MEDICO' || rolName === 'SECRETARIA') && (
            <div className="dashboard-content-grid" style={{ marginTop: '30px' }}>
              <div className="card appointments-card">
                <div className="card-header">
                  <h3>Citas Recientes</h3>
                  <button className="btn btn-secondary btn-sm" onClick={()=>navigate('/citas')}>Ver todas</button>
                </div>
                <div className="appointments-list">
                  {citasHoy.length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-muted)' }}>No hay citas agendadas.</p>
                  ) : (
                    citasHoy.map(apt => (
                      <div key={apt.id_cita} className="appointment-item">
                        <div className="apt-time">
                          <Clock size={16} />
                          <span>{apt.hora_inicio || apt.hora_cita || '00:00'}</span>
                        </div>
                        <div className="apt-details">
                          <h4>{apt.paciente?.usuario?.primer_nombre || apt.paciente?.primer_nombre || 'Paciente'} {apt.paciente?.usuario?.primer_apellido || apt.paciente?.primer_apellido || ''}</h4>
                          <p>{apt.tipo_cita || apt.observaciones?.replace('Tipo: ', '') || 'Control'}</p>
                        </div>
                        <div className={`apt-status status-${(apt.estado_cita || apt.estado || 'PROGRAMADA').toLowerCase()}`}>
                          {apt.estado_cita || apt.estado || 'PROGRAMADA'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card quick-actions-card">
                <div className="card-header">
                  <h3>Acciones Rápidas</h3>
                </div>
                <div className="actions-grid">
                  <button className="action-btn" onClick={()=>navigate('/app/pacientes/nuevo')}>
                    <Users size={24} />
                    <span>Nuevo Paciente</span>
                  </button>
                  <button className="action-btn" onClick={()=>navigate('/app/citas')}>
                    <Calendar size={24} />
                    <span>Agendar Cita</span>
                  </button>
                  <button className="action-btn" onClick={()=>navigate('/app/cirugias')}>
                    <Activity size={24} />
                    <span>Prog. Cirugía</span>
                  </button>
                  <button className="action-btn" onClick={()=>navigate('/app/insumos')}>
                    <Package size={24} />
                    <span>Inventario</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPacienteUser && (
            <div className="dashboard-content-grid" style={{ marginTop: '30px', gridTemplateColumns: '1fr' }}>
              <div className="card appointments-card">
                <div className="card-header">
                  <h3>Próximas Citas</h3>
                </div>
                <div className="appointments-list">
                  {citasHoy.length === 0 ? (
                    <p style={{ padding: '20px', color: 'var(--text-muted)' }}>No tienes citas próximas agendadas.</p>
                  ) : (
                    citasHoy.map(apt => (
                      <div key={apt.id_cita} className="appointment-item">
                        <div className="apt-time">
                          <Clock size={16} />
                          <span>{apt.hora_inicio || apt.hora_cita || '00:00'}</span>
                        </div>
                        <div className="apt-details">
                          <h4>Dr/a. {apt.medico?.usuario?.primer_nombre || apt.medico?.nombre || 'Médico'} {apt.medico?.usuario?.primer_apellido || apt.medico?.apellido || ''}</h4>
                          <p>{apt.tipo_cita || apt.observaciones?.replace('Tipo: ', '') || 'Control'}</p>
                          <small style={{ color: 'var(--text-muted)' }}>Fecha: {apt.fecha_cita}</small>
                        </div>
                        <div className={`apt-status status-${(apt.estado_cita || apt.estado || 'PROGRAMADA').toLowerCase()}`}>
                          {apt.estado_cita || apt.estado || 'PROGRAMADA'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
