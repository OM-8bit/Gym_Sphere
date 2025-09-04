// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach authorization token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Member API functions
export const getMembers = async () => {
  try {
    const response = await api.get('/api/members');
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const addMember = async (formData) => {
  try {
    const response = await api.post('/api/members', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

export const deleteMember = async (memberId) => {
  try {
    const response = await api.delete(`/api/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

export const getMember = async (memberId) => {
  try {
    const response = await api.get(`/api/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
};

export const updateMember = async (memberId, formData) => {
  try {
    const response = await api.put(`/api/members/${memberId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};
