// @stride/cta-section v1 - Final conversion section
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onInstall: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onInstall }) => {
  const { i18n } = useTranslation();

  return (
    <section 
      className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-primary/10"
      aria-labelledby="final-cta"
    >
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 id="final-cta" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            {i18n.language === 'en' 
              ? 'Start Navigating Independently Today' 
              : 'Commencez à Naviguer en Toute Autonomie Aujourd\'hui'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {i18n.language === 'en'
              ? 'Join thousands of blind and low vision users who trust StrideGuide for safe, independent navigation.'
              : 'Rejoignez des milliers d\'utilisateurs malvoyants qui font confiance à StrideGuide pour une navigation sûre et autonome.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={onInstall}
            size="lg"
            className="min-h-[56px] text-lg px-10 shadow-lg hover:shadow-xl transition-all"
          >
            {i18n.language === 'en' ? 'Get Started Free' : 'Commencer Gratuitement'}
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
          <p className="text-sm text-muted-foreground">
            {i18n.language === 'en' 
              ? 'No credit card • No sign up • Works in 30 seconds'
              : 'Sans carte de crédit • Sans inscription • Fonctionne en 30 secondes'}
          </p>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{i18n.language === 'en' ? '10,000+ Active Users' : '10 000+ utilisateurs actifs'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{i18n.language === 'en' ? '4.8 Star Rating' : 'Note de 4,8 étoiles'}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{i18n.language === 'en' ? 'PIPEDA Compliant' : 'Conforme PIPEDA'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
