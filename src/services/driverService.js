import api from './api';

const API_URL = '/api/drivers';

export const getDrivers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`${API_URL}${query ? `?${query}` : ''}`);
  return response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post(API_URL, driverData);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`${API_URL}/${id}`, driverData);
  return response.data;
};

export const updateDriverStatus = async (id, status) => {
  const response = await api.patch(`${API_URL}/${id}/status`, { status });
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`${API_URL}/${id}`);
  return response.data;
};

export const assignDriverToBooking = async (bookingId, driverId, setDriverInMission = true) => {
  const response = await api.post(`${API_URL}/assign`, {
    bookingId,
    driverId,
    setDriverInMission,
  });
  return response.data;
};

const driverService = {
  getDrivers,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver,
  assignDriverToBooking,
};

export default driverService;
