import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gebeta.fooddelivery',
  appName: 'Gebeta Food Delivery',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'gebeta-release-key.keystore',
      keystoreAlias: 'gebeta',
      keystorePassword: 'gebeta123',
      keystoreAliasPassword: 'gebeta123'
    }
  }
};

export default config;