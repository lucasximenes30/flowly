import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIPurpose = 'reports' | 'workout'
export type AIProvider = 'google' | 'openai'

type ConfigSlot = 'reports' | 'workouts' | 'fallback'

interface ProviderConfig {
  provider: AIProvider
  model: string
  apiKey: string
}

export interface GenerateAITextInput {
  purpose: AIPurpose
  prompt: string
  temperature?: number
  maxOutputTokens?: number
}

export interface GenerateAITextResult {
  text: string
  provider: AIProvider
  model: string
  usedFallback: boolean
}

type AIServiceErrorCode =
  | 'AI_CONFIG_ERROR'
  | 'AI_PRIMARY_FAILED'
  | 'AI_ALL_PROVIDERS_FAILED'
  | 'AI_PROVIDER_ERROR'

export class AIServiceError extends Error {
  code: AIServiceErrorCode
  statusCode: number
  retryable: boolean

  constructor(params: {
    message: string
    code: AIServiceErrorCode
    statusCode?: number
    retryable?: boolean
  }) {
    super(params.message)
    this.name = 'AIServiceError'
    this.code = params.code
    this.statusCode = params.statusCode ?? 503
    this.retryable = Boolean(params.retryable)
  }
}

function normalizeProvider(input: string | undefined, fallback: AIProvider): AIProvider {
  const normalized = input?.trim().toLowerCase()
  if (normalized === 'google' || normalized === 'gemini') return 'google'
  if (normalized === 'openai') return 'openai'
  return fallback
}

function defaultModelForProvider(provider: AIProvider): string {
  return provider === 'google' ? 'gemini-2.0-flash' : 'gpt-4o-mini'
}

function envSuffix(slot: ConfigSlot): string {
  if (slot === 'reports') return 'REPORTS'
  if (slot === 'workouts') return 'WORKOUTS'
  return 'FALLBACK'
}

function pickFirstDefined(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (value && value.trim()) return value.trim()
  }
  return undefined
}

function resolveApiKey(provider: AIProvider, slot: ConfigSlot): string | undefined {
  const suffix = envSuffix(slot)

  if (provider === 'google') {
    return pickFirstDefined(
      process.env[`GOOGLE_API_KEY_${suffix}`],
      process.env[`GEMINI_API_KEY_${suffix}`],
      process.env.GOOGLE_API_KEY,
      process.env.GEMINI_API_KEY
    )
  }

  return pickFirstDefined(
    process.env[`OPENAI_API_KEY_${suffix}`],
    process.env.OPENAI_API_KEY
  )
}

function resolvePrimaryConfig(purpose: AIPurpose): ProviderConfig {
  const slot: ConfigSlot = purpose === 'reports' ? 'reports' : 'workouts'

  const provider = normalizeProvider(
    slot === 'reports' ? process.env.AI_PROVIDER_REPORTS : process.env.AI_PROVIDER_WORKOUTS,
    'google'
  )

  const model = pickFirstDefined(
    slot === 'reports' ? process.env.AI_MODEL_REPORTS : process.env.AI_MODEL_WORKOUTS,
    defaultModelForProvider(provider)
  )

  const apiKey = resolveApiKey(provider, slot)
  if (!apiKey) {
    throw new AIServiceError({
      code: 'AI_CONFIG_ERROR',
      message: `Missing API key for AI provider "${provider}" (${purpose})`,
      statusCode: 503,
      retryable: false,
    })
  }

  return {
    provider,
    model: model as string,
    apiKey,
  }
}

function resolveFallbackConfig(): ProviderConfig | null {
  const providerRaw = process.env.AI_PROVIDER_FALLBACK
  const modelRaw = process.env.AI_MODEL_FALLBACK

  if (!providerRaw || !modelRaw) return null

  const provider = normalizeProvider(providerRaw, 'google')
  const apiKey = resolveApiKey(provider, 'fallback')

  if (!apiKey) {
    throw new AIServiceError({
      code: 'AI_CONFIG_ERROR',
      message: `Missing API key for fallback provider "${provider}"`,
      statusCode: 503,
      retryable: false,
    })
  }

  return {
    provider,
    model: modelRaw.trim(),
    apiKey,
  }
}

