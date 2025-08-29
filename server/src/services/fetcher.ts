import axios, { AxiosResponse, AxiosError } from 'axios';
import { SecurityConfig } from '../types';
import { validateContentType, validateHtmlSize } from '../utils/validation';

export class ContentFetcher {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  public async fetchUrl(url: string): Promise<string> {
    try {
      const response: AxiosResponse = await axios.get(url, {
        timeout: this.config.timeout,
        maxRedirects: this.config.maxRedirects,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
        },
        validateStatus: (status: number) => status < 400,
        maxContentLength: this.config.maxHtmlSize * 1024, // Convert KB to bytes
      });

      // Validate content type
      const contentType = response.headers['content-type'] || '';
      validateContentType(contentType);

      // Validate HTML size
      const html = response.data;
      validateHtmlSize(html, this.config.maxHtmlSize);

      return html;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.handleAxiosError(error, url);
      } else {
        throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private handleAxiosError(error: AxiosError, url: string): never {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timeout after ${this.config.timeout}ms`);
    }

    if (error.code === 'ENOTFOUND') {
      throw new Error(`Domain not found: ${new URL(url).hostname}`);
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Connection refused by the server');
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error(`Request timeout after ${this.config.timeout}ms`);
    }

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      
      switch (status) {
        case 403:
          throw new Error('Access forbidden - the server denied access to this resource');
        case 404:
          throw new Error('Page not found - the requested URL does not exist');
        case 429:
          throw new Error('Too many requests - please try again later');
        case 500:
          throw new Error('Server error - the server encountered an internal error');
        default:
          throw new Error(`HTTP ${status} ${statusText}`);
      }
    }

    if (error.request) {
      throw new Error('No response received from server');
    }

    throw new Error(`Network error: ${error.message}`);
  }
}
