'use client';

import { motion, type Variants } from 'framer-motion';

/** Shared Framer Motion variants for micro-interactions. */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.03, y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.97, transition: { type: 'spring', stiffness: 400 } },
};

export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.03, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  tap: { scale: 0.97, transition: { type: 'spring', stiffness: 400 } },
};

export const subtleHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  tap: { scale: 0.98 },
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
