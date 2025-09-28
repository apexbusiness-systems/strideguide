import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, AlertTriangle, Eye, Activity } from 'lucide-react';

interface DetectedHazard {
  id: string;
  type: string;
  position: 'left' | 'center' | 'right';
  distance: 'near' | 'mid' | 'far';
  confidence: number;
}

const VisionPanel = () => {
  const [isActive, setIsActive] = React.useState(false);
  const [fps, setFps] = React.useState(10);
  const [detectedHazards] = React.useState<DetectedHazard[]>([
    { id: '1', type: 'pothole', position: 'center', distance: 'near', confidence: 0.89 },
    { id: '2', type: 'curb_up', position: 'right', distance: 'mid', confidence: 0.76 },
  ]);

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'left': return 'bg-warning text-warning-foreground';
      case 'center': return 'bg-destructive text-destructive-foreground';
      case 'right': return 'bg-warning text-warning-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDistanceColor = (distance: string) => {
    switch (distance) {
      case 'near': return 'bg-destructive text-destructive-foreground';
      case 'mid': return 'bg-warning text-warning-foreground';
      case 'far': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vision Control Panel
          {isActive && (
            <Badge variant="secondary" className="ml-auto">
              <Activity className="h-3 w-3 mr-1" />
              {fps} FPS
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Camera Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Camera Status</p>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Active - Processing frames' : 'Inactive'}
              </p>
            </div>
          </div>
          <Button
            variant={isActive ? 'destructive' : 'default'}
            onClick={() => setIsActive(!isActive)}
            className="min-w-24"
            aria-label={isActive ? 'Stop vision detection' : 'Start vision detection'}
          >
            {isActive ? 'Stop' : 'Start'}
          </Button>
        </div>

        {/* Detected Hazards */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Detected Hazards
          </h3>
          {detectedHazards.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center bg-muted rounded-lg">
              No hazards detected
            </p>
          ) : (
            <div className="space-y-2">
              {detectedHazards.map((hazard) => (
                <div key={hazard.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{hazard.type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {(hazard.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPositionColor(hazard.position)}>
                      {hazard.position}
                    </Badge>
                    <Badge className={getDistanceColor(hazard.distance)}>
                      {hazard.distance}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-medium">Model Version</p>
            <p className="text-muted-foreground">YOLO-nano v1.2</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-medium">Processing</p>
            <p className="text-muted-foreground">800px @ {fps}fps</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisionPanel;