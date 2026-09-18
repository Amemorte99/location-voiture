import api from './api';

// Envoi d'un message depuis le formulaire de contact (public)
export const sendMessage = async (messageData) => {
  const response = await api.post('/api/messages', messageData);
  return response.data;
};

// Récupération des messages avec pagination et filtres (admin)
export const getMessages = async (params = {}) => {
  const response = await api.get('/api/messages', { params });
  return response.data;
};

// Mise à jour du statut ou des notes d'un message (admin)
export const updateMessageStatus = async (id, payload) => {
  const data = typeof payload === 'string' ? { status: payload } : payload;
  const response = await api.patch(`/api/messages/${id}/status`, data);
  return response.data;
};

// Suppression d'un message (admin)
export const deleteMessage = async (id) => {
  const response = await api.delete(`/api/messages/${id}`);
  return response.data;
};
