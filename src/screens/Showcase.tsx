import React from "react";
import "../i18n/index";
import { useTranslation } from "react-i18next";
import AuthGate from "../components/AuthGate";
import PrimaryCTA from "../components/PrimaryCTA";

export default function Showcase() {
  const { t: tCommon } = useTranslation('common');
  const { t: tLanding } = useTranslation('landing');
  const [isAuthed] = React.useState(false);

  const SecBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className = "", ...rest }) => (
    <button
      {...rest}
      className={
        "w-full rounded-2xl h-[52px] min-h-[52px] px-4 border border-border bg-card text-card-foreground " +
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-ring " +
        "hover:bg-accent hover:text-accent-foreground transition-all duration-200 " + className
      }
    >
      {children}
    </button>
  );

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6">
      {/* Header with global CTA */}
      <header className="mb-4">
        <div className="flex items-center gap-3">
          <div aria-hidden className="w-8 h-8 rounded bg-primary" />
          <h1 className="text-xl font-bold text-foreground">Stride Guide</h1>
          <div className="hidden md:block ml-auto w-[240px]">
            <PrimaryCTA onClick={() => { /* wire real action */ }}>
              {tLanding("hero.ctaPrimary")}
            </PrimaryCTA>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{tCommon("app.tagline")}</p>
        <div className="md:hidden mt-3">
          <PrimaryCTA onClick={() => { /* wire real action */ }}>
            {tLanding("hero.ctaPrimary")}
          </PrimaryCTA>
        </div>
      </header>

      {/* "See the interface" with CTA-first structure */}
      <section aria-labelledby="see-int" className="bg-card rounded-2xl p-5 md:p-8 border border-border shadow-sm">
        <h2 id="see-int" className="text-lg font-semibold mb-4 text-card-foreground">See the interface</h2>

        {/* PRIMARY CTA — full width, first */}
        <div className="mb-3">
          <PrimaryCTA onClick={() => { /* start guidance */ }}>
            {tLanding("hero.ctaPrimary")}
          </PrimaryCTA>
        </div>

        {/* Secondary actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <SecBtn>Find Item</SecBtn>
          <SecBtn>Settings</SecBtn>
        </div>

        {/* Tertiary/danger action */}
        <div className="mt-3">
          <SecBtn className="bg-destructive hover:bg-destructive/90 border-destructive text-destructive-foreground">Emergency SOS</SecBtn>
        </div>

        {/* Auth gate */}
        <div className="mt-6">
          <AuthGate isAuthed={isAuthed} onSignIn={() => { /* auth */ }}>
            <div className="text-sm text-success">✓ Authenticated</div>
          </AuthGate>
        </div>
      </section>

      {/* Feature cards */}
      <section className="grid md:grid-cols-2 gap-4 mt-6">
        <article className="rounded-2xl border border-border p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-card-foreground">Guidance</h3>
          <p className="text-sm text-muted-foreground mt-1">Clear audio cues to navigate safely.</p>
        </article>
        <article className="rounded-2xl border border-border p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-card-foreground">Find Item</h3>
          <p className="text-sm text-muted-foreground mt-1">Teach 12 frames to locate keys or wallet.</p>
        </article>
      </section>
    </main>
  );
}
