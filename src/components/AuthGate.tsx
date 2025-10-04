import React from "react";

type Props = { isAuthed: boolean; onSignIn?: () => void; children: React.ReactNode };

export default function AuthGate({ isAuthed, onSignIn, children }: Props) {
  if (isAuthed) return <>{children}</>;
  return (
    <section aria-labelledby="auth-title" className="bg-white text-black border border-neutral-300 rounded-2xl p-4 md:p-6">
      <h2 id="auth-title" className="text-base font-semibold">Authentication Required</h2>
      <p className="mt-1 text-sm text-neutral-700">Please sign in to access this feature.</p>
      <button
        onClick={onSignIn}
        className="mt-4 w-full md:w-auto rounded-2xl px-5 py-3 border border-black bg-black text-white
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-black">
        Sign in
      </button>
    </section>
  );
}
