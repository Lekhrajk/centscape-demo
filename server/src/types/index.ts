export interface PreviewRequest {
  url: string;
  raw_html?: string;
}

export interface PreviewResponse {
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
  sourceUrl: string;
}

export interface ExtractedData {
  title: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
}

export interface ValidationError {
  message: string;
  field?: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
}

export interface SecurityConfig {
  maxRedirects: number;
  timeout: number;
  maxHtmlSize: number;
  userAgent: string;
  allowedContentTypes: string[];
}
