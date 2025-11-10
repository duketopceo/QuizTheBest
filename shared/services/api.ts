// Shared API client logic
const API_URL = process.env.API_URL || 'http://localhost:3000/api'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<import('./types/api').ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.error?.code || 'UNKNOWN_ERROR',
            message: data.error?.message || 'An error occurred',
          },
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error.message || 'Network error occurred',
        },
      }
    }
  }

  async get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'GET' }, token)
  }

  async post<T>(endpoint: string, data: any, token?: string) {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    )
  }

  async put<T>(endpoint: string, data: any, token?: string) {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    )
  }

  async delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: 'DELETE' }, token)
  }
}
