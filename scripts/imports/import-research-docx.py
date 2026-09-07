"""Import the five supplied research manuscripts without rewriting their claims."""
import json, re, shutil, zipfile
from pathlib import Path
from lxml import etree as E
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
M='http://schemas.openxmlformats.org/officeDocument/2006/math'
ns={'w':W,'m':M}
root=Path(__file__).resolve().parents[2]
sources=[('面向MoE推理的Chiplet专家复用架构','moe-chiplet-expert-reuse','芯片架构','chip-architecture'),('面向智能体推理的生命周期感知KV缓存系统','agent-kv-cache-lifecycle','推理系统','inference-systems'),('面向异构加速器的可迁移FP4量化','portable-fp4-quantization','量化与编译','quantization-compilation'),('面向端侧NPU的大模型编译优化','edge-npu-llm-compilation','量化与编译','quantization-compilation'),('大模型推理的内存中心化架构演进','memory-centric-inference','芯片架构','chip-architecture')]
covers={
 'moe-chiplet-expert-reuse':'/visuals/system-gradient.jpg',
 'agent-kv-cache-lifecycle':'/visuals/ai-data-gradient.jpg',
 'portable-fp4-quantization':'/visuals/industrial-intelligence-gradient.jpg',
 'edge-npu-llm-compilation':'/visuals/ai-safety-gradient.jpg',
 'memory-centric-inference':'/visuals/research-gradient.jpg',
}
def math(n):
 if n is None:return ''
 tag=E.QName(n).localname
 get=lambda key:math(n.find('m:'+key,ns))
 if tag=='t':return n.text or ''
 if tag.endswith('Pr'):return ''
 if tag=='sSub':return get('e')+'_{'+get('sub')+'}'
 if tag=='sSup':return get('e')+'^{'+get('sup')+'}'
 if tag=='sSubSup':return get('e')+'_{'+get('sub')+'}^{'+get('sup')+'}'
 if tag=='f':return '('+get('num')+')/('+get('den')+')'
 if tag=='d':
  def attr(k,default):
   x=n.find('m:dPr/m:'+k,ns);return x.get('{'+M+'}val',default) if x is not None else default
  return attr('begChr','(')+get('e')+attr('endChr',')')
 if tag=='nary':
  x=n.find('m:naryPr/m:chr',ns);return (x.get('{'+M+'}val','∑') if x is not None else '∑')+'_{'+get('sub')+'}^{'+get('sup')+'} '+get('e')
 if tag=='limLow':return get('e')+'_{'+get('lim')+'}'
 return ''.join(math(c) for c in n)
def text(n):
 if E.QName(n).namespace==M:return '`'+math(n)+'`'
 tag=E.QName(n).localname
 if tag=='t':return n.text or ''
 if tag=='drawing':
  links=n.findall('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
  return ''.join('\n\n![论文图示]('+media.get(x.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed'),'')+')\n\n' for x in links)
 if tag in ('pPr','rPr'):return ''
 if tag=='tab':return ' '
 if tag=='br':return '\n'
 return ''.join(text(c) for c in n)
def esc(s):return s.replace('|','\\|')
rows=json.loads((root/'content/site/research.json').read_text())
new=[]
for title,slug,category,categorySlug in sources:
 p=Path('/Users/johntao/Downloads')/(title+'_修订版.docx')
 with zipfile.ZipFile(p) as z:
  doc=E.fromstring(z.read('word/document.xml'));body=doc.find('w:body',ns)
  target=root/'public/research/papers'/slug;target.mkdir(parents=True,exist_ok=True)
  rels=E.fromstring(z.read('word/_rels/document.xml.rels'));media={}
  for rel in rels:
   dest=rel.get('Target','')
   if dest.startswith('media/'):
    name=Path(dest).name;(target/name).write_bytes(z.read('word/'+dest));media[rel.get('Id')]='/research/papers/'+slug+'/'+name
  blocks=[];abstract=''; count=0
  for node in body:
   tag=E.QName(node).localname
   if tag=='p':
    s=text(node).strip()
    if not s:continue
    count+=1
    if count<=3:continue # Title is metadata; source author and affiliation are placeholders.
    if s.startswith('摘要 '):abstract=s[3:];blocks.extend(['## 摘要',abstract]);continue
    if s.startswith('关键词 '):blocks.append('**关键词** '+s[4:]);continue
    if re.match(r'^\d+(?:\.\d+)*\s+\S',s) and len(s)<90:
     depth=min(4,2+s.split(' ')[0].count('.'));s='#'*depth+' '+s
    elif s in ['参考文献','结论','致谢']:s='## '+s
    blocks.append(s)
   elif tag=='tbl':
    table=[]
    for row in node.findall('w:tr',ns):table.append([esc(' '.join(text(x).strip() for x in cell.findall('w:p',ns))) for cell in row.findall('w:tc',ns)])
    width=max(map(len,table));table=[r+['']*(width-len(r)) for r in table]
    blocks.append('\n'.join(['| '+' | '.join(table[0])+' |','| '+' | '.join(['---']*width)+' |']+['| '+' | '.join(r)+' |' for r in table[1:]]))
  target=root/'public/research/papers'/slug;target.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target/'manuscript.docx')
  article=dict(slug=slug,title=title,excerpt=abstract.split('。')[0]+'。',publishedAt='2026-09-06',author='',status='published',category=category,categorySlug=categorySlug,cover=covers[slug],body='\n\n'.join(blocks))
  new.append(article)
  print(title,'tables',len(doc.findall('.//w:tbl',ns)),'formula',len(doc.findall('.//m:oMath',ns)),'chars',len(article['body']))
(root/'content/site/research.json').write_text(json.dumps(new+[r for r in rows if r['slug'] not in {x['slug'] for x in new}],ensure_ascii=False,indent=2)+'\n')
