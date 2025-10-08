import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle } from "lucide-react";

interface AdminSetupProps {
  userId: string;
  userEmail: string;
}

export const AdminSetup = ({ userId, userEmail }: AdminSetupProps) => {
  // PHASE 1 MIGRATION: Temporarily disabled during index creation
  // Re-enable after Phase 4 (admin assignment restrictions) is complete
  const MIGRATION_MODE = true; // Set to false after migration complete
  
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleAssignAdmin = async () => {
    setIsAssigning(true);
    try {
      // Call the admin role assignment function
      const { data, error } = await supabase.rpc('assign_admin_role', {
        target_user_id: userId,
        target_role: 'admin'
      });

      if (error) {
        throw error;
      }

      setIsAdmin(true);
      toast({
        title: "Admin access granted!",
        description: "You now have full admin privileges. Please refresh the page.",
      });

      // Refresh the page after 2 seconds to apply new permissions
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error assigning admin role:', error);
      toast({
        title: "Error",
        description: "Failed to assign admin role. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Phase 1 Post-Migration: Read-only mode during index stabilization
  if (MIGRATION_MODE) {
    return (
      <Card className="max-w-2xl mx-auto p-6 border-yellow-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-500" />
            Admin Setup (Read-Only Mode)
          </CardTitle>
          <CardDescription>
            Admin assignment is temporarily paused while system optimizations stabilize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>User ID:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">{userId}</code>
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {userEmail}
            </p>
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
              ⚠️ Maintenance Window Active
            </p>
            <p className="text-xs text-muted-foreground">
              Database performance indexes are being applied. Admin assignment will be re-enabled after Phase 1 validation completes (est. 1-2 hours).
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Admin privileges include:</p>
            <ul className="text-sm space-y-1 ml-4 list-disc">
              <li>Access to admin dashboard</li>
              <li>User management capabilities</li>
              <li>Subscription and billing oversight</li>
              <li>System analytics and monitoring</li>
              <li>Feature flag management</li>
            </ul>
          </div>

          <Button 
            disabled
            className="w-full"
            variant="outline"
          >
            Admin Assignment Paused (Phase 1 Migration)
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Check back after migration validation completes. Monitor progress in docs/PHASE_1_MIGRATION_GUIDE.md
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isAdmin) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Admin Access Granted
          </CardTitle>
          <CardDescription>
            You have been granted admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Refreshing page to apply new permissions...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Setup
        </CardTitle>
        <CardDescription>
          Grant yourself admin access to the dashboard and all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm">
            <strong>User ID:</strong> <code className="text-xs bg-muted px-2 py-1 rounded">{userId}</code>
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {userEmail}
          </p>
        </div>
        
        <div className="bg-muted p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">Admin privileges include:</p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>Access to admin dashboard</li>
            <li>User management capabilities</li>
            <li>Subscription and billing oversight</li>
            <li>System analytics and monitoring</li>
            <li>Feature flag management</li>
          </ul>
        </div>

        <Button 
          onClick={handleAssignAdmin} 
          disabled={isAssigning}
          className="w-full"
        >
          {isAssigning ? "Granting Admin Access..." : "Grant Admin Access"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This action will assign you the 'admin' role and grant full system access.
        </p>
      </CardContent>
    </Card>
  );
};
