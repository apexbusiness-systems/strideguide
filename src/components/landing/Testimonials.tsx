// @stride/testimonials v1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      quote: t('landing.testimonial1'),
      author: 'Marie D.',
      location: 'Montreal, QC',
    },
    {
      quote: t('landing.testimonial2'),
      author: 'James T.',
      location: 'Toronto, ON',
    },
    {
      quote: t('landing.testimonial3'),
      author: 'Sophie L.',
      location: 'Vancouver, BC',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('landing.testimonialsTitle')}</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="border-border">
              <CardContent className="p-6 space-y-4">
                <Quote className="w-8 h-8 text-primary/20" aria-hidden="true" />
                <p className="text-sm text-foreground leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
