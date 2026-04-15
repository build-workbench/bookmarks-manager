import type { ExportFormat } from '@/utils/exporters'
import { FileCode, FileJson, FileSpreadsheet, FileText } from 'lucide-react'

export interface ExportFormatOption {
  format: ExportFormat
  label: string
  icon: React.ReactNode
  description: string
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  { format: 'html', label: 'HTML', icon: <FileText className="w-4 h-4" />, description: '浏览器兼容格式' },
  { format: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" />, description: '结构化数据' },
  { format: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" />, description: '表格格式' },
  { format: 'markdown', label: 'Markdown', icon: <FileCode className="w-4 h-4" />, description: '文档格式' },
]
