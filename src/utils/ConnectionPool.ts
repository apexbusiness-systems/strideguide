/**
 * ConnectionPool - Optimize Supabase client connections
 * Implements connection pooling best practices for edge functions
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

interface PoolConfig {
  maxConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
}

const DEFAULT_CONFIG: PoolConfig = {
  maxConnections: 10,
  idleTimeoutMs: 30000, // 30 seconds
  connectionTimeoutMs: 10000, // 10 seconds
};

/**
 * Optimized Supabase client factory with pooling hints
 * For use in edge functions and heavy-load scenarios
 */
export class ConnectionPool {
  private static instance: ConnectionPool;
  private clients: Map<string, SupabaseClient<Database>> = new Map();
  private lastUsed: Map<string, number> = new Map();
  private config: PoolConfig;

  private constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Cleanup idle connections periodically
    setInterval(() => this.cleanupIdleConnections(), this.config.idleTimeoutMs);
  }

  static getInstance(config?: Partial<PoolConfig>): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config);
    }
    return ConnectionPool.instance;
  }

  /**
   * Get or create a pooled Supabase client
   * Reuses connections when possible
   */
  getClient(supabaseUrl: string, supabaseKey: string): SupabaseClient<Database> {
    const key = `${supabaseUrl}:${supabaseKey.substring(0, 10)}`;
    
    // Return existing client if available
    if (this.clients.has(key)) {
      this.lastUsed.set(key, Date.now());
      return this.clients.get(key)!;
    }

    // Enforce max connections limit
    if (this.clients.size >= this.config.maxConnections) {
      this.evictOldestConnection();
    }

    // Create new optimized client
    const client = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Don't persist in server contexts
        autoRefreshToken: false, // Manual token management
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'X-Connection-Pool': 'true',
        },
      },
    });

    this.clients.set(key, client);
    this.lastUsed.set(key, Date.now());

    return client;
  }

  private evictOldestConnection() {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    this.lastUsed.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.clients.delete(oldestKey);
      this.lastUsed.delete(oldestKey);
    }
  }

  private cleanupIdleConnections() {
    const now = Date.now();
    const keysToRemove: string[] = [];

    this.lastUsed.forEach((time, key) => {
      if (now - time > this.config.idleTimeoutMs) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      this.clients.delete(key);
      this.lastUsed.delete(key);
    });

    if (keysToRemove.length > 0 && import.meta.env.DEV) {
      console.log(`[ConnectionPool] Cleaned up ${keysToRemove.length} idle connections`);
    }
  }

  getStats() {
    return {
      activeConnections: this.clients.size,
      maxConnections: this.config.maxConnections,
      utilizationPercent: (this.clients.size / this.config.maxConnections) * 100,
    };
  }

  reset() {
    this.clients.clear();
    this.lastUsed.clear();
  }
}

/**
 * Helper for edge functions to get optimized Supabase client
 */
export function getPooledClient(url: string, key: string): SupabaseClient<Database> {
  const pool = ConnectionPool.getInstance();
  return pool.getClient(url, key);
}
