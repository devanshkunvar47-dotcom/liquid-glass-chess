import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  strong?: boolean;
  hover?: boolean;
  className?: string;
  padded?: boolean;
}

export function GlassCard({
  children,
  strong = false,
  hover = false,
  className = '',
  padded = true,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={[
        'glass',
        strong ? 'glass-strong' : '',
        hover ? 'glass-hover' : '',
        padded ? 'p-4' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
