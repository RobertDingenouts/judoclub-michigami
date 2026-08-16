import type { ReactNode } from 'react';

interface SectionHeadingProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Optional Japanese kanji accent shown vertically at the right edge (e.g. 柔道) */
  kanji?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Consistent section heading used across all content sections.
 * Renders a shu accent-rule + heading, optional icon, subtitle,
 * an optional vertical kanji accent, and a right-aligned action (e.g. "Alles →").
 */
export function SectionHeading({ icon, title, subtitle, kanji, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={`relative flex items-start justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && (
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#c00000]/10 text-[#c00000] ring-1 ring-[#c00000]/10">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="section-title text-xl font-bold leading-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-[#6b6155]">{subtitle}</p>}
        </div>
      </div>

      {/* Vertical kanji accent — classical right-side placement */}
      {kanji && (
        <span
          aria-hidden
          className="absolute -top-3 right-0 hidden sm:block text-vertical font-mincho text-2xl leading-none text-[#a90000]/15 select-none pointer-events-none"
        >
          {kanji}
        </span>
      )}

      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
