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
async function getCsrfToken(): Promise<string> {
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) return cookieToken;

  const response = await fetch(`${API_URL}/api/csrf-token`, {
    credentials: 'include',
  });
  const data = await response.json();
  return data.csrfToken;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const csrfToken = await getCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(credentials),
    });

    return response.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const csrfToken = await getCsrfToken();
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  },

  async getMe(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    return response.json();
  },
};
