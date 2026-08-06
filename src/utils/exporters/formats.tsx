import type { ExportFormat } from './index'
import { FileCode, FileJson, FileSpreadsheet, FileText } from 'lucide-react'

export interface ExportFormatOption {
  format: ExportFormat
  label: string
  icon: React.ReactNode
  descriptionKey: string
}

export const EXPORT_FORMAT_OPTIONS: ExportFormatOption[] = [
  {
    format: 'html',
    label: 'HTML',
    icon: <FileText className="w-4 h-4" />,
    descriptionKey: 'export.htmlDesc'
  },
  {
    format: 'json',
    label: 'JSON',
    icon: <FileJson className="w-4 h-4" />,
    descriptionKey: 'export.jsonDesc'
  },
  {
    format: 'csv',
    label: 'CSV',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    descriptionKey: 'export.csvDesc'
  },
  {
    format: 'markdown',
    label: 'Markdown',
    icon: <FileCode className="w-4 h-4" />,
    descriptionKey: 'export.markdownDesc'
  }
]
