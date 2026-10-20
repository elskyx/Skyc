"use client";

import * as React from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RandomLetterSwapProps extends React.ComponentPropsWithoutRef<"span"> {
  label: string;
  staggerDuration?: number;
  transition?: Transition;
  reverse?: boolean;
  className?: string;
}

export function RandomLetterSwap({
  label,
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
  reverse = false,
  className,
  ...props
}: RandomLetterSwapProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Generate a stable randomized order for staggering the characters
  const randomOrder = React.useMemo(() => {
    const indices = Array.from({ length: label.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }, [label]);

  return (
    <span
      className={cn(
        "relative inline-flex items-center overflow-hidden cursor-pointer select-none",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="inline-flex">
        {label.split("").map((char, index) => {
          if (char === " ") {
            return (
              <span key={index} className="inline-block whitespace-pre">
                {" "}
              </span>
            );
          }
          const orderIndex = randomOrder.indexOf(index);
          const delay = orderIndex * staggerDuration;

          return (
            <span
              key={index}
              className="relative inline-flex flex-col overflow-hidden h-[1.3em] leading-none"
            >
              <motion.span
                animate={{ y: isHovered ? (reverse ? "100%" : "-100%") : "0%" }}
                transition={{ ...transition, delay }}
                className="inline-block"
              >
                {char}
              </motion.span>
              <motion.span
                animate={{ y: isHovered ? (reverse ? "100%" : "-100%") : "0%" }}
                transition={{ ...transition, delay }}
                className="absolute left-0 inline-block"
                style={{ top: reverse ? "-100%" : "100%" }}
              >
                {char}
              </motion.span>
            </span>
          );
        })}
      </span>
    </span>
  );
}

export default RandomLetterSwap;
