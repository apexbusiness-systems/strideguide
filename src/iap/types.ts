/**
 * IAP Types - Cross-platform In-App Purchase definitions
 * Supports StoreKit 2 (iOS) and Play Billing v5 (Android)
 */

export type ProductType = 'one-time' | 'addon' | 'subscription';

export type PurchaseState = 
  | 'idle' 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'cancelled' 
  | 'failed' 
  | 'restored';

export interface ProductSKU {
  ios: string;
  android: string;
}

export interface IAPProduct {
  id: string;
  type: ProductType;
  name: string;
  description: string;
  sku: ProductSKU;
  requiresPremium?: boolean;
}

export interface PlatformProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  priceAmount: number;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  transactionId?: string;
  receipt?: string;
  error?: string;
  state: PurchaseState;
}

export interface RestoreResult {
  success: boolean;
  purchases: PurchaseResult[];
  error?: string;
}

export interface IAPConfig {
  enabled: boolean;
  shipMode: boolean;
  sandboxMode: boolean;
}
