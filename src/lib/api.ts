import { toast } from "sonner";

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

export interface Playlist {
  id: number;
  playlist_name: string;
  playlist_owner_id: number;
  created_date: string;
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
  public API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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

  /**
   * Central request wrapper that handles token refresh on 401 caused by expired access tokens.
   * Returns parsed JSON body on success or throws an Error with parsed details on failure.
   */
  private async request<T = any>(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<T> {
    const doFetch = async (opts?: RequestInit) => fetch(input, opts || init);

    let response = await doFetch();

    // If 401, check if token expired then attempt refresh and retry once
    if (response.status === 401) {
      const parsed401 = await response.json().catch(() => null);
      const isTokenExpired =
        parsed401?.code === "token_not_valid" ||
        parsed401?.messages?.[0]?.message === "Token is expired" ||
        (typeof parsed401?.detail === "string" &&
          parsed401.detail.toLowerCase().includes("token"));

      if (isTokenExpired) {
        const newAccess = await this.handleTokenRefresh();
        if (newAccess) {
          // retry original request with new access token
          const newInit: RequestInit = {
            ...(init || {}),
            headers: {
              ...(init && init.headers ? (init.headers as any) : {}),
              Authorization: `Bearer ${newAccess}`,
            },
          };
          response = await doFetch(newInit);
        } else {
          // refresh failed and handleTokenRefresh already redirected/cleared tokens
          throw new Error(parsed401?.detail || "Session expired");
        }
      } else {
        // other 401 reasons — treat as auth failure
        throw new Error(parsed401?.detail || "Unauthorized");
      }
    }

    // If still not ok, parse error body and throw
    if (!response.ok) {
      const parsed = await response.json().catch(() => null);

      // Rate limited — surface a generic message for ANY endpoint. Toast here
      // at the source so it shows even when a caller swallows the thrown error
      // with its own message. Fixed id prevents duplicate/stacked toasts.
      if (response.status === 429) {
        toast.error("Too many request, try again later", {
          id: "rate-limit",
        });
        const err = new Error("Too many request, try again later");
        try {
          (err as any).data = parsed;
          (err as any).status = 429;
          (err as any).isRateLimit = true;
        } catch {}
        throw err;
      }

      let message = response.statusText || "Request failed";
      if (parsed) {
        if (typeof parsed === "string") message = parsed;
        else if (parsed.detail) message = parsed.detail;
        else if (parsed.error) message = parsed.error;
        else if (typeof parsed === "object") {
          const parts: string[] = [];
          for (const [key, val] of Object.entries(parsed)) {
            if (Array.isArray(val)) parts.push(`${key}: ${val.join(" ")}`);
            else if (typeof val === "object")
              parts.push(`${key}: ${JSON.stringify(val)}`);
            else parts.push(`${key}: ${String(val)}`);
          }
          if (parts.length) message = parts.join(" | ");
        }
      }
      const err = new Error(message || "Request failed");
      try {
        (err as any).data = parsed;
      } catch {}
      throw err;
    }

    // Success — parse JSON (safe to try)
    return response.json().catch(() => null as any);
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
      // Refresh token is expired/invalid — log the user out fully and send
      // them to login. Flag the reason so the Login page can toast about it
      // (an in-memory toast wouldn't survive the full-page redirect below).
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      try {
        sessionStorage.setItem("session_expired", "1");
      } catch {}
      try {
        window.location.assign("/login");
      } catch {}
      return null;
    }
  }

