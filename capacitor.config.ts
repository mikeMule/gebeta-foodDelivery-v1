import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gebeta.fooddelivery',
  appName: 'Gebeta Food Delivery',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'gebeta-release-key.keystore',
      keystoreAlias: 'gebeta',
      keystorePassword: 'gebeta123',
      keystoreAliasPassword: 'gebeta123'
    }
  },
  // This allows the app to access your backend API when running on a device
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;