// useKeyboardShortcuts Hook
// Global keyboard shortcuts for the application

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.isContentEditable;
    
    if (isInput && !event.ctrlKey && !event.metaKey) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for the ERP
export function useERPShorcuts() {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrl: true,
      action: () => {
        // Trigger search modal
        const searchInput = document.querySelector('[data-search-trigger]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Abrir búsqueda global'
    },
    {
      key: 'n',
      ctrl: true,
      action: () => {
        // Navigate to new item based on current page
        navigate(window.location.pathname + '/nuevo');
      },
      description: 'Nuevo elemento'
    },
    {
      key: 'Escape',
      action: () => {
        // Close modals
        const modal = document.querySelector('[data-modal]');
        if (modal) {
          const closeButton = modal.querySelector('[data-modal-close]') as HTMLButtonElement;
          closeButton?.click();
        }
      },
      description: 'Cerrar modal'
    },
    {
      key: '/',
      ctrl: true,
      action: () => {
        // Focus search
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Buscar'
    },
    {
      key: 'h',
      ctrl: true,
      action: () => navigate('/dashboard'),
      description: 'Ir a inicio'
    },
    {
      key: 'e',
      ctrl: true,
      action: () => navigate('/core/expedientes'),
      description: 'Ir a expedientes'
    },
    {
      key: 'c',
      ctrl: true,
      action: () => navigate('/comunicaciones/mensajes'),
      description: 'Ir a mensajes'
    },
    {
      key: 'p',
      ctrl: true,
      action: () => navigate('/portal'),
      description: 'Ir a portal cliente'
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

export default useKeyboardShortcuts;
