import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

const cookieName = 'authToken';
const tokenLifetimeSeconds = 30 * 24 * 60 * 60;

const getSecret = () => process.env.SITE_SECRET_KEY || process.env.SITE_SECRE_KEY || 'site-status';

export const isPasswordProtectionEnabled = () => Boolean(process.env.SITE_PASSWORD);

const readCookie = (request: IncomingMessage, name: string) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;
  const prefix = `${name}=`;
  return cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
};

const signToken = (expiresAt: string, nonce: string) =>
  createHmac('sha256', getSecret()).update(`${expiresAt}.${nonce}`).digest('base64url');

export const createAuthToken = async () => {
  const expiresAt = String(Math.floor(Date.now() / 1000) + tokenLifetimeSeconds);
  const nonce = randomBytes(16).toString('base64url');
  return `${expiresAt}.${nonce}.${signToken(expiresAt, nonce)}`;
};

const isValidToken = (token: string) => {
  const [expiresAt, nonce, signature] = token.split('.');
  if (!expiresAt || !nonce || !signature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false;
  const expected = signToken(expiresAt, nonce);
  const candidate = Buffer.from(signature);
  const digest = Buffer.from(expected);
  return candidate.length === digest.length && timingSafeEqual(candidate, digest);
};

export const isAuthenticated = async (request: IncomingMessage) => {
  if (!isPasswordProtectionEnabled()) return true;
  const token = readCookie(request, cookieName);
  return Boolean(token && isValidToken(token));
};

export const matchesConfiguredPasswordHash = (candidate: string) => {
  const configuredPassword = process.env.SITE_PASSWORD;
  if (!configuredPassword || !/^[a-f\d]{64}$/iu.test(candidate)) return false;
  const expected = createHash('sha256').update(configuredPassword).digest('hex');
  const candidateBuffer = Buffer.from(candidate.toLowerCase(), 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
};

export const authCookie = (token: string) =>
  `${cookieName}=${token}; Path=/; Max-Age=${tokenLifetimeSeconds}; HttpOnly; Secure; SameSite=Strict`;

export const clearedAuthCookie = () => `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
