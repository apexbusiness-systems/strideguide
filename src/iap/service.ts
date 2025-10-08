/**
 * IAP Service - Cross-platform In-App Purchase handler
 * Bridges to StoreKit 2 (iOS) and Play Billing v5 (Android)
 */

import { Capacitor } from '@capacitor/core';
import type { 
  IAPProduct, 
  PlatformProduct, 
  PurchaseResult, 
  RestoreResult,
  PurchaseState 
} from './types';

/**
 * IAP Bridge - Platform-specific purchase handlers
 * This is a bridge interface that will be implemented by:
 * - StoreKit 2 for iOS (via Capacitor plugin)
 * - Play Billing v5 for Android (via Capacitor plugin)
 * 
 * For now, this is a mock implementation that simulates the API.
 * Replace with actual @capacitor-community/in-app-purchases or custom native code.
 */

class IAPService {
  private initialized = false;
  private platformProducts: Map<string, PlatformProduct> = new Map();

  /**
   * Initialize IAP service - must be called before any other methods
   */
  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[IAP] Not running on native platform - IAP disabled');
      return false;
    }

    try {
      // TODO: Initialize the actual IAP plugin when added
      // For iOS: Use StoreKit 2 via Capacitor
      // For Android: Use Play Billing v5 via Capacitor
      // await InAppPurchases.initialize();
      
      console.log('[IAP] Mock service initialized - replace with real plugin');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[IAP] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Load product details from the platform store
   */
  async loadProducts(products: IAPProduct[]): Promise<PlatformProduct[]> {
    if (!this.initialized) {
      throw new Error('IAP service not initialized');
    }

    const platform = Capacitor.getPlatform();
    const productIds = products.map(p => 
      platform === 'ios' ? p.sku.ios : p.sku.android
    );

    try {
      // TODO: Replace with actual IAP plugin call
      // const response = await InAppPurchases.getProducts({ productIds });
      
      // Mock response for development
      const platformProducts: PlatformProduct[] = products.map(p => ({
        productId: platform === 'ios' ? p.sku.ios : p.sku.android,
        title: p.name,
        description: p.description,
        price: '$9.99', // Mock price
        currency: 'USD',
        priceAmount: 9.99
      }));

      // Cache products
      platformProducts.forEach(p => {
        this.platformProducts.set(p.productId, p);
      });

      console.log('[IAP] Loaded products (mock):', platformProducts);
      return platformProducts;
    } catch (error) {
      console.error('[IAP] Failed to load products:', error);
      throw error;
    }
  }

  /**
   * Purchase a product
   */
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.initialized) {
      return {
        success: false,
        productId,
        error: 'IAP service not initialized',
        state: 'failed'
      };
    }

    console.log('[IAP] Starting purchase for:', productId);

    try {
      // TODO: Replace with actual IAP plugin call
      // const result = await InAppPurchases.purchase({ productId });
      
      // Mock purchase flow - simulates success
      const mockTransactionId = `mock_txn_${Date.now()}`;
      const mockReceipt = btoa(JSON.stringify({ productId, timestamp: Date.now() }));
      
      console.log('[IAP] Mock purchase successful:', productId);
      return {
        success: true,
        productId,
        transactionId: mockTransactionId,
        receipt: mockReceipt,
        state: 'completed'
      };
    } catch (error: any) {
      console.error('[IAP] Purchase error:', error);
      
      // Determine state from error
      let state: PurchaseState = 'failed';
      if (error.message?.includes('cancelled') || error.message?.includes('user')) {
        state = 'cancelled';
      }

      return {
        success: false,
        productId,
        error: error.message || 'Purchase error',
        state
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restore(): Promise<RestoreResult> {
    if (!this.initialized) {
      return {
        success: false,
        purchases: [],
        error: 'IAP service not initialized'
      };
    }

    console.log('[IAP] Starting restore');

    try {
      // TODO: Replace with actual IAP plugin call
      // const result = await InAppPurchases.restorePurchases();
      
      // Mock restore - returns empty for now
      console.log('[IAP] Mock restore - no purchases found');
      return {
        success: true,
        purchases: []
      };
    } catch (error: any) {
      console.error('[IAP] Restore error:', error);
      return {
        success: false,
        purchases: [],
        error: error.message || 'Restore error'
      };
    }
  }

  /**
   * Get product info from cache
   */
  getProductInfo(productId: string): PlatformProduct | undefined {
    return this.platformProducts.get(productId);
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if running on native platform
   */
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }
}

// Singleton instance
export const iapService = new IAPService();
