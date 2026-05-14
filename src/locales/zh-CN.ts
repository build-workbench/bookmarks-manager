export default {
  // App Header Navigation
  'nav.upload': '上传合并',
  'nav.dashboard': '仪表盘',
  'nav.search': '搜索',
  'nav.duplicates': '去重',
  'nav.ai': 'AI',
  'nav.backup': '备份',

  // Theme
  'theme.light': '浅色模式',
  'theme.dark': '深色模式',
  'theme.auto': '跟随系统',

  // Common
  'common.loading': '加载中...',
  'common.error': '发生错误',
  'common.success': '成功',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.save': '保存',
  'common.export': '导出',
  'common.import': '导入',
  'common.yes': '有',
  'common.no': '无',
  'common.unknownError': '未知错误',

  // Upload & Merge Page
  'upload.title': '上传合并',
  'upload.dropzone': '拖拽书签文件到此处，或点击选择文件',
  'upload.supportedFormats': '支持 Chrome、Firefox、Edge、Safari 导出的 Netscape Bookmark 格式',
  'upload.bookmarkCount': '{count} 条书签',
  'upload.importFailed': '导入文件失败: {error}',
  'upload.importFirst': '请先导入书签文件',
  'upload.mergeComplete': '合并完成！数据已保存到本地数据库',
  'upload.mergeFailed': '合并失败',
  'upload.exportSuccess': '已导出为 {format} 格式',
  'upload.exportFailed': '导出失败',
  'upload.fileRemoved': '已移除文件：{name}',
  'upload.rawItemsLabel': '当前导入会话中的总书签数',
  'upload.noRawItems': '当前没有活动中的原始导入会话',
  'upload.mergedItemsLabel': '去重后的书签数',
  'upload.restoredLabel': '从本地恢复的上次合并结果',
  'upload.duplicatesLabel': '检测到的重复簇',
  'upload.duplicatesUnavailable': '仅完整合并后可用',

  // Dashboard Page
  'dashboard.title': '仪表盘',
  'dashboard.deduplicated': '去重后',
  'dashboard.duplicates': '重复',
  'dashboard.needsMerge': '当前导入会话已变更，仪表盘统计已失效',
  'dashboard.needsMergeHint': '请先回到"上传合并"重新执行合并去重',
  'dashboard.restoredWarning':
    '当前显示的是从本地数据库恢复的合并快照。基础统计可用，但重复簇相关信息不代表上一次完整导入会话的全部结果。',
  'dashboard.totalBookmarks': '书签总量',
  'dashboard.duplicateCount': '重复数量',
  'dashboard.domainCount': '域名数',
  'dashboard.duplicateRatio': '重复占比',
  'dashboard.topDomains': 'Top 10 域名',
  'dashboard.byYear': '按年份新增',
  'dashboard.bookmarkList': '书签列表',
  'dashboard.loadMore': '加载更多',
  'dashboard.items': '条',
  'dashboard.chart.pieAria': '书签重复占比饼图',
  'dashboard.chart.barAria': '书签域名分布柱状图',
  'dashboard.chart.lineAria': '书签按年份新增趋势图',
  'dashboard.chart.listAria': '书签列表',

  // Search Page
  'search.title': '搜索',
  'search.placeholder': '搜索书签...',
  'search.noResults': '没有找到匹配的书签',
  'search.noExport': '没有可导出的书签',
  'search.exportSuccess': '已导出为 {format} 格式',
  'search.exportFailed': '导出失败',
  'search.noFolder': '(无目录)',

  // Duplicates Page
  'duplicates.title': '去重',
  'duplicates.empty': '暂无重复书签',
  'duplicates.source': '来源: {source}',

  // AI Page
  'ai.title': 'AI 设置',
  'ai.configSaved': '配置已保存',
  'ai.saveFailed': '保存失败',
  'ai.testing': '正在测试连接...',
  'ai.connected': '连接成功！',

  // Backup Page
  'backup.title': '备份',
  'backup.create': '创建备份',
  'backup.restore': '从备份恢复',
  'backup.creating': '正在创建备份...',
  'backup.restoring': '正在恢复...',
  'backup.success': '备份成功！文件大小: {size}',
  'backup.failed': '备份失败: {error}',
  'backup.parseFailed': '备份文件解析失败',
  'backup.confirmRestore': '确定要恢复以下数据吗？',
  'backup.warning': '⚠️ 这将替换当前所有数据！',
  'backup.restoreSuccess': '恢复成功！书签: {count} 条{aiConfig}',
  'backup.aiConfigRestored': '，AI 配置已恢复',
  'backup.restoreFailed': '恢复失败: {error}',
  'backup.aiConfigLabel': 'AI配置',

  // Export Formats
  'export.html': 'HTML',
  'export.json': 'JSON',
  'export.csv': 'CSV',
  'export.markdown': 'Markdown',
  'export.htmlDesc': '浏览器兼容格式',
  'export.jsonDesc': '结构化数据',
  'export.csvDesc': '表格格式',
  'export.markdownDesc': '文档格式',

  // Landing Page - Hero
  'hero.title': 'Bookmarks Manager',
  'hero.subtitle': '本地优先的书签整理工具',
  'hero.description': '导入、去重、搜索、分析、导出浏览器书签，一切在本地完成，隐私优先',
  'hero.getStarted': '立即开始',
  'hero.viewDemo': '在线演示',
  'hero.stats.total': '书签总数',
  'hero.stats.duplicates': '重复项目',
  'hero.stats.domains': '域名数量',
  'hero.stats.trend': '书签增长趋势',
  'hero.badge': '完全免费 & 开源',
  'hero.headline': '整理你的',
  'hero.headlineHighlight': '数字书签库',
  'hero.github': 'GitHub 开源',
  'hero.trust.local': '100% 本地处理',
  'hero.trust.noSignup': '无需注册',
  'hero.trust.pwa': 'PWA 支持',
  'hero.preview.upload': '上传合并',
  'hero.preview.backup': '本地备份',
  'hero.preview.processed': '本地处理完成',
  'hero.preview.restore': '本地备份恢复',
  'hero.scrollHint': '向下滚动了解更多',

  // Landing Page - Features
  'features.badge': '核心功能',
  'features.title': '一站式书签清理与管理',
  'features.subtitle': '从导入、去重到搜索、备份与导出，覆盖完整的本地书签整理流程',
  'features.smartMerge.title': '智能合并',
  'features.smartMerge.desc':
    '支持 Chrome、Firefox、Edge、Safari 等多浏览器书签文件一键导入，自动识别并合并重复文件夹结构。',
  'features.smartDedup.title': '智能去重',
  'features.smartDedup.desc':
    'URL 规范化算法智能识别重复书签，自动处理 http/https、追踪参数、大小写等差异，保留最早添加的版本。',
  'features.search.title': '全文搜索',
  'features.search.desc':
    '基于 MiniSearch 的高性能搜索引擎，支持标题、URL、文件夹路径全文检索，模糊匹配，毫秒级响应。',
  'features.ai.title': 'AI 可选配置',
  'features.ai.desc':
    '按需接入 OpenAI、Claude 等模型，仅保留自备 Key 的本地配置与连接测试。默认不上传任何数据。',
  'features.stats.title': '可视化统计',
  'features.stats.desc':
    'ECharts 驱动的本地统计视图，展示域名分布、时间趋势和重复占比，帮助你快速判断整理结果。',
  'features.privacy.title': '隐私优先',
  'features.privacy.desc':
    '所有处理在浏览器本地完成，IndexedDB 存储，不上传任何数据。开源代码可审计，真正掌控你的数据。',
  'features.learnMore': '了解更多',
  'features.privacyNote': '所有数据在本地处理，',
  'features.privacyHighlight': '永不上传到服务器',

  // Landing Page - How It Works
  'howItWorks.title': '使用教程',
  'howItWorks.badge': '简单三步',
  'howItWorks.subtitle': '轻松整理你的书签',
  'howItWorks.step1.title': '导入书签',
  'howItWorks.step1.desc':
    '从 Chrome、Firefox、Edge、Safari 导出书签文件，支持拖拽上传或点击选择，可同时导入多个文件。',
  'howItWorks.step1.description':
    '从 Chrome、Firefox、Edge、Safari 导出书签文件，支持拖拽上传或点击选择，可同时导入多个文件。',
  'howItWorks.step1.f1': '多浏览器兼容',
  'howItWorks.step1.feature1': '多浏览器兼容',
  'howItWorks.step1.f2': '批量导入',
  'howItWorks.step1.feature2': '批量导入',
  'howItWorks.step1.f3': '拖拽上传',
  'howItWorks.step1.feature3': '拖拽上传',
  'howItWorks.step2.title': '合并去重',
  'howItWorks.step2.desc':
    '系统自动合并重复文件夹、去除重复书签，并提供稳定的统计视图、搜索和重复项浏览能力。',
  'howItWorks.step2.description':
    '系统自动合并重复文件夹、去除重复书签，并提供稳定的统计视图、搜索和重复项浏览能力。',
  'howItWorks.step2.f1': '自动去重',
  'howItWorks.step2.feature1': '自动去重',
  'howItWorks.step2.f2': '重复概览',
  'howItWorks.step2.feature2': '重复概览',
  'howItWorks.step2.f3': '本地搜索',
  'howItWorks.step2.feature3': '本地搜索',
  'howItWorks.step3.title': '导出整理',
  'howItWorks.step3.desc':
    '将整理后的书签导出为标准 HTML 格式，支持导入回任何浏览器。也可导出 JSON、CSV 用于备份。',
  'howItWorks.step3.description':
    '将整理后的书签导出为标准 HTML 格式，支持导入回任何浏览器。也可导出 JSON、CSV 用于备份。',
  'howItWorks.step3.f1': '标准格式',
  'howItWorks.step3.feature1': '标准格式',
  'howItWorks.step3.f2': '多格式导出',
  'howItWorks.step3.feature2': '多格式导出',
  'howItWorks.step3.f3': '随时恢复',
  'howItWorks.step3.feature3': '随时恢复',
  'howItWorks.bottomNote': '整个过程在本地完成，无需上传任何数据。上传书签 → 一键合并 → 即刻出结果',

  // Landing Page - FAQ
  'faq.title': '常见问题',
  'faq.badge': '常见问题',
  'faq.heading': '还有疑问？',
  'faq.subtitle': '以下是用户最常问的问题',
  'faq.githubIssue': '在 GitHub 上提交 Issue',
  'faq.q1': '我的书签数据会上传到服务器吗？',
  'faq.a1':
    '绝对不会。Bookmarks Manager 是一款纯本地应用，所有书签文件的处理都在你的浏览器中完成。我们使用 IndexedDB 在本地存储数据，没有任何后端服务器，你的书签永远不会离开你的设备。',
  'faq.q2': '支持哪些浏览器导出的书签文件？',
  'faq.a2':
    '支持所有主流浏览器的标准 Netscape Bookmark HTML 格式导出，包括 Chrome、Firefox、Edge、Safari、Brave、Opera 等。只需在浏览器中导出书签到 HTML 文件，然后拖拽上传到本工具即可。',
  'faq.q3': 'AI 功能如何使用？是否需要付费？',
  'faq.a3':
    '当前只保留可选的 AI 配置与连接测试能力。你可以自行提供 OpenAI 或 Claude API Key，配置仅保存在浏览器本地。工具本身不会代管密钥，也不会把你的书签上传到任何仓库控制的服务。',
  'faq.q4': '去重算法是如何工作的？',
  'faq.a4':
    '我们使用智能 URL 规范化算法，在处理前会对 URL 进行标准化：统一协议（http/https）、小写主机名、去除追踪参数（如 utm_source）、排序查询参数等。这样可以识别出格式不同但实际指向同一页面的书签。',
  'faq.q5': '整理后的书签可以导回浏览器吗？',
  'faq.a5':
    '当然可以。我们导出的是标准书签 HTML 格式，可以在任何浏览器的书签管理器中导入。只需点击 "导出" 按钮生成整理后的 HTML 文件，然后在目标浏览器中选择 "导入书签" 即可。',
  'faq.q6': 'PWA 离线功能如何使用？',
  'faq.a6':
    '首次访问后，应用会自动缓存到本地。你可以将网站添加到主屏幕（Chrome/Edge 点击地址栏安装图标，Safari 使用"添加到主屏幕"），之后即使离线也能打开和使用大部分功能。',
  'faq.more': '还有其他问题？',

  // Landing Page - Footer
  'footer.product': '产品',
  'footer.getStarted': '立即使用',
  'footer.features': '功能介绍',
  'footer.tutorial': '使用教程',
  'footer.resources': '资源',
  'footer.github': 'GitHub 仓库',
  'footer.demo': '在线演示',
  'footer.feedback': '问题反馈',
  'footer.license': 'MIT 开源协议',
  'footer.docs': '使用文档',
  'footer.madeWith': '用 ❤️ 构建，保护你的隐私',
  'footer.copyright': '© 2024 Bookmarks Manager. 保留所有权利。',
  'footer.cta.title': '准备好清理你的书签了吗？',
  'footer.cta.description': '开始使用 Bookmarks Manager，轻松整理你的数字书签库',
  'footer.cta.button': '免费开始使用',
  'footer.brand.description': '本地优先的书签管理工具，隐私保护，完全免费',
  'footer.links.startNow': '立即使用',
  'footer.links.features': '功能介绍',
  'footer.links.tutorial': '使用教程',
  'footer.links.github': 'GitHub 仓库',
  'footer.links.demo': '在线演示',
  'footer.links.feedback': '问题反馈',
  'footer.links.mitLicense': 'MIT 开源协议',
  'footer.links.documentation': '使用文档',

  // Error Boundary
  'error.title': '出错了',
  'error.message': '发生了未知错误',
  'error.retry': '重试',

  // ARIA labels
  'aria.mainNav': '主导航',
  'aria.themeSwitch': '主题切换',
  'aria.list': '列表',
  'aria.chart': '图表',

  // Alert messages
  'alert.needsMerge':
    '当前导入会话已变更，旧的统计、搜索结果和导出内容已失效。请前往"上传合并"重新合并去重。',
  'alert.goMerge': '去合并'
} as const
