import BrandLogo from '@/components/BrandLogo'
import Link from 'next/link'

export default function RecuperarSenhaPlaceholder() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto bg-surface-950 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(66,88,249,0.26),transparent_45%),radial-gradient(circle_at_bottom,rgba(17,31,171,0.2),transparent_36%)]" />

      <div className="relative w-full max-w-md space-y-6 animate-auth-fade">
        <div className="text-center">
          <BrandLogo
            size="lg"
            className="justify-center mx-auto"
            textClassName="font-display text-3xl text-white"
            priority
          />
          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-white mb-2">
            Recuperar Senha
          </h1>
        </div>

        <div className="card space-y-6 border-surface-700/70 bg-surface-900/85 p-8 shadow-elevated backdrop-blur text-center w-full">
          <p className="text-surface-200 text-sm leading-relaxed mb-4">
            A funcionalidade de recuperação automática de senha estará disponível na próxima atualização.
          </p>
          
          <div className="p-4 rounded-xl bg-brand-900/10 border border-brand-900/30 flex flex-col items-center">
            <p className="text-brand-300 text-sm font-medium text-center">
              Se você acabou de comprar, não se preocupe! Sua conta está segura. Precisa de ajuda para recuperar seu acesso?
            </p>
            <a 
              href="https://wa.me/5585992551864?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20minha%20conta%20Vynta."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
            >
              💬 Falar com Suporte
            </a>
          </div>

          <div className="pt-4">
            <Link href="/login" className="btn-secondary h-11 w-full text-sm font-semibold flex items-center justify-center mt-4">
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
