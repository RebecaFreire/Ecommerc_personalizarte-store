"use client"
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import CustomizationUpload from '@/components/product/CustomizationUpload';
import { useCartCount } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { Heart, ShoppingCart, Minus, Plus, ArrowLeft } from 'lucide-react';

export default function ProdutoDetalhe() {
  const router = useRouter();
  const params = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [customizationImage, setCustomizationImage] = useState('');
  const [error, setError] = useState('');
  const cartCount = useCartCount();
  
  const { data: product, isLoading } = useProduct(params.id);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
      return;
    }

    try {
      // Combinar texto e imagem em JSON
      const customization = JSON.stringify({
        text: customizationText || null,
        imageUrl: customizationImage || null,
      });

      await addToCart.mutateAsync({
        productId: product.id,
        quantity,
        customization: customizationText || customizationImage ? customization : null,
      });
      router.push('/carrinho');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao adicionar ao carrinho');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Produto não encontrado</p>
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
            <Link href="/produtos" className="inline-flex items-center gap-2 text-sm text-black hover:text-gray-700 transition-colors font-bold">
              <ArrowLeft size={16} />
              Voltar para produtos
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square bg-kraft/50 rounded-3xl overflow-hidden shadow-lg border border-pastelPink/20">
                <img
                  src={product.image || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute top-4 right-4 p-3 bg-white/90 rounded-full hover:bg-black hover:text-white transition-colors shadow-md">
                <Heart size={20} />
              </button>
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-center">
              <span className="text-xs text-pastelBlue font-bold uppercase tracking-wider mb-2">
                {product.category?.name}
              </span>
              <h1 className="font-cursive text-4xl text-pastelPink mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
              
              <div className="text-3xl font-bold text-pastelPink mb-6">
                R$ {product.price?.toFixed(2) || '0.00'}
              </div>

              <div className="mb-6">
                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} unidades em estoque` : 'Produto esgotado'}
                </span>
              </div>

              <div className="space-y-6 mb-6 bg-kraft/30 p-6 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Quantidade</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 border-2 border-black/30 rounded-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-12 h-12 border-2 border-black/30 rounded-xl hover:bg-black hover:text-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">Personalização (opcional)</label>
                  <textarea
                    value={customizationText}
                    onChange={(e) => setCustomizationText(e.target.value)}
                    placeholder="Descreva como você gostaria de personalizar este produto..."
                    className="w-full border-2 border-black/30 rounded-xl p-4 outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all bg-white/80 resize-none text-sm mb-4"
                    rows={3}
                  />
                  <CustomizationUpload
                    value={customizationImage}
                    onChange={setCustomizationImage}
                    label="Upload de imagem para personalização"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {addToCart.isPending ? 'Adicionando...' : product.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
