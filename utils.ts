
import { Lead } from './types';

const STORAGE_KEY = 'solo_agent_crm_data';

export const saveLeads = (leads: Lead[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

export const loadLeads = (): Lead[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Formats a date string to Indian Standard Time (IST) display
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(dateString));
};

/**
 * Checks if a date is in the past relative to now
 */
export const isOverdue = (dateString: string) => {
  if (!dateString) return false;
  return new Date(dateString) < new Date();
};

/**
 * Checks if a date falls on the current day in IST
 */
export const isToday = (dateString: string) => {
  if (!dateString) return false;
  const today = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date());

  const compareDate = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).format(new Date(dateString));

  return today === compareDate;
};

export const getWhatsAppLink = (phone: string, name: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = encodeURIComponent(`Hi ${name}, I'm following up regarding the property interest we discussed. When is a good time to chat?`);
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

/**
 * Generates a local ISO-style string (YYYY-MM-DDTHH:mm) for IST
 * specifically for <input type="datetime-local">
 */
export const getQuickDate = (type: '2h' | 'tomorrow' | '3d') => {
  const now = new Date();
  
  if (type === '2h') {
    now.setHours(now.getHours() + 2);
  } else if (type === 'tomorrow') {
    now.setDate(now.getDate() + 1);
    now.setHours(10, 0, 0, 0);
  } else if (type === '3d') {
    now.setDate(now.getDate() + 3);
    now.setHours(10, 0, 0, 0);
  }

  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
  
  return localISOTime;
};

/**
 * Trial Calculation Helpers
 */
export const isTrialExpired = (createdAt: string | undefined) => {
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return new Date() > expiryDate;
};

export const getTrialDaysLeft = (createdAt: string | undefined) => {
  if (!createdAt) return 0;
  const createdDate = new Date(createdAt);
  const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const diff = expiryDate.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
