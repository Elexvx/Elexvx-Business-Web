import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');

const toDateString = (date = new Date(), timeZone = 'Asia/Shanghai') => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(date)
    .reduce((acc, part) => (part.type !== 'literal' ? { ...acc, [part.type]: part.value } : acc), {});

  return `${parts.year}-${parts.month}-${parts.day}`;
};

const parseArgs = (args) => {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, maybeValue] = arg.slice(2).split('=');
      if (maybeValue === undefined && args[i + 1] && !args[i + 1].startsWith('--')) {
        opts[key] = args[i + 1];
        i++;
      } else {
        opts[key] = maybeValue ?? true;
      }
    }
  }
  return opts;
};

const nextIndex = (dateString, files = []) => {
  const matcher = new RegExp(`^${dateString}-(\\d+)\\.md$`);
  const found = files
    .map((file) => matcher.exec(file))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((n) => Number.isInteger(n));

  return (found.length ? Math.max(...found) : 0) + 1;
};

const writeFrontmatter = ({
  publishDate,
  title,
  author,
  excerpt,
  category,
  tags,
  image,
  draft,
}) => {
  const body = [
    '---',
    `publishDate: ${publishDate}`,
    `title: ${JSON.stringify(title)}`,
    author ? `author: ${JSON.stringify(author)}` : null,
    excerpt ? `excerpt: ${JSON.stringify(excerpt)}` : null,
    `image: ${JSON.stringify(image)}`,
    `category: ${JSON.stringify(category)}`,
    'tags:',
    ...(tags.length ? tags : [category]).map((tag) => `  - ${JSON.stringify(tag)}`),
    `draft: ${draft ? 'true' : 'false'}`,
    'metadata: {}',
    '---',
    '',
    '在这里开始撰写正文...',
    '',
  ];

  return body.filter(Boolean).join('\n');
};

const printHelp = () => {
  console.log(`
用法：
  node scripts/create-post.mjs --title "文章标题" [--category latest-news] [--tags 标签1,标签2] [--author 作者] [--excerpt 摘要]

选项：
  --title       必填，文章标题
  --category    文章分类文件夹（默认：latest-news）
  --categoryName frontmatter 中的 category 名称（默认等同于 category）
  --tags        逗号分隔的标签列表（默认使用 category）
  --author      作者
  --excerpt     摘要
  --image       头图地址（默认：~/assets/images/post/notice.png）
  --draft       是否标记为草稿（默认：true，传入 false 则发布）

示例：
  node scripts/create-post.mjs --title "关于投资公告" --category latest-news --tags 最新动态,投资公告 --author 宏翔商道
`);
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    printHelp();
    return;
  }

  const title = args.title;
  if (!title) {
    console.error('请使用 --title 指定文章标题，例如：--title "新文章标题"');
    process.exit(1);
  }

  const category = args.category || 'latest-news';
  const categoryName = args.categoryName || category;
  const tags = typeof args.tags === 'string' ? args.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  await fs.mkdir(POSTS_DIR, { recursive: true });

  const categoryDir = path.join(POSTS_DIR, category);
  await fs.mkdir(categoryDir, { recursive: true });

  const publishDate = toDateString(new Date());
  const existingFiles = await fs.readdir(categoryDir);
  const index = nextIndex(publishDate, existingFiles);
  const id = `${publishDate}-${String(index).padStart(2, '0')}`;
  const targetPath = path.join(categoryDir, `${id}.md`);

  const frontmatter = writeFrontmatter({
    publishDate,
    title,
    author: args.author || '',
    excerpt: args.excerpt || '',
    category: categoryName,
    tags,
    image: args.image || '~/assets/images/post/notice.png',
    draft: args.draft === 'false' ? false : true,
  });

  await fs.writeFile(targetPath, frontmatter, 'utf-8');
  console.log(`已创建: ${path.relative(ROOT, targetPath)}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
