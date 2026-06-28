import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  /** Entrance stagger index. */
  delay?: number
  as?: 'section' | 'div' | 'article'
  ariaLabel?: string
}

/**
 * Frosted dashboard tile with a subtle staggered entrance. The `.card` class
 * (see index.css) carries the adaptive surface/border colors.
 */
export function Card({ children, className = '', delay = 0, as = 'section', ariaLabel }: CardProps) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      aria-label={ariaLabel}
      className={`card p-5 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </MotionTag>
  )
}

interface CardTitleProps {
  icon?: ReactNode
  children: ReactNode
}

export function CardTitle({ icon, children }: CardTitleProps) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted uppercase">
      {icon}
      {children}
    </h2>
  )
}
