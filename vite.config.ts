import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production hardening
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          'security': ['@/crypto/kv', '@/safety/llm_guard'],
          'utils': ['@/utils/BatteryGuard', '@/utils/HealthManager', '@/utils/SOSGuard']
        }
      }
    },
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        }
      }
    })
  },
  define: {
    __DEV__: mode === 'development',
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.CLOUD_DESCRIBE_ENABLED': JSON.stringify(process.env.CLOUD_DESCRIBE_ENABLED || 'false')
  }
}));
