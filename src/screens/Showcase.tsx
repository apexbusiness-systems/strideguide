import React from "react";
import "../i18n/index";
import { useTranslation } from "react-i18next";
import AuthGate from "../components/AuthGate";

export default function Showcase() {
  const { t } = useTranslation();
  const [isAuthed] = React.useState(false);

  const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...rest }) => (
    <button
      {...rest}
      className="w-full rounded-2xl h-[52px] min-h-[52px] px-4 border border-neutral-600 bg-neutral-900 text-white
                 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-white
                 hover:bg-neutral-800 transition">
      {children}
    </button>
  );

  return (
    <main className="mx-auto max-w-5xl p-4 md:p-6 text-white">
      <header className="flex items-center gap-3 mb-4">
        <div aria-hidden className="w-8 h-8 rounded bg-indigo-600" />
        <h1 className="text-xl font-bold">{t("appName")}</h1>
      </header>

      <section aria-labelledby="see-int" className="bg-neutral-950 rounded-2xl p-5 md:p-8 border border-neutral-800">
        <h2 id="see-int" className="text-lg font-semibold mb-4">{t("seeInterface")}</h2>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Btn>{t("startGuidance")}</Btn>
          <Btn className="bg-white text-black border-neutral-300 hover:bg-neutral-100">{t("findItem")}</Btn>
          <Btn className="bg-red-600 hover:bg-red-700 border-red-700">{t("emergencySOS")}</Btn>
          <Btn className="bg-neutral-700 hover:bg-neutral-600">{t("settings")}</Btn>
        </div>

        <div className="mt-6">
          <AuthGate isAuthed={isAuthed} onSignIn={() => {}}>
            <div className="text-sm text-green-400">✓ Authenticated</div>
          </AuthGate>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4 mt-6">
        <article className="rounded-2xl border border-neutral-800 p-4 bg-neutral-950">
          <h3 className="font-semibold">{t("guidanceCardTitle")}</h3>
          <p className="text-sm text-neutral-300 mt-1">{t("guidanceCardBody")}</p>
        </article>
        <article className="rounded-2xl border border-neutral-800 p-4 bg-neutral-950">
          <h3 className="font-semibold">{t("findItemCardTitle")}</h3>
          <p className="text-sm text-neutral-300 mt-1">{t("findItemCardBody")}</p>
        </article>
      </section>
    </main>
  );
}
