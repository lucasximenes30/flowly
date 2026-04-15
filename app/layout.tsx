import type { Metadata } from 'next'
import { Manrope, Sora } from 'next/font/google'
import { AppProvider } from '@/lib/i18n'
import SidebarLayout from '@/components/SidebarLayout'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Vynta',
    template: '%s | Vynta',
  },
  description: 'Gestão financeira pessoal com clareza e fluidez.',
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
              var theme = localStorage.getItem('vynta_theme');
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
      <body className={`${manrope.variable} ${sora.variable} min-h-screen font-sans`}>
        <AppProvider>
          <SidebarLayout>
            {children}
          </SidebarLayout>
        </AppProvider>
      </body>
    </html>
  )
}
