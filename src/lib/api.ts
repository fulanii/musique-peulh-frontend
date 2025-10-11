const API_BASE_URL = 'https://api.musiquepeulh.com';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface LoginData {
  username?: string;
  email?: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: number;
}

export interface SongUploadData {
  title: string;
  artist_name: string;
  duration?: string;
  mp3_file: File;
  cover_image?: File;
}

export interface Song {
  id: number;
  title: string;
  artist_name: string;
  duration: string;
  mp3_file: string;
  cover_image?: string;
  uploaded_by: number;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
}

class ApiService {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await this.handleTokenRefresh();
      if (newToken) {
        // Retry the original request with new token
        const retryResponse = await fetch(response.url, {
          ...response,
          headers: {
            ...response.headers,
            'Authorization': `Bearer ${newToken}`
          }
        });
        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || error.message || 'Request failed');
    }
    return response.json();
  }

  private async handleTokenRefresh(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const tokens = await this.refreshToken();
      this.isRefreshing = false;
      this.refreshSubscribers.forEach((callback) => callback(tokens.access));
      this.refreshSubscribers = [];
      return tokens.access;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshSubscribers = [];
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      return null;
    }
  }


  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async login(data: LoginData): Promise<AuthTokens> {
    const payload: any = { password: data.password };
    
    // Support login with either email or username
    if (data.email) {
      payload.email = data.email;
    }
    if (data.username) {
      payload.username = data.username;
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const tokens = await this.handleResponse<AuthTokens>(response);
    
    // Store tokens
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    return tokens;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ is_staff: isAdmin }),
    });
    return this.handleResponse(response);
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    const tokens = await this.handleResponse<AuthTokens>(response);
    localStorage.setItem('access_token', tokens.access);
    
    return tokens;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/api/token/blacklist/`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async getSongs(): Promise<Song[]> {
    const response = await fetch(`${API_BASE_URL}/api/songs/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async uploadSong(data: SongUploadData): Promise<Song> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('artist_name', data.artist_name);
    if (data.duration) formData.append('duration', data.duration);
    formData.append('mp3_file', data.mp3_file);
    if (data.cover_image) formData.append('cover_image', data.cover_image);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/songs/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getSongsByArtist(artistName: string): Promise<Song[]> {
    const response = await fetch(`${API_BASE_URL}/api/songs/artists/${encodeURIComponent(artistName)}/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async getSongsByTitle(title: string): Promise<Song[]> {
    const response = await fetch(`${API_BASE_URL}/api/songs/titles/${encodeURIComponent(title)}/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
