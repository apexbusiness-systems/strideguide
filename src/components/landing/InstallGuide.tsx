// @stride/install-guide v1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Share2 } from 'lucide-react';

export const InstallGuide: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Smartphone,
      platform: 'Android / Desktop',
      instruction: t('landing.installAndroid'),
    },
    {
      icon: Share2,
      platform: 'iPhone / iPad',
      instruction: t('landing.installIOS'),
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('landing.installTitle')}</h2>
          <p className="text-base text-muted-foreground">
            Install StrideGuide as a native app on your device in seconds.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} className="border-border">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{step.platform}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.instruction}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
