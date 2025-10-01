// @stride/pricing-section v1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PricingSectionProps {
  onInstall: () => void;
  onUpgrade: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onInstall, onUpgrade }) => {
  const { t } = useTranslation();

  const plans = [
    {
      name: 'Free',
      description: t('pricing.free'),
      cta: t('cta.primary'),
      action: onInstall,
      variant: 'outline' as const,
      features: ['2 hours per day', 'Core guidance features', 'Lost item finder', 'Emergency SOS'],
    },
    {
      name: 'Premium',
      description: t('pricing.premium'),
      cta: 'Start 7-day trial',
      action: onUpgrade,
      variant: 'default' as const,
      popular: true,
      features: ['8 hours per day', 'Night mode enabled', 'Free phone strap', 'Priority support', 'All Free features'],
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more hours or night mode.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <Card key={idx} className={`relative ${plan.popular ? 'border-primary shadow-lg' : 'border-border'}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.action}
                  variant={plan.variant}
                  size="lg"
                  className="w-full min-h-[48px] font-semibold"
                  aria-label={plan.cta}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
