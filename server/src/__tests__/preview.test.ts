import request from 'supertest';
import app from '../index';
import { ContentExtractor } from '../services/extractor';
import { validateUrl, normalizeUrl } from '../utils/validation';

describe('Preview API', () => {
  describe('POST /preview', () => {
    it('should return preview data for valid URL', async () => {
      const response = await request(app)
        .post('/preview')
        .send({
          url: 'https://example.com'
        })
        .expect(200);

      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('sourceUrl');
      expect(response.body.sourceUrl).toBe('https://example.com');
    });

    it('should handle raw HTML input', async () => {
      const testHtml = `
        <html>
          <head>
            <title>Test Product</title>
            <meta property="og:title" content="OG Test Product" />
            <meta property="og:image" content="https://example.com/image.jpg" />
            <meta property="og:price:amount" content="99.99" />
            <meta property="og:price:currency" content="USD" />
          </head>
          <body>
            <h1>Test Product</h1>
            <img src="https://example.com/product.jpg" alt="Product Image" />
          </body>
        </html>
      `;

      const response = await request(app)
        .post('/preview')
        .send({
          url: 'https://example.com/product',
          raw_html: testHtml
        })
        .expect(200);

      expect(response.body.title).toBe('OG Test Product');
      expect(response.body.image).toBe('https://example.com/image.jpg');
      expect(response.body.price).toBe('99.99');
      expect(response.body.currency).toBe('USD');
    });

    it('should return 400 for missing URL and raw_html', async () => {
      const response = await request(app)
        .post('/preview')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Either url or raw_html must be provided');
    });

    it('should return 400 for invalid URL format', async () => {
      const response = await request(app)
        .post('/preview')
        .send({
          url: 'not-a-valid-url'
        })
        .expect(400);

      expect(response.body.error).toContain('Invalid URL format');
    });

    it('should return 403 for private IP addresses', async () => {
      const response = await request(app)
        .post('/preview')
        .send({
          url: 'http://192.168.1.1'
        })
        .expect(403);

      expect(response.body.error).toContain('Private/loopback IP addresses are not allowed');
    });

    it('should return 403 for localhost', async () => {
      const response = await request(app)
        .post('/preview')
        .send({
          url: 'http://localhost:3000'
        })
        .expect(403);

      expect(response.body.error).toContain('Localhost addresses are not allowed');
    });

    it('should handle large HTML content', async () => {
      const largeHtml = 'x'.repeat(600 * 1024); // 600KB

      const response = await request(app)
        .post('/preview')
        .send({
          url: 'https://example.com',
          raw_html: largeHtml
        })
        .expect(413);

      expect(response.body.error).toContain('HTML content exceeds maximum size');
    });
  });

  describe('Rate Limiting', () => {
    it('should limit requests to 10 per minute', async () => {
      const requests = Array.from({ length: 11 }, () =>
        request(app)
          .post('/preview')
          .send({ url: 'https://example.com' })
      );

      const responses = await Promise.all(requests);
      const successResponses = responses.filter(r => r.status === 200);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(successResponses).toHaveLength(10);
      expect(rateLimitedResponses).toHaveLength(1);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});

describe('Content Extractor', () => {
  it('should extract Open Graph data', () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Test Product" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="og:price:amount" content="99.99" />
          <meta property="og:price:currency" content="USD" />
          <meta property="og:site_name" content="Test Store" />
        </head>
      </html>
    `;

    const extractor = new ContentExtractor(html);
    const result = extractor.extract();

    expect(result.title).toBe('Test Product');
    expect(result.image).toBe('https://example.com/image.jpg');
    expect(result.price).toBe('99.99');
    expect(result.currency).toBe('USD');
    expect(result.siteName).toBe('Test Store');
  });

  it('should fallback to title tag when no Open Graph', () => {
    const html = `
      <html>
        <head>
          <title>Fallback Title</title>
        </head>
        <body>
          <img src="https://example.com/image.jpg" alt="Product" />
        </body>
      </html>
    `;

    const extractor = new ContentExtractor(html);
    const result = extractor.extract();

    expect(result.title).toBe('Fallback Title');
    expect(result.image).toBe('https://example.com/image.jpg');
  });

  it('should extract price from text content', () => {
    const html = `
      <html>
        <head><title>Product</title></head>
        <body>
          <p>Price: $99.99</p>
          <p>Regular price: $129.99</p>
        </body>
      </html>
    `;

    const extractor = new ContentExtractor(html);
    const result = extractor.extract();

    expect(result.price).toContain('$99.99');
  });
});

describe('URL Validation', () => {
  it('should validate correct URLs', () => {
    const validUrls = [
      'https://example.com',
      'http://example.com/path',
      'https://example.com/path?param=value',
    ];

    validUrls.forEach(url => {
      expect(() => validateUrl(url)).not.toThrow();
    });
  });

  it('should reject invalid URLs', () => {
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com',
      'javascript:alert(1)',
    ];

    invalidUrls.forEach(url => {
      expect(() => validateUrl(url)).toThrow();
    });
  });

  it('should normalize URLs correctly', () => {
    const testCases = [
      {
        input: 'https://EXAMPLE.com/path?utm_source=test&param=value#fragment',
        expected: 'https://example.com/path?param=value'
      },
      {
        input: 'https://example.com/path?utm_medium=test&utm_campaign=test',
        expected: 'https://example.com/path'
      }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(normalizeUrl(input)).toBe(expected);
    });
  });
});
