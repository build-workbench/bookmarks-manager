import { Link } from 'react-router-dom'
import { BookMarked, ArrowRight } from 'lucide-react'
import { ThemeSwitch } from '@/ui/ThemeSwitch'
import { LanguageSwitch } from '@/ui/LanguageSwitch'
import { t } from '@/locales'

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-bold text-foreground transition hover:text-sky-400"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-white shadow-sm">
            <BookMarked className="h-5 w-5" />
          </div>
          <span className="text-base tracking-tight">Bookmarks Manager</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-foreground transition-colors">
              {t('footer.links.features')}
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              {t('footer.links.tutorial')}
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </a>
          </nav>
          <div className="h-4 w-px bg-border hidden md:block" />
          <ThemeSwitch />
          <LanguageSwitch />
          <Link
            to="/app/upload"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-sky-500 shadow-sm"
          >
            <span>{t('hero.getStarted')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default LandingHeader
