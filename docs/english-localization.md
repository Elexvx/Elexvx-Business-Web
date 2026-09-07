# English publishing

English routes use `/en` and share the Chinese page structure. Public articles render complete English text during static generation; no translation service or browser-side text replacement is required.

- `content/i18n/en.json` contains the published content translations, including article paragraphs, tables, captions, names and page copy. `src/site/translation.ts` combines these with shared interface vocabulary.
- `LocalizedText`, `Translated` and `useI18n().t` translate content at rendering boundaries. Markdown preserves formatting, equations, citations and images. English headings retain punctuation and wrap naturally.
- Metadata uses the same translation source. Exported English documents have `lang="en"`, localized titles and descriptions, canonical URLs and language alternatives.
- Explicit English links remain English. The footer switches to the corresponding page and retains query parameters and article anchors. Browser preference detection is limited to the unprefixed homepage.
- Search includes translated bodies of published research, activities and news. Filter values retain stable source identifiers while labels are translated.
- Original photographs, certificates and manuscript figures remain source assets. Their surrounding article text and captions are localized; text embedded in original raster images is not rewritten.

When publishing or changing Chinese content, add its English translation in the same change. Run `npm test` and `npm run build`. The build runs `npm run i18n:check`, which checks all generated English pages for untranslated visible text, image descriptions, accessible labels and metadata. The language-switch label is intentionally displayed as `中文 · 中国`.

Browser verification should include a long article, an image preview, English body search, a category filter, language switching at an article anchor, and 390px/desktop overflow checks. Chinese prose retains a two-character first-line indent; English prose does not.
