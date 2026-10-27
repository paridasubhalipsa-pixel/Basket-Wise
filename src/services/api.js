const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = null;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('bw_auth_token');
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bw_auth_token', token);
    } else {
      localStorage.removeItem('bw_auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin',
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Non-JSON response received from server.',
        errors: [`HTTP ${response.status}`],
      }));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  get(endpoint, params) {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
