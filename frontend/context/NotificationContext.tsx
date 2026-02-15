'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
    };

    setNotifications(prev => [...prev, fullNotification]);

    // Auto-remove notification after duration
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, fullNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

/**
 * Toast Notification Component
 */
interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

export function Toast({ notification, onClose }: ToastProps) {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
  };

  return (
    <div
      className={`${typeStyles[notification.type]} text-white rounded-lg shadow-lg p-4 mb-3 flex items-start justify-between gap-4 animate-slideIn`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl font-bold">{icons[notification.type]}</span>
        <div>
          <h4 className="font-semibold">{notification.title}</h4>
          {notification.message && (
            <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="text-sm font-semibold underline hover:opacity-80"
          >
            {notification.action.label}
          </button>
        )}
        <button
          onClick={onClose}
          className="text-xl opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Toast Container Component
 * Displays all active notifications
 */
export function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {notifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
