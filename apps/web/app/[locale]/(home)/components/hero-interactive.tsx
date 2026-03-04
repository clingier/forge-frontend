"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DecryptText } from "./decrypt-text";

const ForgeBackgroundLazy = dynamic(
  () =>
    import("./forge-background").then((mod) => ({
      default: mod.ForgeBackground,
    })),
  { ssr: false },
);

type HeroInteractiveProps = {
  /** Content above the title (e.g. blog announcement) */
  announcement?: React.ReactNode;
  /** CTA buttons below the title */
  actions?: React.ReactNode;
  /** Subtitle / description text */
  description: string;
};

export function HeroInteractive({
  announcement,
  actions,
  description,
}: HeroInteractiveProps) {
  const [hovered, setHovered] = useState(false);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);
  // Touch: tap toggles
  const handleTap = useCallback(() => setHovered((h) => !h), []);

  return (
    <div className="relative w-full overflow-hidden">
      <ForgeBackgroundLazy morph={hovered ? 1 : 0} />
      <div className="container relative z-10 mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
          {announcement}
          <div
            className="flex flex-col gap-4 cursor-pointer"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onTouchStart={handleTap}
          >
            <h1 className="max-w-2xl text-center font-regular text-5xl tracking-tighter md:text-7xl">
              <DecryptText
                textA="Everything is data"
                textB="Forge materializes it"
                active={hovered}
              />
            </h1>
            <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
              {description}
            </p>
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}
