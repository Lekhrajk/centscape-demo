import axios, { AxiosResponse, AxiosError } from 'axios';
import { PreviewRequest, PreviewResponse, ApiError } from '../types';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001' 
  : 'https://your-production-api.com';

class ApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as ApiError;
      
      console.error(`API Error ${status}:`, data.error);
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data.field, data.error);
          break;
        case 403:
          console.error('Forbidden - SSRF protection triggered');
          break;
        case 404:
          console.error('Not Found - URL does not exist');
          break;
        case 408:
          console.error('Timeout - Server took too long to respond');
          break;
        case 413:
          console.error('Payload Too Large - HTML content too big');
          break;
        case 429:
          console.error('Rate Limited - Too many requests');
          break;
        case 500:
          console.error('Server Error - Internal server error');
          break;
        default:
          console.error(`Unexpected error: ${status}`);
      }
    } else if (error.request) {
      console.error('Network Error - No response received');
    } else {
      console.error('Request Error:', error.message);
    }
  }

  public async getPreview(request: PreviewRequest): Promise<PreviewResponse> {
    try {
      const response = await this.client.post<PreviewResponse>('/preview', request);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiError;
        throw new Error(apiError?.error || error.message);
      }
      throw error;
    }
  }

  public async getPreviewWithRetry(
    request: PreviewRequest, 
    maxRetries: number = 3
  ): Promise<PreviewResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.getPreview(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }
}

export const apiService = new ApiService();
