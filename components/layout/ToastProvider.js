"use client"
import { useState } from 'react';
import { ToastContainer } from '@/hooks/useToast';

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type, duration) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
