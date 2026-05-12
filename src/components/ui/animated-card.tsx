'use client';

import { motion, type Variants } from 'framer-motion';

/** Shared Framer Motion variants for micro-interactions — subtle, no springy feel. */
export const cardHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { type: 'tween', duration: 0.3 } },
  tap: { scale: 0.99, transition: { type: 'tween', duration: 0.15 } },
};

export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { type: 'tween', duration: 0.3 } },
  tap: { scale: 0.99, transition: { type: 'tween', duration: 0.15 } },
};

export const subtleHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.01, transition: { type: 'tween', duration: 0.3 } },
  tap: { scale: 0.99, transition: { type: 'tween', duration: 0.15 } },
};

/** Animated card wrapper with consistent hover/tap micro-interaction. */
export function AnimatedCard({
  className = '',
  children,
  onClick,
  layout = false,
  variants,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  layout?: boolean;
  variants?: Variants;
}) {
  const v = variants ?? cardHover;
  return (
    <motion.div
      className={className}
      onClick={onClick}
      layout={layout}
      whileHover="hover"
      whileTap="tap"
      initial="rest"
      animate="rest"
      variants={v}
    >
      {children}
    </motion.div>
  );
}

/** Animated button/link wrapper with hover/tap micro-interaction. */
export function AnimatedButton({
  className = '',
  children,
  onClick,
  as: AsTag = 'button',
  href,
  target,
  rel,
  download,
  variants,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  download?: boolean;
  variants?: Variants;
}) {
  const v = variants ?? buttonHover;
  if (AsTag === 'a') {
    return (
      <motion.a
        className={className}
        href={href}
        target={target}
        rel={rel}
        download={download}
        whileHover="hover"
        whileTap="tap"
        initial="rest"
        animate="rest"
        variants={v}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      className={className}
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      initial="rest"
      animate="rest"
      variants={v}
    >
      {children}
    </motion.button>
  );
}
