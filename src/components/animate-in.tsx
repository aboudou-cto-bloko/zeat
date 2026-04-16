"use client";

import { motion } from "motion/react";

// Easing tokens (from motion-design skill)
const EASE_OUT_EXPO  = [0.19, 1, 0.22, 1] as const;   // hero mounts
const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const; // scroll reveals

// ── Above-fold: animates on mount (hero elements) ─────────────────────────────
export function AnimateMount({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Below-fold: animates when scrolled into view ───────────────────────────────
export function AnimateIn({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE_OUT_QUART, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Hero phone: slides in from the right with a subtle perspective ─────────────
export function AnimatePhone({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: 4 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.95, ease: EASE_OUT_EXPO, delay: 0.18 }}
      style={{ transformPerspective: 1400 }}
    >
      {children}
    </motion.div>
  );
}
