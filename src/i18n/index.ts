import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { resources as sosResources } from "./resources";

// Bundle ALL translation files at build time
import enCommon from "./locales/en/common.json";
import frCommon from "./locales/fr/common.json";
import enHome from "./locales/en/home.json";
import frHome from "./locales/fr/home.json";
import enLegacy from "./en.json";
import frLegacy from "./fr.json";
import enLanding from "./landing-en.json";

// CONSOLIDATED: Single i18n init with all namespaces bundled at build
const resources = {
  en: { 
    common: enCommon,
    home: enHome,
    landing: (enLanding as Record<string, unknown>).landing as Record<string, unknown> || {},
    app: enLegacy,
    plan: {},
    pricing: {},
    translation: sosResources.en.translation  // Add SOS translations
  },
  fr: { 
    common: frCommon,
    home: frHome,
    landing: (enLanding as Record<string, unknown>).landing as Record<string, unknown> || {},
    app: frLegacy,
    plan: {},
    pricing: {},
    translation: sosResources.fr.translation  // Add SOS translations
  },
};

// Initialize i18n ONCE - HARD FREEZE: Block render until ready
export const i18nReady = i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    ns: ["common", "home", "landing", "app", "plan", "pricing"],
    defaultNS: "common",
    keySeparator: ".",
    nsSeparator: ":",
    debug: false, // Disabled in prod
    saveMissing: false,
    parseMissingKeyHandler: (key) => {
      console.error('[i18n] ❌ MISSING KEY:', key);
      return key; // Return the key so we can see it in UI during dev
    },
    interpolation: { escapeValue: false },
    react: { 
      useSuspense: true // BLOCK render until i18n is ready
    },
  });

// Dev-only key leak detector
export function assertNoKeyLeak(root = document.body) {
  if (typeof window === 'undefined' || !window.location.hostname.includes('localhost')) return;
  
  const leaked: string[] = [];
  const keyPattern = /\b[a-z]+\.(hero|home|plan|badge|app|pricing|auth|common|landing)\.[a-z_]+\b/i;
  
  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      if (text && keyPattern.test(text)) {
        leaked.push(text);
      }
    }
    node.childNodes.forEach(walk);
  }
  
  walk(root);
  
  if (leaked.length > 0) {
    console.error('[i18n] ❌ LEAKED KEYS DETECTED:', [...new Set(leaked)]);
    return false;
  }
  
  console.log('[i18n] ✓ No key leaks detected');
  return true;
}

export default i18next;
