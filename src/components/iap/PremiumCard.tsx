/**
 * Premium Card - IAP purchase UI for Parent Hub
 * Hidden unless SHIP_MODE && IAP_ENABLED
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIAP } from '@/hooks/useIAP';
import { Crown, RefreshCw, Settings, CheckCircle2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const PREMIUM_PRODUCT_ID = 'strideguide_premium';

export function PremiumCard() {
  const { initialized, loading, products, purchase, restore, hasEntitlement, enabled } = useIAP();
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Check entitlement on mount
  useEffect(() => {
    const checkEntitlement = async () => {
      setChecking(true);
      try {
        const hasPremium = await hasEntitlement(PREMIUM_PRODUCT_ID);
        setIsPremium(hasPremium);
      } catch (error) {
        console.error('[PremiumCard] Failed to check entitlement:', error);
      } finally {
        setChecking(false);
      }
    };

    if (enabled) {
      checkEntitlement();
    } else {
      setChecking(false);
    }
  }, [enabled, hasEntitlement]);

  // Don't show if IAP not enabled
  if (!enabled) {
    return null;
  }

  const premiumProduct = products.find(p => 
    p.productId.includes('premium')
  );

  const handlePurchase = async () => {
    if (!premiumProduct) {
      toast.error('Premium product not available');
      return;
    }

    setPurchasing(true);
    try {
      const result = await purchase(premiumProduct.productId);
      if (result.success) {
        setIsPremium(true);
      }
    } catch (error) {
      console.error('[PremiumCard] Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const result = await restore();
      if (result.success && result.purchases.length > 0) {
        // Re-check entitlement
        const hasPremium = await hasEntitlement(PREMIUM_PRODUCT_ID);
        setIsPremium(hasPremium);
      }
    } catch (error) {
      console.error('[PremiumCard] Restore failed:', error);
    } finally {
      setRestoring(false);
    }
  };

  const handleManage = () => {
    // Open platform's subscription management
    toast.info('Opening subscription management...');
    // TODO: Implement platform-specific subscription management
  };

  if (!initialized && !loading) {
    return (
      <Card className="p-6 border-2 border-dashed">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Lock className="w-5 h-5" />
          <p className="text-sm">In-app purchases not available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">StrideGuide Premium</h3>
              {isPremium ? (
                <Badge variant="default" className="mt-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-1">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
          {premiumProduct && !isPremium && (
            <div className="text-right">
              <p className="text-2xl font-bold">{premiumProduct.price}</p>
              <p className="text-xs text-muted-foreground">One-time purchase</p>
            </div>
          )}
        </div>

        {/* Features */}
        {!isPremium && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-muted-foreground">Unlock premium features:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Advanced hazard detection</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Extended guidance range</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Offline maps & navigation</span>
              </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {!isPremium ? (
            <>
              <Button 
                onClick={handlePurchase}
                disabled={loading || checking || purchasing || !premiumProduct}
                className="w-full"
              >
                {purchasing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Purchase Premium
                  </>
                )}
              </Button>
              <Button 
                onClick={handleRestore}
                disabled={loading || checking || restoring}
                variant="outline"
                className="w-full"
              >
                {restoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Restoring...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restore Purchase
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleManage}
              variant="outline"
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </div>

        {/* Loading state */}
        {(loading || checking) && (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
}
