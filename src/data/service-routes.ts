/**
 * Service pages are part of the main site route surface. Their subdomains are
 * compatibility aliases handled by Vercel, not separate navigation targets.
 */
export const serviceRoutePaths = ['/services', '/services/docs', '/navigation', '/status', '/status/history'] as const;
