"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useAddToCart } from '@/hooks/useCart';
import { Heart, ShoppingCart, Search, Filter } from 'lucide-react';
import Skeleton, { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function Produtos() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const cartCount = useCartCount();
  const addToCart = useAddToCart();

  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ 
    category: selectedCategory ? categories?.find(c => c.name.toLowerCase() === selectedCategory)?.id : undefined, 
    search: searchTerm 
  });

  // Get category and search from URL on mount and sync with URL changes
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const search = searchParams.get('search');
    if (categoria) {
      setSelectedCategory(categoria);
    } else {
      setSelectedCategory('');
    }
    if (search) {
      setSearchTerm(search);
    } else {
      setSearchTerm('');
    }
  }, [searchParams]);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart.mutateAsync({ productId, quantity: 1 });
    } catch (err) {
      console.error('Erro ao adicionar ao carrinho:', err);
    }
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set('categoria', category);
    } else {
      params.delete('categoria');
    }
    params.delete('search'); // Clear search when changing category
    router.push(`/produtos?${params.toString()}`);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/produtos?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen font-sans text-charcoal overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-cursive text-4xl text-primary mb-2">Catálogo de Produtos</h1>
            <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">
              Explore nossos produtos personalizados
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-accent/30 p-6 rounded-2xl sticky top-24 border border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={20} className="text-primary" />
                  <h2 className="font-bold text-charcoal">Filtros</h2>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-3">Categorias</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                        selectedCategory === '' 
                          ? 'bg-black text-white font-bold' 
                          : 'hover:bg-black/20 text-charcoal'
                      }`}
                    >
                      Todas
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.name.toLowerCase())}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-all ${
                          selectedCategory === category.name.toLowerCase() 
                            ? 'bg-black text-white font-bold' 
                            : 'hover:bg-black/20 text-charcoal'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-3">Buscar</h3>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-charcoal/40" />
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full border-2 border-black/30 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all bg-white/80 text-sm"
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : products?.length === 0 ? (
                <div className="text-center py-12 bg-accent/30 rounded-2xl">
                  <p className="text-charcoal/60">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products?.map((product) => (
                    <div key={product.id} className="group">
                      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-primary/20">
                        <div className="relative h-56 overflow-hidden bg-accent/50">
                          <Link href={`/produtos/${product.id}`}>
                            <img
                              src={product.image || '/placeholder.png'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </Link>
                          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-primary hover:text-white transition-colors shadow-md">
                            <Heart size={18} />
                          </button>
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">Esgotado</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-secondary font-bold uppercase tracking-wider">
                            {product.category?.name}
                          </span>
                          <Link href={`/produtos/${product.id}`}>
                            <h3 className="font-bold text-charcoal mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-charcoal/70 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              R$ {product.price?.toFixed(2) || '0.00'}
                            </span>
                            <button 
                              onClick={() => handleAddToCart(product.id)}
                              disabled={product.stock <= 0 || addToCart.isPending}
                              className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ShoppingCart size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
