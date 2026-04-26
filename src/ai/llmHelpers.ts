import { AIErrorCode, AIServiceError } from './types'

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function parseJSONResponse<T>(content: string): T {
  const jsonMatch = content.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    throw new AIServiceError({
      code: AIErrorCode.INVALID_RESPONSE,
      message: 'No JSON found in response',
      retryable: false
    })
  }

  try {
    return JSON.parse(jsonMatch[0]) as T
  } catch {
    throw new AIServiceError({
      code: AIErrorCode.INVALID_RESPONSE,
      message: 'Failed to parse JSON response',
      retryable: false
    })
  }
}
