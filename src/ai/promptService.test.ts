/**
 * Prompt Service Tests
 * Feature: ai-bookmark-analysis
 * Property 20: Prompt Template Round-Trip
 * Property 21: Prompt Template Reset
 * Property 22: Prompt Variable Substitution
 * Validates: Requirements 8.2, 8.3, 8.5
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { promptService, renderPrompt, extractVariables, validateVariables } from './promptService'
import { DEFAULT_PROMPTS } from './constants'
import { db } from '../utils/db'
import { PBT_CONFIG } from '../test/generators'
import type { PromptTemplate } from './types'

describe('Prompt Service', () => {
  beforeEach(async () => {
    await db.aiPrompts.clear()
  })

  /**
   * Feature: ai-bookmark-analysis, Property 20: Prompt Template Round-Trip
   * For any prompt template edit (changing template text or variables),
   * saving and then loading the template should return the edited version.
   * Validates: Requirements 8.2
   */
  describe('Property 20: Prompt Template Round-Trip', () => {
    it('should save and load custom templates correctly', async () => {
      const templateArb = fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 0, maxLength: 500 }),
        template: fc.string({ minLength: 10, maxLength: 2000 }),
        variables: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
        isDefault: fc.boolean(),
        createdAt: fc.integer({ min: 0, max: Date.now() }),
        updatedAt: fc.integer({ min: 0, max: Date.now() })
      })

      await fc.assert(
        fc.asyncProperty(templateArb, async (template) => {
          await db.aiPrompts.clear()

          // Save
          await promptService.saveTemplate(template)

          // Load
          const loaded = await promptService.getTemplate(template.id)
          
          expect(loaded).not.toBeNull()
          expect(loaded!.id).toBe(template.id)
          expect(loaded!.name).toBe(template.name)
          expect(loaded!.description).toBe(template.description)
          expect(loaded!.template).toBe(template.template)
          expect(loaded!.variables).toEqual(template.variables)
        }),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })
  })

  /**
   * Feature: ai-bookmark-analysis, Property 21: Prompt Template Reset
   * For any customized prompt template, resetting it should restore
   * the original default template content.
   * Validates: Requirements 8.3
   */
  describe('Property 21: Prompt Template Reset', () => {
    it('should reset customized template to default', async () => {
      // Use a known default template
      const defaultTemplate = DEFAULT_PROMPTS[0]
      
      // Customize it
      const customized: PromptTemplate = {
        ...defaultTemplate,
        template: 'Custom template content that is different',
        name: 'Customized Name'
      }
      
      await promptService.saveTemplate(customized)
      
      // Verify customization was saved
      const loaded = await promptService.getTemplate(defaultTemplate.id)
      expect(loaded!.template).toBe(customized.template)
      
      // Reset
      const reset = await promptService.resetTemplate(defaultTemplate.id)
      
      // Verify reset to default
      expect(reset).not.toBeNull()
      expect(reset!.template).toBe(defaultTemplate.template)
      expect(reset!.name).toBe(defaultTemplate.name)
    })

    it('should return null when resetting non-existent template', async () => {
      const result = await promptService.resetTemplate('non-existent-id')
      expect(result).toBeNull()
    })
  })

  /**
   * Feature: ai-bookmark-analysis, Property 22: Prompt Variable Substitution
   * For any prompt template with N variables and a data object containing
   * all N variable values, rendering the prompt should replace all
   * {{variable}} placeholders with their corresponding values.
   * Validates: Requirements 8.5
   */
  describe('Property 22: Prompt Variable Substitution', () => {
    it('should substitute all variables correctly', () => {
      // Generate templates with variables and matching data
      const variableNameArb = fc.string({ minLength: 1, maxLength: 20 })
        .filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s))
      
      // Ensure values don't contain placeholder patterns
      const variableValueArb = fc.string({ minLength: 0, maxLength: 100 })
        .filter(s => !s.includes('{{') && !s.includes('}}'))

      fc.assert(
        fc.property(
          fc.array(variableNameArb, { minLength: 1, maxLength: 5 }),
          fc.array(variableValueArb, { minLength: 1, maxLength: 5 }),
          (varNames, varValues) => {
            // Ensure we have matching lengths
            const names = [...new Set(varNames)].slice(0, varValues.length)
            const values = varValues.slice(0, names.length)
            
            if (names.length === 0) return true

            // Build template with placeholders
            const template = names.map(n => `{{${n}}}`).join(' ')
            
            // Build variables object
            const variables: Record<string, string> = {}
            names.forEach((name, i) => {
              variables[name] = values[i]
            })

            // Render
            const rendered = renderPrompt(template, variables)

            // Verify all placeholders are replaced
            for (const name of names) {
              expect(rendered).not.toContain(`{{${name}}}`)
            }

            // Verify all values are present
            for (const value of values) {
              if (value) {
                expect(rendered).toContain(value)
              }
            }

            return true
          }
        ),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })

    it('should handle templates with no variables', () => {
      const template = 'This is a static template with no variables'
      const rendered = renderPrompt(template, {})
      expect(rendered).toBe(template)
    })

    it('should handle missing variables gracefully', () => {
      const template = 'Hello {{name}}, your score is {{score}}'
      const rendered = renderPrompt(template, { name: 'Alice' })
      expect(rendered).toBe('Hello Alice, your score is {{score}}')
    })
  })

  describe('extractVariables', () => {
    it('should extract all unique variables from template', () => {
      const template = 'Hello {{name}}, {{greeting}}! Your {{name}} is great.'
      const variables = extractVariables(template)
      expect(variables).toContain('name')
      expect(variables).toContain('greeting')
      expect(variables.length).toBe(2) // name should only appear once
    })

    it('should return empty array for template without variables', () => {
      const template = 'No variables here'
      const variables = extractVariables(template)
      expect(variables).toEqual([])
    })
  })

  describe('validateVariables', () => {
    it('should validate all required variables are present', () => {
      const template: PromptTemplate = {
        id: 'test',
        name: 'Test',
        description: '',
        template: '{{a}} {{b}} {{c}}',
        variables: ['a', 'b', 'c'],
        isDefault: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      // All present
      const valid = validateVariables(template, { a: '1', b: '2', c: '3' })
      expect(valid.valid).toBe(true)
      expect(valid.missing).toEqual([])

      // Missing some
      const invalid = validateVariables(template, { a: '1' })
      expect(invalid.valid).toBe(false)
      expect(invalid.missing).toContain('b')
      expect(invalid.missing).toContain('c')
    })
  })

  describe('getAllTemplates', () => {
    it('should return all default templates when none customized', async () => {
      const templates = await promptService.getAllTemplates()
      expect(templates.length).toBeGreaterThanOrEqual(DEFAULT_PROMPTS.length)
      
      for (const defaultTemplate of DEFAULT_PROMPTS) {
        const found = templates.find(t => t.id === defaultTemplate.id)
        expect(found).toBeDefined()
      }
    })

    it('should return customized version when available', async () => {
      const defaultTemplate = DEFAULT_PROMPTS[0]
      const customized: PromptTemplate = {
        ...defaultTemplate,
        template: 'Customized content'
      }
      
      await promptService.saveTemplate(customized)
      
      const templates = await promptService.getAllTemplates()
      const found = templates.find(t => t.id === defaultTemplate.id)
      
      expect(found).toBeDefined()
      expect(found!.template).toBe('Customized content')
    })
  })
})
