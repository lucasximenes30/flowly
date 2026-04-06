import type { Metadata } from 'next'
import { AppProvider } from '@/lib/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flowly — Finanças Pessoais',
  description: 'Gestão financeira pessoal, de um jeito simples e bonito.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
