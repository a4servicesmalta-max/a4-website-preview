import React from "react";
import { DARK_GRID, LIGHT_GLOW } from "@/components/fx/primitives";
import { cn } from "@/lib/utils";

interface GradientContainerProps {
  children?: React.ReactNode;
  className?: string;
  /** Corner radius; default follows the design's 24/28px cards. Use `rounded-none` for flush edges. */
  roundedClassName?: string;
  /** Indigo radial glows in two corners (the design's glow colour). */
  showRadials?: boolean;
  /** Kept for compatibility — the A4 surfaces carry no grain. */
  showNoise?: boolean;
  /** Tailwind background class. Dark classes render the ink grid, light ones the light glow. */
  backgroundColor?: string;
  /** Kept for compatibility — glows are CSS now, not images. */
  radialImage?: string;
  radialOpacity?: number;
  topLeftRotation?: string;
  bottomRightRotation?: string;
  leftPositionClass?: string;
  rightPositionClass?: string;
}

const LIGHT_RE = /(^|\s)bg-(white|section-light|section-bg-light|background|background-secondary|icon|zinc-50|zinc-100|gray-50|gray-100|slate-50|\[#[fF])/;

/**
 * Legacy rounded panel, restyled onto the A4 surfaces: dark callers get the
 * ink grid (`DARK_GRID`) with indigo corner glows, light callers the light
 * glow. Transparent callers stay transparent.
 */
const GradientContainer = ({
  children,
  className = "",
  roundedClassName = "rounded-[24px] md:rounded-[28px]",
  showRadials = true,
  backgroundColor,
  radialOpacity,
}: GradientContainerProps) => {
  const bgClass = backgroundColor ?? "bg-primary";
  const probe = `${bgClass} ${className}`;
  const tone: "none" | "light" | "dark" =
    backgroundColor === "" || /(^|\s)bg-transparent(\s|$)/.test(probe) ? "none" : LIGHT_RE.test(probe) ? "light" : "dark";
  const glow = radialOpacity ?? (tone === "dark" ? 0.28 : 0.12);

  return (
    <div
      className={cn("relative w-full overflow-hidden", tone === "none" ? bgClass : "", roundedClassName, className)}
      style={tone === "none" ? undefined : { background: tone === "dark" ? DARK_GRID : LIGHT_GLOW, color: tone === "dark" ? "#FFFFFF" : undefined }}
    >
      {showRadials && tone !== "none" ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{
            background: `radial-gradient(560px 440px at 0% 0%, rgba(79,85,241,${glow}), rgba(79,85,241,0) 70%), radial-gradient(560px 440px at 100% 100%, rgba(79,85,241,${glow * 0.7}), rgba(79,85,241,0) 70%)`,
          }}
        />
      ) : null}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default GradientContainer;
