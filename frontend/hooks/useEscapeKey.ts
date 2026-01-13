import { useEffect } from 'react';

/**
 * Custom hook to handle ESC key press
 * @param onEscape - Callback function to execute when ESC is pressed
 * @param isActive - Whether the hook should be active (default: true)
 */
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onEscape, isActive]);
}
