import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full min-h-[60vh] items-center justify-center space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium animate-pulse">
        Carregando...
      </p>
    </div>
  )
}
