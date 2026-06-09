"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Heart, ShoppingCart } from 'lucide-react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary/20 via-accent to-secondary/10 py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-cursive text-4xl md:text-6xl text-primary mb-4">
            Cada lembrança carrega um pedaço de carinho
          </h1>
          <p className="text-charcoal text-sm md:text-base mb-8 max-w-2xl mx-auto">
            Personalize seus momentos especiais com produtos únicos e feitos com amor
          </p>
          <Link
            href="/produtos"
            className="btn-primary inline-block"
          >
            Ver Produtos
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-cursive text-3xl text-primary">
            Produtos em Destaque
          </h2>
          <Link href="/produtos" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.slice(0, 8).map((p) => (
            <Link key={p.id} href={`/produtos/${p.id}`} className="group">
              <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-primary/20">
                <div className="relative h-48 md:h-56 overflow-hidden bg-accent/50">
                  <img
                    src={p.image || '/placeholder.png'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-primary hover:text-white transition-colors shadow-md">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-charcoal mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <p className="text-primary font-bold text-lg">R$ {p.price?.toFixed(2) || '0.00'}</p>
                    <button className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 bg-primary/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-cursive text-3xl text-center text-primary mb-8">
            Nossas Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((c) => (
              <Link 
                key={c.id} 
                href={`/produtos?categoria=${c.name.toLowerCase()}`}
                className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-primary/20"
              >
                <div className="w-16 h-16 mx-auto mb-3 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎀</span>
                </div>
                <h3 className="font-bold text-sm text-charcoal">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="font-cursive text-3xl text-center text-primary mb-8">
          Depoimentos
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-primary/20">
            <p className="text-charcoal italic mb-4">"Amei meu kit personalizado, ficou perfeito! A qualidade é incrível."</p>
            <p className="font-bold text-primary">— Maria Silva</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-primary/20">
            <p className="text-charcoal italic mb-4">"Entrega rápida e produto de ótima qualidade. Recomendo muito!"</p>
            <p className="font-bold text-primary">— João Santos</p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
