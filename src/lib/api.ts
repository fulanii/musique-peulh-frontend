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
  audio_file: File;
  cover_image?: File;
}

export interface Song {
  id: number;
  title: string;
  artist_name: string;
  duration: string;
  audio_file: string;
  cover_image: string;
  uploaded_by: string;
  upload_date: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user_data: object;
}

export interface User {
  id: number;
  email: string;
  username: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  is_active: boolean;
}

class ApiService {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  public API_BASE_URL = "https://api.musiquepeulh.com"; // "http://localhost:8000"; //

  private getHeaders(includeAuth = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      const parsed = await response.json().catch(() => null);
      const isTokenExpired =
        parsed?.code === "token_not_valid" ||
        parsed?.messages?.[0]?.message === "Token is expired";

      if (isTokenExpired) {
        // Only try refresh for token expiration
        const newToken = await this.handleTokenRefresh();
        if (newToken) {
          // Retry the original request with new token
          const retryResponse = await fetch(response.url, {
            ...response,
            headers: {
              ...response.headers,
              Authorization: `Bearer ${newToken}`,
            },
          });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      }
      // For other 401 errors or if refresh failed, throw the error
      throw new Error(parsed?.detail || "Authentication failed");
    }

    if (!response.ok) {
      // Try to parse JSON body to extract informative error messages
      const parsed = await response.json().catch(() => null);

      let message = response.statusText || "Request failed";

      if (parsed) {
        if (typeof parsed === "string") {
          message = parsed;
        } else if (parsed.detail) {
          // DRF default detail message
          message = parsed.detail;
        } else if (typeof parsed === "object") {
          // Aggregate field errors
          const parts: string[] = [];
          for (const [key, val] of Object.entries(parsed)) {
            if (Array.isArray(val)) {
              parts.push(`${key}: ${val.join(" ")}`);
            } else if (typeof val === "object") {
              // nested object (e.g., { field: { sub: [...] } })
              parts.push(`${key}: ${JSON.stringify(val)}`);
            } else {
              parts.push(`${key}: ${String(val)}`);
            }
          }
          if (parts.length) message = parts.join(" | ");
        }
      }

      const err = new Error(message || "Request failed");
      // Attach parsed body so callers can inspect field-level errors
      try {
        (err as any).data = parsed;
      } catch {}
      throw err;
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return null;
    }
  }

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await fetch(`${this.API_BASE_URL}/api/auth/register/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/auth/verify-email/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      }
    );
    return this.handleResponse(response);
  }

  async login(data: LoginData): Promise<AuthTokens> {
    const payload: any = { password: data.password };

    // Support login with either email or username
    if (data.email) {
      payload.identifier = data.email;
    }
    if (data.username) {
      payload.identifier = data.username;
    }

    const response = await fetch(`${this.API_BASE_URL}/api/auth/login/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const tokens = await this.handleResponse<AuthTokens>(response);

    // Store tokens and data
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    localStorage.setItem("user_data", JSON.stringify(tokens.user_data));

    return tokens;
  }

  async getCurrentUser(id: number): Promise<User> {
    const response = await fetch(`${this.API_BASE_URL}/api/auth/user/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ id }),
    });
    return this.handleResponse(response);
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.API_BASE_URL}/api/auth/users/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async updateUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
    const response = await fetch(`${this.API_BASE_URL}/api/auth/user/admin/`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ id: userId, is_staff: isAdmin }),
    });
    return this.handleResponse(response);
  }

  async deleteUser(
    userId: number
  ): Promise<{ success: boolean; deleted_id: number }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/auth/users/delete/${userId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(true),
        // body: JSON.stringify({ id: userId }),
      }
    );
    return this.handleResponse(response);
  }

  async resendVerification(
    email: string
  ): Promise<{ detail: string; email: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/auth/resend-verification/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      }
    );
    return this.handleResponse(response);
  }

  async requestPasswordReset(
    email: string
  ): Promise<{ message?: string; error?: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/auth/reset-password-request/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      }
    );
    return this.handleResponse(response);
  }

  async resetPassword(
    email: string,
    code: number,
    newPassword: string
  ): Promise<{ message?: string; error?: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/auth/reset-password/`,
      {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify({ email, code, new_password: newPassword }),
      }
    );
    return this.handleResponse(response);
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${this.API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const tokens = await this.handleResponse<AuthTokens>(response);
    localStorage.setItem("access_token", tokens.access);

    return tokens;
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      await fetch(`${this.API_BASE_URL}/api/token/blacklist/`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  async getSongs(): Promise<Song[]> {
    const response = await fetch(`${this.API_BASE_URL}/api/songs/`, {
      headers: this.getHeaders(true),
    });
    return this.handleResponse(response);
  }

  async uploadSong(data: SongUploadData): Promise<Song> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artist_name", data.artist_name);
    formData.append("audio_file", data.audio_file);
    formData.append("cover_image", data.cover_image);

    const token = localStorage.getItem("access_token");

    const response = await fetch(`${this.API_BASE_URL}/api/songs/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return this.handleResponse(response);
  }

  async getSongsByArtist(artistName: string): Promise<Song[]> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/songs/artists/${encodeURIComponent(
        artistName
      )}/`,
      {
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse(response);
  }

  async getSongsByTitle(title: string): Promise<Song[]> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/songs/titles/${encodeURIComponent(title)}/`,
      {
        headers: this.getHeaders(true),
      }
    );
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
