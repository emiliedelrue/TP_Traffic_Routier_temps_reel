import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const trafficAPI = {
  getLiveZones: () => api.get('/zones/live'),
  getTopCongested: (limit = 5) => api.get(`/zones/top-congested?limit=${limit}`),
  getAggregateStats: () => api.get('/aggregates/stats'),
  getZoneHistory: (zoneId, hours = 24) => api.get(`/zones/history/${zoneId}?hours=${hours}`),
};

export default api;