"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/hooks/useCart';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Carrinho() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const { data: cart, isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem.mutateAsync({ id: itemId, quantity: newQuantity });
    } catch (err) {
      console.error('Erro ao atualizar quantidade:', err);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart.mutateAsync(itemId);
    } catch (err) {
      console.error('Erro ao remover item:', err);
    }
  };

  const total = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  if (typeof window === 'undefined' || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <ShoppingBag size={64} className="mx-auto mb-4 text-primary" />
          <h1 className="font-cursive text-3xl text-primary mb-4">Faça login para ver seu carrinho</h1>
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
        <p className="text-charcoal/60">Carregando carrinho...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-charcoal overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-cursive text-4xl text-primary mb-2">Carrinho de Compras</h1>
            <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">
              Revise seus itens antes de finalizar
            </p>
          </div>

          {cart?.items?.length === 0 ? (
            <div className="text-center py-12 bg-accent/30 rounded-3xl">
              <ShoppingBag size={64} className="mx-auto mb-4 text-primary" />
              <p className="text-charcoal mb-4 text-lg">Seu carrinho está vazio</p>
              <Link 
                href="/produtos" 
                className="btn-primary inline-block"
              >
                Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-md p-6 flex gap-4 border border-primary/20">
                    <div className="w-24 h-24 bg-accent/50 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image || '/placeholder.png'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/produtos/${item.product.id}`} className="font-bold text-charcoal hover:text-primary transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-charcoal/70 mb-2">{item.product.category?.name}</p>
                      {item.customization && (
                        <p className="text-sm text-secondary mb-2 bg-white px-3 py-1 rounded-full inline-block border border-secondary/30">
                          Personalização: {item.customization}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-10 h-10 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center bg-white"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-charcoal">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-10 h-10 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center bg-white"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-lg">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-sm text-rose hover:text-rose-dark flex items-center gap-1 mt-1"
                          >
                            <Trash2 size={14} />
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-accent/30 p-6 rounded-2xl h-fit sticky top-24 border border-primary/20 shadow-md">
                <h2 className="font-cursive text-2xl text-primary mb-4">Resumo do Pedido</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-charcoal">
                    <span>Subtotal</span>
                    <span className="font-bold">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-charcoal">
                    <span>Frete</span>
                    <span className="text-sage font-bold">A calcular</span>
                  </div>
                  <div className="border-t-2 border-primary/30 pt-3 flex justify-between font-bold text-xl text-primary">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  Finalizar Compra
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/produtos"
                  className="block w-full mt-4 text-center text-sm text-charcoal/70 hover:text-primary font-bold"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
