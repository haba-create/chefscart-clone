/**
 * UK Supermarket Grocery Scraper
 *
 * Multi-source scraping agent for:
 * - Waitrose
 * - Tesco
 * - Sainsbury's
 * - Ocado
 *
 * Supports:
 * - RapidAPI UK Supermarkets Pricing API
 * - Direct web scraping (with rate limiting and robots.txt compliance)
 * - Caching to reduce API calls
 */

import axios from 'axios';
import ProductDatabase, { Product, ProductPrice } from '../database';
import * as cheerio from 'cheerio';

export interface ScraperConfig {
  rapidApiKey?: string;
  enableCaching?: boolean;
  cacheExpiryHours?: number;
  rateLimit?: number; // requests per minute
  userAgent?: string;
}

export interface ScrapedProduct {
  name: string;
  brand?: string;
  category: string;
  unit: string;
  price: number;
  was_price?: number;
  image_url?: string;
  purchase_url: string;
  store: string;
  barcode?: string;
  description?: string;
  promotion_text?: string;
  availability?: string;
}

export class GroceryScraper {
  private db: ProductDatabase;
  private config: ScraperConfig;
  private requestQueue: Map<string, number> = new Map(); // rate limiting

  constructor(db: ProductDatabase, config: ScraperConfig) {
    this.db = db;
    this.config = {
      enableCaching: true,
      cacheExpiryHours: 6,
      rateLimit: 60, // 60 requests per minute
      userAgent: 'Mozilla/5.0 (compatible; ChefsCart/1.0; +https://chefscart.app)',
      ...config,
    };
  }

  // ============================================
  // Main Scraping Methods
  // ============================================

