"use client"
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import ImageUpload from '@/components/admin/ImageUpload';
import { useCartCount } from '@/hooks/useCart';
import { useProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUser } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function EditarProduto() {
  const router = useRouter();
  const params = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    stock: '0',
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const cartCount = useCartCount();
  const { data: product, isLoading } = useProduct(params.id);
  const updateProduct = useUpdateProduct();
  const { data: categories } = useCategories();
  const { data: user } = useUser();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        categoryId: product.categoryId.toString(),
        stock: product.stock.toString(),
        isActive: product.isActive,
      });

      // Carregar imagens do produto
      loadProductImages();
    }
  }, [product]);

  const loadProductImages = async () => {
    try {
      const response = await api.get(`/products/${params.id}/images`);
      setImages(response.data);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Atualizar produto
      await updateProduct.mutateAsync({ id: params.id, data: formData });
      
      // Sincronizar imagens
      const currentImages = await api.get(`/products/${params.id}/images`);
      const currentImageIds = currentImages.data.map(img => img.id);
      
      // Remover imagens que não estão mais na lista
      for (const currentImg of currentImages.data) {
        const existsInState = images.some(img => img.url === currentImg.url);
        if (!existsInState) {
          await api.delete(`/products/${params.id}/images/${currentImg.id}`);
        }
      }

      // Adicionar novas imagens
      for (const image of images) {
        const existsInDb = currentImages.data.some(img => img.url === image.url);
        if (!existsInDb) {
          await api.post(`/products/${params.id}/images`, image);
        }
      }

      router.push('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar produto');
    }
  };

  // Get user from localStorage as fallback for immediate role check
  const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const userRole = user?.role || localUser?.role;

  // Check token first
  if (typeof window === 'undefined' || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faça login para acessar o painel admin</h1>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while user data is being fetched
  if (!user && !localUser) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p className="text-gray-500 mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/cliente" className="btn-primary">
            Voltar para Área do Cliente
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/admin" className="btn-primary">
            Voltar
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="text-sm text-[#D4A017] hover:underline">
              ← Voltar para Painel Admin
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Editar Produto</h1>
            <p className="text-sm text-gray-500 pb-4 border-b">Atualize as informações do produto</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 bg-white/50 p-8 rounded-lg">
            <div>
              <label className="block text-sm font-bold mb-2">Nome do Produto</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500 resize-none"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Preço (R$)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Estoque</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Categoria</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">URL da Imagem Principal</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Galeria de Imagens</label>
              <ImageUpload 
                images={images}
                onImagesChange={setImages}
                productId={params.id}
                maxImages={5}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm">Produto ativo</label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updateProduct.isPending}
                className="flex-1 btn-primary"
              >
                {updateProduct.isPending ? 'Atualizando...' : 'Atualizar Produto'}
              </button>
              <Link
                href="/admin"
                className="flex-1 btn-secondary text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
