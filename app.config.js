export default {
  expo: {
    name: 'RN Sandbox',
    slug: 'rn-sandbox',
    version: '0.1.0',
    orientation: 'default',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'pw.itr0.rn.sandbox',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'pw.itr0.rn.sandbox',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-build-properties', 'expo-localization'],
  },
};
