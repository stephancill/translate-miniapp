import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "inject-frame-embed",
      transformIndexHtml(html) {
        const frameEmbed = JSON.parse(
          readFileSync(resolve(__dirname, "public/frame-embed.json"), "utf-8")
        );

        const frameContent = JSON.stringify(frameEmbed);

        return html.replace(
          /<meta name="fc:frame" content='.*?' \/>/,
          `<meta name="fc:frame" content='${frameContent}' />`
        );
      },
    },
  ],
  server: {
    allowedHosts: true,
  },
});
