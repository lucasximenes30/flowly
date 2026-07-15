export type SupportedLocale = 'pt-BR' | 'en'

export const CATEGORY_LABELS: Record<string, Record<SupportedLocale, string>> = {
  Salary: { 'pt-BR': 'Salário', en: 'Salary' },
  Freelance: { 'pt-BR': 'Freelance', en: 'Freelance' },
  Food: { 'pt-BR': 'Alimentação', en: 'Food' },
  Transport: { 'pt-BR': 'Transporte', en: 'Transport' },
  Entertainment: { 'pt-BR': 'Lazer', en: 'Entertainment' },
  Shopping: { 'pt-BR': 'Compras', en: 'Shopping' },
  Bills: { 'pt-BR': 'Contas', en: 'Bills' },
  Health: { 'pt-BR': 'Saúde', en: 'Health' },
  General: { 'pt-BR': 'Geral', en: 'General' },
  Investment: { 'pt-BR': 'Investimento', en: 'Investment' },
  Other: { 'pt-BR': 'Outro', en: 'Other' },
  Restaurant: { 'pt-BR': 'Restaurante', en: 'Restaurant' },
  Gym: { 'pt-BR': 'Academia', en: 'Gym' },
  Home: { 'pt-BR': 'Casa', en: 'Home' },
  Education: { 'pt-BR': 'Educação', en: 'Education' },
}

const CATEGORY_ALIASES: Record<string, string> = {
  salario: 'Salary',
  alimentação: 'Food',
  alimentacao: 'Food',
  transporte: 'Transport',
  lazer: 'Entertainment',
  entretenimento: 'Entertainment',
  compras: 'Shopping',
  contas: 'Bills',
  saúde: 'Health',
  saude: 'Health',
  geral: 'General',
  investimento: 'Investment',
  outro: 'Other',
  restaurante: 'Restaurant',
  academia: 'Gym',
  casa: 'Home',
  educação: 'Education',
  educacao: 'Education',
}

function normalizeCategoryText(value: string): string {
  if (!value) return ''
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function resolveCanonicalCategory(category: string): string | null {
  if (!category) return null
  if (category in CATEGORY_LABELS) return category

  const normalized = normalizeCategoryText(category)
  const fromAlias = CATEGORY_ALIASES[normalized]
  if (fromAlias) return fromAlias

  for (const [canonical, labels] of Object.entries(CATEGORY_LABELS)) {
    if (
      normalizeCategoryText(labels['pt-BR']) === normalized ||
      normalizeCategoryText(labels.en) === normalized ||
      normalizeCategoryText(canonical) === normalized
    ) {
      return canonical
    }
  }

  return null
}

export function localizeCategoryName(category: string, language: SupportedLocale = 'pt-BR'): string {
  if (!category) return ''
  const canonical = resolveCanonicalCategory(category)
  if (!canonical) return category
  return CATEGORY_LABELS[canonical][language]
}
