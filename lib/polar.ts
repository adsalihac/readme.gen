type PolarServer = 'sandbox' | 'production';

export function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function getPolarServer(): PolarServer {
  return process.env.POLAR_SERVER === 'production' ? 'production' : 'sandbox';
}

export function getPolarApiUrl(): string {
  return getPolarServer() === 'production'
    ? 'https://api.polar.sh'
    : 'https://sandbox-api.polar.sh';
}
