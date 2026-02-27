import api from './api';

// Auth API calls
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Room API calls
export const roomAPI = {
  getRooms: () => api.get('/rooms'),
  getRoomById: (id) => api.get(`/rooms/${id}`),
  createRoom: (data) => api.post('/rooms', data),
  updateRoom: (id, data) => api.put(`/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/rooms/${id}`),
};

// Tenant API calls
export const tenantAPI = {
  getTenants: () => api.get('/tenants'),
  getTenantById: (id) => api.get(`/tenants/${id}`),
  getTenantByUserId: (userId) => api.get(`/tenants/user/${userId}`),
  createTenant: (data) => api.post('/tenants', data),
  updateTenant: (id, data) => api.put(`/tenants/${id}`, data),
  removeTenant: (id) => api.delete(`/tenants/${id}`),
};

// Meter API calls
export const meterAPI = {
  getMeterReadings: (roomId) => api.get(`/meter/${roomId}`),
  createMeterReading: (data) => api.post('/meter', data),
};

// Bill API calls
export const billAPI = {
  getTenantBills: (tenantId) => api.get(`/bills/tenant/${tenantId}`),
  getCurrentBill: (tenantId) => api.get(`/bills/tenant/${tenantId}/current`),
  getAllBills: () => api.get('/bills'),
  generateBill: (data) => api.post('/bills/generate', data),
  updateBillStatus: (id, data) => api.put(`/bills/${id}/status`, data),
  recordPayment: (data) => api.post('/bills/payment', data),
  getPaymentHistory: (billId) => api.get(`/bills/payment/${billId}`),
};

// Announcement API calls
export const announcementAPI = {
  getAnnouncements: () => api.get('/announcements'),
  getAnnouncementById: (id) => api.get(`/announcements/${id}`),
  createAnnouncement: (data) => api.post('/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/${id}`),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboardStats: () => api.get('/dashboard/stats'),
  getIncomeReport: (year) => api.get('/dashboard/income-report', { params: { year } }),
  getUnpaidBillsReport: () => api.get('/dashboard/unpaid-bills'),
  getUtilityUsageReport: (year) => api.get('/dashboard/utility-usage', { params: { year } }),
};
