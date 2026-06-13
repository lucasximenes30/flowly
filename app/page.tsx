import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { ArrowRight, CheckCircle2, LayoutDashboard, Target, Activity, ShieldCheck, Zap, Globe, Clock, ThumbsUp, CheckSquare, Calendar, StickyNote, X } from 'lucide-react'
import ScrollReveal from '@/components/landing/ScrollReveal'
import MagneticButton from '@/components/landing/MagneticButton'
import SmartCTA from '@/components/landing/SmartCTA'
import HeaderActions from '@/components/landing/HeaderActions'
import FunnelTracker from '@/components/FunnelTracker'

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
      <FunnelTracker eventName="landing_view" />
      
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
                SISTEMA PESSOAL DE GESTÃO
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tighter text-white leading-[1.05]">
                Pare de sobreviver à sua própria <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">rotina.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-[55ch] mx-auto font-light">
                Sua vida não precisa ser uma coleção de abas abertas, contas surpresa e metas abandonadas. A clareza que você precisa para parar de apagar incêndios e começar a viver de forma intencional.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col items-center justify-center">
                <SmartCTA />
                <p className="mt-6 text-sm text-surface-500 font-medium tracking-wide">
                  48h grátis • Sem cartão de crédito • Cancele quando quiser
                </p>
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
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold text-white max-w-4xl mx-auto leading-tight">
                  Por que você sente que está sempre correndo, mas nunca sai do lugar?
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-10 px-4 md:px-0">
              <ScrollReveal delay={0.1} className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full group">
                  <LayoutDashboard className="w-10 h-10 text-rose-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">Falsas promessas de organização</h3>
                    <p className="text-surface-400 text-lg leading-relaxed max-w-sm font-light">
                      Você baixa um app financeiro, outro para hábitos e compra uma agenda cara. Duas semanas depois, abandonou todos. O problema não é sua disciplina, é a fragmentação exaustiva.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-5">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full group">
                  <Target className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">O cansaço invisível</h3>
                    <p className="text-surface-400 leading-relaxed font-light">
                      A sensação angustiante de que esqueceu de pagar um boleto ou deixou algo importante para trás. Você está sempre sobrecarregado, mas raramente sente que foi produtivo.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} className="md:col-span-12">
                <div className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors duration-500 rounded-[2rem] p-8 md:p-12 md:py-16 flex flex-col md:flex-row items-start md:items-center gap-10 group">
                  <div className="flex-1 space-y-4">
                    <Activity className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold text-white">Onde o seu dinheiro foi parar?</h3>
                    <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-3xl font-light">
                      Trabalhar o mês inteiro e, na última semana, não ter ideia de como o saldo evaporou. A ansiedade financeira destrói sua paz mental e sabota qualquer tentativa de planejamento para o futuro.
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
                O único sistema que você precisa.
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-surface-400 leading-relaxed font-light">
                O Vynta não é um punhado de ferramentas soltas. É um sistema nervoso central desenhado para você recuperar o controle do seu dinheiro, do seu tempo e da sua vida.
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
                title="Saiba exatamente para onde seu dinheiro foge." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Pare de ser pego de surpresa. Nossa Inteligência Artificial mapeia seus gastos reais e te dá a visão de raio-x necessária para tomar decisões blindadas antes da conta zerar.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Paz mental com relatórios brutalmente claros', 'Identifique e cancele assinaturas fantasmas', 'Corte gastos por impulso sem esforço'].map((feature, i) => (
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
                title="O fim das resoluções de ano novo abandonadas." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Metas não sobrevivem apenas na sua cabeça. Crie compromissos inegociáveis com o seu futuro e veja, em tempo real, o seu esforço se transformando em conquistas palpáveis.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Foco absoluto no que realmente importa', 'Separe o dinheiro antes de gastá-lo', 'Celebre cada pequena vitória até os 100%'].map((feature, i) => (
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
                title="Seja o único dono do seu próprio tempo." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  A ansiedade nasce do acúmulo. Descarregue suas obrigações no sistema e deixe o tempo trabalhar a seu favor. Chega de esquecer prazos ou chocar compromissos.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Elimine de vez a sobrecarga mental', 'Nunca mais perca um prazo ou boleto crítico', 'Trabalhe de forma proativa, e nunca reativa'].map((feature, i) => (
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
                title="Torne-se a pessoa que você prometeu ser." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  A motivação sempre falha, a disciplina não. Construa uma fundação sólida de hábitos inquebráveis e veja como as pequenas vitórias diárias transformam sua identidade.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Disciplina visualizada e recompensada', 'Elimine a culpa crônica da procrastinação', 'Construa a sua constância no modo automático'].map((feature, i) => (
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
                title="Liberte sua mente do peso de lembrar de tudo." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Seu cérebro foi feito para ter ideias brilhantes, não para armazená-las. Capture insights de ouro e estruture seus pensamentos antes que desapareçam no caos do dia a dia.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Sua mente finalmente silenciosa', 'Informação organizada e sempre acessível', 'Transforme confusão mental em pura clareza'].map((feature, i) => (
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
                title="Resultados estéticos não aceitam desculpas." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-lg md:text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  O que não é medido com precisão, nunca evolui. Esqueça fichas de papel rasgadas e acompanhe seu progresso físico com a frieza e precisão de um atleta de elite.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Evolução documentada de força', 'Comprometimento inabalável com seu corpo', 'Um histórico de evolução que gera orgulho'].map((feature, i) => (
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
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter">Deixe o caos no passado. Viva com clareza absoluta.</h2>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "De Ansioso para Seguro", text: "Substitua o pânico constante de esquecer contas pelo alívio puro de ter a sua vida sob controle absoluto." },
              { icon: Zap, title: "De Reativo para Intencional", text: "Pare de apagar incêndios e decidir tudo de última hora. Acorde com o seu caminho para a vitória já desenhado." },
              { icon: Globe, title: "De Fragmentado para Integrado", text: "Sua vida não é um quebra-cabeça solto. Una seu dinheiro, seu tempo e sua saúde num único ecossistema fluido." },
              { icon: Target, title: "De Estagnado para Imparável", text: "Troque a frustração amarga de não evoluir pelo vício incrível da disciplina recompensada e crescimento visível." }
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
             <h2 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tighter">A verdade nua e crua.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-4 md:px-0 max-w-5xl mx-auto">
             <ScrollReveal delay={0.1}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <Clock className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Mas eu não tenho tempo para preencher tudo isso."</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        Se você não tem 5 minutos para organizar sua vida, você está apenas sobrevivendo. O Vynta é brutalmente simples: abra, registre, feche. Você investe minutos e ganha horas de clareza mental.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.2}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <CheckSquare className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Vou me empolgar e abandonar depois de uma semana."</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        Você abandona ferramentas porque elas são frias e exaustivas. Nós projetamos o Vynta para liberar dopamina limpa a cada "check". A constância se torna inevitável e viciante.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.3}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <LayoutDashboard className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Eu já tentei outros vários aplicativos e não deu certo."</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        O Vynta não é mais um aplicativo genérico. É um sistema nervoso central. Quando você usa 5 apps soltos, sua energia vaza nos espaços entre eles. Nós unimos os pilares para que você recupere seu foco.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.4}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-6 md:p-8 flex items-start gap-4 h-full hover:bg-white/[0.02] transition-colors">
                    <ThumbsUp className="w-6 h-6 text-brand-400 shrink-0 mt-1" strokeWidth={1.5} />
                    <div className="space-y-2">
                      <h4 className="text-base md:text-lg font-bold text-white">"Vale a pena pagar por mais uma assinatura?"</h4>
                      <p className="text-surface-400 font-light text-sm md:text-base leading-relaxed">
                        O quanto custa a sua paz mental? O Vynta se paga já no primeiro mês apontando assinaturas inúteis e cortando desperdícios que você nem sabia que tinha. É um investimento, não um custo.
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
          
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* VIP Plan */}
            <ScrollReveal delay={0.1}>
              <div className="rounded-[2rem] bg-surface-900/50 border border-white/5 p-8 md:p-10 flex flex-col h-full hover:border-white/10 transition-colors">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Financeiro</h3>
                  <p className="text-surface-400 text-sm mb-4">Para quem quer foco total no controle do dinheiro.</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-display font-semibold text-white">R$ 19,90</span>
                    <span className="text-surface-400 mb-1">/mês</span>
                  </div>
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

                <div className="flex flex-col items-center gap-3">
                  <MagneticButton href="/register?plan=vip" intensity={0.2}>
                    <div className="w-full flex justify-center items-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-4 font-bold transition-all">
                      Desbloquear Financeiro
                    </div>
                  </MagneticButton>
                  <span className="text-xs text-surface-500 font-medium tracking-wide text-center">Sem fidelidade • Cancele quando quiser</span>
                </div>
              </div>
            </ScrollReveal>

            {/* PRO Plan */}
            <ScrollReveal delay={0.2}>
              <div className="relative rounded-[2rem] bg-surface-900/80 border border-white/10 p-8 md:p-10 flex flex-col h-full hover:border-white/20 transition-colors overflow-hidden">
                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">PRO</h3>
                  <p className="text-surface-300 text-sm font-medium mb-4">Para pessoas que querem o controle completo de suas vidas.</p>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-5xl font-display font-semibold text-white">R$ 29,90</span>
                    <span className="text-surface-400 mb-1">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-surface-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-bold text-sm md:text-base leading-snug">Tudo do plano Financeiro, e também:</span>
                  </li>
                  {['Gestão de Metas e Alvos', 'Agenda e Calendário Pessoal', 'Segundo Cérebro (Notas)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-surface-200">
                      <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="font-medium text-sm md:text-base leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col items-center gap-3">
                  <MagneticButton href="/register?plan=pro" intensity={0.2}>
                    <div className="relative z-10 w-full flex justify-center items-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-4 font-bold transition-all group">
                      <span>Desbloquear PRO</span>
                    </div>
                  </MagneticButton>
                  <span className="text-xs text-surface-500 font-medium tracking-wide text-center">Sem fidelidade • Cancele quando quiser</span>
                </div>
              </div>
            </ScrollReveal>

            {/* PRO YEARLY Plan */}
            <ScrollReveal delay={0.3}>
              <div className="relative rounded-[2rem] bg-gradient-to-b from-purple-900/40 to-surface-900 border border-purple-500/50 p-8 md:p-10 flex flex-col h-full shadow-[0_0_60px_-15px_rgba(168,85,247,0.25)] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-0 right-8 bg-purple-500 text-white text-[0.65rem] font-bold px-4 py-1.5 rounded-b-lg tracking-wider uppercase shadow-lg">
                  Mais escolhido
                </div>

                <div className="mb-8 relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2">PRO ANUAL</h3>
                  <p className="text-purple-200 text-sm font-medium mb-4">O ecossistema completo para sua vida com o melhor custo-benefício.</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-display font-semibold text-white">R$ 239,90</span>
                    <span className="text-purple-300 mb-1">/ano</span>
                  </div>
                  <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 font-bold text-xs mt-1">
                    Economize R$ 118,90 com o plano anual
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  <li className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-bold text-sm md:text-base leading-snug">Tudo do ecossistema PRO liberado</span>
                  </li>
                  {['Um ano inteiro sem interrupções', 'O equivalente a R$ 16,50 por mês', 'Acesso imediato a todas as áreas'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-surface-200">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" strokeWidth={2} />
                      <span className="font-medium text-sm md:text-base leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>

                <MagneticButton href="/register?plan=pro_yearly" intensity={0.2}>
                  <div className="relative z-10 w-full flex justify-between items-center rounded-full bg-white text-[#050505] px-6 py-4 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] transition-all group">
                    <span>Desbloquear PRO Anual</span>
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
              <h2 className="font-display text-5xl md:text-6xl font-semibold text-white tracking-tighter max-w-4xl leading-[1.1]">Seu trial de 48h começa agora. Sem cartão, sem compromisso. Depois disso: R$ 29,90/mês ou R$ 16,50/mês no plano anual.</h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <MagneticButton href="#planos" intensity={0.3}>
                <div className="group inline-flex justify-between items-center rounded-full bg-brand-600 text-white px-6 sm:px-8 py-4 font-bold text-base sm:text-lg shadow-[0_0_40px_-15px_rgba(48,64,235,0.8)] hover:bg-brand-500 transition-colors">
                  <span className="mr-6 sm:mr-8">Quero assumir o controle da minha vida</span>
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
