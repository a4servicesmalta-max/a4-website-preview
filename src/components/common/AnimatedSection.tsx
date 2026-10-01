import React from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Rises a beat later (as the old delayed variant did). */
  delay?: boolean;
}

/**
 * Section reveal on the A4 motion engine: the design's `rise`, fired by
 * FxRuntime when the block scrolls into view.
 */
export default function AnimatedSection({ children, className, delay = false }: AnimatedSectionProps) {
  return (
    <div data-fx="rise" data-d={delay ? 150 : undefined} className={className}>
      {children}
    </div>
  );
}
