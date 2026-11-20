import { useCallback, useEffect, useRef, useState } from 'react';

import type { NavigationGroup } from '../../data/research-navigation';
import { trapFocusOnTab } from './focus-trap';

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

  const navRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
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

  const activateGroup = (groupId: string) => {
    const nextGroup = visibleNavigationGroups.find((group) => group.id === groupId);
    if (!nextGroup) return;

    clearInteractionTimers();
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

  const scheduleOpen = (groupId: string) => {
    clearInteractionTimers();
    if (openGroup === groupId) return;
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      activateGroup(groupId);
    }, MENU_OPEN_HOVER_DELAY_MS);
  };

  const cancelScheduledOpen = () => {
    if (openTimerRef.current !== null) window.clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };

  const closeDesktopMenu = useCallback(() => {
    clearInteractionTimers();
    clearContentTransition();
    setPanelContentVisible(true);
    setOpenGroup(null);
  }, [clearContentTransition, clearInteractionTimers]);

  const scheduleClose = () => {
    clearInteractionTimers();
    clearContentTransition();
    closeTimerRef.current = window.setTimeout(() => setOpenGroup(null), MENU_CLOSE_HOVER_DELAY_MS);
  };

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const toggleMobileMenu = () => {
    setMobileOpenGroup(null);
    setMenuOpen((value) => !value);
  };

  useEffect(() => {
    const mobileNavigation = mobileNavigationRef.current;
    const shell = navRef.current?.parentElement;
    const inertTargets = shell
      ? Array.from(shell.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== navRef.current && element !== mobileNavigation
        )
      : [];
    const previousInert = inertTargets.map((element) => [element, element.inert] as const);
    let focusFrame: number | null = null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        closeDesktopMenu();
        return;
      }

      if (!menuOpen || event.key !== 'Tab') return;
      trapFocusOnTab(event, getFocusableItems(mobileNavigation), {
        container: mobileNavigation,
        preventWhenEmpty: true,
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) closeDesktopMenu();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    if (menuOpen) {
      document.body.classList.add('menu-is-open');
      inertTargets.forEach((element) => {
        element.inert = true;
      });
      focusFrame = window.requestAnimationFrame(() => {
        const first = getFocusableItems(mobileNavigation)[0];
        first?.focus({ preventScroll: true });
        focusFrame = null;
      });
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.body.classList.remove('menu-is-open');
      if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
      previousInert.forEach(([element, wasInert]) => {
        element.inert = wasInert;
      });
      if (menuOpen) mobileMenuButtonRef.current?.focus({ preventScroll: true });
      clearInteractionTimers();
      clearContentTransition();
    };
  }, [menuOpen, clearContentTransition, clearInteractionTimers, closeDesktopMenu]);

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
    mobileNavigationRef,
    activateGroup,
    scheduleOpen,
    cancelScheduledOpen,
    closeDesktopMenu,
    scheduleClose,
    cancelScheduledClose,
    toggleMobileMenu,
  };
}
