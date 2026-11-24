import { ArticleImage } from './article-gallery';
import { MermaidDiagram } from './mermaid-diagram';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { createElement, type ReactNode } from 'react';
import { parseMarkdown, type BlockNode, type InlineNode } from '../../content/markdown';
import { useI18n } from '../providers/i18n';

type RenderContext = {
  t: (value: string) => string;
  href: (value: string) => string;
  firstImage?: InlineNode;
};

const findFirstImageInInline = (nodes: InlineNode[]): InlineNode | undefined => {
  for (const node of nodes) {
    if (node.type === 'image') return node;
    if (node.type === 'strong' || node.type === 'emphasis' || node.type === 'link') {
      const nested = findFirstImageInInline(node.children);
      if (nested) return nested;
    }
  }
  return undefined;
};

const findFirstImageInBlocks = (blocks: BlockNode[]): InlineNode | undefined => {
  for (const block of blocks) {
    if (block.type === 'heading' || block.type === 'paragraph') {
      const match = findFirstImageInInline(block.children);
      if (match) return match;
    } else if (block.type === 'blockquote') {
      const match = findFirstImageInBlocks(block.children);
      if (match) return match;
    } else if (block.type === 'list') {
      for (const item of block.items) {
        const match = findFirstImageInBlocks(item);
        if (match) return match;
      }
    } else if (block.type === 'table') {
      for (const cell of [...block.headers, ...block.rows.flat()]) {
        const match = findFirstImageInInline(cell);
        if (match) return match;
      }
    }
  }
  return undefined;
};

const renderInline = (nodes: InlineNode[], context: RenderContext, keyPrefix = 'inline'): ReactNode[] =>
  nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
      case 'math':
        return (
          <span
            key={key}
            dangerouslySetInnerHTML={{
              __html: katex.renderToString(node.value, { throwOnError: false, trust: false, strict: false }),
            }}
          />
        );
      case 'text':
        return node.value
          .split('\n')
          .flatMap((part, partIndex) => [
            partIndex > 0 ? <br key={`${key}-break-${partIndex}`} /> : null,
            part ? <span key={`${key}-${partIndex}`}>{context.t(part)}</span> : null,
          ]);
      case 'strong':
        return <strong key={key}>{renderInline(node.children, context, key)}</strong>;
      case 'emphasis':
        return <em key={key}>{renderInline(node.children, context, key)}</em>;
      case 'code':
        return <code key={key}>{node.value}</code>;
      case 'link':
        if (node.href.startsWith('#reference-')) {
          const number = node.href.slice('#reference-'.length);
          return (
            <sup className="paper-citation" key={key}>
              <a href={node.href} aria-label={`${context.t('参考文献')} ${number}`}>
                [{number}]
              </a>
            </sup>
          );
        }
        return (
          <a href={context.href(node.href)} key={key} rel={node.href.startsWith('http') ? 'noreferrer' : undefined}>
            {renderInline(node.children, context, key)}
          </a>
        );
      case 'image':
        return (
          <ArticleImage
            key={key}
            src={node.href}
            alt={context.t(node.alt ?? '')}
            sizes="(max-width: 720px) calc(100vw - 40px), 780px"
            fetchPriority={node === context.firstImage ? 'high' : undefined}
          />
        );
      default:
        return null;
    }
  });

const paragraphVariant = (children: InlineNode[]): { id?: string; className?: string } => {
  const label = children.map((node) => (node.type === 'text' ? node.value : '')).join('');
  const reference = label.match(/^\[(\d+)\]\s/);
  if (reference) return { id: `reference-${reference[1]}`, className: 'paper-reference' };
  if (/^(图|表)\s*\d+\s+/.test(label)) return { className: 'paper-caption' };
  if (/^(注[：:]|说明[：:]|数据来源[：:])/.test(label)) return { className: 'paper-note' };
  return {};
};

const renderBlocks = (blocks: BlockNode[], context: RenderContext, keyPrefix = 'block'): ReactNode[] =>
  blocks.map((block, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (block.type) {
      case 'heading': {
        return createElement(`h${block.level}`, { key }, renderInline(block.children, context, key));
      }
      case 'paragraph': {
        const variant = paragraphVariant(block.children);
        return (
          <p id={variant.id} className={variant.className} key={key}>
            {renderInline(block.children, context, key)}
          </p>
        );
      }
      case 'blockquote':
        return <blockquote key={key}>{renderBlocks(block.children, context, key)}</blockquote>;
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul';
        return (
          <List key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{renderBlocks(item, context, `${key}-item-${itemIndex}`)}</li>
            ))}
          </List>
        );
      }
      case 'table':
        return (
          <div className="markdown-table-wrap" key={key}>
            <table>
              <thead>
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th key={`${key}-header-${headerIndex}`}>
                      {renderInline(header, context, `${key}-header-${headerIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`}>
                        {renderInline(cell, context, `${key}-row-${rowIndex}-cell-${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'code':
        if (block.language === 'math')
          return (
            <div
              className="paper-equation"
              key={key}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(block.value, {
                  displayMode: true,
                  throwOnError: false,
                  trust: false,
                  strict: false,
                }),
              }}
            />
          );
        if (block.language === 'mermaid') return <MermaidDiagram key={key} chart={block.value} />;
        return (
          <pre key={key} data-language={block.language}>
            <code>{block.value}</code>
          </pre>
        );
      case 'rule':
        return <hr key={key} />;
      default:
        return null;
    }
  });

export const MarkdownRenderer = ({ source }: { source: string }) => {
  const { t, href } = useI18n();
  const blocks = parseMarkdown(source);
  const firstImage = findFirstImageInBlocks(blocks);
  return <>{renderBlocks(blocks, { t, href, firstImage })}</>;
};
