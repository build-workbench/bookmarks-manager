import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import UploadMerge from './pages/UploadMerge'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Duplicates from './pages/Duplicates'
import AI from './pages/AI'
import useBookmarksStore from './store/useBookmarksStore'

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
          <nav className="flex gap-2 text-sm">
            <NavLink to="/upload" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>上传合并</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>仪表盘</NavLink>
            <NavLink to="/search" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>搜索</NavLink>
            <NavLink to="/duplicates" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>去重</NavLink>
            <NavLink to="/ai" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>AI</NavLink>
          </nav>
        </div>
      </header>
      {needsMerge && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              已导入新的书签文件，请前往“上传合并”重新合并去重，以更新统计、搜索与导出结果。
            </div>
            <NavLink to="/upload" className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition">
              去合并
            </NavLink>
          </div>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadMerge />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<Search />} />
          <Route path="/duplicates" element={<Duplicates />} />
          <Route path="/ai" element={<AI />} />
        </Routes>
      </main>
    </div>
  )
}
