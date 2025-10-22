-- ChefsCart Product Database Schema
-- SQLite Schema (easily portable to PostgreSQL)

-- Products table - stores actual grocery items from UK supermarkets
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  barcode TEXT,
  nutrition_per_100g TEXT, -- JSON string
  ingredients TEXT,
  allergens TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product prices - one row per store per product
CREATE TABLE IF NOT EXISTS product_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  store TEXT NOT NULL, -- 'Tesco', 'Sainsburys', 'Waitrose', 'Ocado'
  price REAL NOT NULL,
  was_price REAL, -- Previous price if on sale
  promotion_text TEXT,
  availability TEXT DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock', 'low_stock'
  purchase_url TEXT NOT NULL, -- Direct link to buy
  last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(product_id, store)
);

-- Product images - multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'main', -- 'main', 'thumbnail', 'detail'
  display_order INTEGER DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Scraping jobs - track scraping runs
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  products_scraped INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT
);

-- Search cache - cache search results
CREATE TABLE IF NOT EXISTS search_cache (
  query TEXT PRIMARY KEY,
  results TEXT NOT NULL, -- JSON array of product IDs
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  hit_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_product_prices_store ON product_prices(store);
CREATE INDEX IF NOT EXISTS idx_product_prices_price ON product_prices(price);
CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_search_cache_updated ON search_cache(last_updated);

-- View for best prices
CREATE VIEW IF NOT EXISTS best_prices AS
SELECT
  p.id,
  p.name,
  p.category,
  p.unit,
  p.image_url,
  MIN(pp.price) as best_price,
  (SELECT store FROM product_prices WHERE product_id = p.id AND price = MIN(pp.price) LIMIT 1) as best_store,
  GROUP_CONCAT(DISTINCT pp.store) as available_stores,
  COUNT(DISTINCT pp.store) as store_count
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
GROUP BY p.id;
