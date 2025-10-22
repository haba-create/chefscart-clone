/**
 * API Service for ChefsCart Backend
 * Handles all communication with the Express server for product data
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export interface SearchOptions {
  category?: string;
  maxPrice?: number;
  store?: string;
  limit?: number;
}

export interface SearchResponse {
  results: ProductWithPrices[];
  query: string;
  count: number;
}

export interface DealsResponse {
  deals: ProductWithPrices[];
  count: number;
}

export interface CategoriesResponse {
  categories: { category: string; count: number }[];
}

export interface StatsResponse {
  total_products: number;
  total_stores: number;
  total_categories: number;
  last_updated: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000, // 30 second timeout for scraping operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNREFUSED') {
          console.error('❌ Backend server is not running. Start it with: npm run dev:server');
        }
        throw error;
      }
    );
  }

  /**
   * Search for products across all UK supermarkets
   * Auto-scrapes if no results found in cache
   */
  async searchProducts(query: string, options: SearchOptions = {}): Promise<ProductWithPrices[]> {
    try {
      const params = new URLSearchParams();
      params.append('q', query);

      if (options.category) params.append('category', options.category);
      if (options.maxPrice) params.append('maxPrice', options.maxPrice.toString());
      if (options.store) params.append('store', options.store);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await this.client.get<SearchResponse>(`/api/products/search?${params}`);
      return response.data.results;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Get detailed product information including all store prices
   */
  async getProduct(productId: string): Promise<ProductWithPrices | null> {
    try {
      const response = await this.client.get<ProductWithPrices>(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      return null;
    }
  }

  /**
   * Get best deals (products with discounts)
   */
  async getBestDeals(limit: number = 20): Promise<ProductWithPrices[]> {
    try {
      const response = await this.client.get<DealsResponse>(`/api/deals?limit=${limit}`);
      return response.data.deals;
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  /**
   * Get all product categories with counts
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    try {
      const response = await this.client.get<CategoriesResponse>('/api/categories');
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await this.client.get<StatsResponse>('/api/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Manually trigger scraping for a specific search term
   */
  async scrapeProducts(query: string): Promise<{ productsFound: number; searchTerm: string }> {
    try {
      const response = await this.client.post('/api/scrape', { query });
      return response.data;
    } catch (error) {
      console.error('Error triggering scrape:', error);
      throw error;
    }
  }

  /**
   * Check if backend server is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing
export default ApiService;
