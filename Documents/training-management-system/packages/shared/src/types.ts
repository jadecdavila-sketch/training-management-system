// User types
export type UserRole = 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  facilitatorProfile?: {
    qualifications: string[];
  };
}

// Participant types
export interface Participant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  hireDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateParticipantDto {
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  hireDate?: Date;
}

export interface UpdateParticipantDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  department?: string;
  location?: string;
  hireDate?: Date;
  status?: string;
}

// Location types
export interface Location {
  id: string;
  name: string;
  address?: string;
  capacity: number;
  equipment: string[];
  type: 'physical' | 'virtual';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationDto {
  name: string;
  address?: string;
  capacity: number;
  equipment?: string[];
  type: 'physical' | 'virtual';
}

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  capacity?: number;
  equipment?: string[];
  type?: 'physical' | 'virtual';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}