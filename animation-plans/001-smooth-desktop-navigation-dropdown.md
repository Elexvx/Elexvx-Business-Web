# 001 — Smooth the desktop navigation dropdown

- **Status**: DONE
- **Commit**: 510720b
- **Severity**: HIGH
- **Category**: Easing & duration / Interruptibility
- **Estimated scope**: 2 files, approximately 25 lines

## Problem

The desktop dropdown is conditionally mounted only after `panelGroup` is selected. On the first hover, React sets `panelGroup` and `openGroup` in the same render, so the newly mounted panel already has the open class and never transitions from opacity 0. The result is the reported one-frame appearance.

```tsx
// src/app/components.tsx:293 — current initial-open branch
} else {
  clearContentTransition();
  setPanelGroup(nextGroup);
  setPanelContentVisible(true);
}
setOpenGroup(groupId);
```

The intent and close delays are also very short for a large, full-width navigation panel:

```tsx
// src/app/components.tsx:301-316 — current
openTimerRef.current = window.setTimeout(() => activateGroup(groupId), 70);
closeTimerRef.current = window.setTimeout(() => setOpenGroup(null), 180);
```

The panel itself only fades for 220ms:

```css
/* src/styles/apple-system.css:39-42 — current */
--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--motion-duration-nav: 220ms;
--motion-duration-nav-swap: 160ms;
```

## Target

Make the first opening transition reliably from hidden to visible, keep the motion as a restrained fade without bounce or spatial pop, and make pointer movement less abrupt:

```css
--motion-duration-nav: 250ms;
--motion-duration-nav-swap: 180ms;
```

- Initial hover intent delay: `110ms`.
- Full panel fade: `250ms cubic-bezier(0.23, 1, 0.32, 1)`.
- Content change crossfade: `180ms cubic-bezier(0.23, 1, 0.32, 1)`.
- Content replacement waits `180ms`, then reveals on two animation frames.
- Pointer-leave close delay: `240ms`.
- No spring, scale, bounce, blur, or slide. The user explicitly wants a smooth appearance rather than a pop-out.
- The first opening must mount the hidden panel first, then apply `openGroup` on two nested `requestAnimationFrame` callbacks so the browser paints the opacity-0 state before transitioning.
- Keep click and keyboard activation immediate; only pointer hover receives the `110ms` intent delay.

## Repo conventions to follow

- Motion tokens already live in `src/styles/apple-system.css:39-42`.
- The project already uses `--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1)` for UI entrances.
- `revealPanelContent()` in `src/app/components.tsx:270-278` already provides the required two-frame reveal pattern. Reuse that pattern for the initial panel opening instead of adding a dependency.
- `prefers-reduced-motion` is handled globally in `src/styles/apple-system.css:2030-2041`; do not remove it.

## Steps

1. In `src/styles/apple-system.css`, change `--motion-duration-nav` from `220ms` to `250ms` and `--motion-duration-nav-swap` from `160ms` to `180ms`. Do not add movement or new keyframes.
2. In `src/app/components.tsx`, update the group-switch timer from `85` to `180` so content reaches opacity 0 before replacement.
3. In the initial-open path where `panelGroup` is null, set `panelGroup` and `panelContentVisible` first, then use two nested `requestAnimationFrame` calls to set `openGroup(groupId)`. Return from this branch so `openGroup` is not set in the mounting render.
4. Keep already-mounted panel openings immediate at the state level; CSS performs the `250ms` fade.
5. Change the pointer hover delay from `70` to `110` and the pointer-leave close delay from `180` to `240`.
6. Call `clearContentTransition()` inside `scheduleGroup` and `scheduleClose` so rapid pointer movement cancels stale frame/timer work and remains interruptible.

## Boundaries

- Do NOT modify navigation markup, labels, destinations, spacing, colors, or panel dimensions.
- Do NOT modify mobile navigation behavior.
- Do NOT add dependencies or keyframe animations.
- Do NOT animate height, width, margin, padding, top, or left.
- If the cited control flow has changed since commit `510720b`, stop and report instead of improvising.

## Verification

- **Mechanical**: run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build`; all must exit 0.
- **Feel check**: at `http://127.0.0.1:5173/`, hover “研究” from a fresh reload and confirm the first panel fades in instead of appearing fully formed. Move across “能力 / 成果 / 场景” and confirm content crossfades without a flash. Leave and re-enter the navigation quickly and confirm stale panels do not reopen.
- **Keyboard check**: focus a navigation button and activate it; the panel remains immediate and accessible.
- **Reduced motion**: with `prefers-reduced-motion: reduce`, confirm the existing global rule reduces transition duration to `0.01ms`.
- **Done when**: initial open, group switch, close, and quick re-entry are all visually continuous with no bounce, layout movement, stale reopening, or one-frame flash.
