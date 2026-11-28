<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="sitemap xhtml"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Elexvx · 站点地图</title>
        <style>
          :root { color-scheme: light dark; }
          body {
            max-width: 72rem;
            margin: 0 auto;
            padding: clamp(1rem, 4vw, 3rem);
            background: Canvas;
            color: CanvasText;
            font: 0.95rem/1.5 system-ui, -apple-system, sans-serif;
          }
          h1 { margin: 0 0 0.4rem; font-size: 1.75rem; font-weight: 600; }
          p { margin: 0 0 1.5rem; color: GrayText; font-size: 0.9rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            padding: 0.65rem 0.5rem;
            border-top: 1px solid color-mix(in srgb, GrayText 30%, transparent);
            text-align: left;
            vertical-align: top;
          }
          th { font-size: 0.8rem; color: GrayText; font-weight: 500; border-top: 0; }
          td:last-child { white-space: nowrap; color: GrayText; font-size: 0.85rem; }
          a { color: LinkText; text-underline-offset: 0.2em; word-break: break-all; }
        </style>
      </head>
      <body>
        <h1>Elexvx · 站点地图</h1>
        <p>共 <xsl:value-of select="count(sitemap:urlset/sitemap:url)" /> 个规范索引页面。</p>
        <table>
          <thead>
            <tr>
              <th>页面地址</th>
              <th>更新日期</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td>
                  <a href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc" />
                  </a>
                </td>
                <td>
                  <xsl:value-of select="sitemap:lastmod" />
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
