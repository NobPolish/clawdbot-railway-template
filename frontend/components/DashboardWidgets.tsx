'use client';

import React from 'react';
import { Card } from './Card';

/**
 * Dashboard Widget Components
 * Reusable components for dashboard analytics and metrics
 */

interface WidgetProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Widget({ title, description, children, className = '' }: WidgetProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {children}
    </Card>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricCard({ label, value, change, icon, trend = 'neutral' }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-2 ${trendColor}`}>
              {trendIcon} {Math.abs(change)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Activity Feed Component
 */
interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

export function ActivityFeed({ items, maxItems = 5 }: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);
  const statusColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-4">
      {displayItems.map(item => (
        <div key={item.id} className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-2 h-2 rounded-full ${item.status ? statusColors[item.status] : 'bg-gray-300'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{item.action}</p>
            <p className="text-xs text-gray-500">{item.timestamp}</p>
          </div>
          {item.icon && <div className="flex-shrink-0">{item.icon}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * Progress Card Component
 */
interface ProgressCardProps {
  label: string;
  percentage: number;
  description?: string;
  color?: string;
}

export function ProgressCard({ label, percentage, description, color = 'blue' }: ProgressCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{percentage}%</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
}

/**
 * Stats Grid Component
 */
interface StatItem {
  title: string;
  value: string | number;
  subtitle?: string;
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClass[columns]} gap-6`}>
      {stats.map((stat, idx) => (
        <Card key={idx} className="p-6 text-center">
          <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          {stat.subtitle && <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>}
        </Card>
      ))}
    </div>
  );
}

/**
 * Alert Banner Component
 */
interface AlertBannerProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function AlertBanner({ type, title, message, onClose }: AlertBannerProps) {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]}`}>
      <div className="flex items-start">
        <span className="text-2xl mr-3">{icons[type]}</span>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-2 text-lg opacity-50 hover:opacity-100">
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </Card>
  );
}
