import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: '我的书签数据会上传到服务器吗？',
    answer:
      '绝对不会。Bookmarks Manager 是一款纯本地应用，所有书签文件的处理都在你的浏览器中完成。我们使用 IndexedDB 在本地存储数据，没有任何后端服务器，你的书签永远不会离开你的设备。'
  },
  {
    question: '支持哪些浏览器导出的书签文件？',
    answer:
      '支持所有主流浏览器的标准 Netscape Bookmark HTML 格式导出，包括 Chrome、Firefox、Edge、Safari、Brave、Opera 等。只需在浏览器中导出书签到 HTML 文件，然后拖拽上传到本工具即可。'
  },
  {
    question: 'AI 功能如何使用？是否需要付费？',
    answer:
      'AI 功能需要你自己提供 API Key（OpenAI 或 Claude）。工具本身完全免费，你只需要支付大模型 API 的调用费用。API Key 会安全存储在你的浏览器本地，我们不会收集或传输你的 Key。'
  },
  {
    question: '去重算法是如何工作的？',
    answer:
      '我们使用智能 URL 规范化算法，在处理前会对 URL 进行标准化：统一协议（http/https）、小写主机名、去除追踪参数（如 utm_source）、排序查询参数等。这样可以识别出格式不同但实际指向同一页面的书签。'
  },
  {
    question: '整理后的书签可以导回浏览器吗？',
    answer:
      '当然可以。我们导出的是标准书签 HTML 格式，可以在任何浏览器的书签管理器中导入。只需点击 "导出" 按钮生成整理后的 HTML 文件，然后在目标浏览器中选择 "导入书签" 即可。'
  },
  {
    question: 'PWA 离线功能如何使用？',
    answer:
      '首次访问后，应用会自动缓存到本地。你可以将网站添加到主屏幕（Chrome/Edge 点击地址栏安装图标，Safari 使用"添加到主屏幕"），之后即使离线也能打开和使用大部分功能。'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="relative py-24 lg:py-32 bg-slate-950">
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>常见问题</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">还有疑问？</h2>
          <p className="text-lg text-slate-400">以下是用户最常问的问题</p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-slate-900/80 border-sky-500/30 shadow-lg shadow-sky-500/5'
                    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-medium pr-4 ${isOpen ? 'text-sky-400' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'text-sky-400 rotate-180' : 'text-slate-500'
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-slate-400 leading-relaxed">{faq.answer}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* More Questions */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 mb-4">还有其他问题？</p>
          <a
            href="https://github.com/LessUp/bookmarks-manager/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            在 GitHub 上提交 Issue
          </a>
        </div>
      </div>
    </section>
  )
}
