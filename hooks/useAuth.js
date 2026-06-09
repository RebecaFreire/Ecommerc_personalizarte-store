'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('auth-change'));
      }
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('auth-change'));
      }
    },
  });
};

export const useLogout = () => {
  return () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/login';
    }
  };
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    enabled: typeof window !== 'undefined' && !!getToken(),
  });
};
