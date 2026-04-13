'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export const translations = {
  'pt-BR': {
    // Common
    'common.signIn': 'Entrar',
    'common.signUp': 'Criar Conta',
    'common.signOut': 'Sair',
    'common.email': 'E-mail',
    'common.password': 'Senha',
    'common.name': 'Nome',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',

    // Auth
    'auth.welcomeBack': 'Bem-vindo de volta. Entre na sua conta.',
    'auth.createAccount': 'Crie sua conta para começar.',
    'auth.namePlaceholder': 'João Silva',
    'auth.emailPlaceholder': 'voce@exemplo.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.signingIn': 'Entrando...',
    'auth.creatingAccount': 'Criando conta...',
    'auth.noAccount': 'Não tem conta?',
    'auth.hasAccount': 'Já tem conta?',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.currentBalance': 'Saldo Atual',
    'dashboard.totalIncome': 'Receitas',
    'dashboard.totalExpenses': 'Despesas',
    'dashboard.thisMonth': 'Este Mês',
    'dashboard.monthlyIncome': 'Receita do Mês',
    'dashboard.monthlyExpenses': 'Despesas do Mês',
    'dashboard.recentTransactions': 'Transações Recentes',
    'dashboard.addTransaction': '+ Nova Transação',
    'dashboard.noTransactions': 'Nenhuma transação ainda.',
    'dashboard.addFirstTransaction': 'Adicione sua primeira transação para começar.',
    'dashboard.expense': 'Despesa',
    'dashboard.income': 'Receita',
    'dashboard.categoryPlaceholder': 'Selecione a categoria',
    'dashboard.datePickerLabel': 'Data',
    'dashboard.editTransaction': 'Editar Transação',
    'dashboard.recurring': 'Recorrente',
    'transaction.saveChanges': 'Salvar Alterações',

    // Transaction form
    'transaction.title': 'Título',
    'transaction.amount': 'Valor',
    'transaction.type': 'Tipo',
    'transaction.category': 'Categoria',
    'transaction.date': 'Data',
    'transaction.saving': 'Salvando...',
    'transaction.save': 'Salvar Transação',
    'transaction.titlePlaceholder': 'Nome da transação',
    'transaction.failed': 'Falha ao criar transação',
    'transaction.networkError': 'Erro de rede',

    // Settings
    'settings.title': 'Configurações',
    'settings.general': 'Geral',
    'settings.theme': 'Tema',
    'settings.themeLight': 'Claro',
    'settings.themeDark': 'Escuro',
    'settings.themeSystem': 'Automático',
    'settings.language': 'Idioma',
    'settings.changePassword': 'Alterar Senha',
    'settings.currentPassword': 'Senha Atual',
    'settings.newPassword': 'Nova Senha',
    'settings.confirmPassword': 'Confirmar Nova Senha',
    'settings.passwordUpdated': 'Senha atualizada com sucesso!',
    'settings.passwordMismatch': 'As senhas não coincidem.',
    'settings.passwordSame': 'A nova senha deve ser diferente da atual.',
    'settings.changingPassword': 'Alterando senha...',
    'settings.update': 'Alterar Senha',
    'settings.profile': 'Perfil',
    'settings.profileName': 'Nome',
    'settings.namePlaceholder': 'Seu nome',
    'settings.updateName': 'Atualizar Nome',
    'settings.updatingName': 'Atualizando...',
    'settings.nameUpdated': 'Nome atualizado com sucesso!',
    'settings.nameSame': 'O novo nome deve ser diferente do atual.',
    'settings.confirmNameChange': 'Tem certeza que deseja alterar seu nome?',
    'settings.dangerZone': 'Zona de Perigo',
    'settings.deleteAccount': 'Excluir Conta',
    'settings.deleteAccountTitle': 'Excluir sua Conta',
    'settings.deleteAccountWarning': 'Essa ação é irreversível e todos os seus dados serão removidos permanentemente.',
    'settings.deleteAccountConfirm': 'Tem certeza que deseja excluir sua conta?',
    'settings.deleteAccountFinalConfirm': 'Essa é a sua última chance. Digite "EXCLUIR" para confirmar.',
    'settings.deleteConfirmationText': 'EXCLUIR',
    'settings.deletingAccount': 'Excluindo conta...',
    'settings.accountDeleted': 'Conta excluída com sucesso.',
    'settings.confirmPasswordChange': 'Tem certeza que deseja alterar sua senha?',
    'settings.cancel': 'Cancelar',
    'settings.confirm': 'Confirmar',

    // Landing
    'landing.tagline': 'Gestão financeira pessoal, de um jeito simples e bonito.',

    // Category translations
    'category.Salary': 'Salário',
    'category.Freelance': 'Freelance',
    'category.Food': 'Alimentação',
    'category.Transport': 'Transporte',
    'category.Entertainment': 'Lazer',
    'category.Shopping': 'Compras',
    'category.Bills': 'Contas',
    'category.Health': 'Saúde',
    'category.General': 'Geral',
    'category.Investment': 'Investimento',
    'category.Other': 'Outro',
    'category.Restaurant': 'Restaurante',
    'category.Gym': 'Academia',
    'category.Home': 'Casa',
    'category.Education': 'Educação',

    // Monthly Report
    'monthly.selectMonth': 'Selecione um mês',
    'monthly.currentMonth': 'Mês Atual',
    'monthly.previousMonth': 'Mês Anterior',
    'monthly.comparison': 'Comparação',
    'monthly.incomeChange': 'Variação de Receita',
    'monthly.expenseChange': 'Variação de Despesa',
    'monthly.balanceChange': 'Variação de Saldo',
    'monthly.increase': 'Aumento de',
    'monthly.decrease': 'Redução de',
    'monthly.report': 'Relatório de',

    // Month names
    'month.january': 'Janeiro',
    'month.february': 'Fevereiro',
    'month.march': 'Março',
    'month.april': 'Abril',
    'month.may': 'Maio',
    'month.june': 'Junho',
    'month.july': 'Julho',
    'month.august': 'Agosto',
    'month.september': 'Setembro',
    'month.october': 'Outubro',
    'month.november': 'Novembro',
    'month.december': 'Dezembro',

    // Reports
    'reports.title': 'Relatórios',
    'reports.subtitle': 'Análise mensal dos seus gastos',
    'reports.income': 'Receita',
    'reports.expenses': 'Despesas',
    'reports.balance': 'Saldo',
    'reports.insights': 'Insights',
    'reports.expenseByCategory': 'Despesas por Categoria',
    'reports.incomeVsExpenses': 'Receitas vs Despesas',
    'reports.comparison': 'Comparação Mensal',
    'reports.viewReports': 'Ver relatórios',
    'reports.noExpenses': 'Nenhuma despesa neste mês',
    'reports.noData': 'Sem dados suficientes',
    'reports.backToDashboard': 'Voltar ao Dashboard',

    // Cards
    'cards.title': 'Cartões',

    // Workout Generator
    'workout.generatePlan': 'Gerar Plano com IA',
    'workout.objective': 'Objetivo',
    'workout.objectiveMusclGain': 'Ganho de Massa Muscular',
    'workout.objectiveFatLoss': 'Perda de Gordura / Definição',
    'workout.objectiveStrength': 'Ganho de Força',
    'workout.objectiveEndurance': 'Resistência Cardiovascular',
    'workout.objectiveGeneral': 'Condicionamento Geral',
    'workout.level': 'Nível de Experiência',
    'workout.levelBeginner': 'Iniciante',
    'workout.levelIntermediate': 'Intermediário',
    'workout.levelAdvanced': 'Avançado',
    'workout.daysPerWeek': 'Dias por Semana',
    'workout.focus': 'Foco / Áreas de Trabalho',
    'workout.focusPlaceholder': 'Ex: peito e tríceps, costas e bíceps, pernas, etc',
    'workout.sex': 'Sexo (Opcional)',
    'workout.sexMale': 'Masculino',
    'workout.sexFemale': 'Feminino',
    'workout.sexPreferNotSay': 'Prefiro não informar',
    'workout.sexHint': 'Servirá como contexto para personalizar o plano, mas não é regra absoluta.',
    'workout.generating': 'Gerando plano...',
    'workout.generateError': 'Erro ao gerar plano. Tente novamente.',
  },
  'en': {
    'common.signIn': 'Sign In',
    'common.signUp': 'Create Account',
    'common.signOut': 'Sign out',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.name': 'Name',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'auth.welcomeBack': 'Welcome back. Sign in to your account.',
    'auth.createAccount': 'Create your account to get started.',
    'auth.namePlaceholder': 'John Doe',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.noAccount': "Don't have an account? ",
    'auth.hasAccount': 'Already have an account? ',
    'dashboard.title': 'Dashboard',
    'dashboard.currentBalance': 'Current Balance',
    'dashboard.totalIncome': 'Total Income',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.thisMonth': 'This Month',
    'dashboard.monthlyIncome': 'Monthly Income',
    'dashboard.monthlyExpenses': 'Monthly Expenses',
    'dashboard.recentTransactions': 'Recent Transactions',
    'dashboard.addTransaction': '+ Add Transaction',
    'dashboard.noTransactions': 'No transactions yet.',
    'dashboard.addFirstTransaction': 'Add your first transaction to get started.',
    'dashboard.expense': 'Expense',
    'dashboard.income': 'Income',
    'dashboard.categoryPlaceholder': 'Select category',
    'dashboard.datePickerLabel': 'Date',
    'dashboard.editTransaction': 'Edit Transaction',
    'dashboard.recurring': 'Recurring',
    'transaction.saveChanges': 'Save Changes',
    'transaction.title': 'Title',
    'transaction.amount': 'Amount',
    'transaction.type': 'Type',
    'transaction.category': 'Category',
    'transaction.date': 'Date',
    'transaction.saving': 'Saving...',
    'transaction.save': 'Save Transaction',
    'transaction.titlePlaceholder': 'Transaction name',
    'transaction.failed': 'Failed to create transaction',
    'transaction.networkError': 'Network error',
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'Auto',
    'settings.language': 'Language',
    'settings.changePassword': 'Change Password',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmPassword': 'Confirm New Password',
    'settings.passwordUpdated': 'Password updated successfully!',
    'settings.passwordMismatch': 'Passwords do not match.',
    'settings.passwordSame': 'New password must be different from current password.',
    'settings.changingPassword': 'Changing password...',
    'settings.update': 'Change Password',
    'settings.profile': 'Profile',
    'settings.profileName': 'Name',
    'settings.namePlaceholder': 'Your name',
    'settings.updateName': 'Update Name',
    'settings.updatingName': 'Updating...',
    'settings.nameUpdated': 'Name updated successfully!',
    'settings.nameSame': 'New name must be different from current name.',
    'settings.confirmNameChange': 'Are you sure you want to change your name?',
    'settings.dangerZone': 'Danger Zone',
    'settings.deleteAccount': 'Delete Account',
    'settings.deleteAccountTitle': 'Delete Your Account',
    'settings.deleteAccountWarning': 'This action is irreversible and all your data will be permanently removed.',
    'settings.deleteAccountConfirm': 'Are you sure you want to delete your account?',
    'settings.deleteAccountFinalConfirm': 'This is your last chance. Type "DELETE" to confirm.',
    'settings.deleteConfirmationText': 'DELETE',
    'settings.deletingAccount': 'Deleting account...',
    'settings.accountDeleted': 'Account deleted successfully.',
    'settings.confirmPasswordChange': 'Are you sure you want to change your password?',
    'settings.cancel': 'Cancel',
    'settings.confirm': 'Confirm',
    'landing.tagline': 'Effortless financial tracking, beautifully simple.',
    'category.Salary': 'Salary',
    'category.Freelance': 'Freelance',
    'category.Food': 'Food',
    'category.Transport': 'Transport',
    'category.Entertainment': 'Entertainment',
    'category.Shopping': 'Shopping',
    'category.Bills': 'Bills',
    'category.Health': 'Health',
    'category.General': 'General',
    'category.Investment': 'Investment',
    'category.Other': 'Other',
    'category.Restaurant': 'Restaurant',
    'category.Gym': 'Gym',
    'category.Home': 'Home',
    'category.Education': 'Education',

    // Monthly Report
    'monthly.selectMonth': 'Select a month',
    'monthly.currentMonth': 'Current Month',
    'monthly.previousMonth': 'Previous Month',
    'monthly.comparison': 'Comparison',
    'monthly.incomeChange': 'Income Change',
    'monthly.expenseChange': 'Expense Change',
    'monthly.balanceChange': 'Balance Change',
    'monthly.increase': 'Increase of',
    'monthly.decrease': 'Decrease of',
    'monthly.report': 'Report for',

    // Month names
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December',

    'cards.title': 'Cards',

    // Workout Generator
    'workout.generatePlan': 'Generate Plan with AI',
    'workout.objective': 'Objective',
    'workout.objectiveMusclGain': 'Muscle Gain / Hypertrophy',
    'workout.objectiveFatLoss': 'Fat Loss / Definition',
    'workout.objectiveStrength': 'Strength Gain',
    'workout.objectiveEndurance': 'Cardiovascular Endurance',
    'workout.objectiveGeneral': 'General Fitness',
    'workout.level': 'Experience Level',
    'workout.levelBeginner': 'Beginner',
    'workout.levelIntermediate': 'Intermediate',
    'workout.levelAdvanced': 'Advanced',
    'workout.daysPerWeek': 'Days per Week',
    'workout.focus': 'Focus / Areas of Work',
    'workout.focusPlaceholder': 'Ex: chest and triceps, back and biceps, legs, etc',
    'workout.sex': 'Sex (Optional)',
    'workout.sexMale': 'Male',
    'workout.sexFemale': 'Female',
    'workout.sexPreferNotSay': 'Prefer not to say',
    'workout.sexHint': 'Will serve as context to personalize the plan, but is not an absolute rule.',
    'workout.generating': 'Generating plan...',
    'workout.generateError': 'Error generating plan. Try again.',
  },
}

