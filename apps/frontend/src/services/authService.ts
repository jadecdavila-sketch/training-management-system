const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'ADMIN' | 'COORDINATOR' | 'HR' | 'FACILITATOR';
    };
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async getMe(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    return response.json();
  },
};
