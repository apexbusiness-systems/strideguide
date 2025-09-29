import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Search, 
  Shield, 
  Phone, 
  Navigation,
  Volume2,
  Zap,
  Eye,
  MapPin
} from 'lucide-react';

interface ContextualAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'high' | 'medium' | 'low';
  category: 'safety' | 'navigation' | 'assistance' | 'emergency';
  action: () => void;
  isEnabled: boolean;
}

interface ContextualMenuProps {
  isVisible: boolean;
  onActionSelect: (action: ContextualAction) => void;
  onDismiss: () => void;
  currentContext: {
    location?: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    environment: 'indoor' | 'outdoor' | 'unknown';
    batteryLevel: number;
    isMoving: boolean;
  };
  isPremium: boolean;
}

export const ContextualMenu: React.FC<ContextualMenuProps> = ({
  isVisible,
  onActionSelect,
  onDismiss,
  currentContext,
  isPremium,
}) => {
  const [suggestedActions, setSuggestedActions] = useState<ContextualAction[]>([]);

  // Generate contextual actions based on current situation
  useEffect(() => {
    if (!isPremium) return;

    const actions: ContextualAction[] = [];

    // Emergency actions (always high priority)
    actions.push({
      id: 'emergency-call',
      label: 'Emergency Call',
      icon: Phone,
      priority: 'high',
      category: 'emergency',
      action: () => console.log('Emergency call initiated'),
      isEnabled: true,
    });

    // Context-aware navigation
    if (currentContext.environment === 'outdoor') {
      actions.push({
        id: 'route-guidance',
        label: 'Route Guidance',
        icon: Navigation,
        priority: 'high',
        category: 'navigation',
        action: () => console.log('Route guidance activated'),
        isEnabled: true,
      });

      actions.push({
        id: 'identify-surroundings',
        label: 'Describe Surroundings',
        icon: Eye,
        priority: 'medium',
        category: 'assistance',
        action: () => console.log('Environmental description started'),
        isEnabled: true,
      });
    }

    // Low light/night assistance
    if (currentContext.timeOfDay === 'evening' || currentContext.timeOfDay === 'night') {
      actions.push({
        id: 'enhanced-audio',
        label: 'Enhanced Audio Alerts',
        icon: Volume2,
        priority: 'high',
        category: 'safety',
        action: () => console.log('Audio alerts enhanced'),
        isEnabled: true,
      });
    }

    // Battery-aware actions
    if (currentContext.batteryLevel < 20) {
      actions.push({
        id: 'power-save-mode',
        label: 'Activate Power Save',
        icon: Zap,
        priority: 'high',
        category: 'safety',
        action: () => console.log('Power save mode activated'),
        isEnabled: true,
      });
    }

    // Lost item finder (always available)
    actions.push({
      id: 'find-item',
      label: 'Find Lost Item',
      icon: Search,
      priority: 'medium',
      category: 'assistance',
      action: () => console.log('Lost item finder activated'),
      isEnabled: true,
    });

    // Hazard detection
    if (currentContext.isMoving) {
      actions.push({
        id: 'hazard-scan',
        label: 'Scan for Hazards',
        icon: Shield,
        priority: 'high',
        category: 'safety',
        action: () => console.log('Hazard scanning initiated'),
        isEnabled: true,
      });
    }

    // Object identification
    actions.push({
      id: 'identify-object',
      label: 'Identify Object',
      icon: Camera,
      priority: 'medium',
      category: 'assistance',
      action: () => console.log('Object identification started'),
      isEnabled: true,
    });

    // Location sharing for emergencies
    if (currentContext.location) {
      actions.push({
        id: 'share-location',
        label: 'Share My Location',
        icon: MapPin,
        priority: 'medium',
        category: 'safety',
        action: () => console.log('Location shared'),
        isEnabled: true,
      });
    }

    // Sort by priority and category
    const sortedActions = actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const categoryOrder = { emergency: 0, safety: 1, navigation: 2, assistance: 3 };
      
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return categoryOrder[a.category] - categoryOrder[b.category];
    });

    setSuggestedActions(sortedActions.slice(0, 6)); // Show max 6 actions
  }, [currentContext, isPremium]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency':
        return 'destructive';
      case 'safety':
        return 'destructive';
      case 'navigation':
        return 'secondary';
      case 'assistance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return '!!!';
      case 'medium':
        return '!!';
      case 'low':
        return '!';
      default:
        return '';
    }
  };

  if (!isVisible || !isPremium) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background border shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <Badge variant="secondary" className="text-xs">
              Smart Suggestions
            </Badge>
          </div>
          
          <div className="text-sm text-muted-foreground mb-6">
            {currentContext.location && (
              <p className="mb-1">📍 {currentContext.location}</p>
            )}
            <p>
              🕐 {currentContext.timeOfDay} • 
              {currentContext.environment === 'outdoor' ? ' 🌍 Outdoor' : ' 🏠 Indoor'} • 
              🔋 {currentContext.batteryLevel}%
              {currentContext.isMoving && ' • 🚶 Moving'}
            </p>
          </div>

          <div className="space-y-3">
            {suggestedActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 text-left"
                  onClick={() => {
                    onActionSelect(action);
                    onDismiss();
                  }}
                  disabled={!action.isEnabled}
                >
                  <div className="flex items-center gap-3 w-full">
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.label}</span>
                        {action.priority === 'high' && (
                          <Badge variant={getCategoryColor(action.category)} className="text-xs">
                            {getPriorityIndicator(action.priority)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        {action.category.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="ghost" onClick={onDismiss} className="text-sm">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};