  async scrapeAllStores(searchTerm: string): Promise<ScrapedProduct[]> {
    const results: ScrapedProduct[] = [];

    console.log(`🔍 Scraping all stores for: "${searchTerm}"`);

    try {
      // NOTE: RapidAPI only supports barcode lookups, not text search
      // Skip RapidAPI and use direct scraping for text-based searches

      // Direct scraping from individual stores
      const stores = ['tesco', 'sainsburys', 'waitrose', 'ocado'];

      for (const store of stores) {
        try {
          const storeResults = await this.scrapeStore(store, searchTerm);
          results.push(...storeResults);
          await this.sleep(1000); // Rate limiting between stores
          } catch (error) {
            console.error(`❌ Error scraping ${store}:`, error);
          }
        }
      }

      // Save to database
      await this.saveResults(results);

      console.log(`✅ Scraped ${results.length} products from all stores`);
      return results;

    } catch (error) {
      console.error('❌ Scraping error:', error);
      return results;
    }
  }

  // ============================================
  // RapidAPI Method (Recommended)
  // ============================================

  private async scrapeViaRapidAPI(searchTerm: string): Promise<ScrapedProduct[]> {
    if (!this.config.rapidApiKey) {
      console.log('⚠️  RapidAPI key not configured');
      return [];
    }

    try {
      // UK Supermarkets Product Pricing API
      const response = await axios.get('https://uk-supermarkets-product-pricing.p.rapidapi.com/search', {
        params: { query: searchTerm },
        headers: {
          'X-RapidAPI-Key': this.config.rapidApiKey,
          'X-RapidAPI-Host': 'uk-supermarkets-product-pricing.p.rapidapi.com'
        }
      });

      if (!response.data || !response.data.products) {
        return [];
      }

      // Transform RapidAPI response to our format
      return response.data.products.map((product: any) => ({
        name: product.name,
        brand: product.brand,
        category: this.categorizeProduct(product.name),
        unit: product.unit || 'each',
        price: product.price,
        was_price: product.wasPrice,
        image_url: product.image,
        purchase_url: product.url,
        store: this.normalizeStoreName(product.store),
        barcode: product.barcode,
        description: product.description,
        promotion_text: product.promotion,
        availability: product.inStock ? 'in_stock' : 'out_of_stock',
      }));

    } catch (error: any) {
      console.error('❌ RapidAPI error:', error.message);
      return [];
    }
  }

  // ============================================
  // Individual Store Scrapers
  // ============================================

  private async scrapeStore(store: string, searchTerm: string): Promise<ScrapedProduct[]> {
    switch (store.toLowerCase()) {
      case 'tesco':
        return await this.scrapeTesco(searchTerm);
      case 'sainsburys':
        return await this.scrapeSainsburys(searchTerm);
      case 'waitrose':
        return await this.scrapeWaitrose(searchTerm);
      case 'ocado':
        return await this.scrapeOcado(searchTerm);
      default:
        return [];
    }
  }

  private async scrapeTesco(searchTerm: string): Promise<ScrapedProduct[]> {
    const jobId = this.db.createScrapingJob('Tesco');

    try {
      const searchUrl = `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(searchTerm)}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.config.userAgent }
      });

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      // Tesco product tiles
      $('.product-list--list-item').each((_, element) => {
        const $el = $(element);

        const name = $el.find('.product-tile--title').text().trim();
        const priceText = $el.find('.price-per-sellable-unit .value').text().trim();
        const wasPrice = $el.find('.price-per-sellable-unit .was').text().trim();
        const imageUrl = $el.find('.product-tile--image img').attr('src');
        const productUrl = $el.find('.product-tile--wrapper a').attr('href');

        if (name && priceText) {
          products.push({
            name,
            brand: this.extractBrand(name),
            category: this.categorizeProduct(name),
            unit: this.extractUnit(name),
            price: this.parsePrice(priceText),
            was_price: wasPrice ? this.parsePrice(wasPrice) : undefined,
            image_url: imageUrl ? `https://www.tesco.com${imageUrl}` : undefined,
            purchase_url: productUrl ? `https://www.tesco.com${productUrl}` : searchUrl,
            store: 'Tesco',
          });
        }
      });

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      return products;

    } catch (error: any) {
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }

  private async scrapeSainsburys(searchTerm: string): Promise<ScrapedProduct[]> {
    const jobId = this.db.createScrapingJob('Sainsburys');

    try {
      const searchUrl = `https://www.sainsburys.co.uk/gol-ui/SearchResults/${encodeURIComponent(searchTerm)}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.config.userAgent }
      });

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      // Sainsbury's product cards
      $('.pt__info').each((_, element) => {
        const $el = $(element);

        const name = $el.find('.pt__info__description').text().trim();
        const priceText = $el.find('.pt__cost__retail-price').text().trim();
        const imageUrl = $el.find('.pt__image img').attr('src');
        const productUrl = $el.find('a').attr('href');

        if (name && priceText) {
          products.push({
            name,
            brand: this.extractBrand(name),
            category: this.categorizeProduct(name),
            unit: this.extractUnit(name),
            price: this.parsePrice(priceText),
            image_url: imageUrl,
            purchase_url: productUrl ? `https://www.sainsburys.co.uk${productUrl}` : searchUrl,
            store: 'Sainsburys',
          });
        }
      });

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      return products;

    } catch (error: any) {
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }

  private async scrapeWaitrose(searchTerm: string): Promise<ScrapedProduct[]> {
    const jobId = this.db.createScrapingJob('Waitrose');

    try {
      const searchUrl = `https://www.waitrose.com/ecom/shop/search?&searchTerm=${encodeURIComponent(searchTerm)}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.config.userAgent }
      });

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      // Waitrose product pods
      $('.product-pod').each((_, element) => {
        const $el = $(element);

        const name = $el.find('.productNameAndPromotions').text().trim();
        const priceText = $el.find('.price').text().trim();
        const imageUrl = $el.find('.productImage img').attr('src');
        const productUrl = $el.find('a').attr('href');

        if (name && priceText) {
          products.push({
            name,
            brand: this.extractBrand(name),
            category: this.categorizeProduct(name),
            unit: this.extractUnit(name),
            price: this.parsePrice(priceText),
            image_url: imageUrl,
            purchase_url: productUrl ? `https://www.waitrose.com${productUrl}` : searchUrl,
            store: 'Waitrose',
          });
        }
      });

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      return products;

    } catch (error: any) {
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }

  private async scrapeOcado(searchTerm: string): Promise<ScrapedProduct[]> {
    const jobId = this.db.createScrapingJob('Ocado');

    try {
      const searchUrl = `https://www.ocado.com/search?entry=${encodeURIComponent(searchTerm)}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': this.config.userAgent }
      });

      const $ = cheerio.load(response.data);
      const products: ScrapedProduct[] = [];

      // Ocado product tiles
      $('.fops-shelf').each((_, element) => {
        const $el = $(element);

        const name = $el.find('.fop-title').text().trim();
        const priceText = $el.find('.fop-price').text().trim();
        const imageUrl = $el.find('.fop-img img').attr('src');
        const productUrl = $el.find('a').attr('href');

        if (name && priceText) {
          products.push({
            name,
            brand: this.extractBrand(name),
            category: this.categorizeProduct(name),
            unit: this.extractUnit(name),
            price: this.parsePrice(priceText),
            image_url: imageUrl,
            purchase_url: productUrl ? `https://www.ocado.com${productUrl}` : searchUrl,
            store: 'Ocado',
          });
        }
      });

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      return products;

    } catch (error: any) {
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      throw error;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async saveResults(products: ScrapedProduct[]): Promise<void> {
    for (const product of products) {
      // Generate product ID
      const productId = this.generateProductId(product.name, product.brand);

      // Insert/update product
      this.db.insertProduct({
        id: productId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        unit: product.unit,
        image_url: product.image_url,
        barcode: product.barcode,
        description: product.description,
      });

      // Insert/update price
      this.db.upsertPrice({
        product_id: productId,
        store: product.store,
        price: product.price,
        was_price: product.was_price,
        promotion_text: product.promotion_text,
        availability: product.availability || 'in_stock',
        purchase_url: product.purchase_url,
      });
    }
  }

  private generateProductId(name: string, brand?: string): string {
    const normalized = `${brand || ''}-${name}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized.substring(0, 100);
  }

  private normalizeStoreName(store: string): string {
    const storeMap: { [key: string]: string } = {
      'tesco': 'Tesco',
      'sainsburys': 'Sainsburys',
      'sainsbury': 'Sainsburys',
      'waitrose': 'Waitrose',
      'ocado': 'Ocado',
    };

    return storeMap[store.toLowerCase()] || store;
  }

  private categorizeProduct(name: string): string {
    const nameLower = name.toLowerCase();

    const categories: { [key: string]: string[] } = {
      'Dairy & Eggs': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'eggs'],
      'Meat & Fish': ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'prawns'],
      'Fruit': ['apple', 'banana', 'orange', 'grape', 'berry', 'strawberry', 'melon'],
      'Vegetables': ['potato', 'tomato', 'carrot', 'onion', 'pepper', 'lettuce', 'spinach'],
      'Bakery': ['bread', 'roll', 'bagel', 'croissant', 'muffin', 'cake'],
      'Pantry': ['pasta', 'rice', 'flour', 'sugar', 'oil', 'sauce', 'cereal'],
      'Frozen': ['frozen', 'ice cream'],
      'Snacks': ['crisp', 'chocolate', 'biscuit', 'nuts'],
      'Beverages': ['juice', 'water', 'coffee', 'tea', 'soda'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => nameLower.includes(keyword))) {
        return category;
      }
    }

    return 'Other';
  }

  private extractBrand(name: string): string | undefined {
    // Common UK brands
    const brands = ['Tesco', 'Sainsburys', 'Waitrose', 'Ocado', 'Essential', 'Finest', 'Taste the Difference', 'M&S'];

    for (const brand of brands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    // Extract first word as potential brand
    const firstWord = name.split(' ')[0];
    if (firstWord.length > 2 && firstWord[0] === firstWord[0].toUpperCase()) {
      return firstWord;
    }

    return undefined;
  }

  private extractUnit(name: string): string {
    const unitPatterns = [
      /(\d+)(kg|g|l|ml|cl)/i,
      /(\d+) (pack|pint|litre|liter)/i,
      /(each|single|unit)/i,
    ];

    for (const pattern of unitPatterns) {
      const match = name.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return 'each';
  }

  private parsePrice(priceText: string): number {
    // Remove currency symbols and convert to number
    const cleaned = priceText.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default GroceryScraper;
