'use server'

import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

export interface AIInsight {
  text: string
  type: 'positive' | 'negative' | 'tip'
}

export interface InsightsInput {
  monthlyIncome: number
  monthlyExpense: number
  monthlyBalance: number
  topCategories: { category: string; amount: number }[]
  previousIncome: number
  previousExpense: number
  previousBalance: number
  trend: { month: string; income: number; expense: number }[]
}

// Cache em memória para server-side (Map com TTL)
const cache = new Map<string, { data: AIInsight[]; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

function cacheKey(input: InsightsInput): string {
  return JSON.stringify({
    i: input.monthlyIncome,
    e: input.monthlyExpense,
    t: input.topCategories.map((c) => `${c.category}:${Math.round(c.amount / 10) * 10}`),
  })
}

export async function generateAIInsights(input: InsightsInput): Promise<AIInsight[]> {
  // Check cache em memória
  const key = cacheKey(input)
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
    },
  })

  const totalExpenses = input.topCategories.reduce((s, c) => s + c.amount, 0)
  const categoryDetails = input.topCategories.map((c) => {
    const pct = totalExpenses > 0 ? ((c.amount / totalExpenses) * 100).toFixed(0) : '0'
    return `- ${c.category}: R$ ${c.amount.toFixed(2)} (${pct}% do total de gastos)`
  }).join('\n')

  const trendText = input.trend.map((t) => `${t.month}: Receita R$ ${t.income.toFixed(2)} | Despesa R$ ${t.expense.toFixed(2)}`).join('\n')

  const incomeChange = input.previousIncome > 0 ? ((input.monthlyIncome - input.previousIncome) / input.previousIncome) * 100 : 0
  const expenseChange = input.previousExpense > 0 ? ((input.monthlyExpense - input.previousExpense) / input.previousExpense) * 100 : 0
  const balanceChange = input.monthlyBalance - input.previousBalance

  const topCategory = input.topCategories[0]
  const topCategoryPct = totalExpenses > 0 ? (topCategory ? (topCategory.amount / totalExpenses) * 100 : 0) : 0
  const savingsRate = input.monthlyIncome > 0 ? ((input.monthlyBalance / input.monthlyIncome) * 100).toFixed(1) : '0'

  const prompt = `Você é um consultor financeiro pessoal brasileiro chamado "Flowly AI". Analise os dados financeiros do usuário e gere 5 insights objetivos, práticos e personalizados.

Regras rigorosas:
1. Cite valores EXATOS e categorias ESPECÍFICAS dos dados fornecidos
2. Seja direto e natural - NUNCA use "parabéns", "ótima notícia", "fique tranquilo", "atenção" ou expressões similares
3. Se alguma categoria consome mais de 25% dos gastos, diga claramente e sugira uma meta de redução (ex: "Você gastou R$ X com Alimentação (Y% do total). Tente limitar a R$ Z no próximo mês")
4. Compare com o mês anterior com valores reais de diferença (ex: "Suas despesas subiram R$ X em relação ao mês passado")
5. Se o saldo é positivo, mencione a taxa de poupança e sugira onde investir
6. Se o saldo é negativo, priorize alertas sobre onde cortar
7. Misture: 1-2 positivos, 1-2 negativos/alertas, 1-2 dicas práticas
8. Use linguagem conversacional brasileira natural
9. Retorne APENAS JSON válido, sem texto adicional antes ou depois
10. Formato exato: [{"text":"string","type":"positive"|"negative"|"tip"}]

DADOS FINANCEIROS:

Resumo do mês:
- Receita: R$ ${input.monthlyIncome.toFixed(2)}
- Despesas: R$ ${input.monthlyExpense.toFixed(2)}
- Saldo: R$ ${input.monthlyBalance.toFixed(2)}
- Taxa de poupança: ${savingsRate}%

Gastos por categoria (do maior para o menor):
${categoryDetails}

A maior categoria é ${topCategory?.category ?? 'N/A'} com ${topCategoryPct.toFixed(0)}% do total.

Comparação com mês anterior:
- Receita: ${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% (diferença: R$ ${(input.monthlyIncome - input.previousIncome).toFixed(2)})
- Despesas: ${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% (diferença: R$ ${(input.monthlyExpense - input.previousExpense).toFixed(2)})
- Saldo: ${balanceChange >= 0 ? '+' : ''}R$ ${Math.abs(balanceChange).toFixed(2)}

Tendência dos últimos 6 meses:
${trendText}

IMPORTANTE: Se identificar um gasto que pode ser reduzido, SEMPRE sugira uma meta numérica para o próximo mês. Exemplo: "Tente limitar Alimentação a R$ X no próximo mês, uma redução de Y%."`

  const result = await model.generateContent(prompt)
  const response = result.response
  let text = response.text().trim()

  // Extrair JSON se tiver markdown wrapping
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (jsonMatch) {
    text = jsonMatch[0]
  }

  // Parse response
  let insights: AIInsight[]
  try {
    insights = JSON.parse(text)
  } catch {
    return getStaticInsights(input)
  }

  if (!Array.isArray(insights) || insights.length === 0) {
    return getStaticInsights(input)
  }

  // Normalize types
  insights = insights.map((i) => ({
    text: i.text ?? '',
    type: ['positive', 'negative', 'tip'].includes(i.type) ? i.type : 'tip',
  }))

  // Save to cache
  cache.set(key, { data: insights, timestamp: Date.now() })

  // Limpar entradas velhas do cache (>100 entries)
  if (cache.size > 100) {
    const keys = Array.from(cache.keys())
    for (let i = 0; i < keys.length - 80; i++) {
      cache.delete(keys[i])
    }
  }

  return insights
}

