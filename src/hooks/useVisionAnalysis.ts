import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type VisionMode = 'hazard' | 'navigation' | 'scene' | 'item';

interface VisionAnalysisResult {
  description: string;
  mode: VisionMode;
  timestamp: Date;
}

export const useVisionAnalysis = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<VisionAnalysisResult | null>(null);
  const isCancelledRef = useRef(false);

  const analyzeFrame = useCallback(async (
    videoElement: HTMLVideoElement | null,
    mode: VisionMode = 'hazard'
  ): Promise<string | null> => {
    if (!videoElement || isAnalyzing) {
      return null;
    }

    // Mark any ongoing analysis as cancelled
    isCancelledRef.current = true;

    // Reset cancellation flag for new analysis
    isCancelledRef.current = false;
    setIsAnalyzing(true);

    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(videoElement, 0, 0);
      
      // Resize for efficiency (max 800px width)
      const maxWidth = 800;
      if (canvas.width > maxWidth) {
        const ratio = maxWidth / canvas.width;
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = maxWidth;
        resizedCanvas.height = canvas.height * ratio;
        const resizedCtx = resizedCanvas.getContext('2d');
        if (resizedCtx) {
          resizedCtx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
          canvas.width = resizedCanvas.width;
          canvas.height = resizedCanvas.height;
          ctx.drawImage(resizedCanvas, 0, 0);
        }
      }

      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Check if cancelled before making request
      if (isCancelledRef.current) {
        console.log('Vision analysis cancelled before request');
        return null;
      }

      // Call vision API
      const { data, error } = await supabase.functions.invoke('vision-stream', {
        body: { imageData, mode },
      });

      // Check if cancelled after request
      if (isCancelledRef.current) {
        console.log('Vision analysis cancelled after request');
        return null;
      }

      if (error) {
        throw error;
      }

      if (!data || !data.description) {
        throw new Error('No description returned');
      }

      const result: VisionAnalysisResult = {
        description: data.description,
        mode,
        timestamp: new Date()
      };

      setLastResult(result);
      return data.description;

    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };

      // Check if cancelled during error handling
      if (isCancelledRef.current) {
        console.log('Vision analysis cancelled');
        return null;
      }

      console.error('Vision analysis error:', error);
      
      // Handle specific error codes
      if (err.message?.includes('RATE_LIMITED')) {
        toast({
          title: "Rate Limited",
          description: "Please wait a moment before analyzing again.",
          variant: "destructive",
        });
      } else if (err.message?.includes('PAYMENT_REQUIRED')) {
        toast({
          title: "Credits Depleted",
          description: "Please add AI credits to continue using vision features.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Vision Analysis Failed",
          description: "Unable to analyze image. Please try again.",
          variant: "destructive",
        });
      }

      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, toast]);

  const cancelAnalysis = useCallback(() => {
    isCancelledRef.current = true;
  }, []);

  return {
    analyzeFrame,
    cancelAnalysis,
    isAnalyzing,
    lastResult
  };
};
