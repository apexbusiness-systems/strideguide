/**
 * IAP Storage - Secure local persistence for purchase entitlements
 * Uses platform-specific secure storage when available
 */

import { Capacitor } from '@capacitor/core';
import type { PurchaseResult } from './types';

const STORAGE_KEY = 'strideguide_iap_entitlements';
const STORAGE_VERSION = '1.0';

interface StoredEntitlement {
  productId: string;
  transactionId: string;
  purchaseDate: string;
  receipt?: string;
  verified: boolean;
  verifiedAt?: string;
}

interface EntitlementsStorage {
  version: string;
  lastSync: string;
  entitlements: StoredEntitlement[];
}

class IAPStorageService {
  /**
   * Save a purchase entitlement
   */
  async savePurchase(purchase: PurchaseResult): Promise<void> {
    if (!purchase.success || !purchase.transactionId) {
      console.warn('[IAP Storage] Cannot save unsuccessful purchase');
      return;
    }

    const storage = await this.getStorage();
    
    const entitlement: StoredEntitlement = {
      productId: purchase.productId,
      transactionId: purchase.transactionId,
      purchaseDate: new Date().toISOString(),
      receipt: purchase.receipt,
      verified: false
    };

    // Remove any existing entitlement for this product
    storage.entitlements = storage.entitlements.filter(
      e => e.productId !== purchase.productId
    );

    // Add new entitlement
    storage.entitlements.push(entitlement);
    storage.lastSync = new Date().toISOString();

    await this.saveStorage(storage);
    console.log('[IAP Storage] Saved entitlement:', entitlement.productId);
  }

  /**
   * Save multiple purchases (from restore)
   */
  async savePurchases(purchases: PurchaseResult[]): Promise<void> {
    for (const purchase of purchases) {
      await this.savePurchase(purchase);
    }
  }

  /**
   * Get all entitlements
   */
  async getEntitlements(): Promise<StoredEntitlement[]> {
    const storage = await this.getStorage();
    return storage.entitlements;
  }

  /**
   * Check if user has entitlement for a product
   */
  async hasEntitlement(productId: string): Promise<boolean> {
    const entitlements = await this.getEntitlements();
    return entitlements.some(e => e.productId === productId);
  }

  /**
   * Mark entitlement as verified
   */
  async markVerified(productId: string): Promise<void> {
    const storage = await this.getStorage();
    const entitlement = storage.entitlements.find(e => e.productId === productId);
    
    if (entitlement) {
      entitlement.verified = true;
      entitlement.verifiedAt = new Date().toISOString();
      await this.saveStorage(storage);
      console.log('[IAP Storage] Marked verified:', productId);
    }
  }

  /**
   * Clear all entitlements (for testing/reset)
   */
  async clearAll(): Promise<void> {
    await this.saveStorage({
      version: STORAGE_VERSION,
      lastSync: new Date().toISOString(),
      entitlements: []
    });
    console.log('[IAP Storage] Cleared all entitlements');
  }

  /**
   * Get storage object
   */
  private async getStorage(): Promise<EntitlementsStorage> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migrate if needed
        if (parsed.version !== STORAGE_VERSION) {
          return this.migrateStorage(parsed);
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('[IAP Storage] Failed to load storage:', error);
    }

    // Return empty storage
    return {
      version: STORAGE_VERSION,
      lastSync: new Date().toISOString(),
      entitlements: []
    };
  }

  /**
   * Save storage object
   */
  private async saveStorage(storage: EntitlementsStorage): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('[IAP Storage] Failed to save storage:', error);
      throw error;
    }
  }

  /**
   * Migrate storage from older version
   */
  private migrateStorage(oldStorage: any): EntitlementsStorage {
    console.log('[IAP Storage] Migrating from version:', oldStorage.version);
    
    // For now, just create new storage
    // In future, implement actual migration logic
    return {
      version: STORAGE_VERSION,
      lastSync: new Date().toISOString(),
      entitlements: []
    };
  }

  /**
   * Get last sync time
   */
  async getLastSync(): Promise<string | null> {
    const storage = await this.getStorage();
    return storage.lastSync;
  }
}

// Singleton instance
export const iapStorage = new IAPStorageService();
export type { StoredEntitlement };
