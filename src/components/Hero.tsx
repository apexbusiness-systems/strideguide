import React from "react";

type Props = { 
  onStart: () => void; 
  PrimaryCTA: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> 
};

export default function Hero({ onStart, PrimaryCTA }: Props) {
  return (
    <section aria-labelledby="hero-title" className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 md:p-8">
      <h1 id="hero-title" className="text-2xl md:text-3xl font-bold text-white">
        Start safe guidance in seconds
      </h1>
      <p className="mt-2 text-sm md:text-base text-neutral-300">
        On-device vision. Private. Safe.
      </p>
      <div className="mt-4 max-w-sm">
        <PrimaryCTA onClick={onStart}>Start Guidance</PrimaryCTA>
      </div>
      <p className="mt-2 text-xs text-neutral-400">No account? Try guest mode.</p>
    </section>
  );
}
