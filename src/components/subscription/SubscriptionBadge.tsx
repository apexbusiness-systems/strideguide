/**
 * Read-only subscription status badge
 * Only renders when webhooks are enabled
 * Shows current subscription state
 */

import { Badge } from "@/components/ui/badge";
import { Crown, AlertCircle, CheckCircle } from "lucide-react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useSubscription } from "@/hooks/useSubscription";
import { User } from "@supabase/supabase-js";

interface SubscriptionBadgeProps {
  user: User;
  className?: string;
}

export function SubscriptionBadge({ user, className }: SubscriptionBadgeProps) {
  const { isWebhooksEnabled } = useFeatureFlags();
  const { subscription, isLoading } = useSubscription(user);

  // Only render when webhooks are enabled
  if (!isWebhooksEnabled) {
    return null;
  }

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <span className="animate-pulse">Loading...</span>
      </Badge>
    );
  }

  if (!subscription || subscription.status === 'free') {
    return (
      <Badge variant="secondary" className={className}>
        <AlertCircle className="h-3 w-3 mr-1" />
        Free Plan
      </Badge>
    );
  }

  const getStatusColor = () => {
    switch (subscription.status) {
      case 'active':
        return 'default';
      case 'trialing':
        return 'secondary';
      case 'past_due':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = () => {
    if (subscription.status === 'active') {
      return <CheckCircle className="h-3 w-3 mr-1" />;
    }
    return <Crown className="h-3 w-3 mr-1" />;
  };

  return (
    <Badge variant={getStatusColor()} className={className}>
      {getStatusIcon()}
      {subscription.plan_name} - {subscription.status}
    </Badge>
  );
}
