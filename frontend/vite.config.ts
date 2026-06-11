import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Força o Vite a caçar alterações de arquivos dentro do Docker
    },
    hmr: {
      clientPort: 5173, // Garante o Hot Module Replacement ativo
    },
  },
});
