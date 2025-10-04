import i18next from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: {
    appName: "Stride Guide",
    seeInterface: "See the interface",
    startGuidance: "Start Guidance",
    findItem: "Find Item",
    emergencySOS: "Emergency SOS",
    settings: "Settings",
    authRequiredTitle: "Authentication Required",
    authRequiredBody: "Please sign in to access this feature.",
    signIn: "Sign in",
    guidanceCardTitle: "Guidance",
    guidanceCardBody: "Clear audio cues to navigate safely.",
    findItemCardTitle: "Find Item",
    findItemCardBody: "Teach 12 frames to locate keys or wallet.",
    ctaPrimary: "Start Guidance",
    tagline: "On-device vision. Private. Safe."
  }},
  fr: { translation: {
    appName: "Stride Guide",
    seeInterface: "Voir l'interface",
    startGuidance: "Démarrer l'assistance",
    findItem: "Trouver un objet",
    emergencySOS: "SOS d'urgence",
    settings: "Réglages",
    authRequiredTitle: "Authentification requise",
    authRequiredBody: "Veuillez vous connecter pour accéder à cette fonction.",
    signIn: "Se connecter",
    guidanceCardTitle: "Guidage",
    guidanceCardBody: "Indications audio claires pour se déplacer en sécurité.",
    findItemCardTitle: "Trouver un objet",
    findItemCardBody: "Enseignez 12 images pour localiser des clés ou un porte-monnaie.",
    ctaPrimary: "Démarrer l'assistance",
    tagline: "Vision sur l'appareil. Privé. Sûr."
  }},
};

i18next.use(initReactI18next).init({
  resources, lng: "en", fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18next;
