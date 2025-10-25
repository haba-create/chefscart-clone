import { ApifyClient } from 'apify-client';
import ProductDatabase from '../database.js';

/**
 * Grocery Scraper using Apify
 *
 * Scrapes real UK supermarket data from:
 * - Tesco (using jupri/tesco-grocery)
 * - Sainsbury's (using natanielsantos/sainsbury-s-scraper)
 * - Waitrose (using thenetaji/waitrose-scraper)
 */

export interface ScrapedProduct {
  name: string;
  brand?: string;
  category: string;
  unit: string;
  price: number;
  was_price?: number;
  promotion_text?: string;
  image_url?: string;
  purchase_url: string;
  store: string;
  availability?: string;
}

interface ScraperConfig {
  apifyApiToken?: string;
  enableCaching: boolean;
  cacheExpiryHours: number;
  rateLimit: number;
}

export default class GroceryScraper {
  private db: ProductDatabase;
  private config: ScraperConfig;
  private apifyClient: ApifyClient | null = null;

  constructor(db: ProductDatabase, config: ScraperConfig) {
    this.db = db;
    this.config = config;

    if (config.apifyApiToken) {
      this.apifyClient = new ApifyClient({
        token: config.apifyApiToken,
      });
      console.log('✅ Apify client initialized');
    } else {
      console.warn('⚠️  No Apify token - scraping will not work');
    }
  }

  /**
   * Main method: Scrape all stores for a search term
   */
  async scrapeAllStores(searchTerm: string): Promise<ScrapedProduct[]> {
    const results: ScrapedProduct[] = [];

    console.log(`🔍 Scraping all stores for: "${searchTerm}"`);

    if (!this.apifyClient) {
      console.error('❌ Apify client not initialized - need APIFY_API_TOKEN');
      return results;
    }

    try {
      // Scrape all stores in parallel
      const [tescoProducts, sainsburysProducts, waitroseProducts] = await Promise.all([
        this.scrapeTesco(searchTerm),
        this.scrapeSainsburys(searchTerm),
        this.scrapeWaitrose(searchTerm),
      ]);

      results.push(...tescoProducts, ...sainsburysProducts, ...waitroseProducts);

      // Save to database
      await this.saveResults(results);

      console.log(`✅ Scraped ${results.length} products from all stores`);
      return results;

    } catch (error) {
      console.error('❌ Scraping error:', error);
      return results;
    }
  }

  /**
   * Scrape Tesco using Apify actor: jupri/tesco-grocery
   */
  private async scrapeTesco(searchTerm: string): Promise<ScrapedProduct[]> {
    if (!this.apifyClient) return [];

    const jobId = this.db.createScrapingJob('Tesco');

    try {
      console.log(`🛒 Scraping Tesco for: "${searchTerm}"`);

      // Run the Tesco scraper actor
      const run = await this.apifyClient.actor('jupri/tesco-grocery').call({
        keyword: searchTerm,
        max_items: 20,
        max_pages: 1,
      });

      // Get the dataset results
      const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

      const products: ScrapedProduct[] = items.map((item: any) => ({
        name: item.title || item.name || 'Unknown Product',
        brand: this.extractBrand(item.title || item.name),
        category: this.categorizeProduct(item.title || item.name),
        unit: this.extractUnit(item.title || item.name),
        price: this.parsePrice(item.price || item.currentPrice),
        was_price: item.wasPrice ? this.parsePrice(item.wasPrice) : undefined,
        promotion_text: item.promotion || undefined,
        image_url: item.image || item.imageUrl || undefined,
        purchase_url: item.url || item.productUrl || 'https://www.tesco.com',
        store: 'Tesco',
        availability: item.availability || 'in_stock',
      }));

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      console.log(`✅ Tesco: Found ${products.length} products`);
      return products;

    } catch (error: any) {
      console.error(`❌ Tesco scraping failed:`, error.message);
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      return [];
    }
  }

  /**
   * Scrape Sainsbury's using Apify actor: natanielsantos/sainsbury-s-scraper
   */
  private async scrapeSainsburys(searchTerm: string): Promise<ScrapedProduct[]> {
    if (!this.apifyClient) return [];

    const jobId = this.db.createScrapingJob('Sainsburys');

    try {
      console.log(`🛒 Scraping Sainsbury's for: "${searchTerm}"`);

      // Run the Sainsbury's scraper actor
      const run = await this.apifyClient.actor('natanielsantos/sainsbury-s-scraper').call({
        search: searchTerm,
        maxItems: 20,
      });

      // Get the dataset results
      const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

      const products: ScrapedProduct[] = items.map((item: any) => ({
        name: item.productName || item.name || 'Unknown Product',
        brand: this.extractBrand(item.productName || item.name),
        category: this.categorizeProduct(item.productName || item.name),
        unit: this.extractUnit(item.productName || item.name),
        price: this.parsePrice(item.price || item.retailPrice),
        was_price: item.wasPrice ? this.parsePrice(item.wasPrice) : undefined,
        promotion_text: item.promotionDescription || undefined,
        image_url: item.imageUrl || item.images?.[0] || undefined,
        purchase_url: item.productUrl || item.url || 'https://www.sainsburys.co.uk',
        store: 'Sainsburys',
        availability: item.availability || 'in_stock',
      }));

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      console.log(`✅ Sainsbury's: Found ${products.length} products`);
      return products;

    } catch (error: any) {
      console.error(`❌ Sainsbury's scraping failed:`, error.message);
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      return [];
    }
  }

