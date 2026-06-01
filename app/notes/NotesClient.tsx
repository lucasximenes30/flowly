'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as Lucide from 'lucide-react'
import NoteModal from './NoteModal'

export default function NotesClient() {
  const router = useRouter()
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isNoteModalOpen, setNoteModalOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any | null>(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notes')
      if (res.ok) {
        const data = await res.json()
        setNotes(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleEdit = (note: any) => {
    setSelectedNote(note)
    setNoteModalOpen(true)
  }

  return (
    <div className="min-h-full bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-300 animate-dashboard-fade">
      {/* Header */}
      <header className="border-b border-surface-200/80 bg-white dark:bg-surface-900 dark:border-surface-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 hover:bg-surface-100 hover:text-surface-700 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-all duration-200"
              title="Voltar ao Dashboard"
            >
              <Lucide.ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-base font-semibold tracking-tight">Smart Notes</h1>
          </div>
          <button
            onClick={() => {
              setSelectedNote(null)
              setNoteModalOpen(true)
            }}
            className="btn-primary h-9 px-4 text-xs font-semibold shadow-lg shadow-brand-500/20"
          >
            <Lucide.Plus className="w-4 h-4 mr-1" />
            Nova Nota
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sua base de conhecimento</h1>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              Anotações simples, elegantes e conectadas à sua vida.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="card text-center py-16 flex flex-col items-center justify-center border-dashed">
            <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
              <Lucide.StickyNote className="w-8 h-8 text-surface-400 dark:text-surface-500" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Sua mente está limpa</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
              Escreva ideias, lembretes ou conecte notas às suas Metas e Eventos.
            </p>
            <button
              onClick={() => {
                setSelectedNote(null)
                setNoteModalOpen(true)
              }}
              className="btn-primary"
            >
              Criar Primeira Nota
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {notes.map((note) => {
              let bgClass = 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800'
              if (note.color === 'brand') bgClass = 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/30'
              if (note.color === 'emerald') bgClass = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30'
              if (note.color === 'orange') bgClass = 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
              if (note.color === 'blue') bgClass = 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
              if (note.color === 'rose') bgClass = 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30'

              return (
                <div 
                  key={note.id} 
                  onClick={() => handleEdit(note)}
                  className={`card break-inside-avoid relative group hover:scale-[1.02] cursor-pointer transition-all duration-300 border ${bgClass} shadow-sm hover:shadow-md`}
                >
                  {note.isPinned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
                      <Lucide.Pin className="w-3 h-3" />
                    </div>
                  )}
                  
                  {note.category && (
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                        {note.category}
                      </span>
                    </div>
                  )}

                  {note.title && (
                    <h3 className="font-display text-base font-bold text-surface-900 dark:text-surface-100 mb-2 leading-tight">
                      {note.title}
                    </h3>
                  )}
                  
                  <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {note.content}
                  </p>

                  {/* Links Visuais */}
                  {(note.financialGoalId || note.eventId) && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {note.financialGoalId && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300">
                          <Lucide.Target className="w-3 h-3 text-brand-500" />
                          Meta Vinculada
                        </span>
                      )}
                      {note.eventId && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300">
                          <Lucide.Calendar className="w-3 h-3 text-brand-500" />
                          Evento Vinculado
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800/60 flex items-center justify-between text-xs text-surface-400">
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
                        <Lucide.Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        note={selectedNote}
        onSuccess={() => {
          setNoteModalOpen(false)
          fetchNotes()
        }}
      />
    </div>
  )
}
