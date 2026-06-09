"use client"
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/useAuth';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';

export default function Cadastro() {
  const router = useRouter();
  const register = useRegister();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await register.mutateAsync(formData);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    }
  };

  return (
    <div className="bg-cream min-h-screen font-sans text-charcoal overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />

      <main className="relative z-10 max-w-4xl mx-auto py-20 px-6">
        <h1 className="font-cursive text-4xl mb-2 text-primary">Criar conta</h1>
        <p className="text-sm text-charcoal mb-12 pb-4 border-b border-primary/30">Início - Minha Conta - Cadastro</p>

        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-rose/20 border border-rose text-rose-dark rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6 bg-white p-8 rounded-2xl shadow-xl border-2 border-primary/30">
          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Nome completo</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">E-mail</label>
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
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Telefone</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Senha</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
              required
              minLength="6"
            />
          </div>

          <div className="pt-4 border-t border-charcoal/20">
            <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Endereço</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">CEP</label>
              <input 
                type="text" 
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Número</label>
              <input 
                type="text" 
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Rua</label>
            <input 
              type="text" 
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Complemento</label>
            <input 
              type="text" 
              name="complement"
              value={formData.complement}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Bairro</label>
            <input 
              type="text" 
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Cidade</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase text-charcoal mb-2 tracking-widest">Estado</label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border-2 border-primary/40 py-3 px-4 outline-none focus:border-primary bg-accent rounded-lg transition-colors text-charcoal" 
                maxLength="2"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 pt-4">
            <button 
              type="submit"
              disabled={register.isPending}
              className="btn-primary"
            >
              {register.isPending ? 'Criando conta...' : 'Criar Conta'}
            </button>
            <p className="text-sm text-charcoal">Já possui uma conta? <Link href="/login" className="text-primary font-bold">Fazer login</Link></p>
          </div>
        </form>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}