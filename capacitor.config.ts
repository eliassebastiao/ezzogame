import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ezzomaquina.brickclassico',
  appName: 'Brick Clássico',
  webDir: 'www',
  bundledWebRuntime: false,
  loggingBehavior: 'debug',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#0a0a12',
    overrideUserAgent: 'BrickClassico/1.0',
    appendUserAgent: false,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keyPassword: undefined,
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#0a0a12',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    ScreenOrientation: {
      orientation: 'landscape',
    },
    Haptics: {},
    Preferences: {},
    Share: {},
  },
};

export default config;