/**
 * useIAP Hook - React hook for In-App Purchases
 */

import { useState, useEffect, useCallback } from 'react';
import { iapService } from '@/iap/service';
import { iapStorage } from '@/iap/storage';
import type { IAPProduct, PlatformProduct, PurchaseResult, RestoreResult } from '@/iap/types';
import productsConfig from '../../config/iap/products.json';
import { toast } from 'sonner';

interface UseIAPReturn {
  // State
  initialized: boolean;
  loading: boolean;
  products: PlatformProduct[];
  
  // Actions
  purchase: (productId: string) => Promise<PurchaseResult>;
  restore: () => Promise<RestoreResult>;
  hasEntitlement: (productId: string) => Promise<boolean>;
  
  // Config
  isNative: boolean;
  enabled: boolean;
}

export function useIAP(): UseIAPReturn {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<PlatformProduct[]>([]);
  
  const isNative = iapService.isNativePlatform();
  
  // Check if IAP is enabled via feature flags
  const enabled = isNative && import.meta.env.MODE === 'production';

  // Initialize IAP service
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const success = await iapService.initialize();
        setInitialized(success);

        if (success) {
          // Load products from config
          const catalogProducts = productsConfig.products as IAPProduct[];
          const platformProducts = await iapService.loadProducts(catalogProducts);
          setProducts(platformProducts);
        }
      } catch (error) {
        console.error('[useIAP] Initialization error:', error);
        toast.error('Failed to initialize purchases');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [enabled]);

  // Purchase a product
  const purchase = useCallback(async (productId: string): Promise<PurchaseResult> => {
    if (!initialized) {
      toast.error('Purchase system not ready');
      return {
        success: false,
        productId,
        error: 'Not initialized',
        state: 'failed'
      };
    }

    setLoading(true);
    
    try {
      const result = await iapService.purchase(productId);
      
      if (result.success) {
        // Save to local storage
        await iapStorage.savePurchase(result);
        toast.success('Purchase successful!');
      } else {
        if (result.state === 'cancelled') {
          toast.info('Purchase cancelled');
        } else {
          toast.error(result.error || 'Purchase failed');
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('[useIAP] Purchase error:', error);
      toast.error('Purchase error: ' + (error.message || 'Unknown error'));
      return {
        success: false,
        productId,
        error: error.message,
        state: 'failed'
      };
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Restore purchases
  const restore = useCallback(async (): Promise<RestoreResult> => {
    if (!initialized) {
      toast.error('Purchase system not ready');
      return {
        success: false,
        purchases: [],
        error: 'Not initialized'
      };
    }

    setLoading(true);
    
    try {
      const result = await iapService.restore();
      
      if (result.success) {
        // Save all purchases to local storage
        await iapStorage.savePurchases(result.purchases);
        
        if (result.purchases.length > 0) {
          toast.success(`Restored ${result.purchases.length} purchase(s)`);
        } else {
          toast.info('No purchases to restore');
        }
      } else {
        toast.error(result.error || 'Restore failed');
      }
      
      return result;
    } catch (error: any) {
      console.error('[useIAP] Restore error:', error);
      toast.error('Restore error: ' + (error.message || 'Unknown error'));
      return {
        success: false,
        purchases: [],
        error: error.message
      };
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Check if user has entitlement
  const hasEntitlement = useCallback(async (productId: string): Promise<boolean> => {
    return await iapStorage.hasEntitlement(productId);
  }, []);

  return {
    initialized,
    loading,
    products,
    purchase,
    restore,
    hasEntitlement,
    isNative,
    enabled
  };
}
