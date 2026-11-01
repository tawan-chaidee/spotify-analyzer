/// <reference types="vite/client" />

declare const __DATA_SOURCE__: "live" | "mock";

interface ImportMetaEnv {
  readonly VITE_SPOTIFY_CLIENT_ID?: string;
  readonly VITE_DATA_SOURCE?: "live" | "mock";
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
