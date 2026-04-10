const fs = require('fs');

let fileContent = fs.readFileSync('app/dashboard/DashboardClient.tsx', 'utf-8');

const updatedFilterUI = `
          {/* Transaction List — Month Filter & Additional Filters */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                {isBRL ? 'Histórico de transações' : 'Transaction history'}
                {(filterType !== 'ALL' || filterDate || filterCategory || filterCardId !== 'ALL') && (
                  <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                    {isBRL ? 'Filtrado' : 'Filtered'}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {/* Filter toggle button */}
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className={\`flex h-9 items-center justify-center rounded-lg px-3 text-sm transition-all duration-200 \${
                    showFilters || (filterType !== 'ALL' || filterDate || filterCategory || filterCardId !== 'ALL')
                      ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium'
                      : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                  }\`}
                >
                  <Lucide.Filter className="w-4 h-4 mr-2" />
                  {isBRL ? 'Filtros' : 'Filters'}
                </button>
                {/* Sort toggle button */}
                <button
                  type="button"
                  onClick={() => setSortDesc((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-all duration-200"
                  title={sortDesc
                    ? (isBRL ? 'Mais recentes primeiro' : 'Most recent first')
                    : (isBRL ? 'Mais antigos primeiro' : 'Oldest first')
                  }
                >
                  {sortDesc ? (
                    <Lucide.SortDesc className="w-4 h-4" />
                  ) : (
                    <Lucide.SortAsc className="w-4 h-4" />
                  )}
                </button>
                {/* Month selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="input-field text-sm py-1.5 px-3 w-full sm:w-44 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 h-9"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expanded Filters Area */}
            {showFilters && (
              <div className="bg-surface-50 dark:bg-surface-800/40 p-4 rounded-xl border border-surface-200 dark:border-surface-700/50 animate-in slide-in-from-top-2 fade-in-50 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{isBRL ? 'Tipo' : 'Type'}</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="input-field text-sm w-full py-1.5 px-3 h-9"
                    >
                      <option value="ALL">{isBRL ? 'Todos' : 'All'}</option>
                      <option value="INCOME">{isBRL ? 'Receitas' : 'Income'}</option>
                      <option value="EXPENSE">{isBRL ? 'Despesas' : 'Expenses'}</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{isBRL ? 'Data Específica' : 'Specific Date'}</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="input-field text-sm w-full py-1.5 px-3 h-9"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{isBRL ? 'Categoria' : 'Category'}</label>
                    <input
                        type="text"
                        placeholder={isBRL ? 'Ex: Alimentação' : 'E.g. Food'}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="input-field text-sm w-full py-1.5 px-3 h-9"
                      />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{isBRL ? 'Cartão' : 'Card'}</label>
                    <select
                      value={filterCardId}
                      onChange={(e) => setFilterCardId(e.target.value)}
                      className="input-field text-sm w-full py-1.5 px-3 h-9"
                    >
                      <option value="ALL">{isBRL ? 'Todos os cartões e dinheiro' : 'All methods'}</option>
                      {cards.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {(filterType !== 'ALL' || filterDate || filterCategory || filterCardId !== 'ALL') && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={clearFilters}
                      className="text-xs font-medium text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Lucide.XCircle className="w-4 h-4" />
                      {isBRL ? 'Limpar filtros' : 'Clear filters'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {displayedTransactions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800/50">
              <svg className="mx-auto h-12 w-12 text-surface-300 dark:text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="mt-4 text-sm font-medium text-surface-900 dark:text-surface-100">
                {isBRL ? 'Nenhuma transação encontrada' : 'No transactions found'}
              </p>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
                {(filterType !== 'ALL' || filterDate || filterCategory || filterCardId !== 'ALL') 
                  ? (isBRL ? 'Tente alterar ou limpar os filtros applieds.' : 'Try changing or clearing your applied filters.')
                  : (isBRL ? 'Registre suas receitas e despesas do mês.' : 'Record your income and expenses for this month.')}
              </p>
              {(filterType !== 'ALL' || filterDate || filterCategory || filterCardId !== 'ALL') && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 mx-auto"
                >
                  {isBRL ? 'Limpar filtros' : 'Clear filters'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedTransactions.map((txn) => (
`;

fileContent = fileContent.replace(
  /\{\/\*\s*Transaction List — Month Filter\s*\*\/\}.*?\{\s*filteredMonthTransactions\.map\(\(txn\) \=\> \(/s,
  updatedFilterUI.trim() + '\n'
);

fs.writeFileSync('app/dashboard/DashboardClient.tsx', fileContent);
