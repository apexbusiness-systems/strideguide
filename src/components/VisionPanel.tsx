import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, Activity } from 'lucide-react';
import { useMLInference } from '@/hooks/useMLInference';
import { SAFETY } from '@/config/safety';

interface VisionPanelProps {
  onBack: () => void;
}

const VisionPanel: React.FC<VisionPanelProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isInitialized, isLoading, detectObjects } = useMLInference();
  const [list, setList] = useState<{label:string; lane:string; distance:string; score:number}[]>([]);
  const [silentFrames, setSilentFrames] = useState(0);

  const grab = useCallback((): ImageData | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return null;
    const w = v.videoWidth|0;
    const h = v.videoHeight|0;
    if (!w || !h) return null;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('[VisionPanel] Failed to get canvas 2d context');
      return null;
    }
    ctx.drawImage(v, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    let mounted = true;
    let last = 0;
    let silent = 0;
    
    const step = async (ts: number) => {
      if (!mounted) return;
      if (ts - last >= SAFETY.TARGET_FRAME_MS) {
        last = ts;
        const img = grab();
        if (img) {
          try {
            const dets = await detectObjects(img);
            if (dets.length) {
              silent = 0;
            } else {
              silent++;
            }
            setSilentFrames(silent);
            setList(
              dets
                .map(d => ({
                  label: d.hazard,
                  lane: d.lane,
                  distance: d.distance,
                  score: d.score
                }))
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
            );
          } catch (err) {
            console.error('[VisionPanel] Detection error:', err);
          }
        }
      }
      requestAnimationFrame(step);
    };
    
    requestAnimationFrame(step);
    return () => { mounted = false; };
  }, [isInitialized, detectObjects, grab]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8 text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <h3 className="text-lg font-semibold">Loading ML models...</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="min-h-[44px]">
            Back
          </Button>
          <h1 className="text-xl font-semibold">Vision Guidance</h1>
          <div className="w-20" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vision Panel
              {isInitialized && (
                <Badge variant="secondary" className="ml-auto">
                  <Activity className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Detected Hazards
              </h3>
              <ul className="space-y-2">
                {list.length ? (
                  list.map((h, i) => (
                    <li key={i} className="p-3 rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="font-medium">{h.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {h.lane} • {h.distance}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {(h.score * 100 | 0)}%
                      </Badge>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-muted-foreground">No hazards detected</li>
                )}
              </ul>
              {silentFrames >= SAFETY.MAX_SILENT_FRAMES_WARN && (
                <p className="mt-2 text-amber-300 text-xs">
                  Heads-up: no detections for a while. Reframe camera or check lighting.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisionPanel;
