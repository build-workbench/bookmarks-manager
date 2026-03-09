const TRACK_PREFIX = 'utm_'
const TRACK_KEYS = ['gclid','fbclid','igshid','spm','ck_sub_id']

export function normalizeUrl(u: string): string {
  try {
    const url = new URL(u)
    const protocol = url.protocol.toLowerCase()
    const hostname = url.hostname.toLowerCase()
    let port = url.port
    if ((protocol === 'http:' && port === '80') || (protocol === 'https:' && port === '443')) port = ''
    const params = new URLSearchParams(url.search)
    const keys = Array.from(params.keys())
    for (const k of keys) {
      const lower = k.toLowerCase()
      if (lower.startsWith(TRACK_PREFIX) || TRACK_KEYS.includes(lower)) params.delete(k)
    }
    const sorted = new URLSearchParams()
    Array.from(params.keys()).sort().forEach(k => sorted.set(k, params.get(k) || ''))
    let pathname = url.pathname || '/'
    if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1)
    const s = sorted.toString()
    const out = protocol + '//' + hostname + (port ? ':' + port : '') + pathname + (s ? '?' + s : '')
    return out
  } catch {
    return u.trim()
  }
}

export function getHostname(u: string): string {
  try { return new URL(u).hostname.toLowerCase() } catch { return '' }
}
