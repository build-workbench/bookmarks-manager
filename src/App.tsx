import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AlertCircle } from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import { LazyErrorBoundary } from '@/ui/ErrorBoundary'

const UploadMerge = lazy(() => import('@/pages/UploadMerge'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Search = lazy(() => import('@/pages/Search'))
const Duplicates = lazy(() => import('@/pages/Duplicates'))
const AI = lazy(() => import('@/pages/AI'))
const Cleanup = lazy(() => import('@/pages/Cleanup'))
const Backup = lazy(() => import('@/pages/Backup'))

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`

export default function App() {
  const { loadFromDB, needsMerge } = useBookmarksStore()

  useEffect(() => {
    loadFromDB()
  }, [loadFromDB])

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">Bookmarks Analysis</div>
          <nav className="flex gap-2 text-sm" aria-label="主导航">
            <NavLink to="/upload" className={navLinkClass} aria-label="上传合并页面">上传合并</NavLink>
            <NavLink to="/dashboard" className={navLinkClass} aria-label="仪表盘页面">仪表盘</NavLink>
            <NavLink to="/search" className={navLinkClass} aria-label="搜索页面">搜索</NavLink>
            <NavLink to="/duplicates" className={navLinkClass} aria-label="去重页面">去重</NavLink>
            <NavLink to="/cleanup" className={navLinkClass} aria-label="整理页面">整理</NavLink>
            <NavLink to="/ai" className={navLinkClass} aria-label="AI 分析页面">AI</NavLink>
            <NavLink to="/backup" className={navLinkClass} aria-label="备份页面">备份</NavLink>
          </nav>
        </div>
      </header>
      {needsMerge && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300" role="alert">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              当前导入会话已变更，旧的统计、搜索结果和导出内容已失效。请前往"上传合并"重新合并去重。
            </div>
            <NavLink to="/upload" className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition">
              去合并
            </NavLink>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <LazyErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center gap-2 text-sm text-slate-400" role="status" aria-live="polite">
                <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>页面加载中...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<UploadMerge />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/duplicates" element={<Duplicates />} />
              <Route path="/cleanup" element={<Cleanup />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="*" element={<Navigate to="/upload" replace />} />
            </Routes>
          </Suspense>
        </LazyErrorBoundary>
      </main>
    </div>
  )
}
