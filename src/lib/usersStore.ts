import { UserProfile } from '../types';
import { getSupabaseClient, getSupabaseConfig } from './supabase';

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  ordersCount?: number;
  totalSpent?: number;
}

const STORAGE_KEY = 'kllyeein_managed_users';
const BANNED_EMAILS_KEY = 'kllyeein_banned_emails';

// Default initial user accounts
export const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 'user-admin-osman',
    email: 'admin.osman@gmail.com',
    fullName: 'Osman (Super Admin)',
    phone: '+880 1700-112233',
    address: 'Jamuna Future Park, Level 4',
    city: 'Dhaka',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    role: 'admin',
    isBanned: false,
    createdAt: '2026-01-01T10:00:00.000Z',
    ordersCount: 8,
    totalSpent: 425000,
  },
  {
    id: 'user-jahidul',
    email: 'jahidul143.info@gmail.com',
    fullName: 'Jahidul Islam',
    phone: '+880 1812-345678',
    address: 'Mirpur DOHS, Road 12, House 45',
    city: 'Dhaka',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=jahidul',
    role: 'customer',
    isBanned: false,
    createdAt: '2026-02-10T14:30:00.000Z',
    ordersCount: 3,
    totalSpent: 218000,
  },
  {
    id: 'user-tanvir',
    email: 'tanvir.ahmed@yahoo.com',
    fullName: 'Tanvir Ahmed',
    phone: '+880 1711-223344',
    address: 'GEC Circle, Nasirabad',
    city: 'Chittagong',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=tanvir',
    role: 'customer',
    isBanned: false,
    createdAt: '2026-02-15T09:20:00.000Z',
    ordersCount: 2,
    totalSpent: 68000,
  },
  {
    id: 'user-nusrat',
    email: 'nusrat.cyber@gmail.com',
    fullName: 'Nusrat Jahan',
    phone: '+880 1922-887766',
    address: 'Sector 7, Uttara',
    city: 'Dhaka',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nusrat',
    role: 'customer',
    isBanned: false,
    createdAt: '2026-03-01T16:45:00.000Z',
    ordersCount: 1,
    totalSpent: 56000,
  },
];

/**
 * Get all managed users from localStorage + merge with defaults
 */
export function getAllUsers(): ManagedUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: ManagedUser[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Also check if any registered users from legacy key need importing
        const regRaw = localStorage.getItem('kllyeein_registered_users');
        if (regRaw) {
          try {
            const regUsers: any[] = JSON.parse(regRaw);
            regUsers.forEach((ru) => {
              if (ru.email && !parsed.some((p) => p.email.toLowerCase() === ru.email.toLowerCase())) {
                parsed.push({
                  id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  email: ru.email,
                  fullName: ru.fullName || ru.email.split('@')[0],
                  role: ru.email.toLowerCase().includes('admin') ? 'admin' : 'customer',
                  isBanned: false,
                  createdAt: ru.createdAt || new Date().toISOString(),
                  ordersCount: 0,
                  totalSpent: 0,
                });
              }
            });
          } catch {
            // ignore
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }

  // Initialize with defaults if empty
  saveAllUsers(DEFAULT_USERS);
  return DEFAULT_USERS;
}

/**
 * Save users to localStorage and trigger global sync event
 */
export function saveAllUsers(users: ManagedUser[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    
    // Update banned emails index for instant lookup
    const banned = users
      .filter((u) => u.isBanned)
      .map((u) => u.email.toLowerCase());
    localStorage.setItem(BANNED_EMAILS_KEY, JSON.stringify(banned));

    window.dispatchEvent(new CustomEvent('kllyeein_users_updated', { detail: users }));

    // Async sync to server API
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    }).catch(() => {});
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

/**
 * Check if a user's email is currently banned
 */
export function isUserBanned(email?: string | null): boolean {
  if (!email || typeof window === 'undefined') return false;
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Quick check in banned emails index
    const bannedRaw = localStorage.getItem(BANNED_EMAILS_KEY);
    if (bannedRaw) {
      const bannedList: string[] = JSON.parse(bannedRaw);
      if (bannedList.includes(cleanEmail)) return true;
    }

    // 2. Deep check in all users list
    const users = getAllUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    return Boolean(found?.isBanned);
  } catch {
    return false;
  }
}

/**
 * Ban or Suspend a user
 */
export function banUser(userId: string, reason = 'Violated terms of service / suspicious order behavior'): boolean {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  // Protect root super admin from being banned
  if (users[index].email.toLowerCase() === 'admin.osman@gmail.com') {
    return false;
  }

  users[index].isBanned = true;
  users[index].banReason = reason;
  users[index].bannedAt = new Date().toISOString();

  saveAllUsers(users);
  return true;
}

/**
 * Unban / Reactivate a user
 */
export function unbanUser(userId: string): boolean {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  users[index].isBanned = false;
  delete users[index].banReason;
  delete users[index].bannedAt;

  saveAllUsers(users);
  return true;
}

/**
 * Delete a user permanently
 */
export function deleteUser(userId: string): boolean {
  const users = getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return false;

  // Protect root super admin from deletion
  if (target.email.toLowerCase() === 'admin.osman@gmail.com') {
    return false;
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveAllUsers(filtered);
  return true;
}

/**
 * Update user role (admin / customer)
 */
export function updateUserRole(userId: string, newRole: 'admin' | 'customer'): boolean {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;

  users[index].role = newRole;
  saveAllUsers(users);
  return true;
}

/**
 * Register or update an active user in the managed pool
 */
export function recordUserActivity(profile: Partial<UserProfile>): void {
  if (!profile.email) return;
  const cleanEmail = profile.email.trim().toLowerCase();

  const users = getAllUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (index !== -1) {
    users[index].lastLoginAt = new Date().toISOString();
    if (profile.fullName && profile.fullName !== users[index].fullName) {
      users[index].fullName = profile.fullName;
    }
    if (profile.avatarUrl) {
      users[index].avatarUrl = profile.avatarUrl;
    }
    saveAllUsers(users);
  } else {
    const newUser: ManagedUser = {
      id: profile.id || `user-${Date.now()}`,
      email: cleanEmail,
      fullName: profile.fullName || cleanEmail.split('@')[0],
      avatarUrl: profile.avatarUrl,
      role: profile.role || 'customer',
      isBanned: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
    };
    users.unshift(newUser);
    saveAllUsers(users);
  }
}
