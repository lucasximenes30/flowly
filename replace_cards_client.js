const fs = require('fs');

let fileContent = fs.readFileSync('app/cards/CardsClient.tsx', 'utf-8');

// 1. We replace `showForm` and related state with new modal states
const stateReplacement = `
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [showModal, setShowModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; cardId?: string }>({ isOpen: false, mode: 'create' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Confirmation Delete Modal
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [lastFourDigits, setLastFourDigits] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [closingDay, setClosingDay] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [color, setColor] = useState('blue')

  const resetForm = () => {
    setName('')
    setLastFourDigits('')
    setDueDay('')
    setClosingDay('')
    setLimitAmount('')
    setColor('blue')
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal({ isOpen: true, mode: 'create' })
  }

  const openEditModal = (card: Card) => {
    setName(card.name)
    setLastFourDigits(card.lastFourDigits)
    setDueDay(card.dueDay.toString())
    setClosingDay(card.closingDay.toString())
    setLimitAmount(card.limitAmount)
    setColor(card.color)
    setShowModal({ isOpen: true, mode: 'edit', cardId: card.id })
  }
`;

fileContent = fileContent.replace(
  /const \[cards, setCards\] = useState.*?const \[color, setColor\] = useState\('blue'\)/s,
  stateReplacement.trim()
);

fs.writeFileSync('app/cards/CardsClient.tsx', fileContent);

fileContent = fs.readFileSync('app/cards/CardsClient.tsx', 'utf-8');

const submitReplacement = `
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const url = showModal.mode === 'create' ? '/api/cards' : \`/api/cards/\${showModal.cardId}\`
      const method = showModal.mode === 'create' ? 'POST' : 'PATCH'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          lastFourDigits,
          dueDay: parseInt(dueDay),
          closingDay: parseInt(closingDay),
          limitAmount: parseFloat(limitAmount),
          color,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Falha ao processar cartão')
        return
      }

      const { card } = await res.json()
      
      if (showModal.mode === 'create') {
        setCards([...cards, card])
      } else {
        setCards(cards.map(c => c.id === card.id ? card : c))
      }
      
      resetForm()
      setShowModal({ isOpen: false, mode: 'create' })
      router.refresh()
    } catch {
      setError('Erro de conexão')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id)
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    
    try {
      const res = await fetch(\`/api/cards/\${confirmDeleteId}\`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao remover cartão')
      
      setCards(cards.filter(c => c.id !== confirmDeleteId))
      setConfirmDeleteId(null)
      router.refresh()
    } catch (err: any) {
      alert(err.message) // Wait, I should probably setError instead! Wait, I'll allow alert for now or implement an error toast.
    }
  }
`;

fileContent = fileContent.replace(
  /const handleSubmit = async.*?const handleDelete = async \(id: string\) => \{[^}]*return.*?^\s*\}/sm,
  submitReplacement.trim()
);

fs.writeFileSync('app/cards/CardsClient.tsx', fileContent);

fileContent = fs.readFileSync('app/cards/CardsClient.tsx', 'utf-8');

const modalReplacement = `
        {/* Add/Edit Card Modal */}
        {showModal.isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 transition-all duration-300"
            onClick={() => setShowModal({ isOpen: false, mode: 'create' })}
          >
            <div
              className="bg-white dark:bg-surface-900 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] transition-transform animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 flex items-center justify-between border-b border-surface-100 p-4 sm:p-6 dark:border-surface-800/50">
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                    {showModal.mode === 'create' ? 'Adicionar Cartão de Crédito' : 'Editar Cartão'}
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Preencha os dados básicos do seu cartão.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal({ isOpen: false, mode: 'create' })}
                  className="rounded-full p-2 -mr-2 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-colors"
                >
                  <Lucide.X className="h-5 w-5" />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
`;

fileContent = fileContent.replace(
  /\{\/\*\s*Add Card Form\s*\*\/\}.*?\<form onSubmit=\{handleSubmit\} className="space-y-4"\>\s*\<div className="grid grid-cols-1 md:grid-cols-2 gap-4"\>/s,
  modalReplacement.trim() + '\n'
);

const formFooterReplacement = `
                  </div>
                </div>
                
                <div className="flex-shrink-0 border-t border-surface-100 p-4 sm:p-6 dark:border-surface-800/50 bg-surface-50 dark:bg-surface-900/50 rounded-b-3xl sm:rounded-b-2xl">
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal({ isOpen: false, mode: 'create' })}
                      className="px-4 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-50 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-600 dark:hover:bg-surface-700 transition-colors shadow-sm w-full sm:w-auto"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center justify-center flex"
                    >
                      {submitting ? (
                        <Lucide.Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      ) : showModal.mode === 'create' ? (
                        'Adicionar Cartão'
                      ) : (
                        'Salvar Alterações'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all duration-300"
            onClick={() => setConfirmDeleteId(null)}
          >
            <div
              className="bg-white dark:bg-surface-900 w-full sm:max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Lucide.AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                  Excluir Cartão
                </h2>
                <p className="text-surface-600 dark:text-surface-400">
                  Tem certeza que deseja remover este cartão? O histórico de transações será mantido, mas você não poderá mais adicionar novas transações a ele.
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-900/50 px-6 py-4 border-t border-surface-100 dark:border-surface-800/50 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-xl hover:bg-surface-50 dark:bg-surface-800 dark:text-surface-300 dark:border-surface-600 dark:hover:bg-surface-700 transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors w-full sm:w-auto"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
`;

fileContent = fileContent.replace(
  /\{\/\*\s*Form Actions\s*\*\/\}.*?\<\/form\>\n\s*\<\/div\>\n\s*\)\}/s,
  formFooterReplacement.trim() + '\n'
);

fs.writeFileSync('app/cards/CardsClient.tsx', fileContent);

fileContent = fs.readFileSync('app/cards/CardsClient.tsx', 'utf-8');

fileContent = fileContent.replace(
  /onClick=\{.*?setShowForm\(!showForm\).*?\}/s,
  `onClick={openCreateModal}`
);

// add edit and delete buttons next to the card
const cardActionReplacement = `
                    <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-brand-600 dark:hover:bg-surface-800 dark:hover:text-brand-400 transition-colors"
                          title="Editar Cartão"
                        >
                          <Lucide.Pen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(c.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-surface-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                          title="Excluir Cartão"
                        >
                          <Lucide.Trash2 className="h-4 w-4" />
                        </button>
                    </div>
`;

fileContent = fileContent.replace(
  /\<button\s+onClick=\{\(\) \=\> handleDelete\(c\.id\)\}.*?\<\/button\>/s,
  cardActionReplacement.trim()
);

fs.writeFileSync('app/cards/CardsClient.tsx', fileContent);
