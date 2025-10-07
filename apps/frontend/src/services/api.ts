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

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

// Generic fetch wrapper
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
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