function getStaticInsights(input: InsightsInput): AIInsight[] {
  const insights: AIInsight[] = []
  const totalExpenses = input.topCategories.reduce((s, c) => s + c.amount, 0)

  if (input.topCategories.length > 0) {
    const top = input.topCategories[0]
    const pct = totalExpenses > 0 ? ((top.amount / totalExpenses) * 100).toFixed(0) : '0'
    insights.push({ text: `${top.category} é sua maior categoria: R$ ${top.amount.toFixed(2)} (${pct}% dos gastos)`, type: topCategoryIsHigh(totalExpenses, top.amount) ? 'negative' : 'tip' })
  }

  const balChange = input.monthlyBalance - input.previousBalance
  if (balChange >= 0) {
    insights.push({ text: `Seu saldo aumentou R$ ${Math.abs(balChange).toFixed(2)} em relação ao mês anterior`, type: 'positive' })
  } else {
    insights.push({ text: `Seu saldo diminuiu R$ ${Math.abs(balChange).toFixed(2)} em relação ao mês anterior`, type: 'negative' })
  }

  const expChange = input.monthlyExpense - input.previousExpense
  if (expChange > 0) {
    insights.push({ text: `Suas despesas aumentaram R$ ${expChange.toFixed(2)} em relação ao mês anterior`, type: 'negative' })
  } else if (expChange < 0) {
    insights.push({ text: `Você reduziu R$ ${Math.abs(expChange).toFixed(2)} nas despesas em relação ao mês anterior`, type: 'positive' })
  }

  const incChange = input.monthlyIncome - input.previousIncome
  if (incChange > 0) {
    insights.push({ text: `Sua receita aumentou R$ ${incChange.toFixed(2)} em relação ao mês anterior`, type: 'positive' })
  }

  if (input.monthlyIncome > 0) {
    const savingsRate = ((input.monthlyBalance / input.monthlyIncome) * 100).toFixed(0)
    if (parseInt(savingsRate) >= 20) {
      insights.push({ text: `Você está poupando ${savingsRate}% da receita - considere investir o excedente`, type: 'positive' })
    } else if (parseInt(savingsRate) < 0) {
      insights.push({ text: `Suas despesas ultrapassaram a receita. Reveja gastos não essenciais para equilibrar`, type: 'negative' })
    }
  }

  if (input.topCategories.length >= 2) {
    const top2 = input.topCategories.slice(0, 2).reduce((s, c) => s + c.amount, 0)
    const pct = totalExpenses > 0 ? ((top2 / totalExpenses) * 100).toFixed(0) : '0'
    insights.push({ text: `${input.topCategories[0].category} e ${input.topCategories[1].category} juntos representam ${pct}% dos gastos`, type: 'tip' })
  }

  return insights.slice(0, 5)
}

function topCategoryIsHigh(total: number, topAmount: number): boolean {
  if (total === 0) return false
  return (topAmount / total) > 0.3
}