  /**
   * Scrape Waitrose using Apify actor: thenetaji/waitrose-scraper
   */
  private async scrapeWaitrose(searchTerm: string): Promise<ScrapedProduct[]> {
    if (!this.apifyClient) return [];

    const jobId = this.db.createScrapingJob('Waitrose');

    try {
      console.log(`🛒 Scraping Waitrose for: "${searchTerm}"`);

      // Run the Waitrose scraper actor
      const run = await this.apifyClient.actor('thenetaji/waitrose-scraper').call({
        search: searchTerm,
        maxItems: 20,
      });

      // Get the dataset results
      const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

      const products: ScrapedProduct[] = items.map((item: any) => ({
        name: item.name || item.productName || 'Unknown Product',
        brand: this.extractBrand(item.name || item.productName),
        category: this.categorizeProduct(item.name || item.productName),
        unit: this.extractUnit(item.name || item.productName),
        price: this.parsePrice(item.price || item.currentPrice),
        was_price: item.wasPrice ? this.parsePrice(item.wasPrice) : undefined,
        promotion_text: item.promotion || undefined,
        image_url: item.image || item.imageUrl || undefined,
        purchase_url: item.url || item.link || 'https://www.waitrose.com',
        store: 'Waitrose',
        availability: item.availability || 'in_stock',
      }));

      this.db.updateScrapingJob(jobId, {
        status: 'completed',
        products_scraped: products.length
      });

      console.log(`✅ Waitrose: Found ${products.length} products`);
      return products;

    } catch (error: any) {
      console.error(`❌ Waitrose scraping failed:`, error.message);
      this.db.updateScrapingJob(jobId, {
        status: 'failed',
        error_message: error.message
      });
      return [];
    }
  }

  /**
   * Save scraped products to database
   */
  private async saveResults(products: ScrapedProduct[]): Promise<void> {
    for (const product of products) {
      try {
        // Create unique product ID
        const productId = `${product.store.toLowerCase()}-${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        // Upsert product
        this.db.upsertProduct({
          id: productId,
          name: product.name,
          brand: product.brand,
          category: product.category,
          unit: product.unit,
          image_url: product.image_url,
        });

        // Upsert price
        this.db.upsertPrice({
          product_id: productId,
          store: product.store,
          price: product.price,
          was_price: product.was_price,
          promotion_text: product.promotion_text,
          availability: product.availability || 'in_stock',
          purchase_url: product.purchase_url,
        });

      } catch (error: any) {
        console.error(`Error saving product ${product.name}:`, error.message);
      }
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private parsePrice(priceStr: any): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;

    const cleaned = priceStr.toString().replace(/[£$,]/g, '').trim();
    return parseFloat(cleaned) || 0;
  }

  private extractBrand(productName: string): string | undefined {
    // Simple brand extraction from product name
    const brands = ['Tesco', 'Sainsburys', 'Waitrose', 'Heinz', 'Coca-Cola', 'Cadbury', 'Nestle'];
    for (const brand of brands) {
      if (productName.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return undefined;
  }

  private extractUnit(productName: string): string {
    const lowerName = productName.toLowerCase();

    if (lowerName.match(/\d+\s*kg/)) return 'kg';
    if (lowerName.match(/\d+\s*g/)) return 'g';
    if (lowerName.match(/\d+\s*l/)) return 'L';
    if (lowerName.match(/\d+\s*ml/)) return 'ml';
    if (lowerName.match(/\d+\s*pack/)) return 'pack';

    return 'each';
  }

  private categorizeProduct(productName: string): string {
    const lowerName = productName.toLowerCase();

    if (lowerName.match(/milk|butter|cheese|cream|yogurt/)) return 'Dairy & Eggs';
    if (lowerName.match(/chicken|beef|pork|lamb|meat|bacon/)) return 'Meat & Fish';
    if (lowerName.match(/apple|banana|orange|strawberr|fruit/)) return 'Fruits & Vegetables';
    if (lowerName.match(/bread|roll|bagel|croissant/)) return 'Bakery';
    if (lowerName.match(/pasta|rice|cereal|flour/)) return 'Pantry';
    if (lowerName.match(/ice cream|frozen|pizza/)) return 'Frozen';
    if (lowerName.match(/crisp|chocolate|sweet|snack/)) return 'Snacks';
    if (lowerName.match(/water|juice|cola|drink|beer|wine/)) return 'Beverages';

    return 'Other';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
