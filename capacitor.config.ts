import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymw.app',
  appName: 'gymw',
  webDir: 'frontend/out',
  server: process.env.CAPACITOR_SERVER_URL ? {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true
  } : undefined
};

export default config;
