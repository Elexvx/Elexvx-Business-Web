"""Regenerate the site font after content changes: python (fonttools + brotli required)."""
from pathlib import Path
from fontTools import subset
import hashlib
chars = set(chr(i) for i in range(32, 127))
for p in Path('src').rglob('*'):
    if p.suffix in {'.ts', '.tsx', '.json', '.md', '.mdx'}:
        chars.update(p.read_text())
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font('public/fonts/source-han-sans/SourceHanSansCN-VF.woff2', options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=''.join(sorted(chars)))
subsetter.subset(font)
name = 'site-' + hashlib.sha256(''.join(sorted(chars)).encode()).hexdigest()[:10] + '.woff2'
subset.save_font(font, 'public/fonts/source-han-sans/' + name, options)
print(name)
