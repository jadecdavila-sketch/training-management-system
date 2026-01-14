import {
  Participant,
  CreateParticipantDto,
  UpdateParticipantDto,
  Location,
  CreateLocationDto,
  UpdateLocationDto,
  User,
  PaginatedResponse
} from '@tms/shared';
import { useAuthStore } from '../stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// CSRF token management
let csrfToken: string | null = null;

// Get CSRF token from cookie
function getCsrfTokenFromCookie(): string | null {
  const name = 'csrf-token-value=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

// Fetch CSRF token from server
async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(`${API_BASE}/csrf-token`, {
    credentials: 'include',
  });
  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken!;
}

// Get CSRF token (from memory, cookie, or fetch from server)
async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    csrfToken = cookieToken;
    return csrfToken;
  }

  return fetchCsrfToken();
}

// Generic fetch wrapper with auth token, CSRF protection, and timeout
async function fetchApi<T>(url: string, options?: RequestInit & { timeout?: number }): Promise<T> {
  // Get token from auth store
  const token = useAuthStore.getState().accessToken;

  // Get CSRF token for state-changing operations
  let csrfHeader = {};
  if (options?.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
    const csrf = await getCsrfToken();
    csrfHeader = { 'X-CSRF-Token': csrf };
  }

  // Set up abort controller for timeout
  const controller = new AbortController();
  const timeoutMs = options?.timeout ?? 30000; // Default 30 seconds
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include', // Include cookies for CSRF
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...csrfHeader,
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle 401 unauthorized - clear auth and redirect to login
      if (response.status === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }

      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }

    throw error;
  }
}

// Participants API
export const participantsApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.search) query.append('search', params.search);
    
    return fetchApi<PaginatedResponse<Participant>>(`/participants?${query}`);
  },

  getById: (id: string) => 
    fetchApi<{ success: boolean; data: Participant }>(`/participants/${id}`),

  create: (data: CreateParticipantDto) =>
    fetchApi<{ success: boolean; data: Participant }>('/participants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateParticipantDto) =>
    fetchApi<{ success: boolean; data: Participant }>(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/participants/${id}`, { method: 'DELETE' }),

  import: (participants: CreateParticipantDto[]) =>
    fetchApi<{ success: boolean; data: { count: number } }>('/participants/import', {
      method: 'POST',
      body: JSON.stringify(participants),
    }),
};

// Locations API
export const locationsApi = {
  getAll: (params?: { page?: number; pageSize?: number; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.type) query.append('type', params.type);
    
    return fetchApi<PaginatedResponse<Location>>(`/locations?${query}`);
  },

  getById: (id: string) =>
    fetchApi<{ success: boolean; data: Location }>(`/locations/${id}`),

  create: (data: CreateLocationDto) =>
    fetchApi<{ success: boolean; data: Location }>('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateLocationDto) =>
    fetchApi<{ success: boolean; data: Location }>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/locations/${id}`, { method: 'DELETE' }),
};

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; pageSize?: number; role?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    if (params?.role) query.append('role', params.role);

    return fetchApi<PaginatedResponse<User>>(`/users?${query}`);
  },

  getById: (id: string) =>
    fetchApi<{ success: boolean; data: User }>(`/users/${id}`),

  create: (data: any) =>
    fetchApi<{ success: boolean; data: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<{ success: boolean; data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  getFacilitators: () =>
    fetchApi<{ success: boolean; data: Array<{ id: string; name: string; email: string; skills: string[] }> }>('/users/facilitators/list'),

  exportData: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/users/${id}/export`),

  gdprDelete: (id: string) =>
    fetchApi<{ success: boolean; message: string }>(`/users/${id}/gdpr-delete`, {
      method: 'DELETE',
    }),
};

// Programs API
export const programsApi = {
  getAll: (params?: { page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());

    return fetchApi<PaginatedResponse<any>>(`/programs?${query}`);
  },

  getById: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/programs/${id}`),

  create: (data: any) =>
    fetchApi<{ success: boolean; data: any }>('/programs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<{ success: boolean; data: any }>(`/programs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  archive: (id: string) =>
    fetchApi<{ success: boolean; data: any }>(`/programs/${id}/archive`, {
      method: 'PATCH',
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/programs/${id}`, { method: 'DELETE' }),
};

// Cohort Enrollment API
export const cohortEnrollmentApi = {
  moveParticipant: (participantId: string, fromCohortId: string, toCohortId: string) =>
    fetchApi<{ success: boolean }>('/cohort-enrollments/move', {
      method: 'POST',
      body: JSON.stringify({ participantId, fromCohortId, toCohortId }),
    }),

  removeParticipant: (participantId: string, cohortId: string) =>
    fetchApi<{ success: boolean }>('/cohort-enrollments/remove', {
      method: 'POST',
      body: JSON.stringify({ participantId, cohortId }),
    }),
};