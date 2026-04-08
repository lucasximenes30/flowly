import type { Metadata } from 'next'
import { AppProvider } from '@/lib/i18n'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Flowly',
    default: 'Flowly — Finanças Pessoais',
  },
  description: 'Gestão financeira pessoal, de um jeito simples e bonito.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('flowly_theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else if (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              } else if (theme === 'light') {
                document.documentElement.classList.remove('dark');
              } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
