'use client'

interface SettingsSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

export default function SettingsSection({ icon, title, children }: SettingsSectionProps) {
  return (
    <section className="space-y-4 sm:space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 tracking-tight">
          {title}
        </h3>
      </div>
      <div className="px-0 sm:px-1">
        {children}
      </div>
    </section>
  )
}
