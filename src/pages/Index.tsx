import React, { useState, useEffect } from 'react';
import { Eye, Search, AlertTriangle, Settings, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import UsageMeter from '@/components/UsageMeter';
import SettingsDashboard from '@/components/SettingsDashboard';
import { EnhancedLostItemFinder } from '@/components/EnhancedLostItemFinder';
import VisionPanel from '@/components/VisionPanel';
import { PWAInstaller } from '@/components/PWAInstaller';
import { SOSInterface } from '@/components/SOSInterface';
import { OnboardingTutorial } from '@/components/OnboardingTutorial';
import { AudioArmer } from '@/utils/AudioArmer';
import { WakeLockManager } from '@/utils/WakeLockManager';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'guidance' | 'finder' | 'sos' | 'settings'>('home');
  const [isGuidanceActive, setIsGuidanceActive] = useState(false);
  const [audioArmed, setAudioArmed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'fr'>('en');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  // Check if first time user
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('strideguide_onboarding_complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Initialize audio on first user interaction with error handling
  const handleArmAudio = async () => {
    if (!audioArmed) {
      try {
        await AudioArmer.initialize();
        setAudioArmed(true);
        console.log('Audio system armed successfully');
        toast({
          title: t('audio.armed') || 'Audio Ready',
          description: t('audio.armedDescription') || 'Audio features are now available.',
        });
      } catch (error) {
        console.error('Failed to arm audio:', error);
        toast({
          title: 'Audio Setup Failed',
          description: 'Audio features may not work properly. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Toggle language with announcement and error handling
  const toggleLanguage = () => {
    try {
      const newLang = currentLanguage === 'en' ? 'fr' : 'en';
      setCurrentLanguage(newLang);
      i18n.changeLanguage(newLang);
      
      console.log(`Language changed to: ${newLang}`);
      
      // Announce language change for screen readers
      const announcement = newLang === 'en' ? 'Language changed to English' : 'Langue changée en français';
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      
      // Clean up announcer after screen reader processes it
      setTimeout(() => {
        if (document.body.contains(announcer)) {
          document.body.removeChild(announcer);
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to change language:', error);
      toast({
        title: 'Language Change Failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle guidance toggle with comprehensive error handling
  const handleGuidanceToggle = async () => {
    try {
      await handleArmAudio();
      
      if (!isGuidanceActive) {
        console.log('Starting guidance mode...');
        
        // Check if wake lock is supported before attempting
        if (WakeLockManager.isSupported()) {
          try {
            await WakeLockManager.request();
            console.log('Wake lock acquired successfully');
          } catch (wakeLockError) {
            console.warn('Wake lock failed, continuing without it:', wakeLockError);
            toast({
              title: t('guidance.wakeLockFailed') || 'Screen Wake Failed',
              description: t('guidance.wakeLockHelp') || 'Please adjust your device power settings to prevent screen dimming',
              variant: 'destructive',
            });
          }
        } else {
          console.log('Wake lock not supported on this device');
        }
        
        setIsGuidanceActive(true);
        setCurrentView('guidance');
        
        // Play audio confirmation if available
        if (audioArmed && AudioArmer.isArmed()) {
          try {
            AudioArmer.playEarcon('start');
          } catch (audioError) {
            console.warn('Failed to play start earcon:', audioError);
          }
        }
        
        toast({
          title: t('guidance.started') || 'Guidance Started',
          description: t('guidance.stayAwake') || 'Screen will stay awake during guidance',
        });
      } else {
        console.log('Stopping guidance mode...');
        
        // Release wake lock
        try {
          WakeLockManager.release();
          console.log('Wake lock released');
        } catch (error) {
          console.warn('Failed to release wake lock:', error);
        }
        
        setIsGuidanceActive(false);
        setCurrentView('home');
        
        // Play audio confirmation if available
        if (audioArmed && AudioArmer.isArmed()) {
          try {
            AudioArmer.playEarcon('stop');
          } catch (audioError) {
            console.warn('Failed to play stop earcon:', audioError);
          }
        }
        
        toast({
          title: t('guidance.stopped') || 'Guidance Stopped',
        });
      }
    } catch (error) {
      console.error('Error in guidance toggle:', error);
      toast({
        title: 'Guidance Error',
        description: 'Failed to start/stop guidance. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle SOS activation
  const handleSOSPress = () => {
    setCurrentView('sos');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('strideguide_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('strideguide_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  // Replay tutorial from settings
  const replayTutorial = () => {
    setShowOnboarding(true);
  };

  // Handle find item with audio arming
  const handleFindItem = async () => {
    try {
      console.log('Starting lost item finder...');
      await handleArmAudio();
      setCurrentView('finder');
    } catch (error) {
      console.error('Error starting item finder:', error);
      toast({
        title: 'Item Finder Error',
        description: 'Failed to start item finder. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle settings navigation
  const handleSettings = () => {
    try {
      console.log('Opening settings...');
      setCurrentView('settings');
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  // Safe navigation back to home
  const handleBackToHome = () => {
    try {
      console.log('Navigating back to home...');
      
      // Clean up any active states
      if (isGuidanceActive) {
        try {
          WakeLockManager.release();
          setIsGuidanceActive(false);
        } catch (error) {
          console.warn('Failed to clean up guidance state:', error);
        }
      }
      
      setCurrentView('home');
    } catch (error) {
      console.error('Error navigating to home:', error);
      // Force reset to home even if there's an error
      setCurrentView('home');
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'guidance':
        return <VisionPanel onBack={handleBackToHome} />;
      case 'finder':
        return <EnhancedLostItemFinder onBack={handleBackToHome} />;
      case 'sos':
        return <SOSInterface onBack={handleBackToHome} />;
      case 'settings':
        return <SettingsDashboard onBack={handleBackToHome} replayTutorial={replayTutorial} />;
      default:
        return null;
    }
  };

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <OnboardingTutorial
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  if (currentView !== 'home') {
    return (
      <div className="min-h-screen bg-background">
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" onClick={handleArmAudio}>
      <div className="max-w-md mx-auto space-y-8">
        {/* Header with Logo and Language Toggle */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <div className="flex justify-center flex-1">
              <Logo variant="wordmark" className="h-16 w-auto" />
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="min-h-[44px] px-3"
                aria-label={t('language.toggle')}
              >
                <Languages className="h-4 w-4 mr-1" />
                {currentLanguage.toUpperCase()}
              </Button>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {t('app.tagline')}
          </p>
          
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary">{t('app.badges.bilingual')}</Badge>
            <Badge variant="secondary">{t('app.badges.offline')}</Badge>
            <Badge variant="secondary">{t('app.badges.privacy')}</Badge>
          </div>
          
          {/* Usage Meter */}
          <UsageMeter />
        </div>

        {/* Main Controls - Maximum 5 Big Buttons */}
        <div className="space-y-4">
          {/* Primary Action: Start/Stop Guidance */}
          <Button
            onClick={handleGuidanceToggle}
            className={`w-full min-h-[60px] text-lg font-semibold ${
              isGuidanceActive 
                ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
            aria-label={isGuidanceActive ? t('guidance.stop') : t('guidance.start')}
            role="button"
          >
            <Eye className="mr-3 h-6 w-6" />
            {isGuidanceActive ? t('guidance.stop') : t('guidance.start')}
          </Button>

          {/* Find Lost Item */}
          <Button
            onClick={handleFindItem}
            variant="outline"
            className="w-full min-h-[60px] text-lg font-semibold"
            aria-label={t('finder.title')}
            role="button"
          >
            <Search className="mr-3 h-6 w-6" />
            {t('finder.title')}
          </Button>

          {/* Emergency SOS */}
          <Button
            onClick={handleSOSPress}
            variant="destructive"
            className="w-full min-h-[60px] text-lg font-semibold"
            aria-label={t('sos.title')}
            role="button"
          >
            <AlertTriangle className="mr-3 h-6 w-6" />
            {t('sos.title')}
          </Button>

          {/* Settings */}
          <Button
            onClick={handleSettings}
            variant="outline"
            className="w-full min-h-[60px] text-lg font-semibold"
            aria-label={t('settings.title')}
            role="button"
          >
            <Settings className="mr-3 h-6 w-6" />
            {t('settings.title')}
          </Button>
        </div>

        {/* PWA Install Prompt */}
        <PWAInstaller />

        {/* Status Indicators */}
        <div className="space-y-2">
          {/* Audio Status */}
          {!audioArmed && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {t('audio.tapToArm')}
              </Badge>
            </div>
          )}

          {/* Wake Lock Status */}
          {isGuidanceActive && (
            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                {WakeLockManager.isActive() ? t('wake.active') : t('wake.inactive')}
              </Badge>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
          <p>{t('app.footer.builtin')} • {t('app.footer.privacy')} • {t('app.footer.offline')}</p>
          <p className="text-xs">{t('app.footer.version')}</p>
        </div>
      </div>
    </div>
  );
};

export default Index;