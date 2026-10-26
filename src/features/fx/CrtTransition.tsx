import { useEffect, useRef } from 'react';

/**
 * TEMPORARY STUB (Task 7). Task 8 replaces the internals (CRT-off shader with a
 * CSS fallback) and keeps this export and its props.
 */
export function CrtTransition({ onDone }: { onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const id = setTimeout(() => onDoneRef.current(), 600);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: '#000' }}
    />
  );
}
