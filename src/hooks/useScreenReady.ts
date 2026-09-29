import { useEffect, useState } from 'react';

/** Simule un chargement initial pour afficher les skeletons. */
export function useScreenReady(delayMs = 650) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return ready;
}
