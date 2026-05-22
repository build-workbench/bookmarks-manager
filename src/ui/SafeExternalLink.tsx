import type { ReactNode } from 'react'
import { getSafeExternalHref } from '@/utils/url'

interface SafeExternalLinkProps {
  href: string
  children: ReactNode
  className?: string
  unsafeClassName?: string
  ariaLabel?: string
  title?: string
}

export function SafeExternalLink({
  href,
  children,
  className,
  unsafeClassName,
  ariaLabel,
  title
}: SafeExternalLinkProps) {
  const safeHref = getSafeExternalHref(href)

  if (!safeHref) {
    return (
      <span aria-label={ariaLabel} className={unsafeClassName ?? className} title={title}>
        {children}
      </span>
    )
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      title={title}
    >
      {children}
    </a>
  )
}
