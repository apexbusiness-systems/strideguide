import React, { useState, useEffect } from 'react';
import { Play, Square, Volume2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { AudioArmer } from '@/utils/AudioArmer';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { t, i18n } = useTranslation();

  const steps = [
    {
      title: t('onboarding.welcome.title'),
      content: t('onboarding.welcome.content'),
      audio: t('onboarding.welcome.audio'),
      action: 'listen'
    },
    {
      title: t('onboarding.startStop.title'),
      content: t('onboarding.startStop.content'), 
      audio: t('onboarding.startStop.audio'),
      action: 'demo'
    },
    {
      title: t('onboarding.audio.title'),
      content: t('onboarding.audio.content'),
      audio: t('onboarding.audio.audio'),
      action: 'earcon'
    },
    {
      title: t('onboarding.sos.title'),
      content: t('onboarding.sos.content'),
      audio: t('onboarding.sos.audio'),
      action: 'warning'
    },
    {
      title: t('onboarding.complete.title'),
      content: t('onboarding.complete.content'),
      audio: t('onboarding.complete.audio'),
      action: 'finish'
    }
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    // Auto-start first step audio
    if (currentStep === 0 && AudioArmer.isArmed()) {
      playStepAudio();
    }
  }, [currentStep]);

  const playStepAudio = () => {
    if (!AudioArmer.isArmed()) return;
    
    setIsPlaying(true);
    
    // Play earcon first
    if (currentStepData.action === 'earcon') {
      AudioArmer.playEarcon('start');
      setTimeout(() => AudioArmer.playEarcon('success'), 800);
    } else if (currentStepData.action === 'warning') {
      AudioArmer.playEarcon('warning');
    }
    
    // Then speak the content
    setTimeout(() => {
      AudioArmer.announceText(currentStepData.audio);
      setIsPlaying(false);
    }, currentStepData.action === 'earcon' ? 1500 : 300);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTutorial = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto p-6 space-y-6">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentStep 
                  ? 'bg-primary' 
                  : index < currentStep 
                    ? 'bg-primary/60' 
                    : 'bg-muted'
              }`}
              aria-label={`Step ${index + 1} ${index <= currentStep ? 'completed' : 'upcoming'}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">{currentStepData.title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Audio controls */}
        <div className="flex justify-center">
          <Button
            onClick={playStepAudio}
            disabled={!AudioArmer.isArmed() || isPlaying}
            variant="outline"
            className="min-h-[44px] px-6"
            aria-label={isPlaying ? t('onboarding.playing') : t('onboarding.playAudio')}
          >
            {isPlaying ? (
              <Square className="h-5 w-5 mr-2" />
            ) : (
              <Volume2 className="h-5 w-5 mr-2" />
            )}
            {isPlaying ? t('onboarding.playing') : t('onboarding.playAudio')}
          </Button>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="min-h-[44px]"
            aria-label={t('onboarding.previous')}
          >
            {t('onboarding.previous')}
          </Button>

          <Button
            onClick={skipTutorial}
            variant="ghost"
            className="min-h-[44px] text-muted-foreground"
            aria-label={t('onboarding.skip')}
          >
            {t('onboarding.skip')}
          </Button>

          <Button
            onClick={nextStep}
            className="min-h-[44px] bg-primary hover:bg-primary/90"
            aria-label={currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
          >
            {currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
          </Button>
        </div>

        {/* Replay tutorial option */}
        {currentStep === steps.length - 1 && (
          <div className="text-center pt-2 border-t">
            <Button
              onClick={() => setCurrentStep(0)}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              aria-label={t('onboarding.replay')}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('onboarding.replay')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};