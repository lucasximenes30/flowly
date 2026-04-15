import Link from 'next/link'
import Image from 'next/image'
import BrandLogo from '@/components/BrandLogo'
import { ArrowRight, CheckCircle2, LayoutDashboard, Target, Activity, ShieldCheck, Zap, Globe, Clock, ThumbsUp, CheckSquare } from 'lucide-react'
import ScrollReveal from '@/components/landing/ScrollReveal'
import MagneticButton from '@/components/landing/MagneticButton'

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
        <header className="flex items-center justify-between py-8">
          <BrandLogo size="md" />
          <div className="flex justify-end gap-6 items-center">
            <Link href="/login" className="text-sm font-semibold text-surface-400 hover:text-white transition-colors duration-300">
              Acessar Conta
            </Link>
            <MagneticButton href="/register" intensity={0.2}>
               <div className="rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-2.5 text-sm font-semibold flex items-center gap-2 text-white transition-colors duration-300">
                 Quero organizar minha vida
               </div>
            </MagneticButton>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          <div className="lg:col-span-5 space-y-8 text-left">
            <ScrollReveal delay={0.1}>
              <span className="inline-block rounded-full px-4 py-2 bg-surface-800/40 border border-white/10 text-brand-300 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
                O Fim da Procrastinação
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[4.5rem] font-semibold tracking-tighter text-white leading-[1.05]">
                Você não precisa <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">viver perdido</span> todos os dias.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-[50ch] font-light">
                O Vynta é o único sistema premium que conecta sua vida financeira, treinos e rotinas diárias. Pare de perder dinheiro e tempo com a falta de organização e controle.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.4}>
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <MagneticButton href="/register" intensity={0.4}>
                  <div className="group w-full sm:w-auto inline-flex justify-between items-center rounded-full bg-white text-[#050505] px-8 py-4 font-bold shadow-lg">
                    <span>Quero organizar minha vida</span>
                    <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center ml-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                      <ArrowRight className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </span>
                  </div>
                </MagneticButton>
                <MagneticButton href="#solucao" intensity={0.2}>
                  <div className="w-full sm:w-auto inline-flex items-center justify-center rounded-full px-8 py-4 font-bold text-white bg-transparent border border-white/15 hover:bg-white/5 transition-colors duration-300">
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
              <div className="text-center">
                <span className="inline-block rounded-full px-4 py-1.5 mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs uppercase tracking-[0.2em] font-bold">Por que você trava?</span>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold text-white max-w-3xl mx-auto">
                  A desorganização está destruindo o seu potencial silenciosamente.
                </h2>
              </div>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-10">
              <ScrollReveal delay={0.1} className="md:col-span-7">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full">
                  <LayoutDashboard className="w-10 h-10 text-rose-400" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">O peso invisível do caos</h3>
                    <p className="text-surface-400 text-lg leading-relaxed max-w-sm font-light">
                      Quando suas obrigações estão espalhadas em dezenas de cadernos e apps soltos, você perde horas tentando decidir o que fazer. O resultado? Fadiga mental aguda.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-5">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 space-y-6 flex flex-col justify-between h-full">
                  <Target className="w-10 h-10 text-amber-400" strokeWidth={1.5} />
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Procrastinação Oculta</h3>
                    <p className="text-surface-400 leading-relaxed font-light">
                      Você jura que amanhã será diferente. Mas sem um sistema limpo te cobrando progresso diário, você se engana e desiste.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.3} className="md:col-span-12">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-12 md:py-16 flex flex-col md:flex-row items-start md:items-center gap-10">
                  <div className="flex-1 space-y-4">
                    <Activity className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
                    <h3 className="text-3xl font-bold text-white">Sangramento Financeiro</h3>
                    <p className="text-surface-400 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                      Gastos invisíveis estão devorando seu suor. Planilhas de Excel e anotações no celular morrem sempre na segunda semana. Você trabalha no escuro e a conta não bate no fim do mês.
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
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <h2 className="font-display text-5xl md:text-7xl font-semibold tracking-tighter text-white">
                O Fim do Piloto Automático.
              </h2>
              <p className="text-xl md:text-2xl text-surface-400 leading-relaxed font-light">
                O segredo não está na força de vontade, está no ambiente perfeito. Substitua sua ansiedade por visibilidade total sobre de que sua vida é feita.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* How It Works Section (New CRO Addition) */}
        <section className="py-24 border-t border-white/5 space-y-16">
          <ScrollReveal>
             <div className="text-center">
                <span className="inline-block rounded-full px-4 py-1.5 mb-6 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs uppercase tracking-[0.2em] font-bold">A Lógica</span>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tighter">O método infalível, em 3 passos.</h2>
             </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <ScrollReveal delay={0.1} className="h-full">
                 <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">1</div>
                    <h4 className="text-xl font-bold text-white">Organize sua vida</h4>
                    <p className="text-surface-400 leading-relaxed font-light">Centralize seus contatos, dinheiro e hábitos num único ecossistema desenhado para aliviar rapidamente sua carga mental.</p>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.2} className="h-full">
                 <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">2</div>
                    <h4 className="text-xl font-bold text-white">Acompanhe sua evolução</h4>
                    <p className="text-surface-400 leading-relaxed font-light">Deixe de lado suposições. Alimente seus dias e veja gráficos incisivos provarem cada pequeno esforço que você faz valer a pena.</p>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.3} className="h-full">
                 <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-center space-y-6 h-full flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-brand-900/40 text-brand-400 font-display text-2xl font-bold flex items-center justify-center border border-brand-500/20 shadow-lg shadow-brand-500/10">3</div>
                    <h4 className="text-xl font-bold text-white">Tenha controle absoluto</h4>
                    <p className="text-surface-400 leading-relaxed font-light">A sensação invencível de nunca ser surpreendido por surpresas ruins. Respire fundo: sua vida está mapeada com domínio absoluto.</p>
                 </div>
             </ScrollReveal>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 space-y-32 md:space-y-48">
          
          {/* Controle Financeiro */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Controle Financeiro" 
                title="Pare de sofrer com planilhas frustrantes." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  A ansiedade do fim do mês desaparece quando você enxerga claramente cada centavo gasto em gráficos premium. Suas metas financeiras finalmente têm uma data exata de conclusão.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Tome decisões de compra com 100% de clareza', 'Categorização veloz em menos de 5 segundos', 'Monitoramento da sua evolução patrimonial'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full">
              <BezelImage src="/images/relatorios.png" alt="Controle Financeiro Vynta" />
            </div>
          </div>

          {/* Hábitos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="relative w-full">
              <BezelImage src="/images/habitos.png" alt="Gestão de Hábitos Vynta" />
            </div>
            <div className="space-y-6">
              <SectionHeading 
                eyebrow="Hábitos Irrefutáveis" 
                title="Chega de depender apenas da motivação." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  A nossa famosa 'Tabela Verde' muda você por meio do reforço positivo. Visualizar os dias em que você concluiu o que prometeu se torna a sua maior recompensa diária.
                </p>
                <ul className="space-y-4 pt-2">
                  {['A magia dos streaks: Não quer quebrar a corrente', 'Construa uma rotina alinhada ao seu limite', 'Feedback químico de endorfina direto no painel'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
          </div>

          {/* Treinos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <SectionHeading 
                eyebrow="Treinos Dinâmicos" 
                title="O seu físico exige dados. Não pressentimentos." 
              />
              <ScrollReveal delay={0.3}>
                <p className="text-xl text-surface-400 leading-relaxed pb-6 font-light">
                  Guarde suas planilhas pdf empoeiradas. Registre os treinos diretamente no app durante os intervalos, veja sua carga evoluir e destrave a estética que você vem buscando por anos.
                </p>
                <ul className="space-y-4 pt-2">
                  {['Progresso de carga visível para hipertrofia real', 'Fichas em mãos construídas para as academias', 'O histórico da sua disciplina mapeado em volume'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-4 text-surface-300 font-medium tracking-wide">
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" strokeWidth={1.5} />
                      <span className="text-lg">{feature}</span>
                    </li>
                  ))}
                </ul>
              </ScrollReveal>
            </div>
            <div className="relative order-1 lg:order-2 w-full">
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

        {/* Social Proof Section (Fake Testimonials Optimized) */}
        <section className="py-32 border-t border-white/5">
           <ScrollReveal>
             <div className="text-center mb-20 max-w-3xl mx-auto space-y-6">
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter">Mentes que pararam de desperdiçar os próprios dias.</h2>
             </div>
           </ScrollReveal>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <ScrollReveal delay={0.1} className="md:col-span-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 flex flex-col justify-between space-y-12 shrink-0 h-full">
                    <p className="text-surface-300 leading-relaxed text-lg font-light">"Em menos de 2 semanas de uso direto, eu parei de esquecer minhas contas e de falhar absurdamente nos treinos. Minha mente ficou tão leve que observei a minha produtividade dobrar. O Vynta limpou completamente o lixo mental da minha rotina."</p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-brand-300 font-bold text-lg">M</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-[1.05rem]">Murilo Ramos</p>
                          <p className="text-surface-500 text-sm">Desenvolvedor Back-end</p>
                        </div>
                    </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2} className="md:col-span-8">
                <div className="bg-white/[0.04] border border-white/10 rounded-[2rem] p-10 md:p-14 flex flex-col justify-between space-y-12 h-full">
                    <p className="text-surface-200 leading-relaxed text-xl md:text-2xl font-light">"Eu gastava, no mínimo, várias horas confusas cruzando gastos no Notion com apps gratuitos no fim de todo mês e tudo ficava errado. Hoje, eu finalizo meu fechamento em 5 minutos semanais. Ver os gráficos do meu dinheiro subindo junto com minha assiduidade na academia traz o melhor sentimento de controle e dopamina limpa."</p>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-purple-900 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          <span className="text-purple-300 font-bold text-xl">L</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-[1.05rem]">Luiza Machado</p>
                          <p className="text-surface-400 text-sm">Product Manager</p>
                        </div>
                    </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3} className="md:col-span-12">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 flex flex-col md:flex-row justify-between md:items-center gap-10">
                  <p className="text-surface-300 leading-relaxed text-lg md:text-xl md:max-w-4xl font-light">
                    "O simples fato estético de querer 'fechar o dia completando todos os verdes' abrindo a interface impecável do app eliminou por completo minha inclinação crônica à procrastinação destrutiva. O Vynta impõe uma beleza em ser altamente disciplinado que eu não quero nunca mais parar. Literalmente impossível continuar indisciplinado com tanta clareza bem na sua frente todos os dias."
                  </p>
                  <div className="flex items-center gap-4 shrink-0">
                      <div className="w-12 h-12 rounded-full bg-surface-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        <span className="text-surface-300 font-bold text-lg">R</span>
                      </div>
                      <div>
                        <p className="font-bold text-white text-[1.05rem]">Rafaela Souza</p>
                        <p className="text-surface-500 text-sm">Investidora de Riscos</p>
                      </div>
                  </div>
                </div>
              </ScrollReveal>
           </div>
        </section>

        {/* Objection Handling Section */}
        <section className="py-24 border-t border-white/5 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <ScrollReveal delay={0.1}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start h-full hover:bg-white/[0.02] transition-colors">
                    <Clock className="w-8 h-8 text-brand-400 shrink-0" strokeWidth={1.5} />
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Comece em exatamente 2 minutos</h4>
                      <p className="text-surface-400 font-light text-[0.95rem] leading-relaxed">
                        Um design feito para tirar as fricções em vez de apresentar tutoriais confusos de 30 minutos. Zero complexidade de configuração e painel limpo desde o 1º login.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.2}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start h-full hover:bg-white/[0.02] transition-colors">
                    <CheckSquare className="w-8 h-8 text-brand-400 shrink-0" strokeWidth={1.5} />
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Você não precisa saber sobre finanças</h4>
                      <p className="text-surface-400 font-light text-[0.95rem] leading-relaxed">
                        Você não é obrigado a se tornar um mago do Excel para sair das dores da inflação. Preencha apenas o óbvio. Os gráficos de performance inteligente são processados automaticamente para você.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
             <ScrollReveal delay={0.3}>
                 <div className="bg-transparent border border-white/10 border-dashed rounded-[2rem] p-8 flex flex-col md:flex-row gap-6 items-start h-full hover:bg-white/[0.02] transition-colors">
                    <ThumbsUp className="w-8 h-8 text-brand-400 shrink-0" strokeWidth={1.5} />
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-white">Absolutamente nenhum risco invisível</h4>
                      <p className="text-surface-400 font-light text-[0.95rem] leading-relaxed">
                        Sem taxas falsas e não existe fidelidade. Se os primeiros 14 dias não alavancarem consideravelmente o senso estrito do seu foco, saia livremente com um botão sem complicações ou telefonemas.
                      </p>
                    </div>
                 </div>
             </ScrollReveal>
          </div>
        </section>

        {/* Pricing Section - Highly Optimized */}
        <section className="py-24">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-b from-brand-900/20 to-[#050505] p-2 ring-1 ring-white/10 shadow-[0_40px_80px_-20px_rgba(48,64,235,0.2)] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
               <div className="relative rounded-[calc(3rem-0.5rem)] bg-[#050505]/80 backdrop-blur-3xl border border-white/5 p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-16">
                  
                  <div className="flex-1 space-y-8 text-center md:text-left">
                    <div className="space-y-4">
                       <span className="inline-block rounded-full px-4 py-2 bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-bold tracking-widest uppercase">
                         Acesso Completo. Sem Pegadinhas.
                       </span>
                       <h2 className="font-display text-5xl md:text-7xl font-semibold text-white tracking-tighter">R$ 19,90<span className="text-2xl text-surface-500 font-normal tracking-normal">/mês</span></h2>
                       <div className="space-y-1">
                          <p className="text-brand-300 font-semibold text-lg pt-1 bg-brand-500/10 inline-block px-3 py-1 rounded-md border border-brand-500/20">Menos de R$ 0,70 por dia.</p>
                          <p className="text-surface-400 font-medium text-[0.95rem]">Um investimento que paga menos que o valor de uma única pizza por semana, transformando uma vida mal organizada inteira.</p>
                       </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <ul className="space-y-4 mt-8">
                        {['Painel Financeiro Automatizado e Seguro', 'Grid Tracker Intuitivo que bloqueia a procrastinação', 'Diário de Progressão Lógica de Treinos e Fisiologia', 'Aconselhamento por Relatórios Visuais Mensais'].map((item, i) => (
                            <li key={i} className="flex items-center justify-center md:justify-start gap-4 text-surface-200">
                              <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" strokeWidth={2} />
                              <span className="font-medium text-[1.05rem]">{item}</span>
                            </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex flex-col gap-6 pt-8 md:pt-0">
                    <MagneticButton href="/register" intensity={0.4}>
                      <div className="group w-full md:w-[280px] flex justify-between items-center rounded-full bg-white text-[#050505] px-8 py-5 font-bold text-[1.05rem] shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)]">
                        <span>Começar minha transformação</span>
                        <span className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center ml-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                           <ArrowRight className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </span>
                      </div>
                    </MagneticButton>
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
                <div className="group inline-flex justify-between items-center rounded-full bg-brand-600 text-white px-8 py-4 font-bold text-lg shadow-[0_0_40px_-15px_rgba(48,64,235,0.8)]">
                  <span className="mr-8">Criar minha rotina agora</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
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
