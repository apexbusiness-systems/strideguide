// @stride/showcase v1 — idempotent
import React from 'react';
import { useTranslation } from 'react-i18next';
import AuthGate from '@/components/AuthGate';

export default function Showcase() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('see.title')}</h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <button className="h-14 rounded-2xl bg-slate-900 text-white font-semibold focus:outline-none focus-visible:ring-2">
              {t('see.btn.start')}
            </button>
            <button className="h-14 rounded-2xl border border-slate-300 font-semibold focus:outline-none focus-visible:ring-2">
              {t('see.btn.find')}
            </button>
            <button className="h-14 rounded-2xl border border-red-300 text-red-700 font-semibold focus:outline-none focus-visible:ring-2">
              {t('see.btn.sos')}
            </button>
            <button className="h-14 rounded-2xl border border-slate-300 font-semibold focus:outline-none focus-visible:ring-2">
              {t('see.btn.settings')}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {t('see.caption')}
          </p>
        </div>
        <AuthGate />
      </div>
    </section>
  );
}
