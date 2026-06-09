"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useProducts, useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUser } from '@/hooks/useAuth';
import { Package, Plus, Edit, Trash2, Search, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminProdutos() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const cartCount = useCartCount();
  const { data: user } = useUser();
  const { data: products, isLoading, refetch } = useProducts({ admin: 'true' });
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const handleDelete = async (productId) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await deleteProduct.mutateAsync(productId);
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct.mutateAsync({ 
        id: product.id, 
        data: { isActive: !product.isActive } 
      });
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
    }
  };

  const handleStockUpdate = async (product, newStock) => {
    try {
      await updateProduct.mutateAsync({ 
        id: product.id, 
        data: { stock: parseInt(newStock) } 
      });
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
    }
  };

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  }) || [];

  if (typeof window === 'undefined' || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary">Faça login para acessar o painel admin</h1>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  // Get user from localStorage as fallback for immediate role check
  const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const userRole = user?.role || localUser?.role;

  // Show loading while user data is being fetched
  if (!user && !localUser) {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center">
          <p className="text-charcoal/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-white font-sans text-charcoal flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary">Acesso negado</h1>
          <p className="text-charcoal/60 mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/cliente" className="btn-primary">
            Voltar para Área do Cliente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans text-charcoal overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Link href="/admin" className="text-sm text-charcoal/60 hover:text-primary mb-4 inline-block">
                ← Voltar ao Dashboard
              </Link>
              <h1 className="font-cursive text-4xl text-primary mb-2">Gestão de Produtos</h1>
              <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">Adicione, edite e remova produtos</p>
            </div>
            <Link
              href="/admin/produtos/novo"
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <Plus size={20} />
              Novo Produto
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-primary/30 bg-white text-charcoal focus:outline-none focus:border-primary"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-primary/30 bg-white text-charcoal focus:outline-none focus:border-primary"
            >
              <option value="">Todas as categorias</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <p className="text-charcoal/60">Carregando produtos...</p>
            </div>
          ) : (
            <div className="bg-accent/30 rounded-2xl border border-primary/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Preço</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Estoque</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-charcoal uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/20">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-primary/5">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-primary/20">
                              <img
                                src={product.image || '/placeholder.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-bold text-charcoal">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal/70">
                          {product.category?.name}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          R$ {product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={product.stock}
                              onChange={(e) => handleStockUpdate(product, e.target.value)}
                              className={`w-20 px-2 py-1 rounded-lg border text-center focus:outline-none ${
                                product.stock < 5 
                                  ? 'border-rose bg-rose/10 text-rose' 
                                  : 'border-primary/30 bg-white text-charcoal'
                              }`}
                            />
                            {product.stock < 5 && (
                              <AlertCircle size={16} className="text-rose" title="Estoque baixo" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(product)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                              product.isActive 
                                ? 'bg-sage/20 text-sage hover:bg-sage/30' 
                                : 'bg-rose/20 text-rose hover:bg-rose/30'
                            }`}
                          >
                            {product.isActive ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/produtos/${product.id}`}
                              className="p-2 text-secondary hover:text-primary transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-rose hover:text-rose-dark transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="text-charcoal/30 mx-auto mb-4" />
                  <p className="text-charcoal/60">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
