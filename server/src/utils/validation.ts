import isUrl from 'is-url';
import URLParse from 'url-parse';
import isPrivateIP from 'private-ip';

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new ValidationError('URL is required and must be a string', 'url');
  }

  if (!isUrl(url)) {
    throw new ValidationError('Invalid URL format', 'url');
  }

  const parsedUrl = new URLParse(url);
  
  // Check for required protocol
  if (!parsedUrl.protocol || !['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new ValidationError('URL must use HTTP or HTTPS protocol', 'url');
  }

  // Check for valid hostname
  if (!parsedUrl.hostname) {
    throw new ValidationError('URL must have a valid hostname', 'url');
  }

  // SSRF Protection - Check for private/loopback IPs
  try {
    const hostname = parsedUrl.hostname;
    const isPrivate = isPrivateIP(hostname);
    
    if (isPrivate) {
      throw new ValidationError('Private/loopback IP addresses are not allowed', 'url', 403);
    }
  } catch (error) {
    // If isPrivateIP throws an error, it might be a domain name
    // We'll let it pass through for domain resolution
  }

  // Check for localhost
  if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname.startsWith('127.')) {
    throw new ValidationError('Localhost addresses are not allowed', 'url', 403);
  }

  return url;
}

export function normalizeUrl(url: string): string {
  const parsedUrl = new URLParse(url);
  
  // Remove UTM parameters
  const searchParams = new URLSearchParams(parsedUrl.query);
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmParams.forEach(param => searchParams.delete(param));
  
  // Remove fragments
  parsedUrl.set('hash', '');
  
  // Update query string
  parsedUrl.set('query', searchParams.toString());
  
  // Normalize hostname to lowercase
  parsedUrl.set('hostname', parsedUrl.hostname.toLowerCase());
  
  return parsedUrl.toString();
}

export function validateHtmlSize(html: string, maxSize: number): void {
  const sizeInBytes = Buffer.byteLength(html, 'utf8');
  const sizeInKB = sizeInBytes / 1024;
  
  if (sizeInKB > maxSize) {
    throw new ValidationError(
      `HTML content exceeds maximum size of ${maxSize}KB (actual: ${sizeInKB.toFixed(2)}KB)`,
      'raw_html',
      413
    );
  }
}

export function validateContentType(contentType: string): void {
  const allowedTypes = ['text/html', 'text/html; charset=utf-8', 'text/html; charset=UTF-8'];
  
  if (!allowedTypes.some(type => contentType.toLowerCase().includes(type))) {
    throw new ValidationError(
      `Invalid content type: ${contentType}. Expected text/html`,
      'content-type',
      400
    );
  }
}
