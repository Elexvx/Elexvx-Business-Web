import { afterEach, describe, expect, it, vi } from 'vitest';
import { trapFocusOnTab } from '../src/site/components/focus-trap';

type MockFocusable = HTMLElement & { focus: ReturnType<typeof vi.fn> };

function createFocusNode(): MockFocusable {
  return { focus: vi.fn() } as unknown as MockFocusable;
}

function createTabEvent(shiftKey = false): KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> } {
  return {
    shiftKey,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('trapFocusOnTab', () => {
  it('handles empty focusable lists according to preventWhenEmpty', () => {
    vi.stubGlobal('document', { activeElement: null });

    const allowTabEvent = createTabEvent(false);
    trapFocusOnTab(allowTabEvent, []);
    expect(allowTabEvent.preventDefault).not.toHaveBeenCalled();

    const preventTabEvent = createTabEvent(false);
    trapFocusOnTab(preventTabEvent, [], { preventWhenEmpty: true });
    expect(preventTabEvent.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('recovers focus into the container when activeElement is outside', () => {
    const first = createFocusNode();
    const last = createFocusNode();
    const outside = createFocusNode();
    const container = { contains: (node: Node | null) => node === first || node === last } as unknown as HTMLElement;

    vi.stubGlobal('document', { activeElement: outside });

    const forwardEvent = createTabEvent(false);
    trapFocusOnTab(forwardEvent, [first, last], { container });
    expect(forwardEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(first.focus).toHaveBeenCalledTimes(1);
    expect(last.focus).not.toHaveBeenCalled();

    const reverseEvent = createTabEvent(true);
    trapFocusOnTab(reverseEvent, [first, last], { container });
    expect(reverseEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(last.focus).toHaveBeenCalledTimes(1);
  });

  it('wraps forward Tab from last to first and reverse Shift+Tab from first to last', () => {
    const first = createFocusNode();
    const middle = createFocusNode();
    const last = createFocusNode();

    vi.stubGlobal('document', { activeElement: last });
    const forwardWrap = createTabEvent(false);
    trapFocusOnTab(forwardWrap, [first, middle, last]);
    expect(forwardWrap.preventDefault).toHaveBeenCalledTimes(1);
    expect(first.focus).toHaveBeenCalledTimes(1);

    vi.stubGlobal('document', { activeElement: first });
    const reverseWrap = createTabEvent(true);
    trapFocusOnTab(reverseWrap, [first, middle, last]);
    expect(reverseWrap.preventDefault).toHaveBeenCalledTimes(1);
    expect(last.focus).toHaveBeenCalledTimes(1);
  });

  it('wraps a single focusable element in both directions and leaves middle elements untouched', () => {
    const only = createFocusNode();
    vi.stubGlobal('document', { activeElement: only });

    const forwardSingle = createTabEvent(false);
    trapFocusOnTab(forwardSingle, [only]);
    expect(forwardSingle.preventDefault).toHaveBeenCalledTimes(1);

    const reverseSingle = createTabEvent(true);
    trapFocusOnTab(reverseSingle, [only]);
    expect(reverseSingle.preventDefault).toHaveBeenCalledTimes(1);
    expect(only.focus).toHaveBeenCalledTimes(2);

    const first = createFocusNode();
    const middle = createFocusNode();
    const last = createFocusNode();
    vi.stubGlobal('document', { activeElement: middle });

    const middleTab = createTabEvent(false);
    trapFocusOnTab(middleTab, [first, middle, last]);
    expect(middleTab.preventDefault).not.toHaveBeenCalled();
    expect(first.focus).not.toHaveBeenCalled();
    expect(last.focus).not.toHaveBeenCalled();
  });
});
