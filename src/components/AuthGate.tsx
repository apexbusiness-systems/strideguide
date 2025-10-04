// @stride/auth-gate v3 — high-contrast accessible
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AuthGate() {
  const { t } = useTranslation();
  const signIn = () => { (window as any).auth?.signIn?.() ?? (location.href = '/auth'); };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
      <h3 className="text-lg font-semibold">{t('authRequiredTitle')}</h3>
      <p className="mt-1 mb-3 text-sm opacity-80">{t('authRequiredBody')}</p>
      <button
        onClick={signIn}
        className="w-full min-h-[52px] rounded-2xl bg-black text-white font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-sm"
        aria-label={t('signIn')}
      >
        {t('signIn')}
      </button>
    </section>
  );
}
