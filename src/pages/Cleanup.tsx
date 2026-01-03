/**
 * Cleanup Page
 * Page wrapper for the AI-assisted bookmark cleanup workflow
 */

import CleanupWorkflow from '../cleanup/CleanupWorkflow'

export default function Cleanup() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">AI 书签整理</h1>
            <CleanupWorkflow />
        </div>
    )
}
