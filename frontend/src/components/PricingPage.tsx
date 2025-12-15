import { Check, ArrowLeft, Mic2, Crown, Building2 } from 'lucide-react';
import { PricingPlan } from '../types';

interface PricingPageProps {
  onSelectPlan: (planId: 'free' | 'personal' | 'custom') => void;
  onBack: () => void;
}

export function PricingPage({ onSelectPlan, onBack }: PricingPageProps) {
  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      credits: 2,
      features: [
        '2 músicas por mês',
        'Acesso ao catálogo completo',
        'Avaliação por IA',
        'Ranking diário',
        'Suporte por email',
      ],
    },
    {
      id: 'personal',
      name: 'Pessoal',
      price: 29.90,
      credits: 50,
      highlighted: true,
      features: [
        '50 músicas por mês',
        'Acesso ao catálogo completo',
        'Avaliação por IA premium',
        'Rankings diário e geral',
        'Histórico de performances',
        'Suporte prioritário',
        'Sem anúncios',
      ],
    },
    {
      id: 'custom',
      name: 'Empresarial',
      price: null,
      credits: null,
      features: [
        'Créditos sob demanda',
        'Catálogo personalizado',
        'API de integração',
        'Múltiplos usuários',
        'Dashboard administrativo',
        'Suporte dedicado 24/7',
        'SLA garantido',
        'Personalização de marca',
      ],
    },
  ];

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return Mic2;
      case 'personal':
        return Crown;
      case 'custom':
        return Building2;
      default:
        return Mic2;
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="ghost-button mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-theme mb-4">
              Escolha seu Plano
            </h1>
            <p className="text-xl text-theme-muted">
              Comece grátis ou desbloqueie todo o potencial do CantAI com um plano premium.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            return (
              <div
                key={plan.id}
                className={`dashboard-card relative ${
                  plan.highlighted
                    ? 'ring-2 ring-[var(--color-accent)] scale-105'
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white px-4 py-1 rounded-full text-sm font-bold">
                    Mais Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent)]/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-2xl font-bold text-theme">{plan.name}</h2>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  {plan.price !== null ? (
                    <>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-theme-muted">R$</span>
                        <span className="text-4xl font-bold text-theme">
                          {plan.price === 0 ? '0' : plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-theme-muted">/mês</span>
                      </div>
                      <p className="text-sm text-theme-secondary mt-1">
                        {plan.credits} {plan.credits === 1 ? 'música' : 'músicas'} por mês
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-theme">Sob Consulta</div>
                      <p className="text-sm text-theme-secondary mt-1">
                        Créditos personalizados
                      </p>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                      <span className="text-theme-muted">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => onSelectPlan(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                      : 'bg-theme-secondary text-theme border border-theme hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                  }`}
                >
                  {plan.id === 'free' && 'Começar Grátis'}
                  {plan.id === 'personal' && 'Assinar Agora'}
                  {plan.id === 'custom' && 'Falar com Vendas'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-theme text-center mb-8">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {[
              {
                q: 'Como funcionam os créditos?',
                a: 'Cada crédito permite cantar uma música completa com avaliação por IA. Os créditos são renovados mensalmente no plano escolhido.',
              },
              {
                q: 'Posso trocar de plano depois?',
                a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento. Os créditos restantes são mantidos.',
              },
              {
                q: 'Os créditos acumulam?',
                a: 'Não, os créditos não utilizados expiram ao final do mês. Aproveite ao máximo seu plano!',
              },
              {
                q: 'Qual a forma de pagamento?',
                a: 'Aceitamos cartões de crédito, débito, Pix e boleto bancário.',
              },
              {
                q: 'Posso cancelar a qualquer momento?',
                a: 'Sim, você pode cancelar sua assinatura quando quiser. Você mantém acesso até o final do período pago.',
              },
            ].map((faq, index) => (
              <div key={index} className="dashboard-card">
                <h3 className="font-bold text-theme mb-2">{faq.q}</h3>
                <p className="text-theme-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-theme text-center mb-8">
            Comparativo de Planos
          </h2>

          <div className="dashboard-card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left py-4 px-4 text-theme">Recurso</th>
                  <th className="text-center py-4 px-4 text-theme">Gratuito</th>
                  <th className="text-center py-4 px-4 text-theme">Pessoal</th>
                  <th className="text-center py-4 px-4 text-theme">Empresarial</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Músicas/mês', free: '2', personal: '50', custom: 'Ilimitado' },
                  { feature: 'Avaliação IA', free: 'Básica', personal: 'Premium', custom: 'Premium+' },
                  { feature: 'Rankings', free: 'Diário', personal: 'Diário + Geral', custom: 'Personalizado' },
                  { feature: 'Histórico', free: '7 dias', personal: 'Completo', custom: 'Completo' },
                  { feature: 'Suporte', free: 'Email', personal: 'Prioritário', custom: '24/7' },
                  { feature: 'API', free: '-', personal: '-', custom: 'Sim' },
                  { feature: 'Multi-usuário', free: '-', personal: '-', custom: 'Sim' },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-theme/50 last:border-0">
                    <td className="py-3 px-4 text-theme-muted">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-theme-muted">{row.free}</td>
                    <td className="py-3 px-4 text-center text-[var(--color-accent)] font-medium">{row.personal}</td>
                    <td className="py-3 px-4 text-center text-theme-muted">{row.custom}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
