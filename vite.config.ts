import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".");
  const appMode =
    mode === "mock-auth"
      ? "mock-auth"
      : mode === "demo" || mode === "mock"
        ? "demo"
        : "live";
  const dataSource =
    appMode === "live" && env.VITE_DATA_SOURCE !== "mock"
      ? "live"
      : "mock";
  const authSource = appMode === "mock-auth" ? "mock" : "real";
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL);
  let outputDirectory = "";

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "exclude-mock-assets-from-live-build",
        apply: "build",
        configResolved(config) {
          outputDirectory = resolve(config.root, config.build.outDir);
        },
        transformIndexHtml(html) {
          if (!siteUrl) return html;

          return {
            html,
            tags: [
              {
                tag: "link",
                attrs: { rel: "canonical", href: siteUrl },
                injectTo: "head",
              },
              {
                tag: "meta",
                attrs: { property: "og:type", content: "website" },
                injectTo: "head",
              },
              {
                tag: "meta",
                attrs: { property: "og:title", content: "Spotify Top Explorer" },
                injectTo: "head",
              },
              {
                tag: "meta",
                attrs: {
                  property: "og:description",
                  content:
                    "Explore and export your Spotify top tracks and artists across multiple time ranges.",
                },
                injectTo: "head",
              },
              {
                tag: "meta",
                attrs: { property: "og:url", content: siteUrl },
                injectTo: "head",
              },
            ],
          };
        },
        async closeBundle() {
          if (dataSource === "live") {
            await rm(resolve(outputDirectory, "test-fixtures"), {
              recursive: true,
              force: true,
            });
          }

          if (siteUrl) {
            await mkdir(outputDirectory, { recursive: true });
            await writeFile(
              resolve(outputDirectory, "sitemap.xml"),
              `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escapeXml(siteUrl)}</loc></url>\n</urlset>\n`,
              "utf8",
            );
            await writeFile(
              resolve(outputDirectory, "robots.txt"),
              `User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`,
              "utf8",
            );
          }
        },
      },
    ],
    server: {
      host: "127.0.0.1",
      port: 8000,
      strictPort: true,
    },
    define: {
      __APP_MODE__: JSON.stringify(appMode),
      __AUTH_SOURCE__: JSON.stringify(authSource),
      __DATA_SOURCE__: JSON.stringify(
        dataSource,
      ),
    },
  };
});

function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    url.hash = "";
    url.search = "";
    return url.toString();
  } catch {
    return "";
  }
}

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );
}
