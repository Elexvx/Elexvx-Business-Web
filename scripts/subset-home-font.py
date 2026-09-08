"""Run after npm run build with fonttools and brotli, then rebuild to publish the generated CSS/font.
Includes dynamic cookie and theme labels so opening the homepage never requires the article font.
"""
from pathlib import Path
from html.parser import HTMLParser
from fontTools import subset
import hashlib,re
class Text(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.text=[]
 def handle_starttag(self,t,a):
  self.text.extend(v for k,v in a if k in ('alt','placeholder','aria-label','title','value') and v)
  if t in ('script','style'):self.skip+=1
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip-=1
 def handle_data(self,s):
  if not self.skip:self.text.append(s)
p=Text();p.feed(Path('dist/index.html').read_text());chars=set(''.join(p.text));chars.update(chr(i) for i in range(32,127))
for name in ('cookie-consent','footer'):
 chars.update(Path('src/site/components/'+name+'.tsx').read_text())
for stylesheet in Path('src/styles').rglob('*.css'):
 chars.update(c for c in stylesheet.read_text() if ord(c)>127)
chars.update('\u00a0\u2026\u2010\u2011\u25cc\ufffd')  # Browser-generated ellipsis and shaping fallback.
text=''.join(sorted(chars));o=subset.Options();o.flavor='woff2';f=subset.load_font('public/fonts/source-han-sans/SourceHanSansCN-VF.woff2',o);ss=subset.Subsetter(options=o);ss.populate(text=text);ss.subset(f)
name='home-'+hashlib.sha256(text.encode()).hexdigest()[:10]+'.woff2';subset.save_font(f,'public/fonts/source-han-sans/'+name,o)
css=Path('src/styles/sections/01-foundation.css');s=css.read_text();rule="/* Load only homepage glyphs first; other pages retain the complete site subset. */\n@font-face {\n  font-family: 'Source Han Sans';\n  src: url('/fonts/source-han-sans/"+name+"') format('woff2');\n  font-style: normal;\n  font-weight: 250 900;\n  font-display: swap;\n  unicode-range: "+','.join('U+'+format(ord(c),'X') for c in sorted(chars))+";\n}"
# Make the faces disjoint: absent symbol glyphs should use a system fallback,
# rather than download the large article face to look for the same missing glyph.
ranges=[];start=0
for cp in sorted(ord(c) for c in chars):
 if start<cp:ranges.append('U+'+format(start,'X')+'-'+format(cp-1,'X'))
 start=cp+1
ranges.append('U+'+format(start,'X')+'-10FFFF')
first_end=s.index('}')
first=re.sub(r'\s*unicode-range:[^;]+;', '', s[:first_end])
s=first+'\n  unicode-range: '+','.join(ranges)+';\n'+s[first_end:]
s=re.sub(r'/\* Load only homepage glyphs first;.*?\n}',lambda m:rule,s,count=1,flags=re.S);css.write_text(s);print(name,len(chars),Path('public/fonts/source-han-sans/'+name).stat().st_size)
