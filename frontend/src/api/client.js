const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    // Network error (server down, no internet, etc.)
    throw new Error('Network error — please check your connection and try again.');
  }

  // Handle 204 No Content (e.g. PUT responses)
  if (res.status === 204) return { success: true };

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const message =
      data.error || data.message || data.detail ||
      (res.status === 401 ? 'Session expired. Please sign in again.' :
       res.status === 403 ? 'You do not have permission to perform this action.' :
       res.status === 404 ? 'The requested resource was not found.' :
       res.status === 500 ? 'Server error. Please try again later.' :
       `Request failed (${res.status})`);
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Service Requests (Consumer)
  createRequest: (data) =>
    request('/requests', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: (consumerId) =>
    request(`/requests?consumer_id=${consumerId}`),
  getRequest: (id) => request(`/requests/${id}`),

  // Provider feed
  getAvailableRequests: () => request('/providers/feed'),

  // Offers
  createOffer: (requestId, data) =>
    request(`/requests/${requestId}/offers`, { method: 'POST', body: JSON.stringify(data) }),
  getOffersForRequest: (requestId) => request(`/requests/${requestId}/offers`),
  respondToOffer: (offerId, { status, price, message }) =>
    request(`/offers/${offerId}`, {
      method: 'PUT',
      body: JSON.stringify({ status, price, message }),
    }),

  // Chat — scoped to requests
  getMessages: (requestId) => request(`/requests/${requestId}/messages`),
  sendMessage: (requestId, text) =>
    request(`/requests/${requestId}/messages`, { method: 'POST', body: JSON.stringify({ text }) }),
};