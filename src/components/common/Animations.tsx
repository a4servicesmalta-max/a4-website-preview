"use client";

import React from "react";
import type { HTMLMotionProps, motion } from "framer-motion";

/**
 * Legacy entrance wrappers, now on the A4 motion engine.
 *
 * They used to drive framer-motion fades. Every one of them now renders a
 * plain element carrying the design's `data-fx="rise"` (lift + blur + fade,
 * 700ms expo-out) — FxRuntime binds and fires it on scroll, and handles
 * reduced motion centrally. Names and props are unchanged so remaining
 * callers keep working; framer-only props are dropped.
 */

const MOTION_ONLY = new Set([
  "initial",
  "animate",
  "exit",
  "variants",
  "transition",
  "whileHover",
  "whileTap",
  "whileFocus",
  "whileDrag",
  "whileInView",
  "viewport",
  "layout",
  "layoutId",
  "layoutDependency",
  "layoutScroll",
  "custom",
  "onAnimationStart",
  "onAnimationComplete",
  "onUpdate",
  "onLayoutAnimationStart",
  "onLayoutAnimationComplete",
  "onViewportEnter",
  "onViewportLeave",
  "onHoverStart",
  "onHoverEnd",
  "onTap",
  "onTapStart",
  "onTapCancel",
  "onPan",
  "onPanStart",
  "onPanEnd",
  "onDrag",
  "onDragStart",
  "onDragEnd",
  "drag",
  "dragConstraints",
  "dragElastic",
  "dragMomentum",
  "transformTemplate",
]);

const domProps = (props: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(props)) if (!MOTION_ONLY.has(k)) out[k] = props[k];
  // A motion `style` may hold MotionValues; plain objects pass straight through.
  return out;
};

interface AnimationProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  /** Seconds, as before. */
  delay?: number;
  duration?: number;
  viewportMargin?: string;
  once?: boolean;
  as?: keyof typeof motion;
}

type Tag = keyof React.JSX.IntrinsicElements;

function Rise({
  children,
  className,
  delay = 0,
  as = "div",
  rest,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: string;
  rest: Record<string, unknown>;
}) {
  const Element = (as || "div") as Tag;
  const d = Math.max(0, Math.round((delay || 0) * 1000));
  return React.createElement(
    Element,
    { ...domProps(rest), className, "data-fx": "rise", "data-d": d || undefined },
    children
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */

// 1. Fade In Up — the design's rise.
export const FadeInUp = ({ children, className = "", delay = 0, duration, viewportMargin, once, as = "div", ...props }: AnimationProps) => (
  <Rise className={className} delay={delay} as={as as string} rest={props as Record<string, unknown>}>
    {children}
  </Rise>
);

// 2. Fade In Left — the design has no sideways entrances; it rises.
export const FadeInLeft = ({ children, className = "", delay = 0, duration, viewportMargin, once, as = "div", ...props }: AnimationProps) => (
  <Rise className={className} delay={delay} as={as as string} rest={props as Record<string, unknown>}>
    {children}
  </Rise>
);

// 3. Fade In Right — rises, like the rest.
export const FadeInRight = ({ children, className = "", delay = 0, duration, viewportMargin, once, as = "div", ...props }: AnimationProps) => (
  <Rise className={className} delay={delay} as={as as string} rest={props as Record<string, unknown>}>
    {children}
  </Rise>
);

// 4. Zoom In — rises as well (the engine's `zoom` is a per-word effect).
export const ZoomIn = ({ children, className = "", delay = 0, duration, viewportMargin, once, as = "div", ...props }: AnimationProps) => (
  <Rise className={className} delay={delay} as={as as string} rest={props as Record<string, unknown>}>
    {children}
  </Rise>
);

// 5. Stagger Container — a plain wrapper; its children carry their own rise.
interface StaggerProps extends AnimationProps {
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay,
  delay,
  duration,
  viewportMargin,
  once,
  as = "div",
  ...props
}: StaggerProps) => React.createElement((as || "div") as Tag, { ...domProps(props as Record<string, unknown>), className }, children);

// 6. Generic Directional Component — rises; framer props are ignored.
interface DirectionalProps extends HTMLMotionProps<"div"> {
  as?: string;
  viewportMargin?: string;
}

export const DirectionalDiv = ({ children, viewportMargin, as = "div", ...props }: DirectionalProps) => (
  <Rise as={as} className={props.className} rest={props as Record<string, unknown>}>
    {children as React.ReactNode}
  </Rise>
);

/* eslint-enable @typescript-eslint/no-unused-vars */
