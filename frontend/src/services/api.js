import axios from 'axios';

// 1. Dodajemy /api na końcu bazowego adresu URL
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

export const authService = {
  register: async (name, email, password) => {
    // Teraz uderzy pod: http://localhost:3000/api/auth/register
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  login: async (email, password) => {
    // Teraz uderzy pod: http://localhost:3000/api/auth/login
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const projectService = {
  getAll: async () => {
    // Teraz uderzy pod: http://localhost:3000/api/projects
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (name, description) => {
    const response = await api.post('/projects', { name, description });
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export const taskService = {
  getByProject: async (projectId) => {
    // Teraz uderzy pod: http://localhost:3000/api/tasks/project/...
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },
  create: async (title, description, projectId) => {
    const response = await api.post('/tasks', { title, description, projectId });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default api;