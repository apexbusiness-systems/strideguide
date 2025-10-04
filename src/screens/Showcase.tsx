import React from "react";
import Hero from "../components/Hero";
import PrimaryCTA from "../components/PrimaryCTA";
import AuthGate from "../components/AuthGate";

export default function Showcase() {
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [devBypass, setDevBypass] = React.useState(() => 
    localStorage.getItem('stride-dev-bypass') === 'true'
  );

  const toggleDevBypass = () => {
    const newValue = !devBypass;
    setDevBypass(newValue);
    localStorage.setItem('stride-dev-bypass', String(newValue));
  };

  const startFlow = () => {
    if (!isAuthed && !devBypass) {
      document.getElementById("auth-block")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return; // click 1 -> reveals sign-in
    }
    window.location.assign("/guidance"); // click 2 -> go
  };

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6 text-white">
      {/* Dev bypass toggle */}
      <div className="mb-4 flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
        <button
          onClick={toggleDevBypass}
          className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm hover:bg-yellow-400 transition"
        >
          DEV BYPASS: {devBypass ? 'ON ✓' : 'OFF'}
        </button>
        <span className="text-xs text-yellow-200">
          {devBypass ? 'Auth check disabled - clicking Start Guidance goes directly to /guidance' : 'Auth check enabled - normal flow'}
        </span>
      </div>

      <Hero onStart={startFlow} PrimaryCTA={PrimaryCTA} />

      {/* Secondary (below the fold) */}
      <section className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-950 p-5 md:p-8">
        <h2 className="text-lg font-semibold mb-4">See the interface</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <button className="rounded-2xl h-[52px] border border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800 transition">
            Find Item
          </button>
          <button className="rounded-2xl h-[52px] border border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800 transition">
            Settings
          </button>
        </div>

        <div id="auth-block" className="mt-6">
          <AuthGate isAuthed={isAuthed} onSignIn={() => setIsAuthed(true)}>
            <div className="text-sm text-green-400">✓ Authenticated</div>
          </AuthGate>
        </div>

        <div className="mt-4" role="region" aria-label="Danger actions">
          <button className="w-full rounded-2xl h-[52px] border border-red-600 text-red-500 hover:bg-red-600/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2 transition">
            Emergency SOS
          </button>
        </div>
      </section>
    </main>
  );
}