type Locale = 'pt-BR' | 'en'
type Theme = 'light' | 'dark' | 'system'

interface AppContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
  t: (key: string) => string
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('pt-BR')
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const saved = localStorage.getItem('flowly_locale') as Locale | null
    if (saved && (saved === 'pt-BR' || saved === 'en')) setLocale(saved)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('flowly_theme') as Theme | null
    if (saved && ['light', 'dark', 'system'].includes(saved)) setTheme(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('flowly_locale', locale)
    document.documentElement.lang = locale
  }, [locale])

  useEffect(() => {
    localStorage.setItem('flowly_theme', theme)
  }, [theme])

  const resolvedTheme = (() => {
    if (theme === 'light') return 'light' as const
    if (theme === 'dark') return 'dark' as const
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      return 'dark' as const
    return 'light' as const
  })()

  // Sync dark class on html element
  useEffect(() => {
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [resolvedTheme])

  // Listen for system theme changes
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (theme === 'system') {
        setTheme((prev) => prev) // force re-render
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  const t = (key: string): string => {
    const dict = (translations as Record<string, Record<string, string>>)[locale] ?? translations['en']
    const result = dict[key] ?? translations['en'][key as keyof typeof translations['en']] ?? key
    // For category keys like "category.CustomName", return the raw name when not translated
    if (result === key && key.startsWith('category.')) {
      return key.slice(9)
    }
    return result
  }

  return (
    <AppContext.Provider value={{ locale, setLocale, theme, setTheme, resolvedTheme, t }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
