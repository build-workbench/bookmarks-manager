/**
 * AI Usage Service
 * Tracks API usage, costs, and enforces limits
 */

import { db, getAIUsageLimits, saveAIUsageLimits } from '../utils/db'
import { TOKEN_COSTS } from './constants'
import type { UsageRecord, UsageStats, UsageLimits } from './types'

// Warning threshold (80% of limit)
const WARNING_THRESHOLD = 0.8

/**
 * Record an API usage event
 */
export async function recordUsage(record: Omit<UsageRecord, 'id'>): Promise<void> {
  await db.aiUsage.add({
    ...record,
    timestamp: record.timestamp || Date.now()
  })
}

/**
 * Get usage statistics for a time period
 */
export async function getStats(startDate?: Date, endDate?: Date): Promise<UsageStats> {
  const start = startDate?.getTime() || 0
  const end = endDate?.getTime() || Date.now()

  const records = await db.aiUsage
    .where('timestamp')
    .between(start, end)
    .toArray()

  const operationBreakdown: Record<string, { tokens: number; cost: number }> = {}
  const dailyMap: Map<string, { tokens: number; cost: number }> = new Map()

  let totalTokens = 0
  let totalCost = 0

  for (const record of records) {
    // Total
    totalTokens += record.totalTokens
    totalCost += record.estimatedCost

    // By operation
    if (!operationBreakdown[record.operation]) {
      operationBreakdown[record.operation] = { tokens: 0, cost: 0 }
    }
    operationBreakdown[record.operation].tokens += record.totalTokens
    operationBreakdown[record.operation].cost += record.estimatedCost

    // By day
    const date = new Date(record.timestamp).toISOString().split('T')[0]
    const daily = dailyMap.get(date) || { tokens: 0, cost: 0 }
    daily.tokens += record.totalTokens
    daily.cost += record.estimatedCost
    dailyMap.set(date, daily)
  }

  // Convert daily map to sorted array
  const dailyUsage = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalTokens,
    totalCost,
    operationBreakdown,
    dailyUsage
  }
}

/**
 * Get today's usage statistics
 */
export async function getTodayStats(): Promise<{ tokens: number; cost: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const stats = await getStats(today, tomorrow)
  return {
    tokens: stats.totalTokens,
    cost: stats.totalCost
  }
}

/**
 * Get this month's usage statistics
 */
export async function getMonthStats(): Promise<{ tokens: number; cost: number }> {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const stats = await getStats(firstDay, lastDay)
  return {
    tokens: stats.totalTokens,
    cost: stats.totalCost
  }
}

/**
 * Get usage limits
 */
export async function getLimits(): Promise<UsageLimits> {
  const limits = await getAIUsageLimits()
  return limits || {}
}

/**
 * Set usage limits
 */
export async function setLimits(limits: UsageLimits): Promise<void> {
  await saveAIUsageLimits(limits)
}

/**
 * Check if any limits are exceeded or approaching
 */
export async function checkLimits(): Promise<{
  exceeded: boolean
  warning: boolean
  message?: string
  details?: {
    dailyTokens?: { current: number; limit: number; percentage: number }
    monthlyTokens?: { current: number; limit: number; percentage: number }
    dailyCost?: { current: number; limit: number; percentage: number }
    monthlyCost?: { current: number; limit: number; percentage: number }
  }
}> {
  const limits = await getLimits()
  const todayStats = await getTodayStats()
  const monthStats = await getMonthStats()

  const details: {
    dailyTokens?: { current: number; limit: number; percentage: number }
    monthlyTokens?: { current: number; limit: number; percentage: number }
    dailyCost?: { current: number; limit: number; percentage: number }
    monthlyCost?: { current: number; limit: number; percentage: number }
  } = {}

  let exceeded = false
  let warning = false
  const messages: string[] = []

  // Check daily token limit
  if (limits.dailyTokenLimit) {
    const percentage = todayStats.tokens / limits.dailyTokenLimit
    details.dailyTokens = {
      current: todayStats.tokens,
      limit: limits.dailyTokenLimit,
      percentage
    }
    if (percentage >= 1) {
      exceeded = true
      messages.push(`日 Token 限额已用完 (${todayStats.tokens}/${limits.dailyTokenLimit})`)
    } else if (percentage >= WARNING_THRESHOLD) {
      warning = true
      messages.push(`日 Token 使用量已达 ${Math.round(percentage * 100)}%`)
    }
  }

  // Check monthly token limit
  if (limits.monthlyTokenLimit) {
    const percentage = monthStats.tokens / limits.monthlyTokenLimit
    details.monthlyTokens = {
      current: monthStats.tokens,
      limit: limits.monthlyTokenLimit,
      percentage
    }
    if (percentage >= 1) {
      exceeded = true
      messages.push(`月 Token 限额已用完 (${monthStats.tokens}/${limits.monthlyTokenLimit})`)
    } else if (percentage >= WARNING_THRESHOLD) {
      warning = true
      messages.push(`月 Token 使用量已达 ${Math.round(percentage * 100)}%`)
    }
  }

  // Check daily cost limit
  if (limits.dailyCostLimit) {
    const percentage = todayStats.cost / limits.dailyCostLimit
    details.dailyCost = {
      current: todayStats.cost,
      limit: limits.dailyCostLimit,
      percentage
    }
    if (percentage >= 1) {
      exceeded = true
      messages.push(`日费用限额已用完 ($${todayStats.cost.toFixed(4)}/$${limits.dailyCostLimit})`)
    } else if (percentage >= WARNING_THRESHOLD) {
      warning = true
      messages.push(`日费用已达 ${Math.round(percentage * 100)}%`)
    }
  }

  // Check monthly cost limit
  if (limits.monthlyCostLimit) {
    const percentage = monthStats.cost / limits.monthlyCostLimit
    details.monthlyCost = {
      current: monthStats.cost,
      limit: limits.monthlyCostLimit,
      percentage
    }
    if (percentage >= 1) {
      exceeded = true
      messages.push(`月费用限额已用完 ($${monthStats.cost.toFixed(4)}/$${limits.monthlyCostLimit})`)
    } else if (percentage >= WARNING_THRESHOLD) {
      warning = true
      messages.push(`月费用已达 ${Math.round(percentage * 100)}%`)
    }
  }

  return {
    exceeded,
    warning,
    message: messages.length > 0 ? messages.join('; ') : undefined,
    details
  }
}

/**
 * Estimate cost for a given number of tokens
 */
export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = TOKEN_COSTS[model]
  if (!costs) {
    // Default to gpt-4o-mini pricing if model not found
    return (promptTokens * 0.00015 + completionTokens * 0.0006) / 1000
  }
  return (promptTokens * costs.input + completionTokens * costs.output) / 1000
}

/**
 * Clear all usage history
 */
export async function clearHistory(): Promise<void> {
  await db.aiUsage.clear()
}

/**
 * Clear usage history older than a certain date
 */
export async function clearHistoryBefore(date: Date): Promise<number> {
  const records = await db.aiUsage
    .where('timestamp')
    .below(date.getTime())
    .toArray()
  
  await db.aiUsage
    .where('timestamp')
    .below(date.getTime())
    .delete()

  return records.length
}

/**
 * Get recent usage records
 */
export async function getRecentRecords(limit: number = 50): Promise<UsageRecord[]> {
  return db.aiUsage
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray()
}

// Export as a service object for convenience
export const usageService = {
  recordUsage,
  getStats,
  getTodayStats,
  getMonthStats,
  getLimits,
  setLimits,
  checkLimits,
  estimateCost,
  clearHistory,
  clearHistoryBefore,
  getRecentRecords
}
