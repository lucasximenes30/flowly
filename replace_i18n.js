const fs = require('fs');
const path = require('path');

const translations = {
    'common.signIn': 'Entrar',
    'common.signUp': 'Criar Conta',
    'common.signOut': 'Sair',
    'common.email': 'E-mail',
    'common.password': 'Senha',
    'common.name': 'Nome',
    'common.cancel': 'Cancelar',
    'common.save': 'Salvar',
    'auth.welcomeBack': 'Bem-vindo de volta. Entre na sua conta.',
    'auth.createAccount': 'Crie sua conta para começar.',
    'auth.namePlaceholder': 'João Silva',
    'auth.emailPlaceholder': 'voce@exemplo.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.signingIn': 'Entrando...',
    'auth.creatingAccount': 'Criando conta...',
    'auth.noAccount': 'Não tem conta?',
    'auth.hasAccount': 'Já tem conta?',
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
    'landing.tagline': 'Gestão financeira pessoal, de um jeito simples e bonito.',
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
    'cards.title': 'Cartões',
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
    'workout.generateError': 'Erro ao gerar plano. Tente novamente.'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        // Exclude specific files we manually updated correctly
        if (fullPath.includes('AuthPage.tsx') || fullPath.includes('Sidebar.tsx') || fullPath.includes('SidebarLayout.tsx')) continue;

        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove import { useApp } from '@/lib/i18n'
    content = content.replace(/import\s+\{\s*useApp\s*\}\s+from\s+['"]@\/lib\/i18n['"];?\n?/g, '');
    
    // Remove const { t, locale } = useApp() or similar
    content = content.replace(/const\s+\{\s*t(?:,\s*locale)?\s*\}\s*=\s*useApp\(\);?\n?/g, '');
    content = content.replace(/const\s+\{\s*locale(?:,\s*t)?\s*\}\s*=\s*useApp\(\);?\n?/g, '');
    
    // Some places might have const isBRL = locale === 'pt-BR'; let's replace isBRL checks
    content = content.replace(/const\s+isBRL\s*=\s*(?:locale\s*===\s*'pt-BR'|true|false);?/g, 'const isBRL = true;');

    // ONLY match exactly \bt( so it doesn't match split( or import(
    content = content.replace(/\bt\(['"]([^'"]+)['"]\)/g, (match, key) => {
        return translations[key] ? `"${translations[key]}"` : `"${key.split('.').pop()}"`;
    });

    content = content.replace(/isBRL\s*\?\s*['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g, "'$1'");
    content = content.replace(/isBRL\s*\?\s*`([^`]+)`\s*:\s*`([^`]+)`/g, "`$1`");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated', filePath);
    }
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
processDirectory(path.join(__dirname, 'lib'));
