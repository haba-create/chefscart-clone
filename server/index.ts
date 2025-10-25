import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ProductDatabase from './database.js';
import GroceryScraper from './scrapers/groceryScraper.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new ProductDatabase();

// Initialize scraper
const scraper = new GroceryScraper(db, {
  apifyApiToken: process.env.APIFY_API_TOKEN,
  enableCaching: true,
  cacheExpiryHours: 6,
  rateLimit: 60,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  const stats = db.getStats();
  res.json({
    status: 'healthy',
    database: stats,
    timestamp: new Date().toISOString(),
  });
});

// Search products
app.get('/api/products/search', async (req, res) => {
  try {
    const { q, category, maxPrice, store, limit } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Check database first
    let results = db.searchProducts(q as string, {
      category: category as string,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      store: store as string,
      limit: limit ? parseInt(limit as string) : 50,
    });

    // If no results in database, scrape
    if (results.length === 0) {
      console.log(`No cached results for "${q}", scraping...`);
      await scraper.scrapeAllStores(q as string);

      // Try search again
      results = db.searchProducts(q as string, {
        category: category as string,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        store: store as string,
        limit: limit ? parseInt(limit as string) : 50,
      });
    }

    res.json({
      query: q,
      results: results.map(r => r.product),
      count: results.length,
    });

  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
app.get('/api/categories/:category/products', (req, res) => {
  try {
    const { limit } = req.query;
    const products = db.getProductsByCategory(
      req.params.category,
      limit ? parseInt(limit as string) : 50
    );

    res.json({
      category: req.params.category,
      products,
      count: products.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get best deals
app.get('/api/deals', (req, res) => {
  try {
    const { limit } = req.query;
    const deals = db.getBestDeals(limit ? parseInt(limit as string) : 20);

    res.json({
      deals,
      count: deals.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger manual scrape
app.post('/api/scrape', async (req, res) => {
  try {
    const { query, stores } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Manual scrape triggered for: "${query}"`);
    const results = await scraper.scrapeAllStores(query);

    res.json({
      message: 'Scraping completed',
      query,
      productsFound: results.length,
    });

  } catch (error: any) {
    console.error('Scrape error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ChefsCart API Server');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🗄️  Database: ${db.getStats().total_products} products`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Apify: ${process.env.APIFY_API_TOKEN ? 'Configured ✅' : 'Not configured ⚠️'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing database...');
  db.close();
  process.exit(0);
});

export default app;
