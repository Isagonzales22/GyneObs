import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Video, FileText, Upload, Trash2, ExternalLink, Eye,
  Image as ImageIcon, Pencil, X, Save
} from 'lucide-react';
import { contenidoEducativoService, uploadService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { esPaciente } from '../utils/roles';
import './Patients.css';
import './Educacion.css';

const TIPOS = {
  Video: { label: 'Video', icon: Video, color: '#0d6efd', bg: '#e7f1ff' },
  Documento: { label: 'Documento', icon: FileText, color: '#6f42c1', bg: '#f3ecff' },
  Infografia: { label: 'Infografía', icon: ImageIcon, color: '#fd7e14', bg: '#fff4e6' },
};

const FILTROS = [
  { id: 'todos', label: 'Todos', icon: BookOpen },
  { id: 'Video', label: 'Videos', icon: Video },
  { id: 'Documento', label: 'Documentos', icon: FileText },
  { id: 'Infografia', label: 'Infografías', icon: ImageIcon },
];

const normalizarTipo = (tipo) => {
  const t = String(tipo || 'Documento').toLowerCase();
  if (t.includes('video')) return 'Video';
  if (t.includes('infograf')) return 'Infografia';
  return 'Documento';
};

const getEnlaceContenido = (item) => {
  if (!item) return '';
  if (item.enlace_url) return item.enlace_url;
  const tipo = normalizarTipo(item.tipo_contenido);
  if (tipo === 'Video') return item.url_video || '';
  if (tipo === 'Infografia') return item.imagen_portada_url || item.archivo_url || '';
  return item.archivo_url || item.url_video || '';
};

const getAutorNombre = (item) =>
  item?.autorUsuario?.primer_nombre ||
  item?.creador?.primer_nombre ||
  item?.autor ||
  'Clínica';

const buildPayload = (form, userId) => {
  const tipo = form.tipo_contenido;
  const url = form.enlace_url?.trim() || '';
  const payload = {
    titulo: form.titulo,
    descripcion: form.descripcion || null,
    tipo_contenido: tipo,
    autor: userId,
    estado: 'PUBLICADO',
    fecha_publicacion: new Date().toISOString().slice(0, 10),
    url_video: null,
    archivo_url: null,
    imagen_portada_url: null,
  };
  if (tipo === 'Video') {
    payload.url_video = url;
  } else if (tipo === 'Infografia') {
    payload.archivo_url = url;
    payload.imagen_portada_url = url;
  } else {
    payload.archivo_url = url;
  }
  return payload;
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url || '');

const ContenidoPreview = ({ item }) => {
  const tipo = normalizarTipo(item.tipo_contenido);
  const enlace = getEnlaceContenido(item);
  const config = TIPOS[tipo] || TIPOS.Documento;
  const Icon = config.icon;

  if (!enlace) {
    return (
      <div className="educacion-preview-box">
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          <Icon size={40} color={config.color} />
          <p style={{ marginTop: '12px' }}>Sin enlace disponible</p>
        </div>
      </div>
    );
  }

  if (tipo === 'Video') {
    const embed = getYoutubeEmbedUrl(enlace);
    if (embed) {
      return (
        <div className="educacion-preview-box">
          <iframe title={item.titulo} src={embed} allowFullScreen />
        </div>
      );
    }
    return (
      <div className="educacion-preview-box">
        <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Video size={18} /> Reproducir video
        </a>
      </div>
    );
  }

  if (tipo === 'Infografia' && isImageUrl(enlace)) {
    return (
      <div className="educacion-preview-box">
        <img src={enlace} alt={item.titulo} />
      </div>
    );
  }

  if (tipo === 'Infografia') {
    return (
      <div className="educacion-preview-box">
        <ImageIcon size={48} color={config.color} />
        <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '12px' }}>
          Ver infografía
        </a>
      </div>
    );
  }

  return (
    <div className="educacion-preview-box">
      <FileText size={48} color={config.color} />
      <a href={enlace} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '12px' }}>
        Abrir documento
      </a>
    </div>
  );
};

