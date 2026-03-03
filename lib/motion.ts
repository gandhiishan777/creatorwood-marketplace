export const MOTION = {
  spring: { type: "spring" as const, stiffness: 300, damping: 25 },
  duration: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
  stagger: 0.04,
} as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: MOTION.duration,
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: MOTION.duration,
} as const;

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: MOTION.spring,
} as const;
