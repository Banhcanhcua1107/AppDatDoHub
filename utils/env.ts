// utils/env.ts
import Constants from 'expo-constants';

type Env = {
  API_URL?: string;
  SENTRY_DSN?: string;
};

const ENV = (Constants?.expoConfig?.extra as any)?.env as Env;

export function getEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = ENV?.[key];
  if (!value) throw new Error(`ENV ${String(key)} is not defined`);
  return value as NonNullable<Env[K]>;
}