// ==================== ANÁLISES AVANÇADAS ====================

export interface WeeklyAnalysis {
  week: string
  income: number
  expense: number
  balance: number
  transactionCount: number
  topCategory: string | null
}

/**
 * Análise semanal dos últimos 4 meses (ou do período disponível)
 */
export async function getWeeklyAnalysis(userId: string): Promise<WeeklyAnalysis[]> {
  const now = new Date()
  const fourMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: fourMonthsAgo,
        lte: now,
      },
    },
    orderBy: { date: 'asc' },
  })

  // Agrupar por semana
  const weeks = new Map<string, {
    income: number
    expense: number
    transactions: typeof transactions
  }>()

  transactions.forEach((t) => {
    const weekStart = getWeekStart(t.date)
    const key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`

    if (!weeks.has(key)) {
      weeks.set(key, { income: 0, expense: 0, transactions: [] })
    }
    const week = weeks.get(key)!
    week.transactions.push(t)
    if (t.type === 'INCOME') {
      week.income += Number(t.amount)
    } else {
      week.expense += Number(t.amount)
    }
  })

  const result: WeeklyAnalysis[] = []
  for (const [weekKey, data] of weeks) {
    const topCategory = data.transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce<Map<string, number>>((acc, t) => {
        acc.set(t.category, (acc.get(t.category) || 0) + Number(t.amount))
        return acc
      }, new Map())

    const [topCat] = Array.from(topCategory.entries()).sort((a, b) => b[1] - a[1])

    result.push({
      week: weekKey,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      balance: Math.round((data.income - data.expense) * 100) / 100,
      transactionCount: data.transactions.length,
      topCategory: topCat ? topCat[0] : null,
    })
  }

  return result
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d
}

/**
 * Score financeiro: nota de 0-100 baseada nos hábitos do usuário
 */
export interface FinancialScore {
  score: number
  label: string
  breakdown: {
    category: string
    score: number
    max: number
  }[]
  recommendations: string[]
}

export async function calculateFinancialScore(userId: string): Promise<FinancialScore> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfMonth,
        lte: now,
      },
    },
  })

  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const recommendations: string[] = []

  // Score 1: Taxa de poupança (0-30 pts)
  let savingsScore = 0
  if (income > 0) {
    const savingsRate = (income - expenses) / income
    if (savingsRate >= 0.3) savingsScore = 30
    else if (savingsRate >= 0.2) savingsScore = 25
    else if (savingsRate >= 0.1) savingsScore = 20
    else if (savingsRate >= 0) savingsScore = 15
    else if (savingsRate >= -0.1) savingsScore = 10
    else savingsScore = 5

    if (savingsRate < 0.2) {
      recommendations.push(`Sua taxa de poupança está em ${(savingsRate * 100).toFixed(0)}%. A meta ideal é pelo menos 20%.`)
    }
  }

  // Score 2: Diversificação de gastos (0-25 pts)
  let diversificationScore = 25
  const expenseByCategory = new Map<string, number>()
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      expenseByCategory.set(t.category, (expenseByCategory.get(t.category) || 0) + Number(t.amount))
    })

  if (expenses > 0) {
    const categories = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1])
    if (categories.length > 0) {
      const topPct = categories[0][1] / expenses
      if (topPct > 0.5) {
        diversificationScore = 15
        recommendations.push(`A categoria ${categories[0][0]} concentra ${Math.round(topPct * 100)}% dos gastos. Considere diversificar.`)
      } else if (topPct > 0.35) {
        diversificationScore = 20
      }
    }

    if (categories.length < 3 && transactions.filter((t) => t.type === 'EXPENSE').length > 0) {
      diversificationScore = 15
      recommendations.push('Pouca diversidade nas categorias. Registre todos os gastos para ter uma visão completa.')
    }
  }

  // Score 3: Consistência (0-25 pts) - transações regulares
  let consistencyScore = 25
  const uniqueDays = new Set(transactions.map((t) => t.date.toDateString())).size
  const monthProgress = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const expectedDays = Math.max(1, Math.ceil(monthProgress * 15))

  if (uniqueDays < expectedDays * 0.5) {
    consistencyScore = 15
    recommendations.push('Registre seus gastos com mais frequência para ter análises mais precisas.')
  }

  // Score 4: Controle de gastos (0-20 pts)
  let controlScore = 20
  if (expenses > income && income > 0) {
    controlScore = 5
    recommendations.push('Você está gastando mais do que ganha. Priorize cortar gastos não essenciais.')
  } else if (income > 0 && expenses / income > 0.9) {
    controlScore = 12
    recommendations.push('Seus gastos estão muito próximos da receita. Busque uma margem maior.')
  }

  // Verificar se há transações de tendência de aumento
  if (transactions.length >= 4) {
    const last2WeekTransactions = transactions.filter(
      (t) => t.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)
    )
    const prev2WeekTransactions = transactions.filter(
      (t) => t.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - 28) &&
             t.date < new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14)
    )

    const last2WeekSpending = last2WeekTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const prev2WeekSpending = prev2WeekTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    if (prev2WeekSpending > 0 && last2WeekSpending > prev2WeekSpending * 1.2) {
      const increase = ((last2WeekSpending - prev2WeekSpending) / prev2WeekSpending * 100).toFixed(0)
      recommendations.push(`Seus gastos semanais aumentaram ${increase}% nas últimas 2 semanas. Fique atento.`)
    }
  }

  const totalScore = savingsScore + diversificationScore + consistencyScore + controlScore

  let label = ''
  if (totalScore >= 90) label = 'Excelente'
  else if (totalScore >= 75) label = 'Muito Bom'
  else if (totalScore >= 60) label = 'Bom'
  else if (totalScore >= 40) label = 'Regular'
  else label = 'Precisa melhorar'

  return {
    score: totalScore,
    label,
    breakdown: [
      { category: 'Poupança', score: savingsScore, max: 30 },
      { category: 'Diversificação', score: diversificationScore, max: 25 },
      { category: 'Consistência', score: consistencyScore, max: 25 },
      { category: 'Controle', score: controlScore, max: 20 },
    ],
    recommendations,
  }
}

/**
 * Detectar anomalias de gastos (picos incomuns)
 */
export interface SpendingAnomaly {
  date: string
  category: string
  amount: number
  averageInCategory: number
  deviation: number
  title: string
}

export async function detectSpendingAnomalies(userId: string): Promise<SpendingAnomaly[]> {
  // Pegar transações dos últimos 3 meses
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1)

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'EXPENSE',
      date: {
        gte: threeMonthsAgo,
        lte: now,
      },
    },
    orderBy: { date: 'asc' },
  })

  // Calcular média e desvio por categoria
  const categoryStats = new Map<string, { amounts: number[]; total: number }>()

  transactions.forEach((t) => {
    if (!categoryStats.has(t.category)) {
      categoryStats.set(t.category, { amounts: [], total: 0 })
    }
    const stats = categoryStats.get(t.category)!
    const amount = Number(t.amount)
    stats.amounts.push(amount)
    stats.total += amount
  })

  const anomalies: SpendingAnomaly[] = []

  transactions.forEach((t) => {
    const amount = Number(t.amount)
    const stats = categoryStats.get(t.category)!

    if (stats.amounts.length < 3) return // precisa de pelo menos 3 dados para comparar

    const avg = stats.total / stats.amounts.length
    const variance = stats.amounts.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / stats.amounts.length
    const stdDev = Math.sqrt(variance)

    if (stdDev === 0) return

    const deviation = (amount - avg) / stdDev

    // Se mais de 2 desvios padrões acima da média, é anomalia
    if (deviation > 2 && stats.amounts.length >= 3) {
      anomalies.push({
        date: t.date.toISOString(),
        category: t.category,
        amount,
        averageInCategory: Math.round(avg * 100) / 100,
        deviation: Math.round(deviation * 100) / 100,
        title: t.title,
      })
    }
  })

  return anomalies.sort((a, b) => b.deviation - a.deviation).slice(0, 5)
}

/**
 * Gerar insights personalizados para seção de relatórios avançados
 */
export async function generateAdvancedInsights(
  userId: string,
  locale: string = 'pt-BR'
): Promise<{
  score: FinancialScore
  anomalies: SpendingAnomaly[]
  weekly: WeeklyAnalysis[]
}> {
  const [score, anomalies, weekly] = await Promise.all([
    calculateFinancialScore(userId),
    detectSpendingAnomalies(userId),
    getWeeklyAnalysis(userId),
  ])

  return { score, anomalies, weekly }
}
