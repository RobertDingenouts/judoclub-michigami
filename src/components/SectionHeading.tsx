import type { ReactNode } from 'react';

interface SectionHeadingProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Consistent section heading used across all content sections.
 * Renders a red accent-rule + heading, optional icon, subtitle and a right-aligned action (e.g. "Alles →").
 */
export function SectionHeading({ icon, title, subtitle, action, className = '' }: SectionHeadingProps) {
  return (
    <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && (
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#c00000]/10 text-[#c00000]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="section-title text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
