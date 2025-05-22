import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'dailyReflection',
  webDir: 'www'
};

plugins: {
  Keyboard: {
    resize: 'none' // otras opciones: 'body', 'ionic', 'native'
  }
}

export default config;
