import { Request, Response } from 'express';
import { PreviewRequest, PreviewResponse, SecurityConfig } from '../types';
import { validateUrl, ValidationError } from '../utils/validation';
import { ContentFetcher } from '../services/fetcher';
import { ContentExtractor } from '../services/extractor';

export class PreviewController {
  private fetcher: ContentFetcher;
  private securityConfig: SecurityConfig;

  constructor() {
    this.securityConfig = {
      maxRedirects: 3,
      timeout: 10000, // 10 seconds - increased for slower sites
      maxHtmlSize: 1024, // 1 MB - increased for larger pages
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      allowedContentTypes: ['text/html', 'text/html; charset=utf-8', 'text/html; charset=UTF-8'],
    };

    this.fetcher = new ContentFetcher(this.securityConfig);
  }

  public async getPreview(req: Request, res: Response): Promise<void> {
    try {
      const { url, raw_html }: PreviewRequest = req.body;

      // Validate request body
      if (!url && !raw_html) {
        res.status(400).json({
          error: 'Either url or raw_html must be provided',
          field: 'body'
        });
        return;
      }

      let html: string;
      let sourceUrl: string;

      if (raw_html) {
        // Use provided HTML
        html = raw_html;
        sourceUrl = url || 'unknown';
      } else {
        // Fetch HTML from URL
        const validatedUrl = validateUrl(url);
        sourceUrl = validatedUrl;
        html = await this.fetcher.fetchUrl(validatedUrl);
      }

      // Extract content from HTML
      const extractor = new ContentExtractor(html);
      const extractedData = extractor.extract();

      // Ensure we have at least a title
      if (!extractedData.title) {
        extractedData.title = 'Untitled';
      }

      // Create response
      const response: PreviewResponse = {
        title: extractedData.title,
        image: extractedData.image || '',
        price: extractedData.price || '',
        currency: extractedData.currency || '',
        siteName: extractedData.siteName || '',
        sourceUrl: sourceUrl,
      };

      res.status(200).json(response);

    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    console.error('Preview controller error:', error);

    if (error instanceof ValidationError) {
      res.status(error.statusCode).json({
        error: error.message,
        field: error.field,
      });
      return;
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('timeout')) {
        res.status(408).json({
          error: 'Request timeout - the server took too long to respond',
        });
        return;
      }

      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Page not found - the requested URL does not exist',
        });
        return;
      }

      if (error.message.includes('forbidden') || error.message.includes('denied')) {
        res.status(403).json({
          error: 'Access forbidden - the server denied access to this resource',
        });
        return;
      }

      if (error.message.includes('blocked') || error.message.includes('bot')) {
        res.status(403).json({
          error: 'Access blocked - this website blocks automated requests',
        });
        return;
      }

      if (error.message.includes('No response received')) {
        res.status(503).json({
          error: 'Service temporarily unavailable - the website may be blocking automated requests',
        });
        return;
      }

      // Generic error
      res.status(500).json({
        error: 'Internal server error - failed to process the request',
      });
      return;
    }

    // Unknown error
    res.status(500).json({
      error: 'An unexpected error occurred',
    });
  }
}
