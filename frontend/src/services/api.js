// frontend/src/services/api.js
import axios from 'axios';

// Base URL for the backend API
const API_URL = 'http://127.0.0.1:8000';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all members
export const getMembers = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

// Add a new member
export const addMember = async (formData) => {
  try {
    const response = await api.post('/add_member', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding member:', error);
    throw error;
  }
};

// Delete a member
export const deleteMember = async (memberId) => {
  try {
    const response = await api.get(`/delete_member/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

// Get member details for editing
export const getMember = async (memberId) => {
  try {
    const response = await api.get(`/edit_member/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
};

// Update member details
export const updateMember = async (memberId, formData) => {
  try {
    const response = await api.post(`/edit_member/${memberId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};