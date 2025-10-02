// @stride/why-section v1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export const WhyStrideGuide: React.FC = () => {
  const { t } = useTranslation();

  const benefits = [
    t('landing.whyOffline'),
    t('landing.whyInference'),
    t('landing.whyPrivacy'),
    t('landing.whyBilingual'),
    t('landing.whyUI'),
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              {t('landing.whyTitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most navigation apps need internet and send your location to a server. This one doesn't. It runs entirely on your phone and tells you what's in front of you before you walk into it.
            </p>
          </div>

          {/* Right: Checklist */}
          <div className="space-y-4">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" aria-hidden="true" />
                </div>
                <p className="text-base text-foreground font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
