/** Wraps keyboard Tab focus within an active dialog or navigation drawer. */
export const trapFocusOnTab = (
  event: KeyboardEvent,
  focusable: HTMLElement[],
  options?: { container?: HTMLElement | null; preventWhenEmpty?: boolean }
): void => {
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) {
    if (options?.preventWhenEmpty) event.preventDefault();
    return;
  }
  if (options?.container && !options.container.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
