// @stride/landing-hero v1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LandingHeroProps {
  onInstall: () => void;
  onSeePremium: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onInstall, onSeePremium }) => {
  const { t } = useTranslation();

  return (
    <section className="relative bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('hero.title')}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                {t('hero.sub')}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onInstall}
                size="lg"
                className="min-h-[52px] text-base font-semibold px-8 bg-foreground text-background hover:bg-foreground/90"
                aria-label={t('cta.primary')}
              >
                {t('cta.primary')}
              </Button>
              <Button
                onClick={onSeePremium}
                variant="outline"
                size="lg"
                className="min-h-[52px] text-base font-semibold px-8"
                aria-label={t('cta.secondary')}
              >
                {t('cta.secondary')}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-4">
              {t('badges').split(' • ').map((badge, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-sm aspect-[9/19] bg-foreground/5 rounded-3xl border-4 border-foreground/10 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8 space-y-4">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">StrideGuide Interface</p>
                </div>
              </div>
            </div>
            {/* Decorative gradient blur */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
