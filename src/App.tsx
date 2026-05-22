import { Routes, Route, Navigate, NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AlertCircle } from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import { initializePreferences, watchSystemTheme } from '@/store/usePreferencesStore'
import { LazyErrorBoundary } from '@/ui/ErrorBoundary'
import { ThemeSwitch } from '@/ui/ThemeSwitch'
import { LanguageSwitch } from '@/ui/LanguageSwitch'
import { t } from '@/locales'
import { normalizeLegacyHashRoute } from '@/utils/routes'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const UploadMerge = lazy(() => import('@/pages/UploadMerge'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Search = lazy(() => import('@/pages/Search'))
const Duplicates = lazy(() => import('@/pages/Duplicates'))
const AI = lazy(() => import('@/pages/AI'))
const Backup = lazy(() => import('@/pages/Backup'))

const appLinks = [
  { to: '/app/upload', labelKey: 'nav.upload' as const },
  { to: '/app/dashboard', labelKey: 'nav.dashboard' as const },
  { to: '/app/search', labelKey: 'nav.search' as const },
  { to: '/app/duplicates', labelKey: 'nav.duplicates' as const },
  { to: '/app/ai', labelKey: 'nav.ai' as const },
  { to: '/app/backup', labelKey: 'nav.backup' as const }
]

function AppHeader() {
  const { needsMerge } = useBookmarksStore()

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-header-bg backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-sky-400"
          >
            <span>Bookmarks Manager</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 overflow-x-auto text-sm" aria-label={t('aria.mainNav')}>
              {appLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-muted hover:bg-card-hover hover:text-foreground'
                    }`
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>
            <ThemeSwitch />
            <LanguageSwitch />
          </div>
        </div>
      </header>

      {needsMerge && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300" role="alert">
          <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">{t('alert.needsMerge')}</div>
            <NavLink
              to="/app/upload"
              className="rounded bg-amber-500/20 px-3 py-1 transition hover:bg-amber-500/30"
            >
              {t('alert.goMerge')}
            </NavLink>
          </div>
        </div>
      )}
    </>
  )
}

function AppContent() {
  const { loadFromDB } = useBookmarksStore()

  useEffect(() => {
    // Initialize preferences (theme & language)
    initializePreferences()
    const cleanup = watchSystemTheme()
    void loadFromDB()
    return cleanup
  }, [loadFromDB])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <LazyErrorBoundary>
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center gap-2 py-20 text-sm text-muted"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"
                  aria-hidden="true"
                />
                <span>{t('common.loading')}</span>
              </div>
            }
          >
            <Routes>
              <Route path="/app" element={<Navigate to="/app/upload" replace />} />
              <Route path="/app/upload" element={<UploadMerge />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/search" element={<Search />} />
              <Route path="/app/duplicates" element={<Duplicates />} />
              <Route path="/app/ai" element={<AI />} />
              <Route path="/app/backup" element={<Backup />} />
              <Route path="*" element={<Navigate to="/app/upload" replace />} />
            </Routes>
          </Suspense>
        </LazyErrorBoundary>
      </main>
    </div>
  )
}

function LegacyRedirectHandler() {
  const location = useLocation()

  useEffect(() => {
    const normalizedHash = normalizeLegacyHashRoute(window.location.hash)
    if (normalizedHash) {
      window.location.hash = normalizedHash
    }
  }, [location])

  return null
}

export default function App() {
  return (
    <>
      <LegacyRedirectHandler />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-background">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
                </div>
              }
            >
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/app/*" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
