'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';

export default function Login() {
  const login = useLogin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login.mutateAsync(formData);

      const user =
        result?.user ||
        JSON.parse(localStorage.getItem('user') || 'null');

      if (user?.role === 'admin') {
        window.location.assign('/admin');
        return;
      }

      window.location.assign('/cliente');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-charcoal overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />

      <main className="relative z-10 max-w-4xl mx-auto py-20 px-6">
        <h1 className="font-cursive text-4xl mb-2 text-primary">
          Iniciar sessão
        </h1>

        <p className="text-sm text-charcoal mb-12 pb-4 border-b border-primary/30">
          Início - Minha Conta - Login
        </p>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-rose/20 border border-rose text-rose-dark rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-xl border-2 border-primary/30"
        >
          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">
              E-mail
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">
              Senha
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal"
              required
            />

            <div className="text-right mt-2">
              <Link href="#" className="text-xs text-primary font-bold italic">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button type="submit" disabled={login.isPending} className="btn-primary">
              {login.isPending ? 'Entrando...' : 'Iniciar Sessão'}
            </button>

            <p className="text-sm text-charcoal">
              Não possui uma conta?{' '}
              <Link href="/cadastro" className="text-primary font-bold">
                Cadastre-se
              </Link>
            </p>
          </div>
        </form>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}