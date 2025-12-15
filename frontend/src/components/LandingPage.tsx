import { Mic2, Star, Trophy, Zap, ChevronRight, Music, Users, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onNavigateToPricing: () => void;
  onNavigateToAuth: () => void;
  onNavigateToApp: () => void;
}

export function LandingPage({ onNavigateToPricing, onNavigateToAuth, onNavigateToApp }: LandingPageProps) {
  const features = [
    {
      icon: Mic2,
      title: 'Grave sua Voz',
      description: 'Cante junto com os vídeos de karaokê enquanto nossa tecnologia captura cada nota da sua performance.',
    },
    {
      icon: Sparkles,
      title: 'IA Avançada',
      description: 'Avaliação inteligente analisa tom, letra e energia para dar feedback personalizado.',
    },
    {
      icon: Trophy,
      title: 'Rankings e Competição',
      description: 'Compare sua pontuação com outros cantores e suba no ranking diário e geral.',
    },
    {
      icon: Music,
      title: 'Catálogo Variado',
      description: 'Músicas em português, inglês e espanhol. De clássicos a hits atuais.',
    },
  ];

  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Cantora Amadora',
      text: 'Incrível! A IA realmente entende minha voz e me ajuda a melhorar a cada música.',
      rating: 5,
    },
    {
      name: 'João Pereira',
      role: 'Entusiasta de Karaokê',
      text: 'Uso no churrasco com os amigos. A competição pelos rankings deixa tudo mais divertido!',
      rating: 5,
    },
    {
      name: 'Ana Costa',
      role: 'Professora de Música',
      text: 'Excelente ferramenta para praticar. O feedback sobre tom é muito preciso.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-[var(--color-flag-blue)]/5" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <img src="/cantai_logo.png" alt="CantAI" className="h-32 md:h-40" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-theme mb-6">
              Karaokê com
              <span className="text-[var(--color-accent)]"> Inteligência Artificial</span>
            </h1>

            <p className="text-xl md:text-2xl text-theme-muted mb-10 max-w-2xl mx-auto">
              Cante, receba feedback em tempo real e melhore sua performance com avaliação por IA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToApp}
                className="btn-primary text-lg flex items-center justify-center gap-2"
              >
                <Mic2 className="w-5 h-5" />
                Experimente Grátis
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={onNavigateToPricing}
                className="btn-secondary text-lg flex items-center justify-center gap-2"
              >
                Ver Planos
              </button>
            </div>

            <p className="mt-6 text-sm text-theme-secondary">
              2 músicas grátis por mês. Sem cartão de crédito.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--color-accent)]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-[var(--color-flag-blue)]/20 rounded-full blur-3xl" />
      </section>

      {/* How it Works */}
      <section className="py-20 bg-theme-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-theme mb-4">
            Como Funciona
          </h2>
          <p className="text-center text-theme-muted mb-16 max-w-2xl mx-auto">
            Em três passos simples, você está cantando e recebendo feedback profissional.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Escolha', desc: 'Navegue pelo catálogo e escolha sua música favorita' },
              { step: 2, title: 'Cante', desc: 'Acompanhe o vídeo e solte a voz com confiança' },
              { step: 3, title: 'Receba', desc: 'Veja sua pontuação detalhada com feedback da IA' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-theme mb-2">{item.title}</h3>
                <p className="text-theme-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-theme mb-4">
            Recursos Exclusivos
          </h2>
          <p className="text-center text-theme-muted mb-16 max-w-2xl mx-auto">
            Tecnologia de ponta para transformar sua experiência de karaokê.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="dashboard-card group">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mb-4 group-hover:bg-[var(--color-accent)]/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-lg font-bold text-theme mb-2">{feature.title}</h3>
                <p className="text-sm text-theme-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation Metrics */}
      <section className="py-20 bg-theme-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-theme mb-4">
            Avaliação Completa
          </h2>
          <p className="text-center text-theme-muted mb-16 max-w-2xl mx-auto">
            Nossa IA analisa três dimensões essenciais da sua performance.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { emoji: '🎵', name: 'Tom', desc: 'Precisão das notas e afinação' },
              { emoji: '📝', name: 'Letra', desc: 'Acerto na pronúncia e timing' },
              { emoji: '🔥', name: 'Energia', desc: 'Expressividade e emoção' },
            ].map((metric, index) => (
              <div key={index} className="dashboard-card text-center">
                <span className="text-5xl mb-4 block">{metric.emoji}</span>
                <h3 className="text-xl font-bold text-theme mb-2">{metric.name}</h3>
                <p className="text-theme-muted">{metric.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-theme mb-4">
            O que Dizem Nossos Usuários
          </h2>
          <p className="text-center text-theme-muted mb-16 max-w-2xl mx-auto">
            Milhares de pessoas já descobriram o prazer de cantar com feedback inteligente.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="dashboard-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-theme-muted mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-theme">{testimonial.name}</p>
                  <p className="text-sm text-theme-secondary">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[var(--color-accent)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center text-white">
            {[
              { value: '10K+', label: 'Usuários' },
              { value: '50K+', label: 'Músicas Cantadas' },
              { value: '100+', label: 'Músicas no Catálogo' },
              { value: '4.9', label: 'Avaliação Média' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Zap className="w-16 h-16 text-[var(--color-accent)] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-theme mb-4">
              Pronto para Soltar a Voz?
            </h2>
            <p className="text-xl text-theme-muted mb-8">
              Comece grátis agora mesmo e descubra seu potencial como cantor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNavigateToApp}
                className="btn-primary text-lg flex items-center justify-center gap-2"
              >
                <Mic2 className="w-5 h-5" />
                Começar Grátis
              </button>
              <button
                onClick={onNavigateToAuth}
                className="btn-secondary text-lg flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Fazer Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
