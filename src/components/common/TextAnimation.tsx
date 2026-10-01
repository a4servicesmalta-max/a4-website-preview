import React from "react";

interface TextAnimationProps {
  text: string;
  className?: string;
  /** Seconds before the first word rises. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  once?: boolean;
}

/**
 * Word-by-word heading reveal, now the A4 engine's `words` effect: each word
 * rises (lift + blur + fade, expo-out) in sequence when the heading scrolls
 * into view. Bound by FxRuntime; reduced motion is handled there.
 */
export const TextAnimation = ({ text, className, delay = 0, as = "h2" }: TextAnimationProps) => {
  const Tag = as;
  const words = String(text ?? "").split(" ");
  return (
    <Tag className={className} data-fx="words" data-d={delay ? Math.round(delay * 1000) : undefined} data-stagger={60}>
      {words.map((word, index) => (
        <React.Fragment key={index}>
          {index > 0 ? " " : null}
          <span data-w="" style={{ display: "inline-block" }}>
            {word}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default TextAnimation;
