import { ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Crown, Zap } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface FeatureGateProps {
  feature: string;
  user: User | null;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const featureConfig = {
  hazard_notification_screen: {
    title: "Dedicated Hazard/Notification Screen",
    description: "Centralized view for alerts and system status with advanced monitoring",
    icon: Zap,
    requiredPlan: "Premium",
  },
  enhanced_notifications: {
    title: "Enhanced Notification System",
    description: "Proactive, contextual alerts for premium users with advanced features",
    icon: Crown,
    requiredPlan: "Premium",
  },
};

export const FeatureGate = ({ 
  feature, 
  user, 
  children, 
  fallback, 
  showUpgrade = true,
  onUpgrade 
}: FeatureGateProps) => {
  const { hasFeatureAccess, subscription, isLoading } = useSubscription(user);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to access this feature
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const hasAccess = hasFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const config = featureConfig[feature as keyof typeof featureConfig];
  const Icon = config?.icon || Lock;

  return (
    <Card className="border-dashed bg-muted/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Icon className="h-8 w-8 text-muted-foreground" />
            <Lock className="h-4 w-4 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {config?.title || "Premium Feature"}
          <Badge variant="outline">{config?.requiredPlan || "Premium"}</Badge>
        </CardTitle>
        <CardDescription>
          {config?.description || "This feature requires a premium subscription"}
        </CardDescription>
      </CardHeader>
      
      {showUpgrade && (
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-muted-foreground">
            Current plan: <Badge variant="secondary">{subscription?.plan_name || "Free"}</Badge>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={onUpgrade}
              className="w-full"
            >
              Upgrade to {config?.requiredPlan || "Premium"}
            </Button>
            
            {config?.requiredPlan === "Enterprise" && (
              <p className="text-xs text-muted-foreground">
                Contact sales for enterprise pricing and custom features
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Hook for programmatic feature checking
export const useFeatureGate = (feature: string, user: User | null) => {
  const { hasFeatureAccess, subscription } = useSubscription(user);
  
  return {
    hasAccess: hasFeatureAccess(feature),
    currentPlan: subscription?.plan_name || "Free",
    requiredPlan: featureConfig[feature as keyof typeof featureConfig]?.requiredPlan || "Premium",
  };
};