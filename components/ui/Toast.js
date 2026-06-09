"use client"
import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-sage" />,
    error: <AlertCircle size={20} className="text-rose" />,
    warning: <AlertTriangle size={20} className="text-primary" />,
    info: <Info size={20} className="text-secondary" />
  };

  const bgColors = {
    success: 'bg-sage/10 border-sage/30',
    error: 'bg-rose/10 border-rose/30',
    warning: 'bg-primary/10 border-primary/30',
    info: 'bg-secondary/10 border-secondary/30'
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 p-4 rounded-xl border shadow-lg ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium text-charcoal">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full transition-colors">
        <X size={16} className="text-charcoal/60" />
      </button>
    </div>
  );
}
