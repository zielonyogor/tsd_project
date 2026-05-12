import type { User } from '../../types/user';

const STORAGE_KEY = 'currentUser';

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}