import { BookMarked, Github, Heart, ExternalLink } from 'lucide-react'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const footerLinks: Record<string, FooterLink[]> = {
  产品: [
    { label: '立即使用', href: '#/app/upload' },
    { label: '功能介绍', href: '#features' },
    { label: '使用教程', href: '#how-it-works' }
  ],
  资源: [
    { label: 'GitHub 仓库', href: 'https://github.com/LessUp/bookmarks-manager', external: true },
    { label: '在线演示', href: 'https://lessup.github.io/bookmarks-manager/', external: true },
    {
      label: '问题反馈',
      href: 'https://github.com/LessUp/bookmarks-manager/issues',
      external: true
    }
  ],
  协议: [
    {
      label: 'MIT 开源协议',
      href: 'https://github.com/LessUp/bookmarks-manager/blob/master/LICENSE',
      external: true
    },
    {
      label: '使用文档',
      href: 'https://github.com/LessUp/bookmarks-manager#readme',
      external: true
    }
  ]
}

export default function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && !href.startsWith('#/')) {
      const element = document.querySelector(href)
      element?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/50">
      {/* CTA Section */}
      <div className="relative py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            准备好清理你的书签了吗？
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            完全免费，无需注册，即刻开始使用。你的书签，你完全掌控。
          </p>
          <a
            href="#/app/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105"
          >
            免费开始使用
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
                  <BookMarked className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">Bookmarks Manager</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                本地优先的书签整理工具。导入、去重、搜索、备份与导出都在浏览器里完成。
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/LessUp/bookmarks-manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-white mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-500 hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          onClick={(e) => {
                            if (link.href.startsWith('#') && !link.href.startsWith('#/')) {
                              e.preventDefault()
                              scrollToSection(link.href)
                            }
                          }}
                          className="text-sm text-slate-500 hover:text-sky-400 transition-colors"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>by</span>
              <a
                href="https://github.com/LessUp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                LessUp
              </a>
            </div>
            <div>© {new Date().getFullYear()} Bookmarks Manager. MIT License.</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
