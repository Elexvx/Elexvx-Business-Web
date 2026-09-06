import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import type { RehypePlugin, RemarkPlugin } from '@astrojs/markdown-remark';

/**
 * 计算文章阅读时间的插件
 * 针对中文内容优化算法：
 * - 中文：按字符数计算，平均阅读速度 300-400 字符/分钟
 * - 英文：按单词数计算，平均阅读速度 200-250 单词/分钟
 * - 混合内容：智能识别并分别计算
 */
export const readingTimeRemarkPlugin: RemarkPlugin = () => {
  return function (tree, file) {
    const textOnPage = toString(tree);
    const readingTime = calculateOptimizedReadingTime(textOnPage);

    if (typeof file?.data?.astro?.frontmatter !== 'undefined') {
      file.data.astro.frontmatter.readingTime = readingTime;
    }
  };
};

/**
 * 优化的阅读时间计算函数
 * @param text 文章文本内容
 * @returns 预估阅读时间（分钟）
 */
function calculateOptimizedReadingTime(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  // 过滤代码块和代码相关内容
  let cleanText = text
    // 移除代码块 ```code```
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码 `code`
    .replace(/`[^`\n]*?`/g, '')
    // 移除 HTML 代码标签 <code>...</code>
    .replace(/<code[^>]*>[\s\S]*?<\/code>/gi, '')
    // 移除 HTML pre 标签 <pre>...</pre>
    .replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '')
    // 移除其他 HTML 标签
    .replace(/<[^>]*>/g, ' ')
    // 移除多余的空白字符
    .replace(/\s+/g, ' ')
    .trim();
  
  // 分离中文字符和英文单词
  const chineseChars = cleanText.match(/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/gu) || [];
  const englishText = cleanText.replace(/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2b73f}\u{2b740}-\u{2b81f}\u{2b820}-\u{2ceaf}\uf900-\ufaff\u3300-\u33ff\ufe30-\ufe4f\uf900-\ufaff\u{2f800}-\u{2fa1f}]/gu, ' ');
  const englishWords = englishText.match(/\b\w+\b/g) || [];
  
  // 计算阅读时间
  const chineseReadingTime = chineseChars.length / 350; // 中文平均阅读速度：350字符/分钟
  const englishReadingTime = englishWords.length / 225;  // 英文平均阅读速度：225单词/分钟
  
  const totalReadingTime = chineseReadingTime + englishReadingTime;
  
  // 最少1分钟，向上取整
  return Math.max(1, Math.ceil(totalReadingTime));
}

export const responsiveTablesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      if (child.type === 'element' && child.tagName === 'table') {
        tree.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            style: 'overflow:auto',
          },
          children: [child],
        };

        i++;
      }
    }
  };
};

export const lazyImagesRehypePlugin: RehypePlugin = () => {
  return function (tree) {
    if (!tree.children) return;

    visit(tree, 'element', function (node) {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
      }
    });
  };
};
