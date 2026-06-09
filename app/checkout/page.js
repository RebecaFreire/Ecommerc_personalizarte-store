"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/useOrders';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    paymentMethod: 'credit_card',
  });
  const [error, setError] = useState('');
  const [cepError, setCepError] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const cartCount = useCartCount();
  const { data: cart, isLoading } = useCart();
  const createOrder = useCreateOrder();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      // Format CEP with mask
      const numericValue = value.replace(/\D/g, '');
      let formattedValue = numericValue;
      
      if (numericValue.length > 5) {
        formattedValue = numericValue.slice(0, 5) + '-' + numericValue.slice(5, 8);
      }
      
      setFormData({
        ...formData,
        [name]: formattedValue
      });
      
      // Trigger CEP search when 8 digits are entered
      if (numericValue.length === 8) {
        fetchAddress(numericValue);
      } else {
        setCepError('');
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const fetchAddress = async (cep) => {
    setLoadingCep(true);
    setCepError('');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado. Verifique o número digitado.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));
    } catch (err) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.cep || !formData.street || !formData.number || !formData.city || !formData.state) {
      setError('Por favor, preencha todos os campos de endereço obrigatórios');
      return;
    }

    if (!cart?.items?.length) {
      setError('Seu carrinho está vazio');
      return;
    }

    try {
      const shippingAddress = `${formData.street}, ${formData.number}${formData.complement ? `, ${formData.complement}` : ''}, ${formData.neighborhood}, ${formData.city} - ${formData.state}, CEP: ${formData.cep}`;

      const orderData = {
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          customization: item.customization,
        })),
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      };

      const order = await createOrder.mutateAsync(orderData);
      
      // Redirect to order details page
      router.push(`/pedidos/${order.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pedido');
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  if (typeof window === 'undefined' || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <ShoppingBag size={64} className="mx-auto mb-4 text-primary" />
          <h1 className="font-cursive text-3xl text-primary mb-4">Faça login para finalizar a compra</h1>
          <Link href="/login" className="btn-primary inline-block">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <p className="text-charcoal/60">Carregando...</p>
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <ShoppingBag size={64} className="mx-auto mb-4 text-primary" />
          <h1 className="font-cursive text-3xl text-primary mb-4">Seu carrinho está vazio</h1>
          <Link href="/produtos" className="btn-primary inline-block">
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-cursive text-4xl text-primary mb-2">Finalizar Compra</h1>
            <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">
              Complete seu pedido
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-accent/30 p-6 rounded-2xl border border-primary/20">
                  <h2 className="font-cursive text-2xl text-primary mb-4">Endereço de Entrega</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">CEP</label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleChange}
                        placeholder="00000-000"
                        maxLength="9"
                        className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                        required
                      />
                      {loadingCep && (
                        <p className="text-xs text-primary mt-1">Buscando CEP...</p>
                      )}
                      {cepError && (
                        <p className="text-xs text-rose mt-1">{cepError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Número</label>
                      <input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Rua</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Complemento</label>
                    <input
                      type="text"
                      name="complement"
                      value={formData.complement}
                      onChange={handleChange}
                      className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Bairro</label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                      required
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Cidade</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-2">Estado</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        maxLength="2"
                        className="w-full border-2 border-charcoal/30 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white/80"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-accent/30 p-6 rounded-2xl border border-primary/20">
                  <h2 className="font-cursive text-2xl text-primary mb-4">Forma de Pagamento</h2>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-primary/30 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="font-bold text-charcoal">Cartão de Crédito</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 border-primary/30 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit_card"
                        checked={formData.paymentMethod === 'debit_card'}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="font-bold text-charcoal">Cartão de Débito</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 border-primary/30 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleChange}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="font-bold text-charcoal">PIX</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose/10 border border-rose/30 text-rose rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createOrder.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  {createOrder.isPending ? 'Processando...' : 'Confirmar Pedido'}
                </button>
              </form>
            </div>

            <div className="bg-accent/30 p-6 rounded-2xl h-fit sticky top-24 border border-primary/20 shadow-md">
              <h2 className="font-cursive text-2xl text-primary mb-4">Resumo do Pedido</h2>
              <div className="space-y-3 mb-6">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-primary/20 last:border-0">
                    <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-primary/20">
                      <img
                        src={item.product.image || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-charcoal">{item.product.name}</p>
                      <p className="text-sm text-charcoal/70">Qtd: {item.quantity}</p>
                      <p className="text-sm font-bold text-primary">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-primary/30 pt-4 space-y-2">
                <div className="flex justify-between text-charcoal">
                  <span>Subtotal</span>
                  <span className="font-bold">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span>Frete</span>
                  <span className="text-sage font-bold">Grátis</span>
                </div>
                <div className="border-t-2 border-primary/30 pt-3 flex justify-between font-bold text-xl text-primary">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
