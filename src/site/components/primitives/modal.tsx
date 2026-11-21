'use client';

import { Dialog } from 'radix-ui';
import { useRef, type ComponentProps, type RefObject } from 'react';

type ModalContentProps = ComponentProps<typeof Dialog.Content> & {
  overlayClassName?: string;
  container?: HTMLElement | null;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/** Shared modal behavior; callers provide their existing layout and a Dialog.Title. */
export function ModalContent({
  children,
  className,
  overlayClassName,
  container,
  returnFocusRef,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ...props
}: ModalContentProps) {
  const openingElement = useRef<HTMLElement | null>(null);

  return (
    <Dialog.Portal container={container}>
      <Dialog.Overlay className={['ui-dialog-overlay', overlayClassName].filter(Boolean).join(' ')} />
      <Dialog.Content
        {...props}
        className={['ui-dialog-content', className].filter(Boolean).join(' ')}
        onOpenAutoFocus={(event) => {
          openingElement.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          onOpenAutoFocus?.(event);
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          if (event.defaultPrevented) return;
          const target = returnFocusRef?.current ?? openingElement.current;
          if (target?.isConnected && target !== document.body && !target.closest('[inert]')) {
            event.preventDefault();
            target.focus({ preventScroll: true });
          }
        }}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
