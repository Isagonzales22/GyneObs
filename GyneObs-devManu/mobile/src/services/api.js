import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default development IP - will be updated dynamically via AsyncStorage if changed in Settings
export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000/api';

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 8000, // 8 seconds timeout to prevent infinite loading
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to load dynamic base URL and Bearer token before each request
api.interceptors.request.use(async (config) => {
  try {
    // Load custom API URL if set by user in Profile Screen
    const customUrl = await AsyncStorage.getItem('custom_api_url');
    if (customUrl) {
      config.baseURL = customUrl;
    } else {
      config.baseURL = DEFAULT_API_URL;
    }

    // Load Token
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error in API request interceptor:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

// Helper to check/update base URL
export const getBaseURL = async () => {
  const customUrl = await AsyncStorage.getItem('custom_api_url');
  return customUrl || DEFAULT_API_URL;
};

export const setBaseURL = async (url) => {
  if (!url) {
    await AsyncStorage.removeItem('custom_api_url');
  } else {
    await AsyncStorage.setItem('custom_api_url', url);
  }
};

// API Services matching the web client
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const usuarioService = {
  getById: (id) => api.get(`/usuarios/${id}`),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
};

export const pacienteService = {
  getAll: () => api.get('/pacientes'),
  getById: (id) => api.get(`/pacientes/${id}`),
};

export const historiaClinicaService = {
  getByPaciente: (pacienteId) => api.get(`/historias-clinicas/paciente/${pacienteId}`),
};

export const recetaService = {
  getAll: () => api.get('/recetas'),
  getById: (id) => api.get(`/recetas/${id}`),
};

export const citaService = {
  getAll: () => api.get('/citas'),
  getById: (id) => api.get(`/citas/${id}`),
  create: (data) => api.post('/citas', data),
  update: (id, data) => api.put(`/citas/${id}`, data),
  delete: (id) => api.delete(`/citas/${id}`),
};

export const medicoService = {
  getAll: () => api.get('/medicos'),
};

export const contenidoEducativoService = {
  getAll: () => api.get('/contenidos-educativos'),
};

export const uploadService = {
  uploadProfilePhoto: (uri) => {
    const formData = new FormData();
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';
    
    formData.append('foto', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: filename || 'photo.jpg',
      type: type || 'image/jpeg',
    });
    
    return api.post('/upload/perfil', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
