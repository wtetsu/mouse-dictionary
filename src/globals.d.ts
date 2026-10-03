// Build-time constants injected by tools/build.ts (Vite `define`).
// In tests, they are provided by vitest.setup.ts.
declare const BROWSER: "chrome" | "firefox" | "safari";
declare const DIALOG_ID: string;
declare const DEBUG: boolean;
declare const VERSION: string;
