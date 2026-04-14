'use client';

import { useEffect, RefObject } from 'react';

const useOnClickOutside = (refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[], handler: () => void) => {
  useEffect(() => {
    const refArray = Array.isArray(refs) ? refs : [refs];

    const listener = (event: MouseEvent | TouchEvent) => {
      const isInside = refArray.some((ref) => ref.current && ref.current.contains(event.target as Node));
      if (!isInside) handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
};

export default useOnClickOutside;
