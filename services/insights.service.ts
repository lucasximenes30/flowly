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
  language: string
}

// Cache em memória para server-side (Map com TTL)
const cache = new Map<string, { data: AIInsight[]; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

function cacheKey(input: InsightsInput): string {
  return JSON.stringify({
    i: input.monthlyIncome,
    e: input.monthlyExpense,
    t: input.topCategories.map((c) => `${c.category}:${Math.round(c.amount / 10) * 10}`),
    l: input.language,
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

  const prompt = `Atue como um consultor financeiro pessoal inteligente chamado "Flowly AI". O idioma de saída OBRIGATÓRIO é ${input.language === 'pt-BR' ? 'Português do Brasil' : 'Inglês'}.
Sua missão é dar 5 insights analíticos, não-triviais, acionáveis e humanizados baseados nos dados financeiros reais abaixo.

Diretrizes de Qualidade e Tom de Voz:
1. Tom: Confidente, direto e humanizado (como um bom conselheiro). Nunca soe robótico ou panfletário. Evite clichês vazios como "Ótima notícia!", "Parabéns!" ou "Atenção!".
2. Precisão: Embasamento nos números e categorias exatas. Nunca invente dados.
3. Equilíbrio: Dê feedbacks negativos construtivos (redução de excessos), positivos (crescimento ou economia) e sugestões operacionais ou estratégicas.
4. Clareza e Profundidade: Em vez de "Sua despesa em Alimentação foi de X", prefira "Alimentação consumiu X (Y% da sua renda). Tente substituir pequenos gastos diários nessa categoria para liberar limite para investimentos."
5. Se o saldo for negativo: Foco total em ação de corte e alerta crítico, mas construtivo num tom empático. Sugira com gentileza um limite realista.
6. Compare: Faça pequenas análises cruzadas (ex.: como um gasto X impactou o mês de modo geral vs. mês passado).

Formato Extrito:
- NUNCA retorne outro texto, cumprimentos ou marcações fora do bloco JSON.
- ARRAY JSON EXATO com 5 objetos: [{"text":"string","type":"positive"|"negative"|"tip"}]

DADOS FINANCEIROS - Análise:
Receita Mensal: R$ ${input.monthlyIncome.toFixed(2)} (${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs. último mês)
Despesas Mensais: R$ ${input.monthlyExpense.toFixed(2)} (${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs. último mês)
Saldo Mensal (Líquido): R$ ${input.monthlyBalance.toFixed(2)} (Diferença para o mês anterior: ${balanceChange >= 0 ? '+' : ''}R$ ${Math.abs(balanceChange).toFixed(2)})
Taxa de Retenção/Poupança: ${savingsRate}% da renda retida (dinheiro sobrando)

Maiores Gastos do Mês:
${categoryDetails}

Tendência Recente de Gastos e Receitas (Últimos 6 meses):
${trendText}

Ações Importantes a Refletir:
- Encontre oportunidades de corte ou otimização.
- Ofereça conselhos realistas sobre investimento, segurança financeira ou contenção.
- Não soe alarmista, mas sim orientador firme.`

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
  const isEn = input.language === 'en'

  if (input.topCategories.length > 0) {
    const top = input.topCategories[0]
    const pct = totalExpenses > 0 ? ((top.amount / totalExpenses) * 100).toFixed(0) : '0'
    const high = topCategoryIsHigh(totalExpenses, top.amount)
    insights.push({
      text: isEn 
        ? `${top.category} is your highest expense: R$ ${top.amount.toFixed(2)} (${pct}% of total spending). ${high ? 'Consider reviewing this to free up your budget.' : 'Keep an eye on it to maintain control.'}` 
        : `${top.category} é o seu maior gasto: R$ ${top.amount.toFixed(2)} (${pct}% do total). ${high ? 'Considere avaliar essa categoria para liberar mais orçamento.' : 'Acompanhe esse valor para continuar no controle.'}`,
      type: high ? 'negative' : 'tip'
    })
  }

  const balChange = input.monthlyBalance - input.previousBalance
  if (balChange >= 0) {
    insights.push({ 
      text: isEn 
        ? `Your balance improved by R$ ${Math.abs(balChange).toFixed(2)} compared to last month. Great job keeping your finances healthy!` 
        : `Seu saldo melhorou R$ ${Math.abs(balChange).toFixed(2)} em relação ao mês anterior. Ótimo trabalho em manter suas finanças saudáveis!`, 
      type: 'positive' 
    })
  } else {
    insights.push({ 
      text: isEn 
        ? `Your balance dropped by R$ ${Math.abs(balChange).toFixed(2)} compared to last month. Try to identify any unusual expenses that might have caused this.` 
        : `Seu saldo caiu R$ ${Math.abs(balChange).toFixed(2)} em relação ao último mês. Tente identificar gastos atípicos que geraram essa queda.`, 
      type: 'negative' 
    })
  }

  const expChange = input.monthlyExpense - input.previousExpense
  if (expChange > 0) {
    insights.push({ 
      text: isEn 
        ? `Your expenses increased by R$ ${expChange.toFixed(2)} compared to last month. Planning ahead can help you avoid surprises.` 
        : `Suas despesas subiram R$ ${expChange.toFixed(2)} em comparação ao mês passado. Um bom planejamento pode evitar surpresas futuras.`, 
      type: 'negative' 
    })
  } else if (expChange < 0) {
    insights.push({ 
      text: isEn 
        ? `You reduced your expenses by R$ ${Math.abs(expChange).toFixed(2)} compared to last month. This shows excellent cost control!` 
        : `Você reduziu suas despesas em R$ ${Math.abs(expChange).toFixed(2)} comparado ao mês passado. Mostra um excelente controle de custos!`, 
      type: 'positive' 
    })
  }

  const incChange = input.monthlyIncome - input.previousIncome
  if (incChange > 0) {
    insights.push({ 
      text: isEn 
        ? `Your income grew by R$ ${incChange.toFixed(2)} compared to last month. This is a great opportunity to increase your savings.` 
        : `Sua receita cresceu R$ ${incChange.toFixed(2)} em relação ao mês anterior. Esta é uma ótima oportunidade para poupar ou investir mais.`, 
      type: 'positive' 
    })
  }

  if (input.monthlyIncome > 0) {
    const savingsRate = ((input.monthlyBalance / input.monthlyIncome) * 100).toFixed(0)
    if (parseInt(savingsRate) >= 20) {
      insights.push({ 
        text: isEn 
          ? `You are saving ${savingsRate}% of your income. Consider investing this surplus to build your wealth.` 
          : `Você está poupando ${savingsRate}% do que ganha. Considere investir esse excedente para construir seu patrimônio.`, 
        type: 'positive' 
      })
    } else if (parseInt(savingsRate) < 0) {
      insights.push({ 
        text: isEn 
          ? `Your expenses have exceeded your income. Look for non-essential spending that you can easily cut back on.` 
          : `Suas despesas ultrapassaram sua receita. Revise os gastos não essenciais que podem ser cortados no curto prazo.`, 
        type: 'negative' 
      })
    }
  }

  if (input.topCategories.length >= 2) {
    const top2 = input.topCategories.slice(0, 2).reduce((s, c) => s + c.amount, 0)
    const pct = totalExpenses > 0 ? ((top2 / totalExpenses) * 100).toFixed(0) : '0'
    insights.push({ 
      text: isEn 
        ? `Combined, ${input.topCategories[0].category} and ${input.topCategories[1].category} make up ${pct}% of your expenses. Managing these two effectively will have a huge impact.` 
        : `Juntos, ${input.topCategories[0].category} e ${input.topCategories[1].category} representam ${pct}% das despesas. Focar em otimizar esses dois pontos trará um impacto enorme.`, 
      type: 'tip' 
    })
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

export async function calculateFinancialScore(userId: string, locale: string = 'pt-BR'): Promise<FinancialScore> {
  const isEn = locale !== 'pt-BR'
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

  // ... (keeping internal logic the same, just changing text generation below)
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
      recommendations.push(
        isEn 
          ? `Your savings rate is at ${(savingsRate * 100).toFixed(0)}%. Aim for at least 20% to build a stronger financial cushion.`
          : `Sua taxa de poupança está em ${(savingsRate * 100).toFixed(0)}%. A meta ideal é de pelo menos 20% para maior segurança financeira.`
      )
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
        recommendations.push(
          isEn 
            ? `The category "${categories[0][0]}" makes up ${Math.round(topPct * 100)}% of your expenses. Try to balance your spending across different needs.`
            : `A categoria "${categories[0][0]}" concentra ${Math.round(topPct * 100)}% dos seus gastos. Tente equilibrar melhor suas despesas.`
        )
      } else if (topPct > 0.35) {
        diversificationScore = 20
      }
    }

    if (categories.length < 3 && transactions.filter((t) => t.type === 'EXPENSE').length > 0) {
      diversificationScore = 15
      recommendations.push(
        isEn 
          ? `Low category diversity. Track all your expenses to get a fully clear picture of your habits.`
          : `Pouca diversidade nas categorias registradas. Tente organizar todos os seus gastos para uma visão mais completa.`
      )
    }
  }

  // Score 3: Consistência (0-25 pts) - transações regulares
  let consistencyScore = 25
  const uniqueDays = new Set(transactions.map((t) => t.date.toDateString())).size
  const monthProgress = now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const expectedDays = Math.max(1, Math.ceil(monthProgress * 15))

  if (uniqueDays < expectedDays * 0.5) {
    consistencyScore = 15
    recommendations.push(
      isEn 
        ? `Log your expenses more frequently for highly accurate insights and better control over your cash flow.`
        : `Registre seus gastos com maior frequência para receber análises mais precisas e melhorar seu controle.`
    )
  }

  // Score 4: Controle de gastos (0-20 pts)
  let controlScore = 20
  if (expenses > income && income > 0) {
    controlScore = 5
    recommendations.push(
      isEn 
        ? `You are spending more than your income this month. Prioritize cutting non-essential expenses to recover.`
        : `Você está gastando acima do que ganha neste mês. Priorize o corte de gastos não essenciais para se recuperar.`
    )
  } else if (income > 0 && expenses / income > 0.9) {
    controlScore = 12
    recommendations.push(
      isEn 
        ? `Your expenses are very close to your total income. Try to keep a larger safety margin.`
        : `Seus gastos estão muito próximos do total da sua receita. Busque manter uma margem de segurança maior.`
    )
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
      recommendations.push(
        isEn 
          ? `Your weekly expenses grew by ${increase}% in the last two weeks. Keep a close eye on your recent spending.`
          : `Seus gastos semanais subiram cerca de ${increase}% nas últimas duas semanas. Fique atento a essas variações.`
      )
    }
  }

  const totalScore = savingsScore + diversificationScore + consistencyScore + controlScore

  let label = ''
  if (totalScore >= 90) label = isEn ? 'Excellent' : 'Excelente'
  else if (totalScore >= 75) label = isEn ? 'Very Good' : 'Muito Bom'
  else if (totalScore >= 60) label = isEn ? 'Good' : 'Bom'
  else if (totalScore >= 40) label = isEn ? 'Fair' : 'Regular'
  else label = isEn ? 'Needs Improvement' : 'Precisa melhorar'

  return {
    score: totalScore,
    label,
    breakdown: [
      { category: isEn ? 'Savings' : 'Poupança', score: savingsScore, max: 30 },
      { category: isEn ? 'Diversification' : 'Diversificação', score: diversificationScore, max: 25 },
      { category: isEn ? 'Consistency' : 'Consistência', score: consistencyScore, max: 25 },
      { category: isEn ? 'Control' : 'Controle', score: controlScore, max: 20 },
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
    calculateFinancialScore(userId, locale),
    detectSpendingAnomalies(userId),
    getWeeklyAnalysis(userId),
  ])

  return { score, anomalies, weekly }
}
