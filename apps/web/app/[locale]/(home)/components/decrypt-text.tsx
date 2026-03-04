"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+{}|:<>?";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

type DecryptTextProps = {
  /** Text when not hovered */
  textA: string;
  /** Text when hovered */
  textB: string;
  /** Whether the hover state is active */
  active: boolean;
  className?: string;
  /** Class for scrambled (unresolved) characters */
  scrambledClassName?: string;
};

export function DecryptText({
  textA,
  textB,
  active,
  className,
  scrambledClassName = "text-[#8a8680]",
}: DecryptTextProps) {
  const [display, setDisplay] = useState<
    { char: string; resolved: boolean }[]
  >(() => [...textA].map((c) => ({ char: c, resolved: true })));

  const rafRef = useRef(0);
  const tickRef = useRef(0);

  const animate = useCallback(
    (target: string) => {
      // Cancel any in-progress animation
      cancelAnimationFrame(rafRef.current);
      tickRef.current = 0;

      const maxLen = Math.max(target.length, display.length);
      const speed = 18; // ms per tick
      const revealEvery = 2; // reveal one char every N ticks
      let resolvedCount = 0;
      let lastTime = 0;

      const step = (time: number) => {
        if (time - lastTime < speed) {
          rafRef.current = requestAnimationFrame(step);
          return;
        }
        lastTime = time;
        tickRef.current++;

        // Every `revealEvery` ticks, lock in the next character
        if (tickRef.current % revealEvery === 0 && resolvedCount < target.length) {
          resolvedCount++;
        }

        const newDisplay: { char: string; resolved: boolean }[] = [];
        for (let i = 0; i < target.length; i++) {
          if (i < resolvedCount) {
            newDisplay.push({ char: target[i], resolved: true });
          } else {
            newDisplay.push({ char: randomChar(), resolved: false });
          }
        }
        setDisplay(newDisplay);

        if (resolvedCount < target.length) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [display.length],
  );

  // Track previous active state to only animate on change
  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (prevActiveRef.current !== active) {
      prevActiveRef.current = active;
      animate(active ? textB : textA);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, textA, textB, animate]);

  return (
    <span className={className} aria-label={active ? textB : textA}>
      {display.map((item, i) => (
        <span
          key={i}
          className={item.resolved ? undefined : scrambledClassName}
        >
          {item.char}
        </span>
      ))}
    </span>
  );
}
