import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const usuarioService = {
  getAll: () => api.get('/usuarios'),
  getById: (id) => api.get(`/usuarios/${id}`),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

export const pacienteService = {
  getAll: () => api.get('/pacientes'),
  getById: (id) => api.get(`/pacientes/${id}`),
  create: (data) => api.post('/pacientes', data),
  update: (id, data) => api.put(`/pacientes/${id}`, data),
  delete: (id) => api.delete(`/pacientes/${id}`),
};

export const historiaClinicaService = {
  getByPaciente: (pacienteId) => api.get(`/historias-clinicas/paciente/${pacienteId}`),
  create: (data) => api.post('/historias-clinicas', data),
  update: (id, data) => api.put(`/historias-clinicas/${id}`, data),
};

// Antecedentes
export const antecedenteGOService = {
  getByHistoria: (historiaId) => api.get(`/antecedentes-go/historia/${historiaId}`),
  create: (data) => api.post('/antecedentes-go', data),
  update: (id, data) => api.put(`/antecedentes-go/${id}`, data),
};

export const antecedentePatologicoService = {
  getByHistoria: (historiaId) => api.get(`/antecedentes-patologicos/historia/${historiaId}`),
  create: (data) => api.post('/antecedentes-patologicos', data),
  update: (id, data) => api.put(`/antecedentes-patologicos/${id}`, data),
};

// Consultas
export const consultaMedicaService = {
  getByHistoria: (historiaId) => api.get(`/consultas-medicas/historia/${historiaId}`),
  create: (data) => api.post('/consultas-medicas', data),
  update: (id, data) => api.put(`/consultas-medicas/${id}`, data),
  delete: (id) => api.delete(`/consultas-medicas/${id}`),
};

export const examenFisicoService = {
  getByConsulta: (consultaId) => api.get(`/examenes-fisicos/consulta/${consultaId}`),
  create: (data) => api.post('/examenes-fisicos', data),
};

// Recetas
export const recetaService = {
  getAll: () => api.get('/recetas'),
  getById: (id) => api.get(`/recetas/${id}`),
  getByConsulta: (consultaId) => api.get(`/recetas/consulta/${consultaId}`),
  create: (data) => api.post('/recetas', data),
  createCompleta: (data) => api.post('/recetas/completa', data),
  update: (id, data) => api.put(`/recetas/${id}`, data),
  delete: (id) => api.delete(`/recetas/${id}`),
};
export const reporteService = {
  generarPDF: (tipo, filtros) => 
    api.post('/reportes/generar', { tipo, ...filtros }, {
      responseType: 'arraybuffer'
    }),
  obtenerMetricas: (tipo, pacienteId) => 
    api.get(`/reportes/metricas?tipo=${tipo}${pacienteId ? `&pacienteId=${pacienteId}` : ''}`),
};
export const detalleRecetaService = {
  create: (data) => api.post('/detalle-recetas', data),
  update: (id, data) => api.put(`/detalle-recetas/${id}`, data),
  delete: (id) => api.delete(`/detalle-recetas/${id}`),
};

export const citaService = {
  getAll: () => api.get('/citas'),
  getById: (id) => api.get(`/citas/${id}`),
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  delete: (id) => api.delete(`/citas/${id}`),
};

export const cirugiaService = {
  getAll: () => api.get('/cirugias'),
  create: (data) => api.post('/cirugias', data),
  update: (id, data) => api.put(`/cirugias/${id}`, data),
};

export const insumoService = {
  getAll: () => api.get('/insumos'),
  getById: (id) => api.get(`/insumos/${id}`),
  create: (data) => api.post('/insumos', data),
  update: (id, data) => api.put(`/insumos/${id}`, data),
  delete: (id) => api.delete(`/insumos/${id}`),
};

export const uploadService = {
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    return api.post('/upload/perfil', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadContentFile: (file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return api.post('/upload/contenido', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export const contenidoEducativoService = {
  getAll: () => api.get('/contenidos-educativos'),
  getById: (id) => api.get(`/contenidos-educativos/${id}`),
  create: (data) => api.post('/contenidos-educativos', data),
  update: (id, data) => api.put(`/contenidos-educativos/${id}`, data),
  delete: (id) => api.delete(`/contenidos-educativos/${id}`),
};

// Agrega este servicio en tu api.js
export const medicoService = {
  getAll: () => api.get('/medicos'),
  getMe: () => api.get('/medicos/yo'),
  getById: (id) => api.get(`/medicos/${id}`),
  create: (data) => api.post('/medicos', data),
  update: (id, data) => api.put(`/medicos/${id}`, data),
  delete: (id) => api.delete(`/medicos/${id}`),
};