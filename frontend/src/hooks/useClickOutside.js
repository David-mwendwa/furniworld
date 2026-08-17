import { useEffect } from 'react';

/** Fires `onOutside` on a pointer down outside `ref.current`, and on Escape —
 * the two ways a dropdown or popover is normally dismissed. */
export const useClickOutside = (ref, onOutside, active = true) => {
  useEffect(() => {
    if (!active) return;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onOutside();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [ref, onOutside, active]);
};
