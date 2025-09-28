import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Crown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UsageMeter = () => {
  const [usedMinutes, setUsedMinutes] = React.useState(45); // 45 minutes used today
  const [isPremium, setIsPremium] = React.useState(false);
  const [language, setLanguage] = React.useState<'en' | 'fr'>('en');
  const { toast } = useToast();

  const dailyLimitMinutes = isPremium ? 480 : 120; // 8h vs 2h in minutes
  const remainingMinutes = dailyLimitMinutes - usedMinutes;
  const usagePercentage = (usedMinutes / dailyLimitMinutes) * 100;
  const isLimitReached = usedMinutes >= dailyLimitMinutes;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleUpgrade = () => {
    toast({
      title: language === 'en' ? "Upgrade to Premium" : "Passer à Premium",
      description: language === 'en' 
        ? "8 hours daily + night mode + free strap included!" 
        : "8 heures quotidiennes + mode nuit + sangle gratuite incluse!",
    });
  };

  const simulateUsageIncrease = () => {
    setUsedMinutes(prev => Math.min(prev + 15, dailyLimitMinutes));
  };

  const togglePlan = () => {
    setIsPremium(!isPremium);
    toast({
      title: !isPremium 
        ? (language === 'en' ? "Premium Activated" : "Premium Activé")
        : (language === 'en' ? "Switched to Free" : "Retour au Gratuit"),
      description: !isPremium 
        ? (language === 'en' ? "All features unlocked!" : "Toutes les fonctionnalités débloquées!")
        : (language === 'en' ? "Limited to 2h daily" : "Limité à 2h quotidiennes"),
    });
  };

  const copy = {
    en: {
      remaining: `${formatTime(remainingMinutes)} remaining today`,
      limitReached: 'Daily limit reached - Guidance paused',
      upgradePrompt: 'Upgrade to Premium for 8h daily + night mode',
      premiumActive: 'Premium Active',
      freeStrap: 'Free strap included!',
      upgrade: 'Upgrade Now',
      simulate: 'Simulate +15min',
      togglePlan: isPremium ? 'Demo: Switch to Free' : 'Demo: Activate Premium'
    },
    fr: {
      remaining: `${formatTime(remainingMinutes)} restantes aujourd'hui`,
      limitReached: 'Limite quotidienne atteinte - Guidage en pause',
      upgradePrompt: 'Passez à Premium pour 8h quotidiennes + mode nuit',
      premiumActive: 'Premium Actif',
      freeStrap: 'Sangle gratuite incluse!',
      upgrade: 'Passer à Premium',
      simulate: 'Simuler +15min',
      togglePlan: isPremium ? 'Démo: Passer au Gratuit' : 'Démo: Activer Premium'
    }
  };

  const t = copy[language];

  return (
    <Card className={`w-full max-w-md mx-auto ${isLimitReached ? 'border-warning' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Plan Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {isPremium ? t.premiumActive : 'Free Plan'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPremium && (
              <Badge variant="default" className="gap-1">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              aria-label="Toggle language"
            >
              {language.toUpperCase()}
            </Button>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage Today</span>
            <span className={isLimitReached ? 'text-warning font-medium' : ''}>
              {formatTime(usedMinutes)} / {formatTime(dailyLimitMinutes)}
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${isLimitReached ? 'bg-warning/20' : ''}`}
          />
          {!isLimitReached ? (
            <p className="text-sm text-muted-foreground text-center">
              {t.remaining}
            </p>
          ) : (
            <p className="text-sm text-warning font-medium text-center">
              {t.limitReached}
            </p>
          )}
        </div>

        {/* Upgrade CTA for Free Users */}
        {!isPremium && (
          <div className="space-y-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">{t.upgradePrompt}</p>
              <p className="text-xs text-muted-foreground">{t.freeStrap}</p>
            </div>
            <Button 
              className="w-full gap-2" 
              onClick={handleUpgrade}
              aria-label={t.upgrade}
            >
              <Zap className="h-4 w-4" />
              {t.upgrade}
            </Button>
          </div>
        )}

        {/* Demo Controls */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={simulateUsageIncrease}
            disabled={isLimitReached}
          >
            {t.simulate}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={togglePlan}
          >
            {t.togglePlan}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageMeter;