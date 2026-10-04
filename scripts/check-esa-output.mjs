import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const defaultOrigin = 'https://www.elexvx.com';

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, name) => {
    const normalized = name.toLowerCase();
    if (normalized === 'amp') return '&';
    if (normalized === 'lt') return '<';
    if (normalized === 'gt') return '>';
    if (normalized === 'quot') return '"';
    if (normalized === 'apos') return "'";
    const codePoint = normalized.startsWith('#x')
      ? Number.parseInt(normalized.slice(2), 16)
      : Number.parseInt(normalized.slice(1), 10);
    return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : entity;
  });
}

function parseAttributes(tag) {
  const attributes = new Map();
  const body = tag.replace(/^<\w+\b|\s*\/?\s*>$/g, '');
  const matcher = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of body.matchAll(matcher)) {
    attributes.set(match[1].toLowerCase(), decodeEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attributes;
}

function linksFromHtml(html) {
  const links = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const rel = (attributes.get('rel') ?? '').toLowerCase().split(/\s+/).filter(Boolean);
    if (rel.includes('canonical')) links.push({ kind: 'canonical', href: attributes.get('href') ?? '' });
    if (rel.includes('alternate') && attributes.has('hreflang')) {
      links.push({
        kind: 'alternate',
        href: attributes.get('href') ?? '',
        language: attributes.get('hreflang') ?? '',
      });
    }
  }
  return links;
}

function parseSitemap(xml) {
  return [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)].map((match) => decodeEntities(match[1].trim()));
}

function normalizedUrl(value, origin) {
  const url = new URL(value);
  if (url.origin !== origin || url.search || url.hash) return null;
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return `${url.origin}${url.pathname}`;
}

function staticFileForUrl(root, value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }

  const segments = url.pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const decoded = decodeURIComponent(segment);
      if (decoded === '.' || decoded === '..' || decoded.includes('/') || decoded.includes('\\')) {
        throw new Error(`Unsafe URL path: ${value}`);
      }
      return decoded;
    });
  const lastSegment = segments.at(-1) ?? '';
  const relativeFile = /\.[a-z\d]{1,8}$/i.test(lastSegment)
    ? path.join(...segments)
    : path.join(...segments, 'index.html');
  const file = path.resolve(root, relativeFile || 'index.html');
  const relativeFileFromRoot = path.relative(root, file);
  if (relativeFileFromRoot.startsWith('..') || path.isAbsolute(relativeFileFromRoot)) {
    throw new Error(`URL escapes static root: ${value}`);
  }
  return file;
}

function pageText(html) {
  return decodeEntities(
    html
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<(script|style|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function isNoindexDocument(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => parseAttributes(match[0]))
    .some(
      (attributes) =>
        (attributes.get('name') ?? '').toLowerCase() === 'robots' &&
        /\bnoindex\b/i.test(attributes.get('content') ?? '')
    );
}

function hasNotFoundHeading(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1] ?? '';
  const heading = pageText(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] ?? '');
  return /^(?:404\b.*|page\s+not\s+found\b.*|not\s+found\b.*|page\s+does\s+not\s+exist\b.*|the\s+page\s+(?:you\s+are\s+looking\s+for|does\s+not\s+exist)\b.*|页面.*(?:暂时)?(?:找不到|不存在|未找到)|这一页.*找不到|找不到页面.*)$/i.test(
    heading
  );
}

async function collectHtmlFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(entryPath)));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) files.push(entryPath);
  }
  return files;
}

function languageMap(links, origin) {
  return links
    .filter((link) => link.kind === 'alternate')
    .map((link) => {
      let normalized = null;
      try {
        normalized = normalizedUrl(link.href, origin);
      } catch {
        // The caller reports malformed or relative links with page context.
      }
      return { ...link, normalized };
    });
}

function expectedCounterpart(pathname) {
  if (pathname === '/en' || pathname === '/en/') return '/';
  if (!pathname.startsWith('/en/')) return null;
  return pathname.replace(/^\/en(?=\/)/, '');
}

function languageCode(value) {
  return value.toLowerCase();
}

async function existsAsFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

function expectedBackLanguage(sourceUrl, language) {
  const sourcePath = new URL(sourceUrl).pathname;
  if (sourcePath === '/en' || sourcePath.startsWith('/en/')) return 'en';
  if (languageCode(language).startsWith('en')) return 'zh-cn';
  return undefined;
}

function redirectFallbackFile(root, source) {
  const asUrl = new URL(source, defaultOrigin);
  if (asUrl.origin !== defaultOrigin || asUrl.search || asUrl.hash) return null;
  try {
    return staticFileForUrl(root, asUrl.href);
  } catch {
    return null;
  }
}

export async function inspectEsaOutput({
  root = 'esa/site/assets',
  origin = defaultOrigin,
  redirects,
  redirectsFile = 'src/server/esa/redirects.json',
} = {}) {
  const staticRoot = path.resolve(root);
  const errors = [];
  const pages = new Map();
  let sourceRedirects = redirects;

  if (!sourceRedirects) {
    try {
      sourceRedirects = JSON.parse(await readFile(redirectsFile, 'utf8'));
    } catch (error) {
      return {
        pages: 0,
        errors: [`Cannot read ESA redirect rules: ${error.message}`],
      };
    }
  }

  const sitemapFile = path.join(staticRoot, 'sitemap.xml');
  let urls;
  try {
    urls = parseSitemap(await readFile(sitemapFile, 'utf8'));
  } catch (error) {
    return { pages: 0, errors: [`Cannot read ESA sitemap at ${sitemapFile}: ${error.message}`] };
  }
  if (urls.length === 0) errors.push('sitemap.xml contains no <loc> URLs.');

  for (const url of urls) {
    let identity;
    try {
      identity = normalizedUrl(url, origin);
    } catch {
      identity = null;
    }
    if (!identity) {
      errors.push(`Sitemap URL must use ${origin} and have no query or fragment: ${url}`);
      continue;
    }
    if (pages.has(identity)) {
      errors.push(`Duplicate sitemap URL after trailing-slash normalization: ${url}`);
      continue;
    }

    let file;
    try {
      file = staticFileForUrl(staticRoot, url);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (!(await existsAsFile(file))) {
      errors.push(`Sitemap target has no static HTML file: ${url} -> ${path.relative(staticRoot, file)}`);
      continue;
    }

    const html = await readFile(file, 'utf8');
    if (/\bid\s*=\s*(["'])__next_error__\1/i.test(html)) {
      errors.push(`Published page is a Next.js error document: ${url}`);
    }

    const canonicalLinks = linksFromHtml(html).filter((link) => link.kind === 'canonical');
    if (canonicalLinks.length !== 1) {
      errors.push(`Published page must have exactly one canonical link: ${url} (found ${canonicalLinks.length})`);
    } else {
      let canonicalIdentity;
      try {
        canonicalIdentity = normalizedUrl(canonicalLinks[0].href, origin);
      } catch {
        canonicalIdentity = null;
      }
      if (canonicalIdentity !== identity) {
        errors.push(`Canonical does not match sitemap URL: ${url} -> ${canonicalLinks[0].href || '(empty)'}`);
      }
    }

    if (isNoindexDocument(html)) {
      errors.push(`Sitemap page is marked noindex: ${url}`);
    }

    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main\s*>/i)?.[1] ?? '';
    const mainText = pageText(main);
    const heading = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1\s*>/i)?.[1] ?? '';
    const headingText = pageText(heading);
    if (!main || headingText.length < 2 || mainText.length < 24) {
      errors.push(`Published page has no valid main content (needs a meaningful h1 and body text): ${url}`);
    }

    pages.set(identity, {
      url,
      file,
      html,
      alternates: languageMap(linksFromHtml(html), origin),
    });
  }

  // Next can emit an error document as a regular route file. Such a file may
  // be missing from the sitemap and still be served by ESA with HTTP 200, so
  // scan every exported HTML file as well as the published URL list.
  const sitemapFiles = new Set([...pages.values()].map((page) => page.file));
  for (const file of await collectHtmlFiles(staticRoot)) {
    if (sitemapFiles.has(file)) continue;
    const html = await readFile(file, 'utf8');
    const relativeFile = path.relative(staticRoot, file).split(path.sep).join('/');
    if (/\bid\s*=\s*(["'])__next_error__\1/i.test(html)) {
      errors.push(`ESA assets contain a Next.js error document outside or inside the sitemap: ${relativeFile}`);
    }
    if (isNoindexDocument(html) && hasNotFoundHeading(html)) {
      errors.push(`ESA assets contain a noindex page-not-found document at a static URL: ${relativeFile}`);
    }
  }

  const loadedAlternates = new Map();
  for (const page of pages.values()) {
    for (const alternate of page.alternates) {
      if (!alternate.href) {
        errors.push(`Alternate ${alternate.language || '(missing language)'} has no href: ${page.url}`);
        continue;
      }
      if (!alternate.normalized) {
        errors.push(
          `Alternate target must use ${origin} and have no query or fragment: ${page.url} -> ${alternate.href}`
        );
        continue;
      }

      let targetFile;
      try {
        targetFile = staticFileForUrl(staticRoot, alternate.href);
      } catch {
        targetFile = null;
      }
      if (!targetFile || !(await existsAsFile(targetFile))) {
        errors.push(`Hreflang target has no static HTML file: ${page.url} -> ${alternate.href}`);
        continue;
      }

      if (!loadedAlternates.has(alternate.normalized)) {
        const targetPage = pages.get(alternate.normalized);
        const targetHtml = targetPage?.html ?? (await readFile(targetFile, 'utf8'));
        loadedAlternates.set(alternate.normalized, languageMap(linksFromHtml(targetHtml), origin));
      }
      if (languageCode(alternate.language) === 'x-default') continue;

      const backLanguage = expectedBackLanguage(page.url, alternate.language);
      const reciprocalLinks = loadedAlternates.get(alternate.normalized);
      const hasBacklink = reciprocalLinks.some(
        (backlink) =>
          backlink.normalized === normalizedUrl(page.url, origin) &&
          (!backLanguage || languageCode(backlink.language) === backLanguage)
      );
      if (!hasBacklink) {
        errors.push(`Hreflang is not reciprocal: ${page.url} (${alternate.language}) -> ${alternate.href}`);
      }
    }
  }

  // The generated sitemap intentionally omits English versions of standalone
  // service utilities. Every actual zh/en pair in the sitemap must still link
  // to itself and back to its counterpart.
  for (const page of pages.values()) {
    const pathname = new URL(page.url).pathname;
    if (!pathname.startsWith('/en/') && pathname !== '/en/') continue;
    const chinesePath = expectedCounterpart(pathname);
    const chineseIdentity = `${origin}${chinesePath.replace(/\/+$/, '') || '/'}`;
    const chinesePage = pages.get(chineseIdentity);
    if (!chinesePage) continue;
    const englishIdentity = `${origin}${pathname.replace(/\/+$/, '') || '/'}`;
    const hasAlternate = (source, language, target) =>
      source.alternates.some(
        (alternate) => languageCode(alternate.language) === language && alternate.normalized === target
      );
    if (!hasAlternate(page, 'en', englishIdentity)) {
      errors.push(`English page is missing its self hreflang alternate: ${page.url}`);
    }
    if (!hasAlternate(page, 'zh-cn', chineseIdentity)) {
      errors.push(`English page is missing its Chinese hreflang alternate: ${page.url}`);
    }
    if (!hasAlternate(chinesePage, 'zh-cn', chineseIdentity)) {
      errors.push(`Chinese page is missing its self hreflang alternate: ${chinesePage.url}`);
    }
    if (!hasAlternate(chinesePage, 'en', englishIdentity)) {
      errors.push(`Chinese page is missing its English hreflang alternate: ${chinesePage.url}`);
    }
  }

  const notFoundHtml = path.join(staticRoot, '404.html');
  if (await existsAsFile(notFoundHtml)) {
    errors.push('ESA assets expose 404.html as a static 200 path; embed it in the function and remove it from assets.');
  }
  const nextNotFoundHtml = path.join(staticRoot, '_not-found', 'index.html');
  if (await existsAsFile(nextNotFoundHtml)) {
    errors.push('ESA assets expose Next.js internal /_not-found/ as a static path; remove it from assets.');
  }

  for (const redirect of sourceRedirects) {
    if (redirect.has || redirect.source.includes(':')) continue;
    const fallbackFile = redirectFallbackFile(staticRoot, redirect.source);
    if (fallbackFile && (await existsAsFile(fallbackFile))) {
      errors.push(`Redirect source still has a static fallback that can shadow its redirect: ${redirect.source}`);
    }
  }

  return { pages: pages.size, errors };
}

export async function checkEsaOutput(options = {}) {
  const result = await inspectEsaOutput(options);
  if (result.errors.length > 0) {
    throw new Error(
      `ESA static output check failed (${result.errors.length} issue(s)):\n- ${result.errors.join('\n- ')}`
    );
  }
  return result;
}

function readCliRoot(args) {
  const index = args.indexOf('--root');
  if (index === -1) return 'esa/site/assets';
  const root = args[index + 1];
  if (!root || root.startsWith('--')) throw new Error('--root requires a directory path.');
  return root;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await checkEsaOutput({ root: readCliRoot(process.argv.slice(2)) });
    console.log(
      `ESA static output check passed: ${result.pages} sitemap pages, metadata, language links, and static fallback rules.`
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
