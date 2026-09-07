import { ArticleImage } from './article-gallery';
import katex from 'katex';
import { createElement, type ReactNode } from 'react';
import { parseMarkdown, type BlockNode, type InlineNode } from '../../content/markdown';
import { useI18n } from '../providers/i18n';

const renderInline = (
  nodes: InlineNode[],
  t: (value: string) => string,
  href: (value: string) => string,
  keyPrefix = 'inline'
): ReactNode[] =>
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
            part ? <span key={`${key}-${partIndex}`}>{t(part)}</span> : null,
          ]);
      case 'strong':
        return <strong key={key}>{renderInline(node.children, t, href, key)}</strong>;
      case 'emphasis':
        return <em key={key}>{renderInline(node.children, t, href, key)}</em>;
      case 'code':
        return <code key={key}>{node.value}</code>;
      case 'link':
        if (node.href.startsWith('#reference-')) {
          const number = node.href.slice('#reference-'.length);
          return (
            <sup className="paper-citation" key={key}>
              <a href={node.href} aria-label={`${t('参考文献')} ${number}`}>
                [{number}]
              </a>
            </sup>
          );
        }
        return (
          <a href={href(node.href)} key={key} rel={node.href.startsWith('http') ? 'noreferrer' : undefined}>
            {renderInline(node.children, t, href, key)}
          </a>
        );
      case 'image':
        return <ArticleImage key={key} src={node.href} alt={t(node.alt ?? '')} />;
      default:
        return null;
    }
  });

const renderBlocks = (
  blocks: BlockNode[],
  t: (value: string) => string,
  href: (value: string) => string,
  keyPrefix = 'block'
): ReactNode[] =>
  blocks.map((block, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (block.type) {
      case 'heading': {
        return createElement(`h${block.level}`, { key }, renderInline(block.children, t, href, key));
      }
      case 'paragraph': {
        const label = block.children.map((node) => (node.type === 'text' ? node.value : '')).join('');
        const reference = label.match(/^\[(\d+)\]\s/);
        const caption = /^(图|表)\s*\d+\s+/.test(label);
        const note = /^(注[：:]|说明[：:]|数据来源[：:])/.test(label);
        return (
          <p
            id={reference ? `reference-${reference[1]}` : undefined}
            className={reference ? 'paper-reference' : caption ? 'paper-caption' : note ? 'paper-note' : undefined}
            key={key}
          >
            {renderInline(block.children, t, href, key)}
          </p>
        );
      }
      case 'blockquote':
        return <blockquote key={key}>{renderBlocks(block.children, t, href, key)}</blockquote>;
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul';
        return (
          <List key={key}>
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{renderBlocks(item, t, href, `${key}-item-${itemIndex}`)}</li>
            ))}
          </List>
        );
      }
      case 'table':
        return (
          <table key={key}>
            <thead>
              <tr>
                {block.headers.map((header, headerIndex) => (
                  <th key={`${key}-header-${headerIndex}`}>
                    {renderInline(header, t, href, `${key}-header-${headerIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${key}-row-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`}>
                      {renderInline(cell, t, href, `${key}-row-${rowIndex}-cell-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
  return <>{renderBlocks(parseMarkdown(source), t, href)}</>;
};
