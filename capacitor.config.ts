import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl =
  process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;

const config: CapacitorConfig = {
  appId: "com.masoko.app",
  appName: "maSoKo",
  webDir: "public",
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: serverUrl.startsWith("http://"),
      }
    : undefined,
  android: {
    allowMixedContent: true,
  },
};

export default config;
