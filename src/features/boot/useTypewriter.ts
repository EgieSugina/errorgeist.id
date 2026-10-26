import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/reducedMotion';

/** Target pace; shortened automatically so the whole script fits the budget. */
const MS_PER_CHAR = 25;
/** Total typing time never exceeds this, however long the script is. */
const TYPING_BUDGET_MS = 3800;
const MIN_TICK_MS = 4;

export type TypewriterResult = {
  /** One entry per line; a line is partially typed while it is the active one. */
  shown: string[];
  /** Index of the line currently being typed (lines.length once finished). */
  active: number;
  done: boolean;
  /** True when typing is skipped because the visitor prefers reduced motion. */
  reduced: boolean;
};

function slice(lines: string[], steps: number): Omit<TypewriterResult, 'reduced'> {
  // Each line costs its length plus one step for the "enter" keypress.
  let left = steps;
  const shown: string[] = [];
  let active = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i]!;
    if (left >= text.length + 1) {
      shown.push(text);
      left -= text.length + 1;
    } else {
      shown.push(text.slice(0, Math.max(left, 0)));
      if (active === lines.length) active = i;
      left = 0;
    }
  }
  return { shown, active, done: active === lines.length };
}

/**
 * Types `lines` out one character at a time. `instantLines` leading lines are
 * shown in full from the first render (the terminal banner). Under reduced
 * motion everything is shown at once.
 */
export function useTypewriter(lines: string[], instantLines = 0): TypewriterResult {
  const [reduce] = useState(prefersReducedMotion);
  const total = lines.reduce((n, l, i) => (i < instantLines ? n : n + l.length + 1), 0);
  const instant = lines.slice(0, instantLines).reduce((n, l) => n + l.length + 1, 0);
  const [steps, setSteps] = useState(instant);

  const typingDone = reduce || steps >= instant + total;

  useEffect(() => {
    if (typingDone) return undefined;
    const tick = Math.max(MIN_TICK_MS, Math.min(MS_PER_CHAR, TYPING_BUDGET_MS / Math.max(total, 1)));
    const id = setInterval(() => setSteps((s) => s + 1), tick);
    return () => clearInterval(id);
  }, [typingDone, total]);

  return { ...slice(lines, reduce ? Number.MAX_SAFE_INTEGER : steps), reduced: reduce };
}
