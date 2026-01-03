/**
 * Prompt Template Service
 * Manages AI prompt templates for various operations
 */

import type { PromptTemplate } from './types'
import { DEFAULT_PROMPTS } from './constants'
import { getAIPrompt, getAllAIPrompts, saveAIPrompt, deleteAIPrompt } from '../utils/db'

/**
 * Get a prompt template by ID
 */
export async function getTemplate(id: string): Promise<PromptTemplate | null> {
  // First check database for customized version
  const stored = await getAIPrompt(id)
  if (stored) {
    return {
      id: stored.id,
      name: stored.name,
      description: stored.description,
      template: stored.template,
      variables: stored.variables,
      isDefault: stored.isDefault,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt
    }
  }

  // Fall back to default template
  const defaultTemplate = DEFAULT_PROMPTS.find(p => p.id === id)
  return defaultTemplate || null
}

/**
 * Get all available prompt templates
 */
export async function getAllTemplates(): Promise<PromptTemplate[]> {
  const stored = await getAllAIPrompts()
  const storedIds = new Set(stored.map(p => p.id))

  // Combine stored templates with defaults (stored takes precedence)
  const templates: PromptTemplate[] = stored.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    template: s.template,
    variables: s.variables,
    isDefault: s.isDefault,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt
  }))

  // Add default templates that aren't customized
  for (const defaultTemplate of DEFAULT_PROMPTS) {
    if (!storedIds.has(defaultTemplate.id)) {
      templates.push(defaultTemplate)
    }
  }

  return templates
}

/**
 * Save a prompt template (create or update)
 */
export async function saveTemplate(template: PromptTemplate): Promise<void> {
  await saveAIPrompt({
    id: template.id,
    name: template.name,
    description: template.description,
    template: template.template,
    variables: template.variables,
    isDefault: template.isDefault,
    isCustomized: true,
    createdAt: template.createdAt || Date.now(),
    updatedAt: Date.now()
  })
}

/**
 * Reset a prompt template to its default
 */
export async function resetTemplate(id: string): Promise<PromptTemplate | null> {
  // Delete the customized version
  await deleteAIPrompt(id)

  // Return the default template
  const defaultTemplate = DEFAULT_PROMPTS.find(p => p.id === id)
  return defaultTemplate || null
}

/**
 * Render a prompt template with variable substitution
 */
export function renderPrompt(template: string, variables: Record<string, string>): string {
  let rendered = template

  // Replace all {{variable}} placeholders
  // Use Object.keys to safely iterate (avoids __proto__ issues)
  // Escape special regex characters in the key
  for (const key of Object.keys(variables)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const placeholder = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g')
    rendered = rendered.replace(placeholder, () => variables[key])
  }

  return rendered
}

/**
 * Render a prompt template by ID with variable substitution
 */
export async function renderPromptById(
  templateId: string,
  variables: Record<string, string>
): Promise<string> {
  const template = await getTemplate(templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  return renderPrompt(template.template, variables)
}

/**
 * Validate that all required variables are provided
 */
export function validateVariables(
  template: PromptTemplate,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const variable of template.variables) {
    if (!(variable in variables) || !variables[variable]) {
      missing.push(variable)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Extract variables from a template string
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) || []
  const variables = matches.map(m => m.replace(/\{\{|\}\}/g, ''))
  return [...new Set(variables)] // Remove duplicates
}

/**
 * Initialize default templates in the database
 */
export async function initializeDefaultTemplates(): Promise<void> {
  const stored = await getAllAIPrompts()
  const storedIds = new Set(stored.map(p => p.id))

  // Only add defaults that don't exist
  for (const defaultTemplate of DEFAULT_PROMPTS) {
    if (!storedIds.has(defaultTemplate.id)) {
      await saveAIPrompt({
        ...defaultTemplate,
        isCustomized: false
      })
    }
  }
}

// Export as a service object for convenience
export const promptService = {
  getTemplate,
  getAllTemplates,
  saveTemplate,
  resetTemplate,
  renderPrompt,
  renderPromptById,
  validateVariables,
  extractVariables,
  initializeDefaultTemplates
}
