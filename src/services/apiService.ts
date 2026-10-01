import {
  User,
  ConversionJob,
  UserFileRecord,
  SiteSettings,
  AuditLogEntry,
  AdminStats,
} from '../types';

const TOKEN_KEY = 'filemaster_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('localStorage error', e);
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server request failed');
  }
  return data as T;
}

// ==========================================
// Authentication Client APIs
// ==========================================

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(res.token);
  return res;
}

export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setStoredToken(res.token);
  return res;
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await apiRequest<{ user: User }>('/api/auth/me');
    return res.user;
  } catch {
    return null;
  }
}

export async function updateUserProfile(data: { name?: string; avatarUrl?: string; newPassword?: string }): Promise<User> {
  const res = await apiRequest<{ user: User }>('/api/auth/update-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.user;
}

// ==========================================
// User Usage & Files
// ==========================================

export interface UserUsageResponse {
  plan: string;
  dailyLimit: number;
  usageToday: number;
  remainingToday: number;
  maxFileSizeMb: number;
  storageUsedBytes: number;
}

export async function fetchUserUsage(): Promise<UserUsageResponse> {
  return await apiRequest<UserUsageResponse>('/api/user/usage');
}

export async function fetchUserFiles(): Promise<UserFileRecord[]> {
  const res = await apiRequest<{ files: UserFileRecord[] }>('/api/user/files');
  return res.files;
}

export async function deleteUserFile(id: string): Promise<boolean> {
  const res = await apiRequest<{ success: boolean }>(`/api/files/${id}`, {
    method: 'DELETE',
  });
  return res.success;
}

// ==========================================
// Job Processing Client APIs
// ==========================================

export async function submitProcessingJob(
  toolSlug: string,
  fileName: string,
  fileSize: number,
  options?: Record<string, any>
): Promise<{ success: boolean; jobId: string }> {
  return await apiRequest<{ success: boolean; jobId: string }>(`/api/tools/${toolSlug}/process`, {
    method: 'POST',
    body: JSON.stringify({ fileName, fileSize, options }),
  });
}

export async function pollJobStatus(jobId: string): Promise<ConversionJob> {
  const res = await apiRequest<{ job: ConversionJob }>(`/api/jobs/${jobId}`);
  return res.job;
}

// ==========================================
// Subscriptions & Payments
// ==========================================

export async function createSubscriptionOrder(planType: 'monthly' | 'yearly') {
  return await apiRequest<{
    success: boolean;
    orderId: string;
    currency: string;
    amount: number;
    keyId: string;
  }>('/api/subscription/create', {
    method: 'POST',
    body: JSON.stringify({ planType, provider: 'razorpay' }),
  });
}

// ==========================================
// Support / Contact
// ==========================================

export async function sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
  return await apiRequest<{ success: boolean; message: string }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ==========================================
// Admin APIs
// ==========================================

export async function fetchAdminStatistics(): Promise<AdminStats> {
  const res = await apiRequest<{ stats: AdminStats }>('/api/admin/statistics');
  return res.stats;
}

export async function fetchAdminUsers(search?: string, plan?: string, status?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (plan) params.append('plan', plan);
  if (status) params.append('status', status);

  const res = await apiRequest<{ users: User[] }>(`/api/admin/users?${params.toString()}`);
  return res.users;
}

export async function updateAdminUser(
  userId: string,
  updates: { isSuspended?: boolean; plan?: string; role?: string; dailyLimit?: number }
): Promise<User> {
  const res = await apiRequest<{ success: boolean; user: User }>(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return res.user;
}

export async function deleteAdminUser(userId: string): Promise<boolean> {
  const res = await apiRequest<{ success: boolean }>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
  return res.success;
}

export async function fetchAdminSettings(): Promise<SiteSettings> {
  const res = await apiRequest<{ settings: SiteSettings }>('/api/admin/settings');
  return res.settings;
}

export async function updateAdminSettings(settings: SiteSettings): Promise<SiteSettings> {
  const res = await apiRequest<{ success: boolean; settings: SiteSettings }>('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return res.settings;
}

export async function fetchAdminAuditLogs(): Promise<AuditLogEntry[]> {
  const res = await apiRequest<{ logs: AuditLogEntry[] }>('/api/admin/audit-logs');
  return res.logs;
}

// Validate file on server endpoint
export async function validateFileOnServer(file: File) {
  try {
    const res = await apiRequest<any>('/api/validate', {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }),
    });
    return res;
  } catch (e: any) {
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: 'File size exceeds 50 MB server limit.' };
    }
    return { valid: true, message: 'Local client validation verified.' };
  }
}

export async function convertOnServer(file: File, targetFormat: string) {
  const ext = file.name.split('.').pop() || '';
  return await apiRequest<any>('/api/convert', {
    method: 'POST',
    body: JSON.stringify({
      sourceFormat: ext.toLowerCase(),
      targetFormat: targetFormat.toLowerCase(),
      fileName: file.name,
    }),
  });
}