const Educacion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRoleId = Number(user?.rol?.id_rol ?? user?.id_rol);
  const userId = user?.id_usuario || user?.id;

  useEffect(() => {
    if (userRoleId === 4) navigate('/app/');
  }, [userRoleId, navigate]);

  const canManage = userRoleId === 1 || userRoleId === 2;
  const isPacienteUser = esPaciente(user);

  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewModal, setViewModal] = useState({ show: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: '' });
  const [alertModal, setAlertModal] = useState({ show: false, message: '', type: 'success' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_contenido: 'Documento',
    enlace_url: '',
  });

  const cargarContenidos = async () => {
    try {
      const contRes = await contenidoEducativoService.getAll();
      const data = contRes.data?.contenidos || contRes.data || [];
      const activos = (Array.isArray(data) ? data : []).filter(
        (c) => (c.estado || 'PUBLICADO') !== 'ARCHIVADO'
      );
      setContenidos(activos);
    } catch (error) {
      console.error('Error fetching contenidos', error);
      setAlertModal({ show: true, message: 'No se pudo cargar el contenido educativo', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContenidos();
  }, []);

  const contenidosFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return contenidos;
    return contenidos.filter((c) => normalizarTipo(c.tipo_contenido) === filtroTipo);
  }, [contenidos, filtroTipo]);

  const conteosPorTipo = useMemo(() => ({
    todos: contenidos.length,
    Video: contenidos.filter((c) => normalizarTipo(c.tipo_contenido) === 'Video').length,
    Documento: contenidos.filter((c) => normalizarTipo(c.tipo_contenido) === 'Documento').length,
    Infografia: contenidos.filter((c) => normalizarTipo(c.tipo_contenido) === 'Infografia').length,
  }), [contenidos]);

  const resetForm = () => {
    setFormData({ titulo: '', descripcion: '', tipo_contenido: 'Documento', enlace_url: '' });
    setSelectedFile(null);
    setFileError('');
    setEditingId(null);
    setShowForm(false);
  };

  const validateFile = (file, tipo) => {
    if (!file) return { valid: true, error: '' };

    if (tipo === 'Video') {
      return { valid: false, error: 'No se pueden subir archivos para videos. Usa un enlace de YouTube.' };
    }

    const imageExtensions = /\.(png|jpe?g|gif|webp|svg)$/i;
    const documentExtensions = /\.(pdf|docx?|pptx?|txt|xlsx?|xls)$/i;

    if (tipo === 'Infografia') {
      if (!imageExtensions.test(file.name)) {
        return { valid: false, error: 'Solo se permiten imágenes (PNG, JPG, GIF, WebP, SVG)' };
      }
    } else if (tipo === 'Documento') {
      const isImage = imageExtensions.test(file.name);
      const isDocument = documentExtensions.test(file.name);
      if (!isImage && !isDocument) {
        return { valid: false, error: 'Solo se permiten documentos (PDF, Word, PowerPoint, Excel, TXT) o imágenes' };
      }
    }
    return { valid: true, error: '' };
  };

  const abrirEdicion = (item) => {
    setSelectedFile(null);
    setFileError('');
    setFormData({
      titulo: item.titulo || '',
      descripcion: item.descripcion || '',
      tipo_contenido: normalizarTipo(item.tipo_contenido),
      enlace_url: getEnlaceContenido(item),
    });
    setEditingId(item.id_contenido || item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar que no tengan ambos: enlace Y archivo
      const hasLink = formData.enlace_url?.trim();
      const hasFile = selectedFile !== null;
      
      if (hasLink && hasFile) {
        setFileError('Por favor, proporciona solo uno: enlace O archivo, no ambos');
        return;
      }
      
      if (!hasLink && !hasFile) {
        setFileError('Debes proporcionar un enlace o un archivo');
        return;
      }

      if (selectedFile) {
        const validation = validateFile(selectedFile, formData.tipo_contenido);
        if (!validation.valid) {
          setFileError(validation.error);
          return;
        }
      }

      let fileUrl = '';
      if (selectedFile && formData.tipo_contenido !== 'Video') {
        const uploadRes = await uploadService.uploadContentFile(selectedFile);
        fileUrl = uploadRes.data?.archivoUrl || uploadRes.data?.secure_url || '';
        if (!fileUrl) {
          throw new Error('No se pudo obtener la URL del archivo subido');
        }
      }

      const payload = buildPayload(
        { ...formData, enlace_url: fileUrl || formData.enlace_url },
        userId
      );

      if (editingId) {
        await contenidoEducativoService.update(editingId, payload);
        setAlertModal({ show: true, message: 'Material actualizado correctamente', type: 'success' });
      } else {
        await contenidoEducativoService.create(payload);
        setAlertModal({ show: true, message: 'Material educativo publicado exitosamente', type: 'success' });
      }

      resetForm();
      await cargarContenidos();
    } catch (error) {
      console.error(error);
      setAlertModal({
        show: true,
        message: error.response?.data?.message || error.message || 'Error al guardar el material',
        type: 'error',
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await contenidoEducativoService.delete(deleteModal.id);
      setDeleteModal({ show: false, id: null, name: '' });
      setAlertModal({ show: true, message: 'Material eliminado correctamente', type: 'success' });
      await cargarContenidos();
    } catch (error) {
      console.error(error);
      setAlertModal({ show: true, message: 'Error al eliminar material', type: 'error' });
    }
  };

  const renderTarjeta = (c) => {
    const tipo = normalizarTipo(c.tipo_contenido);
    const config = TIPOS[tipo] || TIPOS.Documento;
    const Icon = config.icon;
    const enlace = getEnlaceContenido(c);

    return (
      <article key={c.id_contenido || c.id} className="educacion-card">
        <div className="educacion-card-cover" style={{ background: `linear-gradient(145deg, ${config.bg}, white)` }}>
          <span className="educacion-card-tipo-label" style={{ color: config.color }}>{config.label}</span>
          <div className="educacion-card-cover-icon">
            <Icon size={28} color={config.color} />
          </div>
        </div>
        <div className="educacion-card-body">
          <h3>{c.titulo}</h3>
          <p className="educacion-card-meta">Por {getAutorNombre(c)}</p>
          {c.descripcion && (
            <p className="educacion-card-meta">
              {c.descripcion.length > 80 ? `${c.descripcion.slice(0, 80)}…` : c.descripcion}
            </p>
          )}
        </div>
        <div className="educacion-card-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewModal({ show: true, item: c })}
          >
            <Eye size={16} /> Ver
          </button>
          {enlace && (
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <ExternalLink size={16} /> Abrir
            </a>
          )}
          {canManage && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => abrirEdicion(c)}
              >
                <Pencil size={16} /> Editar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() =>
                  setDeleteModal({ show: true, id: c.id_contenido || c.id, name: c.titulo })
                }
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
        <header className="educacion-hero">
          <h2>Contenido Educativo</h2>
          <p>
            {isPacienteUser
              ? 'Explora videos, documentos e infografías sobre salud gineco-obstétrica.'
              : 'Publica y organiza material de apoyo para tus pacientes.'}
          </p>
          {canManage && (
            <div className="educacion-hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (showForm && !editingId) resetForm();
                  else {
                    setEditingId(null);
                    setFormData({ titulo: '', descripcion: '', tipo_contenido: 'Documento', enlace_url: '' });
                    setShowForm(!showForm);
                  }
                }}
              >
                <Upload size={18} /> {showForm ? 'Cancelar' : 'Nuevo material'}
              </button>
            </div>
          )}
        </header>

        <div className="educacion-stats">
          {FILTROS.map((f) => {
            const FIcon = f.icon;
            const cfg = f.id === 'todos' ? { color: '#ff69b4', bg: '#fff0f6' } : TIPOS[f.id] || TIPOS.Documento;
            return (
              <div key={f.id} className="educacion-stat-card">
                <div className="educacion-stat-icon" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                  <FIcon size={22} />
                </div>
                <div>
                  <strong>{conteosPorTipo[f.id] ?? 0}</strong>
                  <span>{f.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="educacion-layout">
          <aside className="educacion-sidebar">
            <h4>Filtrar por tipo</h4>
            <div className="educacion-filtros">
              {FILTROS.map((f) => {
                const FIcon = f.icon;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`educacion-filtro-btn ${filtroTipo === f.id ? 'active' : ''}`}
                    onClick={() => setFiltroTipo(f.id)}
                  >
                    <FIcon size={16} />
                    {f.label}
                    <span style={{ marginLeft: 'auto', opacity: 0.8 }}>({conteosPorTipo[f.id]})</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="educacion-main">
            {canManage && showForm && (
              <div className="educacion-form-card animate-fade-in">
                <h4>
                  {editingId ? <Pencil size={20} /> : <Upload size={20} />}
                  {editingId ? 'Editar material' : 'Publicar nuevo material'}
                </h4>
                <form onSubmit={handleSubmit} className="educacion-form-grid">
                  <div className="form-group">
                    <label>Título</label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de contenido</label>
                    <select
                      value={formData.tipo_contenido}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedFile(null);
                        setFileError('');
                        setFormData({ ...formData, tipo_contenido: value });
                      }}
                    >
                      <option value="Video">Video</option>
                      <option value="Documento">Documento / Artículo</option>
                      <option value="Infografia">Infografía</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>Enlace o archivo</label>
                    <input
                      type="url"
                      value={formData.enlace_url}
                      onChange={(e) => {
                        setSelectedFile(null);
                        setFileError('');
                        setFormData({ ...formData, enlace_url: e.target.value });
                      }}
                      placeholder="https://... (video, PDF o imagen)"
                      disabled={selectedFile !== null}
                    />
                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="file"
                        disabled={formData.tipo_contenido === 'Video'}
                        accept={formData.tipo_contenido === 'Infografia' ? 'image/*' : formData.tipo_contenido === 'Documento' ? '.pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,image/*' : ''}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          const validation = validateFile(file, formData.tipo_contenido);
                          
                          if (file && !validation.valid) {
                            setSelectedFile(null);
                            setFileError(validation.error);
                          } else if (file && validation.valid) {
                            setSelectedFile(file);
                            setFileError('');
                            setFormData({ ...formData, enlace_url: '' });
                          } else {
                            setSelectedFile(null);
                            setFileError('');
                          }
                        }}
                      />
                      {selectedFile && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Archivo: {selectedFile.name}</span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                      {fileError && (
                        <p style={{ color: '#d32f2f', marginTop: '8px' }}>{fileError}</p>
                      )}
                    </div>
                  </div>
                  <div className="form-group full">
                    <label>Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div className="form-group full" style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      <Save size={18} /> {editingId ? 'Guardar cambios' : 'Publicar'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      <X size={18} /> Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <p style={{ padding: '24px', textAlign: 'center' }}>Cargando materiales...</p>
            ) : (
              <div className="educacion-grid">
                {contenidosFiltrados.length === 0 ? (
                  <div className="educacion-empty">
                    <BookOpen size={44} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      {filtroTipo === 'todos'
                        ? 'No hay contenidos educativos disponibles.'
                        : `No hay ${FILTROS.find((f) => f.id === filtroTipo)?.label?.toLowerCase()} por ahora.`}
                    </p>
                  </div>
                ) : (
                  contenidosFiltrados.map(renderTarjeta)
                )}
              </div>
            )}
          </div>
        </div>

        {viewModal.show && viewModal.item && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '16px',
            }}
            onClick={() => setViewModal({ show: false, item: null })}
          >
            <div className="educacion-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const tipo = normalizarTipo(viewModal.item.tipo_contenido);
                const config = TIPOS[tipo] || TIPOS.Documento;
                const Icon = config.icon;
                return (
                  <>
                    <span
                      className="educacion-tipo-badge"
                      style={{ backgroundColor: config.bg, color: config.color }}
                    >
                      <Icon size={14} />
                      {config.label}
                    </span>
                    <h3 style={{ margin: '12px 0 8px' }}>{viewModal.item.titulo}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
                      Publicado por {getAutorNombre(viewModal.item)}
                    </p>
                    {viewModal.item.descripcion && (
                      <p style={{ marginTop: '16px', lineHeight: 1.55 }}>{viewModal.item.descripcion}</p>
                    )}
                    <ContenidoPreview item={viewModal.item} />
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setViewModal({ show: false, item: null })}
                      >
                        Cerrar
                      </button>
                      {getEnlaceContenido(viewModal.item) && (
                        <a
                          href={getEnlaceContenido(viewModal.item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                        >
                          <ExternalLink size={18} />
                          {tipo === 'Video' ? 'Ver video completo' : tipo === 'Infografia' ? 'Ver infografía' : 'Abrir documento'}
                        </a>
                      )}
                    </div>
                  </>
                );
              })()}
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
            <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
              <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
              <h3>¿Eliminar material?</h3>
              <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>
                Vas a eliminar <strong>{deleteModal.name}</strong>. Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px' }}>
                <button className="btn btn-secondary" onClick={() => setDeleteModal({ show: false, id: null, name: '' })}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={confirmDelete}>Sí, eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>

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
          <div className="card animate-fade-in" style={{ padding: '30px', maxWidth: '400px', textAlign: 'center', backgroundColor: 'white' }}>
            {alertModal.type === 'error' ? (
              <Trash2 size={48} color="#ea5455" style={{ marginBottom: '15px' }} />
            ) : (
              <BookOpen size={48} color="#28c76f" style={{ marginBottom: '15px' }} />
            )}
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

export default Educacion;