  async register(data: RegisterData): Promise<{ message: string }> {
    return this.request(`${this.API_BASE_URL}/api/auth/register/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return this.request(`${this.API_BASE_URL}/api/auth/verify-email/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
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

    const tokens = await this.request<AuthTokens>(
      `${this.API_BASE_URL}/api/auth/login/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    // Store tokens and data
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    localStorage.setItem("user_data", JSON.stringify(tokens.user_data));

    return tokens;
  }

  async getCurrentUser(id: number): Promise<User> {
    return this.request(`${this.API_BASE_URL}/api/auth/user/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ id }),
    });
  }

  async getUsers(): Promise<User[]> {
    return this.request(`${this.API_BASE_URL}/api/auth/users/`, {
      headers: this.getHeaders(true),
    });
  }

  async updateUserAdmin(userId: number, isAdmin: boolean): Promise<void> {
    return this.request(`${this.API_BASE_URL}/api/auth/user/admin/`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      body: JSON.stringify({ id: userId, is_staff: isAdmin }),
    });
  }

  async deleteUser(
    userId: number
  ): Promise<{ success: boolean; deleted_user_id: number }> {
    return this.request(
      `${this.API_BASE_URL}/api/auth/users/delete/${userId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(true),
      }
    );
  }

  async resendVerification(
    email: string
  ): Promise<{ detail: string; email: string }> {
    return this.request(`${this.API_BASE_URL}/api/auth/resend-verification/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });
  }

  async requestPasswordReset(
    email: string
  ): Promise<{ message?: string; error?: string }> {
    return this.request(
      `${this.API_BASE_URL}/api/auth/reset-password-request/`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      }
    );
  }

  async resetPassword(
    email: string,
    code: number,
    newPassword: string
  ): Promise<{ message?: string; error?: string }> {
    return this.request(`${this.API_BASE_URL}/api/auth/reset-password/`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await fetch(`${this.API_BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });

    // handle directly to avoid recursion through request()
    if (response.status === 401) {
      const parsed = await response.json().catch(() => null);
      throw new Error(parsed?.detail || "Refresh token invalid");
    }

    if (!response.ok) {
      const parsed = await response.json().catch(() => null);
      const err = new Error(
        parsed?.detail || response.statusText || "Failed to refresh token"
      );
      try {
        (err as any).data = parsed;
      } catch {}
      throw err;
    }

    const tokens = await response.json();
    localStorage.setItem("access_token", tokens.access);
    if (tokens.refresh) localStorage.setItem("refresh_token", tokens.refresh);
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
    return this.request(`${this.API_BASE_URL}/api/songs/`, {
      headers: this.getHeaders(true),
    });
  }

  async uploadSong(data: SongUploadData): Promise<Song> {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("artist_name", data.artist_name);
    formData.append("audio_file", data.audio_file);
    formData.append("cover_image", data.cover_image);

    const token = localStorage.getItem("access_token");
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return this.request(`${this.API_BASE_URL}/api/songs/upload/`, {
      method: "POST",
      headers,
      body: formData,
    });
  }

  async getSongsByArtist(artistName: string): Promise<Song[]> {
    return this.request<Song[]>(
      `${this.API_BASE_URL}/api/songs/artists/${encodeURIComponent(
        artistName
      )}/`,
      {
        headers: this.getHeaders(true),
      }
    );
  }

  async getSongsByTitle(title: string): Promise<Song[]> {
    return this.request<Song[]>(
      `${this.API_BASE_URL}/api/songs/titles/${encodeURIComponent(title)}/`,
      {
        headers: this.getHeaders(true),
      }
    );
  }

  /**
   * Get a short-lived pre-signed streaming URL for a song.
   * The returned URL expires after a few minutes, so fetch it right before playback.
   */
  async getStreamUrl(songId: number): Promise<{ url: string }> {
    return this.request<{ url: string }>(
      `${this.API_BASE_URL}/api/songs/stream/${songId}`,
      {
        headers: this.getHeaders(true),
      }
    );
  }

  async getPlaylists(): Promise<Playlist[]> {
    const data = await this.request<any>(
      `${this.API_BASE_URL}/api/songs/playlist/`,
      {
        headers: this.getHeaders(true),
      }
    );
    // Backend returns a list of playlists, but {"detail": []} when the user has none
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.detail)) return data.detail;
    return [];
  }

  async createPlaylist(playlistName: string): Promise<{ detail: string }> {
    return this.request(`${this.API_BASE_URL}/api/songs/playlist/`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ playlist_name: playlistName }),
    });
  }

  async getPlaylistSongs(playlistId: number): Promise<Song[]> {
    const data = await this.request<any[]>(
      `${this.API_BASE_URL}/api/songs/playlist/${playlistId}/songs/`,
      {
        headers: this.getHeaders(true),
      }
    );
    const list = Array.isArray(data) ? data : [];
    // The playlist-songs endpoint returns a trimmed shape (id/title/artist/duration).
    // Fill the remaining Song fields so it satisfies the Song type; playback only
    // needs the id (streaming URL is fetched separately at play time).
    return list.map((s) => ({
      id: s.id,
      title: s.title,
      artist_name: s.artist_name,
      duration: s.duration,
      audio_file: "",
      cover_image: "",
      uploaded_by: "",
      upload_date: "",
    }));
  }
}

export const api = new ApiService();
