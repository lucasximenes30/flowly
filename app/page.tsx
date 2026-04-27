import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { ArrowRight, CheckCircle2, LayoutDashboard, Target, Activity, ShieldCheck, Zap, Globe, Clock, ThumbsUp, CheckSquare } from 'lucide-react'
import ScrollReveal from '@/components/landing/ScrollReveal'
import MagneticButton from '@/components/landing/MagneticButton'
import { CAKTO_CONFIG } from '@/lib/cakto'

// Layout Helpers
function BezelImage({ src, alt, className, priority = false }: { src: string, alt: string, className?: string, priority?: boolean }) {
  return (
    <ScrollReveal yOffset={40}>
      <div className={`p-1.5 md:p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 ring-1 ring-black/10 shadow-2xl ${className}`}>
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center border border-white/5">
          <Image src={src} alt={alt} width={1200} height={800} className="w-full h-auto object-cover" priority={priority} />
        </div>
      </div>
    </ScrollReveal>
  )
}

function SectionHeading({ title, subtitle, eyebrow }: { title: string, subtitle?: string, eyebrow?: string }) {
  return (
    <div className="text-center md:text-left space-y-4 mb-16 md:mb-24 flex flex-col md:items-start items-center">
      {eyebrow && (
        <ScrollReveal delay={0}>
          <span className="inline-block rounded-full px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs uppercase tracking-[0.2em] font-bold">
            {eyebrow}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold text-white max-w-2xl leading-[1.1]">
          {title}
        </h2>
      </ScrollReveal>
      {subtitle && (
        <ScrollReveal delay={0.2}>
          <p className="text-lg md:text-xl text-surface-400 max-w-[55ch] leading-relaxed font-light text-center md:text-left">
            {subtitle}
          </p>
        </ScrollReveal>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-[100dvh] bg-[#050505] text-surface-200 selection:bg-brand-500/30 overflow-x-hidden relative font-sans">
      
      {/* Background Radiance */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-start opacity-40 overflow-hidden">
        <div className="w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[140px] mix-blend-screen -translate-y-[40%] -translate-x-[20%]" />
        <div className="w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] mix-blend-screen -translate-y-[20%] translate-x-[20%]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <header className="flex items-center justify-between py-6 md:py-8">
          <div className="shrink-0">
             <BrandLogo size="md" />
          </div>
          <div className="flex justify-end gap-3 md:gap-6 items-center">
            <Link href="/login" className="text-sm font-semibold text-surface-400 hover:text-white transition-colors duration-300">
              Entrar
            </Link>
            <MagneticButton href="/register" intensity={0.2}>
               <div className="hidden sm:flex rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-2.5 text-sm font-semibold items-center gap-2 text-white transition-colors duration-300">
                 Desbloquear acesso
               </div>
            </MagneticButton>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-8 text-left">
            <ScrollReveal delay={0.1}>
              <span className="inline-block rounded-full px-4 py-2 bg-surface-800/40 border border-white/10 text-brand-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                O seu sistema pessoal
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tighter text-white leading-[1.05]">
                Assuma o controle da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">rotina.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-[50ch] font-light">
                O Vynta centraliza sua gestão financeira, fortalece seus bons hábitos diários e, como bônus, organiza seus treinos. Pare de perder energia usando diversos aplicativos desconexos.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <MagneticButton href="/register" intensity={0.4}>
                  <div className="group w-full sm:w-auto inline-flex justify-between items-center rounded-full bg-white text-[#050505] px-6 sm:px-8 py-4 font-bold shadow-lg text-sm sm:text-base">
                    <span>Quero organizar minha vida</span>
                    <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center ml-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                      <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </span>
                  </div>
                </MagneticButton>
                <MagneticButton href="#solucao" intensity={0.2}>
                  <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-6 sm:px-8 py-4 font-bold text-white bg-transparent border border-white/15 hover:bg-white/5 transition-colors duration-300 text-sm sm:text-base">
                    Como o Vynta resolve isso?
                  </div>
                </MagneticButton>
              </div>
            </ScrollReveal>
          </div>
          <div className="lg:col-span-7 relative w-full mt-12 lg:mt-0">
            <BezelImage src="/images/dashboard.png" alt="Vynta Dashboard" priority={true} />
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-32 border-t border-white/5">
          <div className="max-w-5xl mx-auto space-y-16">
            <ScrollReveal>
              <div className="text-center px-4">
                <span className="inline-block rounded-full px-4 py-1.5 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs uppercase tracking-[0.2em] font-bold">A raiz do problema</span>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold text-white max-w-3xl mx-auto leading-tight">
                  Você não precisa de mais motivação. Precisa de direção.
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-10 px-4 md:px-0">
              <ScrollReveal delay={0.1} className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full group">
                  <LayoutDashboard className="w-10 h-10 text-rose-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">O caos de 10 apps diferentes</h3>
                    <p className="text-surface-400 text-lg leading-relaxed max-w-sm font-light">
                      Anotações perdidas e planilhas confusas. Quando sua vida está espalhada, você perde a vontade de se organizar antes mesmo de começar.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-5">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full group">
                  <Target className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Problemas de constância</h3>
                    <p className="text-surface-400 leading-relaxed font-light">
                      É fácil fazer o certo por 3 dias e parar. Sem um histórico simples na palma da mão, desistir vira o padrão.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} className="md:col-span-12">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 md:py-16 flex flex-col md:flex-row items-start md:items-center gap-10 group">
                  <div className="flex-1 space-y-4">
                    <Activity className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold text-white">Descontrole Financeiro</h3>
                    <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                      Não saber para onde o dinheiro foi gera estresse constante. Sem clareza rápida, você não prevê gastos mensais e vive tentando corrigir surpresas.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="solucao" className="py-24 md:py-32">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-10 px-4">
              <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter text-white">
                O fim da desorganização.
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-surface-400 leading-relaxed font-light">
                Uma única plataforma intuitiva para gerenciar seu dinheiro, manter seus bons hábitos em dia e ter controle da sua rotina.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-24 border-t border-white/5 space-y-12 md:space-y-16">
          <ScrollReveal>
             <div className="text-center px-4">
                <span className="inline-block rounded-full px-4 py-1.5 mb-6 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs uppercase tracking-[0.2em] font-bold">Como funciona</span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tighter">Sua vida em 3 pilares.</h2>
             </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4 lg:px-0">
             <ScrollReveal delay={0.1} className="h-full">
                 <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 hover:border-white/10 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">1</div>
                    <h4 className="text-xl font-bold text-white">Finanças Claras</h4>
                    <p className="text-surface-400 leading-relaxed font-light text-sm md:text-base">Mapeie toda sua entrada e saída de dinheiro em segundos. Entenda seus gastos com painéis fáceis de ler e agir.</p>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.2} className="h-full">
                 <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 hover:border-white/10 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">2</div>
                    <h4 className="text-xl font-bold text-white">Hábitos Diários</h4>
                    <p className="text-surface-400 leading-relaxed font-light text-sm md:text-base">Crie uma lista simples com tarefas cruciais. Preencha todo dia e veja a sua constância se tornando real.</p>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.3} className="h-full">
                 <div className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors border border-white/5 hover:border-white/10 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">3</div>
                    <h4 className="text-xl font-bold text-white">Treinos (Módulo Extra)</h4>
                    <p className="text-surface-400 leading-relaxed font-light text-sm md:text-base">Gosta de treinar? Marque o peso atual, séries e repetições de forma prática sem depender de fichas de papel.</p>
                 </div>
             </ScrollReveal>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 space-y-32 md:space-y-48">
          
          {/* Controle Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Controle Financeiro" 
                title="Decida o que fazer com seu dinheiro." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  A tranquilidade no fim do mês vem de ver seus ganhos e gastos de forma organizada. Chega de somar tudo na calculadora e terminar confuso.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Tome decisões de compra com segurança', 'Adicione gastos rapidamente do celular', 'Acompanhe seu progresso mês a mês'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/relatorios.png" alt="Controle Financeiro Vynta" />
            </div>
          </div>

          {/* Hábitos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="relative w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/habitos.png" alt="Gestão de Hábitos Vynta" />
            </div>
            <div className="space-y-6">
              <SectionHeading 
                eyebrow="Gestão de Hábitos" 
                title="Mantenha o foco todos os dias." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Acompanhar seu dia a dia é o que constrói a disciplina. Nossa interface visual recompensa instantaneamente cada vez que você avança um pouco.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Não quebre a corrente: streaks diários', 'Rotina desenhada para sua realidade', 'Dopamina limpa na tabela verde'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Treinos (Optional Addon) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Módulo Opcional" 
                title="Mais prático que ficha de papel." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Sem complicação. Um extra focado e prático para quem leva o treino a sério. Acompanhe a evolução do seu peso e repetições de forma leve.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Guarde qual carga você usou por último', 'Otimizado para usar enquanto descansa', 'Visualize seu corpo mudando na prática'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/treino.png" alt="Módulo de Treino Vynta" />
            </div>
          </div>

        </section>

        {/* Benefits Section */}
        <section className="py-32 border-t border-white/5 space-y-20">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter">Acorde todos os dias sabendo exatamente o seu propósito.</h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "Paz de Espírito", text: "Remova a preocupação de deixar obrigações escapar por causa do esquecimento banal." },
              { icon: Zap, title: "Basta Executar", text: "Suas decisões já foram tomadas. É só você abrir, consultar seu Vynta e começar o dia em modo focado." },
              { icon: Globe, title: "A Visão de Cima", text: "Olhe num retrospecto histórico. Compreenda e comemore os juros compostos que a disciplina te pagou." },
              { icon: Target, title: "O Novo Você", text: "Vicie a sua mente no sentimento maravilhoso que vem com a dopamina de fechar todas as suas metas." }
            ].map((Benefit, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-surface-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-surface-800/40 transition-all rounded-[2rem] p-8 text-center space-y-6 group h-full">
                  <div className="w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6 transition-transform duration-300 group-hover:scale-110">
                    <Benefit.icon className="w-6 h-6 text-brand-400" strokeWidth={1.5}/>
                  </div>
                  <h4 className="font-semibold text-white text-xl">{Benefit.title}</h4>
                  <p className="text-surface-400 text-[1.05rem] leading-relaxed font-light">{Benefit.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-24 md:py-32 border-t border-white/5">
           <ScrollReveal>
             <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto space-y-6 px-4">
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter">Feito para pessoas reais.</h2>
             </div>
           </ScrollReveal>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 px-4 md:px-0">
              <ScrollReveal delay={0.1} className="md:col-span-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between space-y-8 h-full">
                    <p className="text-surface-300 leading-relaxed text-base md:text-lg font-light">"Em curtas duas semanas eu parei de esquecer as contas e comecei a ter constância na academia. É muito mais leve colocar tudo no Vynta do que tentar lembrar de cabeça."</p>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-brand-300 font-bold text-sm md:text-lg">M</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm md:text-[1.05rem]">Murilo R.</p>
                          <p className="text-surface-500 text-xs md:text-sm">Desenvolvedor Back-end</p>
                        </div>
                    </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-8">
                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-8 md:p-12 flex flex-col justify-between space-y-8 h-full">
                    <p className="text-surface-200 leading-relaxed text-lg md:text-xl font-light">"Eu perdia horas tentando alinhar meus gastos em planilhas todos os fins de semana e quase sempre as contas não batiam. Agora, adiciono tudo pelo celular na hora e levo 5 minutos para revisar a semana inteira. Simplesmente funciona e alivia a mente."</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-purple-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-purple-300 font-bold text-base md:text-xl">L</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm md:text-[1.05rem]">Luiza M.</p>
                          <p className="text-surface-400 text-xs md:text-sm">Product Manager</p>
                        </div>
                    </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3} className="md:col-span-12">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row justify-between md:items-center gap-8">
                  <p className="text-surface-300 leading-relaxed text-base md:text-lg md:max-w-4xl font-light">
                    "O visual escuro com as tarefas cumpridas em verde dá uma pequena satisfação que me faz abrir o app todo dia. É tão rápido preencher que usar o Vynta já virou parte da rotina, parei de procrastinar no celular de manhã."
                  </p>
                  <div className="flex items-center gap-4 shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        <span className="text-surface-300 font-bold text-sm md:text-lg">R</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm md:text-[1.05rem]">Rafaela S.</p>
                        <p className="text-surface-500 text-xs md:text-sm">Analista de Negócios</p>
                      </div>
                  </div>
                </div>
              </ScrollReveal>
           </div>
        </section>

        {/* Objection Handling Section */}
        <section className="py-20 md:py-24 border-t border-white/5 space-y-12 md:space-y-16">
          <div className="text-center px-4 max-w-2xl mx-auto mb-12">
             <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tighter">Ainda em dúvida?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0 max-w-5xl mx-auto">
             <ScrollReveal delay={0.1}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <Clock className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Eu não sou muito disciplinado"</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        É exatamente para isso que estamos aqui. Você não precisa ser perfeito. O Vynta foca no básico para construir a disciplina de preencher dia após dia.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.2}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <CheckSquare className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Já tentei outros apps e parei"</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        A maioria dos aplicativos tenta fazer tudo e complica. Nós removemos as fricções. Com uma interface minimalista e amigável, você resolve seu dia em segundos.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.3}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <Activity className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Não entendo nada de finanças"</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        Não é necessário. Basta adicionar o que você ganhou e o que gastou. Nossos painéis de performance são processados automaticamente, mostrando apenas o óbvio e útil.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.4}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <ThumbsUp className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Não quero adicionar mais um custo"</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        O Vynta resolve justamente isso. Nossa primeira meta é ajudar a identificar e cortar vazamentos. No primeiro mês, a assinatura se paga com a economia que você não via.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
          </div>
        </section>

        {/* Pricing Section - Highly Optimized */}
        <section id="planos" className="py-20 md:py-24 px-4 md:px-0">
          <ScrollReveal>
            <div className="max-w-5xl mx-auto rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-brand-900/20 to-[#050505] p-1.5 md:p-2 ring-1 ring-white/10 shadow-[0_40px_80px_-20px_rgba(48,64,235,0.2)] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-brand-500/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none group-hover:bg-brand-500/30 transition-colors duration-1000" />
               <div className="relative rounded-[calc(2rem-0.375rem)] md:rounded-[calc(3rem-0.5rem)] bg-[#050505]/80 backdrop-blur-3xl border border-white/5 p-8 md:p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                  
                  <div className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left w-full">
                    <div className="space-y-4">
                       <span className="inline-block rounded-full px-4 py-1.5 md:py-2 bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-bold tracking-widest uppercase">
                         Plano Base
                       </span>
                       <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold text-white tracking-tighter">R$ 19,90<span className="text-xl md:text-2xl text-surface-500 font-normal tracking-normal">/mês</span></h2>
                       <div className="space-y-2">
                          <p className="text-brand-300 font-semibold text-base md:text-lg pt-1 bg-brand-500/10 inline-block px-3 py-1 rounded-md border border-brand-500/20">Apenas R$ 0,66 por dia.</p>
                          <p className="text-surface-400 font-medium text-sm md:text-base leading-relaxed max-w-sm mx-auto lg:mx-0">O foco principal: colocar sua vida financeira e sua consistência diária nos eixos de vez.</p>
                       </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 w-full text-left">
                      <p className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4 mx-auto lg:mx-0 text-center lg:text-left">O que está incluído:</p>
                      <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 max-w-sm mx-auto lg:mx-0">
                        {['Controle Financeiro Completo', 'Gestão Visual de Hábitos', 'Sincronização instantânea na nuvem', 'Estatísticas mensais em tempo real'].map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-surface-200">
                              <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={2} />
                              <span className="font-medium text-sm md:text-[1.05rem] leading-snug">{item}</span>
                            </li>
                        ))}
                      </ul>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 md:p-5 flex items-start gap-3 backdrop-blur-sm mx-auto lg:mx-0 max-w-sm transform hover:scale-[1.02] transition-transform">
                         <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={2} />
                         <div>
                            <p className="font-bold text-white text-sm mb-1">Módulo de Treinos (Opcional)</p>
                            <p className="text-xs text-surface-400 font-light leading-relaxed">Você pode adicionar este módulo separadamente no checkout, caso faça sentido para sua rotina na academia.</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto shrink-0 flex flex-col gap-6 pt-4 lg:pt-0">
                    <MagneticButton href="/register" intensity={0.4}>
                      <div className="group w-full lg:w-[300px] flex justify-between items-center rounded-full bg-white text-[#050505] px-6 md:px-8 py-4 md:py-5 font-bold text-base md:text-[1.05rem] shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] transition-all">
                        <span>Quero assinar</span>
                        <span className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/5 flex items-center justify-center ml-2 md:ml-4 shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                           <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-black" strokeWidth={2.5} />
                        </span>
                      </div>
                    </MagneticButton>
                    <p className="text-xs text-center text-surface-500 font-medium bg-white/[0.02] py-2 rounded-full border border-white/5">Cancele quando quiser, sem burocracia.</p>
                  </div>
               </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Final CTA & Footer */}
        <footer className="py-32 text-center flex flex-col items-center border-t border-white/5 space-y-16">
            <ScrollReveal>
              <h2 className="font-display text-5xl md:text-6xl font-semibold text-white tracking-tighter max-w-3xl leading-[1.1]">Comece a proteger a coisa mais escassa que você possui: O seu tempo livre.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <MagneticButton href="/register" intensity={0.3}>
                <div className="group inline-flex justify-between items-center rounded-full bg-brand-600 text-white px-6 sm:px-8 py-4 font-bold text-base sm:text-lg shadow-[0_0_40px_-15px_rgba(48,64,235,0.8)]">
                  <span className="mr-6 sm:mr-8">Desbloquear acesso agora</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                    <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </span>
                </div>
              </MagneticButton>
            </ScrollReveal>
            
            <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-4xl pt-24 mt-24 border-t border-white/10 text-surface-500 text-sm">
               <p>© {new Date().getFullYear()} Vynta. Todos os direitos reservados.</p>
               <div className="flex gap-8 mt-6 sm:mt-0">
                  <Link href="#" className="hover:text-white transition-colors">Termos de Serviço para Uso Simplificado</Link>
                  <Link href="#" className="hover:text-white transition-colors">Privacidade Estrita de Dados</Link>
               </div>
            </div>
        </footer>

      </div>
    </main>
  )
}
