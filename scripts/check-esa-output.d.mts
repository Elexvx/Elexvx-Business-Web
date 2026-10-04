export type EsaRedirectRule = {
  source: string;
  destination?: string;
  permanent?: boolean;
  has?: unknown[];
};

export type EsaOutputCheckOptions = {
  root?: string;
  origin?: string;
  redirects?: EsaRedirectRule[];
  redirectsFile?: string;
};

export type EsaOutputCheckResult = {
  pages: number;
  errors: string[];
};

export function inspectEsaOutput(options?: EsaOutputCheckOptions): Promise<EsaOutputCheckResult>;
export function checkEsaOutput(options?: EsaOutputCheckOptions): Promise<EsaOutputCheckResult>;
