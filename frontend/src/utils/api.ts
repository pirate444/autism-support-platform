// API configuration utility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://autism-support-platform.onrender.com';

export const apiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export default apiUrl; 