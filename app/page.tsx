import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { ArrowRight, CheckCircle2, LayoutDashboard, Target, Activity, ShieldCheck, Zap, Globe, Clock, ThumbsUp, CheckSquare, Calendar, StickyNote, X } from 'lucide-react'
import ScrollReveal from '@/components/landing/ScrollReveal'
import MagneticButton from '@/components/landing/MagneticButton'
import SmartCTA from '@/components/landing/SmartCTA'
import HeaderActions from '@/components/landing/HeaderActions'
import { CAKTO_CONFIG } from '@/lib/cakto'

// Layout Helpers
function BezelImage({ src, mobileSrc, alt, className, priority = false }: { src: string, mobileSrc?: string, alt: string, className?: string, priority?: boolean }) {
  return (
    <ScrollReveal yOffset={40}>
      <div className={`p-1.5 md:p-2 rounded-[2rem] bg-white/[0.03] border border-white/10 ring-1 ring-black/10 shadow-2xl ${className}`}>
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-surface-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center border border-white/5">
          {mobileSrc ? (
            <>
              <Image src={src} alt={alt} width={1200} height={800} className="hidden md:block w-full h-auto object-cover" priority={priority} />
              <Image src={mobileSrc} alt={alt} width={800} height={1200} className="block md:hidden w-full h-auto object-cover" priority={priority} />
            </>
          ) : (
            <Image src={src} alt={alt} width={1200} height={800} className="w-full h-auto object-cover" priority={priority} />
          )}
        </div>
      </div>
    </ScrollReveal>
  )
}

