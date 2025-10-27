import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import UploadMerge from './pages/UploadMerge'
import Dashboard from './pages/Dashboard'
import AI from './pages/AI'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">Bookmarks Analysis</div>
          <nav className="flex gap-3 text-sm">
            <NavLink to="/upload" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>上传合并</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>仪表盘</NavLink>
            <NavLink to="/ai" className={({isActive}) => `px-3 py-2 rounded ${isActive ? 'bg-sky-600 text-white' : 'hover:bg-slate-800'}`}>AI 分析</NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadMerge />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai" element={<AI />} />
        </Routes>
      </main>
    </div>
  )
}
