import { ReactNode } from "react";
import { DARK_GRID } from "@/components/fx/primitives";

type HeroBackgroundProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Dark hero backdrop in the A4 style: ink with the 64px grid and two indigo
 * radial glows (the design's drift-glow colour), replacing the old radial
 * texture images.
 */
const HeroBackground = ({ children, className = "" }: HeroBackgroundProps) => {
  return (
    <div className={`relative w-full h-full text-white overflow-hidden ${className}`} style={{ background: DARK_GRID, borderRadius: 24 }}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(520px 420px at 92% -6%, rgba(79,85,241,.30), rgba(79,85,241,0) 70%), radial-gradient(480px 380px at 0% 100%, rgba(79,85,241,.18), rgba(79,85,241,0) 70%)",
        }}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default HeroBackground;
