import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SW_VERSION } from "./sw-version";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/800.css";
import "./i18n";
import "./utils/ComponentTester";
import "./utils/SystemReliabilityTester";

// Initialize core managers
import "./utils/InstallManager";
import "./utils/AudioArmer";

// Initialize performance monitoring
import "./utils/PerformanceMonitor";

// Register service worker with cache-bust version
if ("serviceWorker" in navigator) {
  const url = `/sw.js?v=${encodeURIComponent(SW_VERSION)}`;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(url, { 
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    }).then((registration) => {
      // Check for updates every hour
      setInterval(() => {
        registration.update().catch(() => {});
      }, 1000 * 60 * 60);
    }).catch(() => {});
  });
}

// Preload critical resources
const preloadCritical = () => {
  // Preload fonts
  const fontPreload = document.createElement('link');
  fontPreload.rel = 'preload';
  fontPreload.as = 'font';
  fontPreload.type = 'font/woff2';
  fontPreload.crossOrigin = 'anonymous';
  fontPreload.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontPreload);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCritical);
} else {
  preloadCritical();
}

// i18n is now synchronously initialized
createRoot(document.getElementById("root")!).render(<App />);
