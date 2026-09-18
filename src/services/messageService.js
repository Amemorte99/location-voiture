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

// Mise à jour du statut d'un message (admin: 'read', 'unread', 'archived')
export const updateMessageStatus = async (id, status) => {
  const response = await api.patch(`/api/messages/${id}/status`, { status });
  return response.data;
};

// Suppression d'un message (admin)
export const deleteMessage = async (id) => {
  const response = await api.delete(`/api/messages/${id}`);
  return response.data;
};
