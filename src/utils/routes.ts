export function normalizeLegacyHashRoute(hash: string): string | null {
  if (!hash || !hash.startsWith('#/') || hash === '#/' || hash.startsWith('#/app/')) {
    return null
  }

  const legacyPath = hash.replace('#/', '')
  const normalizedPath = legacyPath.startsWith('/') ? legacyPath : `/${legacyPath}`
  return `#/app${normalizedPath}`
}
