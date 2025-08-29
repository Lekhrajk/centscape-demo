import * as cheerio from 'cheerio';
import { ExtractedData } from '../types';

export class ContentExtractor {
  private $: cheerio.CheerioAPI;

  constructor(html: string) {
    this.$ = cheerio.load(html);
  }

  public extract(): ExtractedData {
    const data: ExtractedData = {
      title: '',
      image: '',
      price: '',
      currency: '',
      siteName: '',
    };

    // Extraction order: Open Graph → Twitter Card → oEmbed → fallback
    this.extractOpenGraph(data);
    this.extractTwitterCard(data);
    this.extractOEmbed(data);
    this.extractFallback(data);

    return data;
  }

  private extractOpenGraph(data: ExtractedData): void {
    // Title
    if (!data.title) {
      data.title = this.$('meta[property="og:title"]').attr('content') || '';
    }

    // Image
    if (!data.image) {
      data.image = this.$('meta[property="og:image"]').attr('content') || '';
    }

    // Site name
    if (!data.siteName) {
      data.siteName = this.$('meta[property="og:site_name"]').attr('content') || '';
    }

    // Price (some sites use og:price)
    if (!data.price) {
      data.price = this.$('meta[property="og:price:amount"]').attr('content') || '';
      if (data.price && !data.currency) {
        data.currency = this.$('meta[property="og:price:currency"]').attr('content') || '';
      }
    }
  }

  private extractTwitterCard(data: ExtractedData): void {
    // Title
    if (!data.title) {
      data.title = this.$('meta[name="twitter:title"]').attr('content') || '';
    }

    // Image
    if (!data.image) {
      data.image = this.$('meta[name="twitter:image"]').attr('content') || '';
    }

    // Site name
    if (!data.siteName) {
      data.siteName = this.$('meta[name="twitter:site"]').attr('content') || '';
    }
  }

  private extractOEmbed(_data: ExtractedData): void {
    // Look for oEmbed link
    const oembedLink = this.$('link[type="application/json+oembed"]').attr('href') ||
                      this.$('link[type="text/xml+oembed"]').attr('href');

    if (oembedLink) {
      // Note: In a real implementation, you would fetch the oEmbed data
      // For now, we'll just note that oEmbed is available
      console.log('oEmbed link found:', oembedLink);
    }
  }

  private extractFallback(data: ExtractedData): void {
    // Title fallback
    if (!data.title) {
      data.title = this.$('title').text().trim() || '';
    }

    // Image fallback - look for the first significant image
    if (!data.image) {
      const images = this.$('img[src]').toArray();
      for (const img of images) {
        const src = this.$(img).attr('src');
        if (src && this.isSignificantImage(src, this.$(img))) {
          data.image = src;
          break;
        }
      }
    }

    // Price fallback - look for common price patterns
    if (!data.price) {
      data.price = this.extractPriceFromText();
    }

    // Site name fallback
    if (!data.siteName) {
      data.siteName = this.extractSiteName();
    }
  }

  private isSignificantImage(src: string, imgElement: cheerio.Cheerio<any>): boolean {
    // Skip small images, icons, and tracking pixels
    const width = imgElement.attr('width');
    const height = imgElement.attr('height');
    const alt = imgElement.attr('alt') || '';
    const className = imgElement.attr('class') || '';

    // Skip if it's likely an icon or small image
    if (width && parseInt(width) < 100) return false;
    if (height && parseInt(height) < 100) return false;

    // Skip common icon/tracking patterns
    const skipPatterns = [
      'icon', 'logo', 'avatar', 'thumb', 'pixel', 'tracking', 'analytics',
      'favicon', 'sprite', 'button', 'badge'
    ];

    const combinedText = `${src} ${alt} ${className}`.toLowerCase();
    if (skipPatterns.some(pattern => combinedText.includes(pattern))) {
      return false;
    }

    return true;
  }

  private extractPriceFromText(): string {
    // Common price patterns - improved for better matching
    const pricePatterns = [
      /\$[\d,]+\.?\d*/g,  // $123.45 or $123
      /₹[\d,]+\.?\d*/g,   // ₹123.45 or ₹123 (Indian Rupees)
      /[\d,]+\.?\d*\s*(USD|EUR|GBP|CAD|AUD|INR)/gi,  // 123.45 USD
      /price[:\s]*\$?[\d,]+\.?\d*/gi,  // Price: $123.45
      /[\d,]+\.?\d*\s*(dollars?|euros?|pounds?|rupees?)/gi,  // 123.45 dollars
    ];

    const text = this.$('body').text();
    
    for (const pattern of pricePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Find the most complete price match
        let bestMatch = matches[0];
        for (const match of matches) {
          // Prefer matches with decimal places or longer numbers
          if (match.includes('.') || match.length > bestMatch.length) {
            bestMatch = match;
          }
        }
        return bestMatch.replace(/\s+/g, ' ').trim();
      }
    }

    // Try to find price in specific elements
    const priceElements = this.$('[class*="price"], [id*="price"], [class*="Price"], [id*="Price"]');
    for (const element of priceElements.toArray()) {
      const text = this.$(element).text().trim();
      const priceMatch = text.match(/[\$₹]?[\d,]+\.?\d*/);
      if (priceMatch) {
        return priceMatch[0];
      }
    }

    return '';
  }

  private extractSiteName(): string {
    // Try to extract from various sources
    const sources = [
      this.$('meta[name="application-name"]').attr('content'),
      this.$('meta[name="apple-mobile-web-app-title"]').attr('content'),
      this.$('meta[property="og:site_name"]').attr('content'),
      this.$('meta[name="twitter:site"]').attr('content'),
    ];

    for (const source of sources) {
      if (source && source.trim()) {
        return source.trim();
      }
    }

    return '';
  }
}
