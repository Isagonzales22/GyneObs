import React, { useState, useEffect, useMemo } from 'react';
import {
  Pill, Plus, Eye, Pencil, Trash2, Calendar, User, Stethoscope,
  Save, X, FileText
} from 'lucide-react';
import { recetaService, pacienteService, medicoService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { esPaciente } from '../utils/roles';
import './Recetas.css';

const MED_EMPTY = { medicamento: '', dosis: '', frecuencia: '', duracion: '' };

const getNombreUsuario = (u) =>
  u ? `${u.primer_nombre || ''} ${u.primer_apellido || ''}`.trim() : '';

const getNombrePaciente = (receta) =>
  getNombreUsuario(receta.paciente?.usuario) ||
  receta.paciente?.codigo_paciente ||
  'Paciente';

const getNombreMedico = (receta) =>
  getNombreUsuario(receta.medico?.usuario) ||
  receta.medico?.especialidad ||
  'Médico';

const formatFecha = (f) => {
  if (!f) return '—';
  return new Date(f).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Recetas = () => {
  const { user } = useAuth();
  const userRoleId = Number(user?.rol?.id_rol ?? user?.id_rol);
  const userId = user?.id_usuario || user?.id;

  const canManage = userRoleId === 1 || userRoleId === 2;
  const isPacienteUser = esPaciente(user);
  const isAdmin = userRoleId === 1;
  const isMedico = userRoleId === 2;

  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [medicoLogueado, setMedicoLogueado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewReceta, setViewReceta] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });

  const [formData, setFormData] = useState({
    id_paciente: '',
    id_medico: '',
    fecha_receta: new Date().toISOString().slice(0, 10),
    indicaciones_generales: '',
    medicamentos: [{ ...MED_EMPTY }],
  });

  const miMedicoId = useMemo(
    () => medicoLogueado?.id_medico || medicoLogueado?.id || null,
    [medicoLogueado]
  );

  const nombreMedicoLogueado = useMemo(() => {
    if (!medicoLogueado) return getNombreUsuario(user) || 'Médico';
    return getNombreUsuario(medicoLogueado.usuario) || getNombreUsuario(user) || 'Médico';
  }, [medicoLogueado, user]);

  const cargarDatos = async () => {
    try {
      const promises = [recetaService.getAll()];
      if (canManage) {
        promises.push(pacienteService.getAll());
        if (isMedico) {
          promises.push(medicoService.getMe());
        } else if (isAdmin) {
          promises.push(medicoService.getAll());
        }
      }
      const results = await Promise.all(promises);
      const recRes = results[0];
      const data = recRes.data?.recetas || recRes.data || [];
      setRecetas(Array.isArray(data) ? data : []);

      if (canManage) {
        const pacRes = results[1];
        const pacData = pacRes.data?.pacientes || pacRes.data || [];
        setPacientes(Array.isArray(pacData) ? pacData : []);

        if (isMedico) {
          const medMeRes = results[2];
          const med = medMeRes?.data?.medico || null;
          setMedicoLogueado(med);
          if (med) {
            const idMed = med.id_medico || med.id;
            setFormData((prev) => ({ ...prev, id_medico: idMed }));
          }
        } else if (isAdmin) {
          const medRes = results[2];
          const medData = medRes.data?.medicos || medRes.data || [];
          setMedicos(Array.isArray(medData) ? medData : []);
        }
      }
    } catch (error) {
      console.error(error);
      setAlertModal({
        show: true,
        message: error.response?.data?.message || 'Error al cargar recetas',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (miMedicoId) {
      setFormData((prev) => ({ ...prev, id_medico: miMedicoId }));
    }
  }, [miMedicoId]);

  const resetForm = () => {
    setFormData({
      id_paciente: '',
      id_medico: miMedicoId || '',
      fecha_receta: new Date().toISOString().slice(0, 10),
      indicaciones_generales: '',
      medicamentos: [{ ...MED_EMPTY }],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const abrirEdicion = (receta) => {
    const detalles = receta.detalleReceta?.length
      ? receta.detalleReceta.map((d) => ({
          medicamento: d.medicamento || '',
          dosis: d.dosis || '',
          frecuencia: d.frecuencia || '',
          duracion: d.duracion || '',
        }))
      : [{ ...MED_EMPTY }];

    setFormData({
      id_paciente: receta.id_paciente,
      id_medico: receta.id_medico,
      fecha_receta: receta.fecha_receta
        ? String(receta.fecha_receta).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      indicaciones_generales: receta.indicaciones_generales || '',
      medicamentos: detalles,
    });
    setEditingId(receta.id_receta || receta.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addMedRow = () => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, { ...MED_EMPTY }],
    }));
  };

  const removeMedRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index),
    }));
  };

  const updateMedRow = (index, field, value) => {
    setFormData((prev) => {
      const meds = [...prev.medicamentos];
      meds[index] = { ...meds[index], [field]: value };
      return { ...prev, medicamentos: meds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idMedico = isMedico ? miMedicoId : formData.id_medico;
    if (!formData.id_paciente) {
      setAlertModal({ show: true, message: 'Selecciona el paciente', type: 'error' });
      return;
    }
    if (!idMedico) {
      setAlertModal({
        show: true,
        message: isMedico
          ? 'No se encontró tu perfil de médico. Contacta al administrador.'
          : 'Selecciona el médico',
        type: 'error',
      });
      return;
    }

    const payload = {
      id_paciente: formData.id_paciente,
      id_medico: idMedico,
      fecha_receta: formData.fecha_receta,
      indicaciones_generales: formData.indicaciones_generales,
      medicamentos: formData.medicamentos,
    };

    try {
      if (editingId) {
        await recetaService.update(editingId, payload);
        setAlertModal({ show: true, message: 'Receta actualizada correctamente', type: 'success' });
      } else {
        await recetaService.createCompleta(payload);
        setAlertModal({ show: true, message: 'Receta emitida correctamente', type: 'success' });
      }
      resetForm();
      await cargarDatos();
    } catch (error) {
      setAlertModal({
        show: true,
        message: error.response?.data?.message || 'Error al guardar la receta',
        type: 'error',
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await recetaService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setAlertModal({ show: true, message: 'Receta eliminada', type: 'success' });
      await cargarDatos();
    } catch (error) {
      setAlertModal({ show: true, message: 'Error al eliminar', type: 'error' });
    }
  };

  const renderDetalleTable = (detalles) => {
    if (!detalles?.length) {
      return <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin medicamentos detallados.</p>;
    }
    return (
      <table className="receta-meds-table">
        <thead>
          <tr>
            <th>Medicamento</th>
            <th>Dosis</th>
            <th>Frecuencia</th>
            <th>Duración</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((d) => (
            <tr key={d.id_detalle_receta || d.medicamento}>
              <td><strong>{d.medicamento}</strong></td>
              <td>{d.dosis || '—'}</td>
              <td>{d.frecuencia || '—'}</td>
              <td>{d.duracion || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderRecetaCard = (receta) => {
    const id = receta.id_receta || receta.id;
    return (
      <article key={id} className="receta-card">
        <div className="receta-card-header">
          <div>
            <h3>
              <Pill size={18} style={{ verticalAlign: 'middle', marginRight: 8, color: '#0d6efd' }} />
              Receta médica
            </h3>
            {!isPacienteUser && (
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                {getNombrePaciente(receta)}
              </p>
            )}
          </div>
          <span className="receta-fecha">
            <Calendar size={14} />
            {formatFecha(receta.fecha_receta)}
          </span>
        </div>
        <div className="receta-card-body">
          <div className="receta-paciente-medico">
            {isPacienteUser ? (
              <div>
                <label>Médico tratante</label>
                <span>{getNombreMedico(receta)}</span>
              </div>
            ) : (
              <>
                <div>
                  <label><User size={12} /> Paciente</label>
                  <span>{getNombrePaciente(receta)}</span>
                </div>
                <div>
                  <label><Stethoscope size={12} /> Médico</label>
                  <span>{getNombreMedico(receta)}</span>
                </div>
              </>
            )}
          </div>
          {renderDetalleTable(receta.detalleReceta)}
          {receta.indicaciones_generales && (
            <div className="receta-indicaciones">
              <strong>Indicaciones:</strong> {receta.indicaciones_generales}
            </div>
          )}
        </div>
        <div className="receta-card-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setViewReceta(receta)}>
            <Eye size={16} /> Ver receta
          </button>
          {canManage && (
            <>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => abrirEdicion(receta)}>
                <Pencil size={16} /> Editar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteModal({ show: true, id })}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </article>
    );
  };

  return (
    <>
      <div className="educacion-page animate-fade-in">
        <header className="educacion-hero recetas-hero">
          <h2>Recetas Médicas</h2>
          <p>
            {isPacienteUser
              ? 'Consulta las recetas que te ha emitido tu médico.'
              : isMedico
                ? `Emite recetas a tus pacientes como Dr/a. ${nombreMedicoLogueado}.`
                : 'Emite y gestiona recetas para tus pacientes.'}
          </p>
          {canManage && (
            <div className="educacion-hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={isMedico && !medicoLogueado && !loading}
                onClick={() => {
                  if (showForm && !editingId) resetForm();
                  else {
                    setEditingId(null);
                    setShowForm(true);
                  }
                }}
              >
                <Plus size={18} /> {showForm ? 'Cancelar' : 'Nueva receta'}
              </button>
            </div>
          )}
        </header>

        {isMedico && medicoLogueado && (
          <div className="receta-medico-badge">
            <Stethoscope size={24} color="#0d6efd" />
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Sesión activa como</span>
              <br />
              <strong>Dr/a. {nombreMedicoLogueado}</strong>
            </div>
          </div>
        )}

        <div className="educacion-stat-card" style={{ marginBottom: 8 }}>
          <div className="educacion-stat-icon" style={{ backgroundColor: '#e7f1ff', color: '#0d6efd' }}>
            <FileText size={22} />
          </div>
          <div>
            <strong>{recetas.length}</strong>
            <span>
              {isPacienteUser
                ? 'Recetas recibidas'
                : isMedico
                  ? 'Mis recetas emitidas'
                  : 'Recetas en el sistema'}
            </span>
          </div>
        </div>

        {canManage && showForm && (
          <div className="educacion-form-card receta-form-panel animate-fade-in">
            <h4>
              {editingId ? <Pencil size={20} /> : <Plus size={20} />}
              {editingId ? 'Editar receta' : 'Emitir nueva receta'}
            </h4>
            <form onSubmit={handleSubmit} className="educacion-form-grid">
              {isMedico && (
                <div
                  className="form-group full"
                  style={{
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, #e7f1ff, #f3ecff)',
                    borderRadius: '12px',
                    border: '1px solid rgba(13, 110, 253, 0.2)',
                  }}
                >
                  <label style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stethoscope size={16} /> Médico que emite la receta
                  </label>
                  <strong style={{ fontSize: '16px', color: '#0d6efd' }}>
                    Dr/a. {nombreMedicoLogueado}
                  </strong>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                    La receta quedará registrada a tu nombre automáticamente.
                  </p>
                </div>
              )}
              <div className="form-group" style={isMedico ? { gridColumn: '1 / -1' } : undefined}>
                <label>Paciente *</label>
                <select
                  value={formData.id_paciente}
                  onChange={(e) => setFormData({ ...formData, id_paciente: e.target.value })}
                  required
                  disabled={!!editingId}
                >
                  <option value="">— Seleccionar paciente —</option>
                  {pacientes.map((p) => (
                    <option key={p.id_paciente || p.id} value={p.id_paciente || p.id}>
                      {getNombreUsuario(p.usuario) || p.codigo_paciente}
                    </option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label>Médico *</label>
                  <select
                    value={formData.id_medico}
                    onChange={(e) => setFormData({ ...formData, id_medico: e.target.value })}
                    required
                  >
                    <option value="">— Seleccionar médico —</option>
                    {medicos.map((m) => (
                      <option key={m.id_medico || m.id} value={m.id_medico || m.id}>
                        {getNombreUsuario(m.usuario) || m.especialidad}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Fecha de receta</label>
                <input
                  type="date"
                  value={formData.fecha_receta}
                  onChange={(e) => setFormData({ ...formData, fecha_receta: e.target.value })}
                  required
                />
              </div>
              <div className="form-group full">
                <label>Indicaciones generales</label>
                <textarea
                  value={formData.indicaciones_generales}
                  onChange={(e) =>
                    setFormData({ ...formData, indicaciones_generales: e.target.value })
                  }
                  rows="2"
                  placeholder="Reposo, dieta, observaciones..."
                />
              </div>
              <div className="form-group full">
                <label>Medicamentos</label>
                <div className="receta-form-meds">
                  {formData.medicamentos.map((med, idx) => (
                    <div key={idx} className="receta-med-row">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Medicamento</label>
                        <input
                          type="text"
                          value={med.medicamento}
                          onChange={(e) => updateMedRow(idx, 'medicamento', e.target.value)}
                          placeholder="Nombre"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Dosis</label>
                        <input
                          type="text"
                          value={med.dosis}
                          onChange={(e) => updateMedRow(idx, 'dosis', e.target.value)}
                          placeholder="500 mg"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Frecuencia</label>
                        <input
                          type="text"
                          value={med.frecuencia}
                          onChange={(e) => updateMedRow(idx, 'frecuencia', e.target.value)}
                          placeholder="C/8h"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Duración</label>
                        <input
                          type="text"
                          value={med.duracion}
                          onChange={(e) => updateMedRow(idx, 'duracion', e.target.value)}
                          placeholder="7 días"
                        />
                      </div>
                      {formData.medicamentos.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeMedRow(idx)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={addMedRow}>
                  <Plus size={16} /> Agregar medicamento
                </button>
              </div>
              <div className="form-group full" style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={18} /> {editingId ? 'Guardar cambios' : 'Emitir receta'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p style={{ padding: 32, textAlign: 'center' }}>Cargando recetas...</p>
        ) : recetas.length === 0 ? (
          <div className="educacion-empty">
            <Pill size={48} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              {isPacienteUser
                ? 'Aún no tienes recetas médicas registradas.'
                : 'No hay recetas emitidas. Crea la primera con el botón superior.'}
            </p>
          </div>
        ) : (
          <div className="recetas-grid">{recetas.map(renderRecetaCard)}</div>
        )}
      </div>

      {viewReceta && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setViewReceta(null)}
        >
          <div className="educacion-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Pill color="#0d6efd" /> Receta médica
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {formatFecha(viewReceta.fecha_receta)}
              {!isPacienteUser && ` · ${getNombrePaciente(viewReceta)}`}
            </p>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              <Stethoscope size={14} style={{ verticalAlign: 'middle' }} /> {getNombreMedico(viewReceta)}
            </p>
            {renderDetalleTable(viewReceta.detalleReceta)}
            {viewReceta.indicaciones_generales && (
              <div className="receta-indicaciones" style={{ marginTop: 16 }}>
                <strong>Indicaciones generales:</strong>
                <br />
                {viewReceta.indicaciones_generales}
              </div>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 20 }}
              onClick={() => setViewReceta(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ padding: 30, maxWidth: 400, textAlign: 'center', background: 'white' }}>
            <Trash2 size={48} color="#ea5455" style={{ marginBottom: 15 }} />
            <h3>¿Eliminar receta?</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: 10 }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null })}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {alertModal.show && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
        >
          <div className="card" style={{ padding: 30, maxWidth: 400, textAlign: 'center', background: 'white' }}>
            <h3>{alertModal.type === 'error' ? 'Error' : 'Éxito'}</h3>
            <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>{alertModal.message}</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
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

export default Recetas;
