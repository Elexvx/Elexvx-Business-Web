# Design QA

## Comparison target

- Source visual truth path: `/var/folders/k4/mgjk9gsj2q16n5_csyg45bp40000gn/T/codex-clipboard-06c80ce5-4ed4-4445-9837-801637afbcc7.png`
- Implementation screenshot path: Codex in-app Browser capture retained inline in this task from `http://127.0.0.1:5173/`
- Desktop viewport: `1286 x 888` CSS px
- Source pixels: `2570 x 1776` at approximately `2x`; normalized comparison size `1285 x 888`
- Implementation pixels: `1286 x 888` at `1x`
- Mobile viewport: `390 x 844` CSS px
- State: homepage, Chinese locale, top of page, no menus open

## Full-view comparison evidence

- The reference uses one dominant feature story and two vertically stacked secondary stories. The implementation reproduces that hierarchy with measured desktop tracks of `858px 286px` inside a `1176px` frame.
- The main image, large title below the image, compact category/read-time metadata, square secondary imagery, and generous vertical spacing match the reference composition.
- The existing black Elexvx hero surface is intentionally retained as an inverse treatment of the reference's white canvas; the layout, density, image hierarchy, and reading order are the matched design surfaces.
- Desktop document overflow check: `false`.

## Focused region comparison evidence

- Main article: `858px` wide with a `1.72 / 1` image ratio and a two-line display title.
- Secondary rail: `286px` wide with two stacked stories and `1.18 / 1` image ratios.
- Mobile: the grid resolves to one `335px` column with all three stories in source order and no horizontal overflow.
- Typography uses the existing Elexvx display family and weights while matching the reference's main-versus-secondary scale relationship.
- All four images are existing published-content assets; no placeholder or generated artwork is used.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: hierarchy, weight, line height, and wrapping are consistent with the reference structure and the existing Elexvx type system.
- Spacing and layout rhythm: column proportions, card gaps, image-to-copy spacing, and mobile stacking are balanced and overflow-free.
- Colors and visual tokens: the dark inverse palette is an intentional product constraint; contrast remains strong.
- Image quality and asset fidelity: source covers render sharply with deliberate crops and no stretching.
- Copy and content: the showcase uses the four most recent published Elexvx articles and preserves verified titles, categories, reading times, and destinations.

## Interaction and runtime checks

- The lead card navigated to `/insights/question-before-model/` and browser back returned to `/`.
- Desktop and mobile browser console warnings/errors: none.
- All three article links are exposed with correct local destinations.

## Comparison history

- Pass 1: no P0/P1/P2 findings; no corrective visual iteration was required.
- Post-build responsive check: desktop `1286 x 888` and mobile `390 x 844` both remained overflow-free.

## Iteration 2: live OpenAI sticky rail comparison

- Live source URL: `https://openai.com/zh-Hans-CN/`
- Source desktop evidence at `1516 x 888`: a four-column grid with the feature card spanning three columns and three cards stacked in the remaining column.
- Source scroll evidence: the feature card uses `position: sticky` beneath the header while the right rail remains in normal document flow with `overflow-y: visible`.
- Implementation desktop evidence at `1516 x 888`: `1053.75px` feature column, `351.25px` right rail, three secondary cards, sticky top `64px`, and no horizontal overflow.
- Implementation scroll evidence: at document scroll `888px`, the feature card remained at `54.45px` while the third right-rail card entered the viewport.
- Initial mobile finding [P2]: the feature card inherited desktop sticky positioning below `720px`.
- Fix: added a mobile breakpoint override that restores `position: static`.
- Post-fix mobile evidence at `390 x 844`: one natural-flow column, three secondary cards, `position: static`, no horizontal overflow, and no console warnings or errors.

## Follow-up polish

- P3: a future light-theme homepage variant could use the reference's white canvas directly, but that would change the surrounding Elexvx hero rather than improve this scoped component.

final result: passed