function SectionHeading({ title, subtitle, eyebrow }: { title: string, subtitle?: string, eyebrow?: string }) {
  return (
    <div className="text-center md:text-left space-y-4 mb-12 md:mb-16 flex flex-col md:items-start items-center">
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
          <div className="shrink-0 mr-4">
             <BrandLogo size="md" />
          </div>
          <HeaderActions />
        </header>

        {/* Hero Section */}
        <section className="py-24 md:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="space-y-8">
            <ScrollReveal delay={0.1}>
              <span className="inline-block rounded-full px-4 py-2 bg-surface-800/40 border border-white/10 text-brand-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                Sistema Pessoal de Gestão
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tighter text-white leading-[1.05]">
                Assuma o controle total da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">rotina.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-[50ch] mx-auto font-light">
                O Vynta centraliza sua gestão financeira, protege suas metas, estrutura sua agenda, consolida suas notas e acompanha seus treinos. Pare de dispersar energia em múltiplos aplicativos.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="flex justify-center">
                <SmartCTA />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-32 border-t border-white/5">
          <div className="max-w-5xl mx-auto space-y-16">
            <ScrollReveal>
              <div className="text-center px-4">
                <span className="inline-block rounded-full px-4 py-1.5 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs uppercase tracking-[0.2em] font-bold">A raiz do problema</span>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold text-white max-w-3xl mx-auto leading-tight">
                  Sua vida não cabe em um só lugar. Até agora.
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
                      Anotações perdidas, compromissos esquecidos e planilhas de gastos confusas. A desorganização é o que faz você perder o foco.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-5">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full group">
                  <Target className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Falta de visão clara</h3>
                    <p className="text-surface-400 leading-relaxed font-light">
                      É impossível manter a constância nos hábitos e no bolso quando a informação não está centralizada e acessível rapidamente.
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
                      Não saber para onde o dinheiro foi gera estresse. A base de uma vida estruturada é ter paz mental financeira. O Vynta transforma esse caos em relatórios acionáveis e insights reais.
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
                Seu comando central.
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-surface-400 leading-relaxed font-light">
                O Vynta não é apenas um app de finanças. É um sistema completo para você desenhar e executar a vida que deseja.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* Features Section - Comprehensive Rewrite */}
        <section className="py-24 space-y-32 md:space-y-40">
          
          {/* Controle Financeiro (The Core) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Finanças + Inteligência Artificial" 
                title="Clareza absoluta sobre o seu dinheiro." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Acompanhe entradas e saídas instantaneamente. Nossa IA analisa seu comportamento real de gastos para alertar sobre excessos e recomendar cortes.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Insights baseados no seu histórico', 'Acompanhamento rápido pelo celular', 'Relatórios que apontam falhas de orçamento'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Finanças V2.png" mobileSrc="/images/Finanças Mobile V2.jpeg" alt="Controle Financeiro Vynta" />
            </div>
          </div>

          {/* Metas Financeiras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="relative w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Metas V2.png" mobileSrc="/images/Metas Mobile V2.jpeg" alt="Gestão de Metas Vynta" />
            </div>
            <div className="space-y-6">
              <SectionHeading 
                eyebrow="Planejamento de Metas" 
                title="Conquiste seus maiores objetivos." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Transforme desejos em alvos tangíveis. Defina o valor, estabeleça o prazo e acompanhe o progresso de cada depósito até a barra chegar a 100%.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Visualização clara do progresso', 'Separe dinheiro virtualmente sem complicação', 'Motivação real para economizar'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Agenda & Calendário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Agenda Simplificada" 
                title="O tempo trabalha para você." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Eventos, compromissos e lembretes em uma visualização direta. Não perca prazos e tire a pressão de ter que lembrar de tudo.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Organize seus dias com facilidade', 'Evite choques de compromissos', 'Visão mensal panorâmica'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <Calendar className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Agenda V2.png" mobileSrc="/images/Agenda Mobile V2.jpeg" alt="Agenda Vynta" />
            </div>
          </div>

          {/* Hábitos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="relative w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Hábitos V2.png" mobileSrc="/images/Hábitos Mobile V2.jpeg" alt="Gestão de Hábitos Vynta" />
            </div>
            <div className="space-y-6">
              <SectionHeading 
                eyebrow="Gestão de Hábitos" 
                title="Construa disciplina diária." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Acompanhar seu dia a dia é o que constrói resultados reais. Nossa tabela de hábitos entrega a dopamina limpa ao marcar as tarefas como concluídas.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Não quebre a corrente (Streaks)', 'Tabela verde altamente visual', 'Sua rotina levada a sério'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckSquare className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Notas Pessoais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Notas e Descarregamento Mental" 
                title="Um segundo cérebro para suas ideias." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Textos rápidos, reflexões ou listas complexas. Mantenha todas as suas anotações importantes seguras, organizadas e sempre à mão.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Edição em Rich Text', 'Categorização por cores e pastas', 'Seus pensamentos estruturados'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <StickyNote className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Notas V2.png" mobileSrc="/images/Notas Mobile V2.jpeg" alt="Notas Vynta" />
            </div>
          </div>

          {/* Treinos (Optional Addon) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 md:px-0">
            <div className="relative w-full max-w-md md:max-w-full mx-auto">
              <BezelImage src="/images/Treino V2.png" mobileSrc="/images/Treino Mobile V2.jpeg" alt="Módulo de Treino Vynta" />
            </div>
            <div className="space-y-6">
              <SectionHeading 
                eyebrow="Treinamento (Opcional)" 
                title="Aposente a ficha de papel na academia." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Acompanhe a evolução do seu peso e repetições sem burocracia. Perfeito para uso rápido entre as séries, memorizando sua força ao longo do tempo.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Histórico de cargas automático', 'Foco no progresso real', 'Interface escura e amigável para o treino'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-base md:text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
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
              { icon: Zap, title: "Basta Executar", text: "Suas decisões já foram tomadas. É só você abrir, consultar seu Vynta e começar o dia focado." },
              { icon: Globe, title: "A Visão de Cima", text: "Compreenda a sua vida de cima. Finanças, rotina e saúde em um só hub." },
              { icon: Target, title: "O Novo Você", text: "Vicie a sua mente no sentimento maravilhoso que vem com o avanço palpável." }
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
                        A maioria tenta fazer tudo e complica. Nós removemos as fricções unindo as 5 áreas mais vitais em uma navegação rápida, para você resolver em segundos.
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
                        Não é necessário. Basta adicionar ganhos e gastos. Nossa IA processa e cria análises avisando onde você deve agir. Simples, sem jargões.
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
                        O Vynta se paga já no primeiro mês apontando assinaturas esquecidas e excessos no orçamento, fora o valor inestimável da organização mental.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planos" className="py-20 md:py-32 px-4 md:px-0">
          <ScrollReveal>
            <div className="text-center mb-16 space-y-4">
              <span className="inline-block rounded-full px-4 py-1.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs uppercase tracking-[0.2em] font-bold">
                Assinatura Simples
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tighter">
                Escolha o seu plano.
              </h2>
            </div>
          </ScrollReveal>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* VIP Plan */}
            <ScrollReveal delay={0.1}>
              <div className="rounded-[2rem] bg-surface-900/50 border border-white/5 p-8 md:p-10 flex flex-col h-full hover:border-white/10 transition-colors">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">VIP</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-display font-semibold text-white">R$ 19,90</span>
                    <span className="text-surface-400 mb-1">/mês</span>
                  </div>
                  <p className="text-surface-400 text-sm">Controle financeiro e construção de hábitos.</p>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {['Finanças inteligentes (IA)', 'Tabela de Hábitos', 'Módulo de Treinos', 'Sem limite de tempo'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-surface-200">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="font-medium text-sm md:text-base leading-snug">{item}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-surface-600">
                    <X className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-medium text-sm md:text-base leading-snug">Sem Metas, Agenda ou Notas</span>
                  </li>
                </ul>

                <MagneticButton href="/register?plan=vip" intensity={0.2}>
                  <div className="w-full flex justify-center items-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 font-bold transition-all">
                    Desbloquear VIP
                  </div>
                </MagneticButton>
              </div>
            </ScrollReveal>

            {/* PRO Plan */}
            <ScrollReveal delay={0.2}>
              <div className="relative rounded-[2rem] bg-gradient-to-b from-purple-900/20 to-surface-900 border border-purple-500/30 p-8 md:p-10 flex flex-col h-full shadow-[0_0_60px_-15px_rgba(168,85,247,0.15)] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-0 right-8 bg-purple-500 text-white text-[0.65rem] font-bold px-4 py-1.5 rounded-b-lg tracking-wider uppercase shadow-lg">
                  Mais escolhido
                </div>

                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-display font-semibold text-white">R$ 29,90</span>
                    <span className="text-purple-300 mb-1">/mês</span>
                  </div>
                  <p className="text-purple-200 text-sm font-medium">O ecossistema completo para sua vida.</p>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-bold text-sm md:text-base leading-snug">Tudo do plano VIP, e também:</span>
                  </li>
                  {['Gestão de Metas e Alvos', 'Agenda e Calendário Pessoal', 'Segundo Cérebro (Notas)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-surface-200">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="font-medium text-sm md:text-base leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <MagneticButton href="/register?plan=pro" intensity={0.2}>
                  <div className="relative z-10 w-full flex justify-between items-center rounded-full bg-white text-[#050505] px-6 py-4 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] transition-all group">
                    <span>Desbloquear PRO</span>
                    <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                       <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </span>
                  </div>
                </MagneticButton>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* Final CTA & Footer */}
        <footer className="py-32 text-center flex flex-col items-center border-t border-white/5 space-y-16">
            <ScrollReveal>
              <h2 className="font-display text-5xl md:text-6xl font-semibold text-white tracking-tighter max-w-3xl leading-[1.1]">Comece a proteger a coisa mais valiosa que você tem: O seu foco.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <MagneticButton href="#planos" intensity={0.3}>
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
                  <Link href="#" className="hover:text-white transition-colors">Termos de Serviço</Link>
                  <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
               </div>
            </div>
        </footer>

      </div>
    </main>
  )
}
