import { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Mic2, CreditCard, Check } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthPageProps {
  selectedPlan?: 'free' | 'personal' | 'custom' | null;
  onBack: () => void;
  onLogin: (user: UserType) => void;
  onRegister: (user: UserType) => void;
}

type AuthMode = 'login' | 'register';

export function AuthPage({ selectedPlan, onBack, onLogin, onRegister }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(selectedPlan ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'payment'>(selectedPlan && selectedPlan !== 'free' ? 'auth' : 'auth');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const planDetails = {
    free: { name: 'Gratuito', price: 0, credits: 2 },
    personal: { name: 'Pessoal', price: 29.90, credits: 50 },
    custom: { name: 'Empresarial', price: null, credits: null },
  };

  const currentPlan = selectedPlan ? planDetails[selectedPlan] : null;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
      return;
    }

    // Format expiry date
    if (name === 'cardExpiry') {
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAuthForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Nome é obrigatório';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não conferem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }
    if (!formData.cardExpiry || formData.cardExpiry.length < 5) {
      newErrors.cardExpiry = 'Data inválida';
    }
    if (!formData.cardCvc || formData.cardCvc.length < 3) {
      newErrors.cardCvc = 'CVC inválido';
    }
    if (!formData.cardName) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAuthForm()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mode === 'register' && selectedPlan && selectedPlan !== 'free') {
      // Go to payment step
      setStep('payment');
      setIsLoading(false);
      return;
    }

    // Create mock user
    const mockUser: UserType = {
      id: `user_${Date.now()}`,
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      role: 'user',
      credits: selectedPlan === 'personal' ? 50 : 2,
      plan: selectedPlan || 'free',
      planCredits: selectedPlan === 'personal' ? 50 : 2,
      createdAt: new Date().toISOString(),
    };

    setIsLoading(false);

    if (mode === 'login') {
      onLogin(mockUser);
    } else {
      onRegister(mockUser);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePaymentForm()) return;

    setIsLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create mock user with paid plan
    const mockUser: UserType = {
      id: `user_${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: 'user',
      credits: currentPlan?.credits || 50,
      plan: selectedPlan || 'personal',
      planCredits: currentPlan?.credits || 50,
      createdAt: new Date().toISOString(),
    };

    setIsLoading(false);
    onRegister(mockUser);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="ghost-button mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="max-w-lg mx-auto">
          {/* Plan Summary (if plan selected) */}
          {currentPlan && (
            <div className="dashboard-card mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/20 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <p className="font-bold text-theme">Plano {currentPlan.name}</p>
                    <p className="text-sm text-theme-muted">
                      {currentPlan.credits} músicas/mês
                    </p>
                  </div>
                </div>
                {currentPlan.price !== null && (
                  <p className="font-bold text-theme">
                    R$ {currentPlan.price.toFixed(2).replace('.', ',')}
                    <span className="text-sm font-normal text-theme-muted">/mês</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Auth Card */}
          <div className="dashboard-card">
            {step === 'auth' ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-theme mb-2">
                    {mode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
                  </h1>
                  <p className="text-theme-muted">
                    {mode === 'login'
                      ? 'Bem-vindo de volta! Digite seus dados para continuar.'
                      : 'Preencha os dados para começar a cantar.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-theme mb-1">
                        Nome completo
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                          className="input-field pl-10"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-theme mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme mb-1">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Sua senha"
                        className="input-field pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-secondary hover:text-theme"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-theme mb-1">
                        Confirmar senha
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirme sua senha"
                          className="input-field pl-10"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Entrar' : 'Continuar'}
                      </>
                    )}
                  </button>
                </form>

                {/* Switch mode */}
                <div className="mt-6 text-center">
                  <p className="text-theme-muted">
                    {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                      className="ml-2 text-[var(--color-accent)] font-medium hover:underline"
                    >
                      {mode === 'login' ? 'Criar conta' : 'Fazer login'}
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Payment Step */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-theme mb-2">
                    Pagamento
                  </h1>
                  <p className="text-theme-muted">
                    Complete o pagamento para ativar seu plano.
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-theme-secondary/50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-theme-muted">Plano {currentPlan?.name}</span>
                    <span className="text-theme font-medium">
                      R$ {currentPlan?.price?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-theme pt-2">
                    <span className="font-bold text-theme">Total/mês</span>
                    <span className="font-bold text-[var(--color-accent)]">
                      R$ {currentPlan?.price?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme mb-1">
                      Número do cartão
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500 mt-1">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme mb-1">
                        Validade
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="input-field"
                      />
                      {errors.cardExpiry && (
                        <p className="text-sm text-red-500 mt-1">{errors.cardExpiry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className="input-field"
                      />
                      {errors.cardCvc && (
                        <p className="text-sm text-red-500 mt-1">{errors.cardCvc}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme mb-1">
                      Nome no cartão
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="Como aparece no cartão"
                      className="input-field"
                    />
                    {errors.cardName && (
                      <p className="text-sm text-red-500 mt-1">{errors.cardName}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Confirmar Pagamento
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('auth')}
                    className="w-full py-2 text-theme-muted hover:text-theme"
                  >
                    Voltar
                  </button>
                </form>

                {/* Security badges */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-theme-secondary">
                  <span>🔒 Pagamento seguro</span>
                  <span>•</span>
                  <span>SSL criptografado</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
