import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function googleSiteVerification() {
  return {
    name: "google-site-verification",
    transformIndexHtml(html) {
      const code = process.env.VITE_GOOGLE_SITE_VERIFICATION;
      if (!code) return html;
      return html.replace(
        "</head>",
        `    <meta name="google-site-verification" content="${code}" />\n  </head>`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), googleSiteVerification()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});