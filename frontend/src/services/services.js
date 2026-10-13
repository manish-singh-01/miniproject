import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateLocation: (lat, lng) => api.put('/auth/location', { lat, lng }),
  getResponders: () => api.get('/auth/responders'),
};

export const incidentService = {
  getAll: (params) => api.get('/incidents', { params }),
  getMine: () => api.get('/incidents/mine'),
  create: (data) => api.post('/incidents', data),
  verify: (id) => api.patch(`/incidents/${id}/verify`),
  resolve: (id) => api.patch(`/incidents/${id}/resolve`),
};

export const alertService = {
  getActive: () => api.get('/alerts/active'),
  getAll: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
  send: (id) => api.patch(`/alerts/${id}/send`),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const shelterService = {
  getAll: () => api.get('/shelters'),
  getNearby: (lat, lng, radius = 30) =>
    api.get('/shelters/nearby', { params: { lat, lng, radius } }),
  create: (data) => api.post('/shelters', data),
  update: (id, data) => api.patch(`/shelters/${id}`, data),
};

export const taskService = {
  getMine: () => api.get('/tasks/mine'),
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  updateStatus: (id, status, notes) =>
    api.patch(`/tasks/${id}/status`, { status, notes }),
};
