// src/utils/logger.ts
import log, { LogLevelDesc } from 'loglevel';
import Config from 'react-native-config';

// ── env → level (no scoping, simple)
const ENV = Config.ENVIRONMENT || (__DEV__ ? 'development' : 'production');
function levelFromEnv(env: string): LogLevelDesc {
  switch (env) {
    case 'development':
      return 'debug';
    case 'staging':
      return 'info';
    case 'production':
      return 'error';
    default:
      return 'warn';
  }
}
log.setLevel(levelFromEnv(ENV));

// Add these icon constants at the top with your other constants
const ICONS = {
  warn: '⚠️', // Warning sign
  error: '🛑', // Stop sign
  info: 'ℹ️ ', // Information
  debug: '🐛', // Bug (for debugging)
};

// ── colors + timestamp
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};
const ts = () => {
  const now = new Date();
  return `${C.dim}[${now.toLocaleTimeString('en-GB')}.${String(now.getMilliseconds()).padStart(
    3,
    '0',
  )}]${C.reset}`;
};

type Lvl = 'debug' | 'info' | 'warn' | 'error';
const levelColor = (lvl: Lvl) =>
  lvl === 'error' ? C.red : lvl === 'warn' ? C.yellow : lvl === 'info' ? C.green : C.cyan;

const threshold: Record<Lvl, number> = {
  debug: log.levels.DEBUG,
  info: log.levels.INFO,
  warn: log.levels.WARN,
  error: log.levels.ERROR,
};
const enabled = (lvl: Lvl) => log.getLevel() <= threshold[lvl];

function out(lvl: Lvl, ...args: any[]) {
  if (!enabled(lvl)) return;
  const icon = ICONS[lvl];
  const label = `${levelColor(lvl)}[${lvl.toUpperCase()}]${C.reset}`;
  const prefix = `${ts()} ${label} ${icon}`;
  if (lvl === 'warn') console.warn(prefix, ...args);
  else if (lvl === 'error') console.error(prefix, ...args);
  else console.log(prefix, ...args);
}

const logger = {
  debug: (...args: any[]) => out('debug', ...args),
  info: (...args: any[]) => out('info', ...args),
  warn: (...args: any[]) => out('warn', ...args),
  error: (...args: any[]) => out('error', ...args),
  setLevel: (lvl: LogLevelDesc) => log.setLevel(lvl),
  getLevel: () => log.getLevel(),
};

export default logger;
