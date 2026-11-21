import { useCallback, useEffect, useRef, useState } from 'react';

import type { NavigationGroup } from '../../data/research-navigation';

const MENU_CONTENT_SWAP_DELAY_MS = 180;
const MENU_OPEN_HOVER_DELAY_MS = 280;
const MENU_CLOSE_HOVER_DELAY_MS = 240;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

const getFocusableItems = (container: HTMLElement | null): HTMLElement[] =>
  Array.from(container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) || []).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      !element.closest('[aria-hidden="true"]') &&
      element.getClientRects().length > 0
  );

export function useNavigationMenus(visibleNavigationGroups: NavigationGroup[]) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<string | null>(null);
  const [panelGroup, setPanelGroup] = useState<NavigationGroup | null>(null);
  const [panelContentVisible, setPanelContentVisible] = useState(true);
  const [pendingFocusGroup, setPendingFocusGroup] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const desktopTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const restoringDesktopFocusRef = useRef(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const contentSwapTimerRef = useRef<number | null>(null);
  const contentFrameRef = useRef<number | null>(null);

  const clearInteractionTimers = useCallback(() => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }, []);

  const clearContentTransition = useCallback(() => {
    if (contentSwapTimerRef.current !== null) window.clearTimeout(contentSwapTimerRef.current);
    if (contentFrameRef.current !== null) window.cancelAnimationFrame(contentFrameRef.current);
    contentSwapTimerRef.current = null;
    contentFrameRef.current = null;
  }, []);

  const revealPanelContent = () => {
    contentFrameRef.current = window.requestAnimationFrame(() => {
      contentFrameRef.current = window.requestAnimationFrame(() => {
        setPanelContentVisible(true);
        contentFrameRef.current = null;
      });
    });
  };

  const activateGroup = (groupId: string, trigger: HTMLAnchorElement, focusFirstLink = false) => {
    if (restoringDesktopFocusRef.current) return;
    const nextGroup = visibleNavigationGroups.find((group) => group.id === groupId);
    if (!nextGroup) return;

    clearInteractionTimers();
    desktopTriggerRef.current = trigger;
    setPendingFocusGroup(focusFirstLink ? groupId : null);
    if (focusFirstLink) {
      clearContentTransition();
      setPanelGroup(nextGroup);
      setPanelContentVisible(true);
      setOpenGroup(groupId);
      return;
    }
    if (openGroup && panelGroup && panelGroup.id !== groupId) {
      clearContentTransition();
      setPanelContentVisible(false);
      contentSwapTimerRef.current = window.setTimeout(() => {
        setPanelGroup(nextGroup);
        contentSwapTimerRef.current = null;
        revealPanelContent();
      }, MENU_CONTENT_SWAP_DELAY_MS);
    } else {
      clearContentTransition();
      setPanelGroup(nextGroup);
      setPanelContentVisible(true);
      if (!panelGroup) {
        contentFrameRef.current = window.requestAnimationFrame(() => {
          contentFrameRef.current = window.requestAnimationFrame(() => {
            setOpenGroup(groupId);
            contentFrameRef.current = null;
          });
        });
        return;
      }
    }
    setOpenGroup(groupId);
  };

  const scheduleOpen = (groupId: string, trigger: HTMLAnchorElement) => {
    clearInteractionTimers();
    if (openGroup === groupId) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      activateGroup(groupId, trigger);
    }, MENU_OPEN_HOVER_DELAY_MS);
  };

  const cancelScheduledOpen = () => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };

  const closeDesktopMenu = useCallback(() => {
    clearInteractionTimers();
    clearContentTransition();
    desktopTriggerRef.current = null;
    setPendingFocusGroup(null);
    setPanelContentVisible(true);
    setOpenGroup(null);
  }, [clearContentTransition, clearInteractionTimers]);

  const scheduleClose = () => {
    clearInteractionTimers();
    closeTimerRef.current = window.setTimeout(closeDesktopMenu, MENU_CLOSE_HOVER_DELAY_MS);
  };

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  useEffect(() => {
    if (!pendingFocusGroup || openGroup !== pendingFocusGroup || panelGroup?.id !== pendingFocusGroup) return;
    const panel = navRef.current?.querySelector<HTMLElement>('#desktop-menu-panel') ?? null;
    getFocusableItems(panel)[0]?.focus({ preventScroll: true });
    setPendingFocusGroup(null);
  }, [openGroup, panelGroup, pendingFocusGroup]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Modal Escape and focus behavior belong to the topmost Radix dialog.
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('[role="dialog"]')))
        return;
      if (event.key === 'Escape') {
        const desktopTrigger = desktopTriggerRef.current;
        closeDesktopMenu();
        if (!menuOpen && desktopTrigger) {
          event.preventDefault();
          restoringDesktopFocusRef.current = true;
          desktopTrigger.focus({ preventScroll: true });
          restoringDesktopFocusRef.current = false;
        }
        return;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeDesktopMenu();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      clearInteractionTimers();
      clearContentTransition();
    };
  }, [menuOpen, clearContentTransition, clearInteractionTimers, closeDesktopMenu]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const closeMobileOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    closeMobileOnDesktop();
    desktop.addEventListener('change', closeMobileOnDesktop);
    return () => desktop.removeEventListener('change', closeMobileOnDesktop);
  }, []);

  return {
    menuOpen,
    setMenuOpen,
    openGroup,
    mobileOpenGroup,
    setMobileOpenGroup,
    panelGroup,
    panelContentVisible,
    navRef,
    mobileMenuButtonRef,
    activateGroup,
    scheduleOpen,
    cancelScheduledOpen,
    closeDesktopMenu,
    scheduleClose,
    cancelScheduledClose,
  };
}
