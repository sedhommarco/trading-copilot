/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_APP_VERSION?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
