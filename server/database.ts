import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database types
export interface Product {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  category: string;
  unit: string;
  image_url?: string;
  last_updated: string;
  barcode?: string;
  nutrition_per_100g?: string;
  ingredients?: string;
  allergens?: string;
}

export interface ProductPrice {
  id?: number;
  product_id: string;
  store: string;
  price: number;
  was_price?: number;
  promotion_text?: string;
  availability: string;
  purchase_url: string;
  last_checked: string;
}

export interface ProductWithPrices extends Product {
  prices: ProductPrice[];
  best_price: number;
  best_store: string;
}

export interface SearchResult {
  product: ProductWithPrices;
  relevance_score: number;
}

class ProductDatabase {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath || join(__dirname, '../database/products.db');
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL'); // Better performance
    this.initialize();
  }

  private initialize() {
    // Read and execute schema
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute schema statements
    const statements = schema.split(';').filter(s => s.trim());
    statements.forEach(statement => {
      if (statement.trim()) {
        this.db.exec(statement);
      }
    });

    console.log('✅ Database initialized');
  }

  // ============================================
  // Product Operations
  // ============================================

  insertProduct(product: Omit<Product, 'created_at' | 'last_updated'>): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO products
      (id, name, description, brand, category, unit, image_url, barcode, nutrition_per_100g, ingredients, allergens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      product.id,
      product.name,
      product.description,
      product.brand,
      product.category,
      product.unit,
      product.image_url,
      product.barcode,
      product.nutrition_per_100g,
      product.ingredients,
      product.allergens
    );
  }

  getProduct(id: string): ProductWithPrices | null {
    const product = this.db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product;

    if (!product) return null;

    const prices = this.db.prepare('SELECT * FROM product_prices WHERE product_id = ?')
      .all(id) as ProductPrice[];

    const bestPrice = prices.length > 0 ? Math.min(...prices.map(p => p.price)) : 0;
    const bestStore = prices.find(p => p.price === bestPrice)?.store || '';

    return {
      ...product,
      prices,
      best_price: bestPrice,
      best_store: bestStore,
    };
  }

  // ============================================
  // Price Operations
  // ============================================

  upsertPrice(price: Omit<ProductPrice, 'id' | 'last_checked'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO product_prices (product_id, store, price, was_price, promotion_text, availability, purchase_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id, store) DO UPDATE SET
        price = excluded.price,
        was_price = excluded.was_price,
        promotion_text = excluded.promotion_text,
        availability = excluded.availability,
        purchase_url = excluded.purchase_url,
        last_checked = CURRENT_TIMESTAMP
    `);

    stmt.run(
      price.product_id,
      price.store,
      price.price,
      price.was_price,
      price.promotion_text,
      price.availability,
      price.purchase_url
    );
  }

  getPricesByStore(store: string): ProductPrice[] {
    return this.db.prepare('SELECT * FROM product_prices WHERE store = ? ORDER BY price ASC')
      .all(store) as ProductPrice[];
  }

  // ============================================
  // Search Operations
  // ============================================

  searchProducts(query: string, options: {
    category?: string;
    maxPrice?: number;
    store?: string;
    limit?: number;
  } = {}): SearchResult[] {
    const { category, maxPrice, store, limit = 50 } = options;

    let sql = `
      SELECT DISTINCT p.*,
        MIN(pp.price) as best_price,
        (SELECT store FROM product_prices WHERE product_id = p.id ORDER BY price ASC LIMIT 1) as best_store
      FROM products p
      LEFT JOIN product_prices pp ON p.id = pp.product_id
      WHERE (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)
    `;

    const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (category) {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (maxPrice) {
      sql += ' AND pp.price <= ?';
      params.push(maxPrice);
    }

    if (store) {
      sql += ' AND pp.store = ?';
      params.push(store);
    }

    sql += ' GROUP BY p.id ORDER BY best_price ASC LIMIT ?';
    params.push(limit);

    const products = this.db.prepare(sql).all(...params) as any[];

    return products.map(p => {
      const fullProduct = this.getProduct(p.id);

      // Calculate relevance score (simple algorithm)
      const nameMatch = p.name.toLowerCase().includes(query.toLowerCase());
      const exactMatch = p.name.toLowerCase() === query.toLowerCase();
      let score = 0;
      if (exactMatch) score = 100;
      else if (nameMatch) score = 80;
      else score = 50;

      return {
        product: fullProduct!,
        relevance_score: score,
      };
    }).sort((a, b) => b.relevance_score - a.relevance_score);
  }

  // ============================================
  // Category Operations
  // ============================================

  getCategories(): { category: string; count: number }[] {
    return this.db.prepare(`
      SELECT category, COUNT(*) as count
      FROM products
      GROUP BY category
      ORDER BY count DESC
    `).all() as { category: string; count: number }[];
  }

  getProductsByCategory(category: string, limit = 50): ProductWithPrices[] {
    const products = this.db.prepare(`
      SELECT * FROM products WHERE category = ? LIMIT ?
    `).all(category, limit) as Product[];

    return products.map(p => this.getProduct(p.id)).filter(p => p !== null) as ProductWithPrices[];
  }

  // ============================================
  // Best Deals
  // ============================================

  getBestDeals(limit = 20): ProductWithPrices[] {
    const deals = this.db.prepare(`
      SELECT DISTINCT p.*
      FROM products p
      JOIN product_prices pp ON p.id = pp.product_id
      WHERE pp.was_price IS NOT NULL AND pp.was_price > pp.price
      ORDER BY (pp.was_price - pp.price) DESC
      LIMIT ?
    `).all(limit) as Product[];

    return deals.map(p => this.getProduct(p.id)).filter(p => p !== null) as ProductWithPrices[];
  }

  // ============================================
  // Scraping Job Tracking
  // ============================================

  createScrapingJob(store: string): number {
    const result = this.db.prepare(`
      INSERT INTO scraping_jobs (store, status, started_at)
      VALUES (?, 'running', CURRENT_TIMESTAMP)
    `).run(store);

    return result.lastInsertRowid as number;
  }

  updateScrapingJob(jobId: number, data: {
    status?: string;
    products_scraped?: number;
    error_message?: string;
  }): void {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      params.push(data.status);
      if (data.status === 'completed' || data.status === 'failed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }
    }

    if (data.products_scraped !== undefined) {
      updates.push('products_scraped = ?');
      params.push(data.products_scraped);
    }

    if (data.error_message) {
      updates.push('error_message = ?');
      params.push(data.error_message);
    }

    if (updates.length > 0) {
      params.push(jobId);
      this.db.prepare(`
        UPDATE scraping_jobs SET ${updates.join(', ')}
        WHERE id = ?
      `).run(...params);
    }
  }

  // ============================================
  // Statistics
  // ============================================

  getStats() {
    const productCount = this.db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    const storeCount = this.db.prepare('SELECT COUNT(DISTINCT store) as count FROM product_prices').get() as { count: number };
    const categoryCount = this.db.prepare('SELECT COUNT(DISTINCT category) as count FROM products').get() as { count: number };

    const lastUpdate = this.db.prepare('SELECT MAX(last_updated) as last FROM products').get() as { last: string };

    return {
      total_products: productCount.count,
      total_stores: storeCount.count,
      total_categories: categoryCount.count,
      last_updated: lastUpdate.last,
    };
  }

  close() {
    this.db.close();
  }
}

export default ProductDatabase;