function toErrorText(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function toErrorStatus(error: unknown): number | null {
  const withStatus = error as { status?: number; statusCode?: number }
  if (typeof withStatus?.status === 'number') return withStatus.status
  if (typeof withStatus?.statusCode === 'number') return withStatus.statusCode
  return null
}

export function isRateLimitLikeError(error: unknown): boolean {
  const status = toErrorStatus(error)
  if (status === 429) return true

  const message = toErrorText(error).toLowerCase()
  return (
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('quota exceeded') ||
    message.includes('quota')
  )
}

export function isProviderRecoverableError(error: unknown): boolean {
  if (isRateLimitLikeError(error)) return true

  const status = toErrorStatus(error)
  if (status !== null && status >= 500) return true

  const message = toErrorText(error).toLowerCase()
  return (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('temporarily unavailable')
  )
}

async function callGoogle(input: GenerateAITextInput, config: ProviderConfig): Promise<string> {
  const client = new GoogleGenerativeAI(config.apiKey)
  const model = client.getGenerativeModel({
    model: config.model,
    generationConfig: {
      temperature: input.temperature,
      maxOutputTokens: input.maxOutputTokens,
    },
  })

  const result = await model.generateContent(input.prompt)
  return result.response.text().trim()
}

function extractOpenAIText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''

  const withOutputText = payload as { output_text?: unknown }
  if (typeof withOutputText.output_text === 'string' && withOutputText.output_text.trim()) {
    return withOutputText.output_text.trim()
  }

  const withOutput = payload as {
    output?: Array<{
      content?: Array<{ type?: string; text?: string }>
    }>
  }

  const chunks = withOutput.output ?? []
  const parts: string[] = []

  for (const chunk of chunks) {
    const content = chunk.content ?? []
    for (const item of content) {
      if (item.type === 'output_text' && typeof item.text === 'string' && item.text.trim()) {
        parts.push(item.text.trim())
      }
    }
  }

  return parts.join('\n').trim()
}

async function callOpenAI(input: GenerateAITextInput, config: ProviderConfig): Promise<string> {
  const body: Record<string, unknown> = {
    model: config.model,
    input: input.prompt,
  }

  if (typeof input.temperature === 'number') {
    body.temperature = input.temperature
  }

  if (typeof input.maxOutputTokens === 'number') {
    body.max_output_tokens = input.maxOutputTokens
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const raw = await response.text()

  if (!response.ok) {
    const snippet = raw.length > 300 ? `${raw.slice(0, 300)}...` : raw
    const error = new Error(`OpenAI request failed (${response.status}): ${snippet}`) as Error & {
      status?: number
      statusCode?: number
    }
    error.status = response.status
    error.statusCode = response.status
    throw error
  }

  const payload = JSON.parse(raw)
  const text = extractOpenAIText(payload)

  if (!text) {
    throw new Error('OpenAI response does not contain text output')
  }

  return text
}

async function callProvider(input: GenerateAITextInput, config: ProviderConfig): Promise<string> {
  if (config.provider === 'google') {
    return callGoogle(input, config)
  }
  return callOpenAI(input, config)
}

function shouldTryFallback(error: unknown): boolean {
  if (error instanceof AIServiceError && error.code === 'AI_CONFIG_ERROR') {
    return true
  }
  return isProviderRecoverableError(error)
}

export async function generateAIText(input: GenerateAITextInput): Promise<GenerateAITextResult> {
  let primary: ProviderConfig | null = null
  let primaryError: unknown = null

  try {
    primary = resolvePrimaryConfig(input.purpose)
  } catch (configError) {
    primaryError = configError
    console.error('[AI] Primary configuration failed', {
      purpose: input.purpose,
      message: toErrorText(configError),
    })
  }

  if (primary) {
    try {
      const text = await callProvider(input, primary)
      return {
        text,
        provider: primary.provider,
        model: primary.model,
        usedFallback: false,
      }
    } catch (providerError) {
      primaryError = providerError
      console.error('[AI] Primary provider failed', {
        purpose: input.purpose,
        provider: primary.provider,
        model: primary.model,
        message: toErrorText(providerError),
        status: toErrorStatus(providerError),
        recoverable: isProviderRecoverableError(providerError),
      })
    }
  }

  const fallback = resolveFallbackConfig()

  if (!fallback || !shouldTryFallback(primaryError)) {
    throw new AIServiceError({
      code: 'AI_PRIMARY_FAILED',
      message: 'Primary AI provider failed and no fallback is available',
      statusCode: 503,
      retryable: isProviderRecoverableError(primaryError),
    })
  }

  try {
    const text = await callProvider(input, fallback)
    return {
      text,
      provider: fallback.provider,
      model: fallback.model,
      usedFallback: true,
    }
  } catch (fallbackError) {
    console.error('[AI] Fallback provider failed', {
      purpose: input.purpose,
      provider: fallback.provider,
      model: fallback.model,
      message: toErrorText(fallbackError),
      status: toErrorStatus(fallbackError),
    })

    throw new AIServiceError({
      code: 'AI_ALL_PROVIDERS_FAILED',
      message: 'All configured AI providers failed for this request',
      statusCode: 503,
      retryable: true,
    })
  }
}