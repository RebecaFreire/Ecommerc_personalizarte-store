"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useUser } from '@/hooks/useAuth';
import { FolderPlus, Edit, Trash2, Package, AlertCircle } from 'lucide-react';

export default function AdminCategorias() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', slug: '' });
  const cartCount = useCartCount();
  const { data: user } = useUser();
  const { data: categories, isLoading, refetch } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '', slug: category.slug });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', slug: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', slug: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, data: formData });
      } else {
        await createCategory.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar categoria:', err);
    }
  };

  const handleDelete = async (categoryId) => {
    const category = categories?.find(c => c.id === categoryId);
    if (category?._count?.products > 0) {
      alert('Não é possível excluir uma categoria que possui produtos vinculados.');
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await deleteCategory.mutateAsync(categoryId);
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
    }
  };

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
              <h1 className="font-cursive text-4xl text-primary mb-2">Gestão de Categorias</h1>
              <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">Gerencie as categorias de produtos</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <FolderPlus size={20} />
              Nova Categoria
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <p className="text-charcoal/60">Carregando categorias...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories?.map((category) => (
                <div key={category.id} className="bg-accent/30 rounded-2xl border border-primary/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Package size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal">{category.name}</h3>
                        <p className="text-xs text-charcoal/60">{category.slug}</p>
                      </div>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-charcoal/70 mb-4">{category.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-charcoal/60 mb-4">
                    <Package size={16} />
                    <span>{category._count?.products || 0} produto(s)</span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-primary/20">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors text-sm font-bold"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      disabled={category._count?.products > 0}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors text-sm font-bold ${
                        category._count?.products > 0
                          ? 'bg-charcoal/10 text-charcoal/50 cursor-not-allowed'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                      title={category._count?.products > 0 ? 'Não é possível excluir categoria com produtos' : 'Excluir'}
                    >
                      {category._count?.products > 0 ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      {category._count?.products > 0 ? 'Bloqueado' : 'Excluir'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {categories?.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <Package size={48} className="text-charcoal/30 mx-auto mb-4" />
              <p className="text-charcoal/60">Nenhuma categoria encontrada</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="font-cursive text-2xl text-primary mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-primary/30 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Slug (opcional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-primary/30 focus:outline-none focus:border-primary"
                  placeholder="Gerado automaticamente se vazio"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-primary/30 focus:outline-none focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
