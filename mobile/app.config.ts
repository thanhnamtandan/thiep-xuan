import type { ConfigContext, ExpoConfig } from "expo/config";

// Bản web đăng trên GitHub Pages nằm ở đường dẫn con /thiep-xuan, nên cần baseUrl khi build web.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
