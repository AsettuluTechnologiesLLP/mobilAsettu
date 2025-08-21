import Config from 'react-native-config';

type Env = 'development' | 'staging' | 'production';
const APP_ENV = (Config.APP_ENV as Env) || 'development';

export const AppConfig = {
  env: APP_ENV,
  apiBaseUrl: Config.API_BASE_URL!,
  logLevel: (Config.LOG_LEVEL ?? (__DEV__ ? 'debug' : 'info')) as
    | 'debug'
    | 'info'
    | 'warn'
    | 'error',
};
