import { createElement, type ReactNode } from 'react';
import { parseMarkdown, type BlockNode, type InlineNode } from '../content/markdown';
import { useI18n } from './i18n';

const renderInline = (
  nodes: InlineNode[],
  t: (value: string) => string,
  href: (value: string) => string,
  keyPrefix = 'inline'
): ReactNode[] =>
  nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (node.type) {
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
        return (
          <a href={href(node.href)} key={key} rel={node.href.startsWith('http') ? 'noreferrer' : undefined}>
            {renderInline(node.children, t, href, key)}
          </a>
        );
      case 'image':
        return <img key={key} src={node.href} alt={t(node.alt ?? '')} loading="lazy" decoding="async" />;
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
      case 'paragraph':
        return <p key={key}>{renderInline(block.children, t, href, key)}</p>;
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
