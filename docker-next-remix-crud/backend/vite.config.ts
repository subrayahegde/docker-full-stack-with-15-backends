import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [
    remix({
      appDirectory: "app", // Adjust this path if your root is deeper
       future: {
        // This is the flag that stops Remix from blocking cross-origin actions/mutations
        v3_singleFetch: false, 
      },
    }),
    tsconfigPaths()],
  server: {
    port: 5000,
    host: "0.0.0.0", // This exposes the server to your network / Docker container
   cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      preflightContinue: true // Force Vite to forward OPTIONS to Remix
    }
  },
});


