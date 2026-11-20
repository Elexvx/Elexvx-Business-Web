import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const repoArg = process.argv[2] ?? '../Silvae';
const sourceDir = resolve(repoArg, 'apps/web/public/assets/ming-library');
const outputDir = fileURLToPath(new URL('../release-assets/humite/visuals/humite-library/', import.meta.url));
const bookSource = fileURLToPath(new URL('./humite-showcase-books.mjs', import.meta.url));

const replaceOnce = (source, from, to) => {
  if (source.split(from).length !== 2) throw new Error(`Humite showcase integration point changed: ${from}`);
  return source.replace(from, to);
};

// Sync fresh embedded Ming Library assets from the Humite (Silvae) repository.
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

// Provide local @font-face declarations so the standalone iframe does not request /fonts/humite-serif.css.
const interfaceCssPath = join(outputDir, 'interface.css');
const interfaceCss = await readFile(interfaceCssPath, 'utf8');
await writeFile(interfaceCssPath, replaceOnce(interfaceCss, '@import url("/fonts/humite-serif.css");\n', ''));

await writeFile(
  join(outputDir, 'showcase.css'),
  `@font-face {
  font-family: 'Humite Serif';
  src: url('./assets/MingLibrarySerif.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: 'Silvae Serif';
  src: url('./assets/MingLibrarySerif.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

:root {
  --serif: 'Humite Serif', 'Silvae Serif', BookCJK, serif;
}

.showcase-badge {
  pointer-events: none;
}
`
);

// Build showcase book generator helper and inject it into the synced scene bundle.
const helperBuild = await build({
  entryPoints: [bookSource],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  globalName: '__HumiteShowcaseBooks',
  target: ['es2020'],
});
const helperCode = helperBuild.outputFiles[0].text.trim();

const htmlPath = join(outputDir, 'index.html');
let html = await readFile(htmlPath, 'utf8');
const scriptMatch = html.match(/src="\.\/(app-[a-f0-9]+\.js)"/);
if (!scriptMatch) throw new Error('Missing scene script in Humite ming-library index.html');
const originalScriptName = scriptMatch[1];

let code = await readFile(join(outputDir, originalScriptName), 'utf8');
code = replaceOnce(
  code,
  'allocateBooks:(o,s)=>l8(r.compartments,o,s)',
  'allocateBooks:(o,s)=>s?.repeat?__HumiteShowcaseBooks.fillShelfSlots(r.compartments,o,(c,b)=>l8(c,b,{repeat:!0,maxBooks:s.maxBooks??3e4})):l8(r.compartments,o,s)'
);
code = replaceOnce(code, 'await od([],{loadFont:!1})', 'await od(__HumiteShowcaseBooks.createRandomBooks(),{demo:!0})');
code = replaceOnce(
  code,
  'Me("#json-import").onclick=()=>pd(Me("#json-import"),async()=>{await nd(JSON.parse(Me("#json-input").value)),ul(),Vi.length&&await ls(Vi[0].id,{focus:!0}),Me("#data-panel").hidden=!1,Me("#selection").hidden=!0},"\\u4E66\\u76EE\\u5DF2\\u5BFC\\u5165\\uFF0C\\u6BCF\\u6761\\u8BB0\\u5F55\\u5DF2\\u751F\\u6210\\u4E00\\u518C\\u4E09\\u7EF4\\u4E66\\u7C4D")',
  'Me("#json-import").onclick=()=>pd(Me("#json-import"),async()=>{await nd(JSON.parse(Me("#json-input").value)),ul(),Vi.length&&await ls(Vi[0].id,{focus:!0}),Me("#data-panel").hidden=!1,Me("#selection").hidden=!0},"\\u4E66\\u76EE\\u5DF2\\u5BFC\\u5165\\uFF0C\\u6BCF\\u6761\\u8BB0\\u5F55\\u5DF2\\u751F\\u6210\\u4E00\\u518C\\u4E09\\u7EF4\\u4E66\\u7C4D"),Me("#demo-restore")&&(Me("#demo-restore").onclick=()=>pd(Me("#demo-restore"),async()=>{await od(__HumiteShowcaseBooks.createRandomBooks(),{demo:!0}),ul()},"\\u5DF2\\u6062\\u590D\\u6F14\\u793A\\u85CF\\u4E66"))'
);

const finalBundle = `${helperCode}\n${code}`;
const newScriptName = `app-${createHash('sha256').update(finalBundle).digest('hex').slice(0, 12)}.js`;
await writeFile(join(outputDir, newScriptName), finalBundle);
if (newScriptName !== originalScriptName) await rm(join(outputDir, originalScriptName), { force: true });

// Adapt index.html for standalone iframe showcase mode.
html = replaceOnce(
  html,
  '<meta name="description" content="走进观文藏阁：两层明式木构、整齐书架与由真实书目生成的现代三维书册。" />',
  '<meta name="description" content="走进观文藏阁：两层明式木构、整齐书架与由模拟书目生成的现代三维书册。" />\n  <meta name="robots" content="noindex, nofollow" />'
);
html = replaceOnce(
  html,
  '<link rel="stylesheet" href="./interface.css">',
  '<link rel="stylesheet" href="./interface.css">\n  <link rel="stylesheet" href="./showcase.css">'
);
html = replaceOnce(
  html,
  `<button class="top-button" id="back-button" type="button" aria-label="返回">`,
  `<span class="top-button showcase-badge" title="书目、作者与封面均为模拟数据">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" stroke-width="2.5"/></svg><span>模拟</span>
        </span>
        <button class="top-button" id="back-button" type="button" hidden aria-label="返回">`
);
html = replaceOnce(
  html,
  '<div class="download-links"><a href="./book-example.json" download>示例书目 JSON</a><a href="./integration.md" download>网站接入说明</a></div>\n',
  ''
);
html = replaceOnce(
  html,
  '<p class="field-note">生成示例后，再替换你的真实书目。导入真实书目时，每条书目生成一册；演示中的 48 种书目会循环陈列，以展示整馆藏书效果。</p>',
  '<p class="field-note">此公开演示默认展示模拟书目，可用于预览三维书册排架效果。</p>'
);
html = replaceOnce(
  html,
  '<p class="help-foot">建筑为明式木构意匠下的原创空间，并非某座历史建筑的测绘复原。馆藏来自当前账户可访问的真实书目，每条书目对应一册。封面与元信息通过书籍详情页维护。</p>',
  '<p class="help-foot">建筑为明式木构意匠下的原创空间，并非某座历史建筑的测绘复原。馆藏、作者与封面均为模拟内容，仅用于展示书架定位和三维书册。</p>'
);
html = replaceOnce(html, originalScriptName, newScriptName);

await writeFile(htmlPath, html);
console.log(`Synced Humite showcase: ${newScriptName}`);
