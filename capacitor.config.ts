import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.masoko.app",
  appName: "maSoKo",
  webDir: "public",
  server: {
    url: "https://masoko-lemon.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
