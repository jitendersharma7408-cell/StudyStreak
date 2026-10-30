import { base44 } from '@/api/base44Client';

const KEY = 'studystreak_guest';

export const isGuest = () => localStorage.getItem(KEY) === '1';

export const enterGuest = () => {
  localStorage.setItem(KEY, '1');
  window.location.href = '/learn';
};

export const logoutAll = () => {
  localStorage.removeItem(KEY);
  base44.auth.logout('/login');
};