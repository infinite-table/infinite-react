import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll,
} from 'body-scroll-lock';
import { usePathname } from 'next/navigation';
import * as React from 'react';

/**
 * Menu toggle that enables body scroll locking (for
 * iOS Mobile and Tablet, Android, desktop Safari/Chrome/Firefox)
 * without breaking scrolling of a target
 * element.
 */
export const useMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLElement>(null);

  const pathname = usePathname();

  const showSidebar = React.useCallback(() => {
    setIsOpen(true);
    if (menuRef.current != null) {
      disableBodyScroll(menuRef.current);
    }
  }, []);

  const hideSidebar = React.useCallback(() => {
    setIsOpen(false);
    if (menuRef.current != null) {
      enableBodyScroll(menuRef.current);
    }
  }, []);

  const toggleOpen = React.useCallback(() => {
    if (isOpen) {
      hideSidebar();
    } else {
      showSidebar();
    }
  }, [showSidebar, hideSidebar, isOpen]);

  React.useEffect(() => {
    hideSidebar();
    return () => {
      clearAllBodyScrollLocks();
    };
  }, [pathname, hideSidebar]);

  return {
    hideSidebar,
    showSidebar,
    toggleOpen,
    menuRef,
    isOpen,
  };
};

export const MenuContext = React.createContext<ReturnType<typeof useMenu>>(
  {} as ReturnType<typeof useMenu>,
);

export function MenuProvider(props: { children: React.ReactNode }) {
  return <MenuContext.Provider value={useMenu()} {...props} />;
}
