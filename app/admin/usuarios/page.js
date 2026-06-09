"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useUsers, useDeleteUser } from '@/hooks/useUsers';
import { useUser } from '@/hooks/useAuth';
import { Users, Shield, User, Mail, Phone, MapPin, ShoppingCart, DollarSign } from 'lucide-react';

export default function AdminUsuarios() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const { data: currentUser } = useUser();
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = async (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await deleteUser.mutateAsync(userId);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
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
  const userRole = currentUser?.role || localUser?.role;

  // Show loading while user data is being fetched
  if (!currentUser && !localUser) {
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
          <div className="mb-8">
            <Link href="/admin" className="text-sm text-charcoal/60 hover:text-primary mb-4 inline-block">
              ← Voltar ao Dashboard
            </Link>
            <h1 className="font-cursive text-4xl text-primary mb-2">Gestão de Usuários</h1>
            <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">Gerencie os usuários do sistema</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <p className="text-charcoal/60">Carregando usuários...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users?.map((user) => (
                <div key={user.id} className="bg-accent/30 rounded-2xl border border-primary/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal">{user.name}</h3>
                        <p className="text-sm text-charcoal/60">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-sage/20 text-sage'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Cliente'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {user.phone && (
                      <div className="flex items-center gap-2 text-charcoal/70">
                        <Phone size={16} />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.cep && (
                      <div className="flex items-center gap-2 text-charcoal/70">
                        <MapPin size={16} />
                        <span>{user.city}, {user.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <Shield size={16} />
                      <span>Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-charcoal/60">
                      <ShoppingCart size={16} />
                      <span>{user._count?.orders || 0} pedido(s)</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <DollarSign size={16} />
                      <span>Total gasto: R$ {(user.totalSpent || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-primary/20">
                    <Link
                      href={`/admin/usuarios/${user.id}`}
                      className="flex-1 text-center px-4 py-2 bg-black/10 text-black rounded-xl hover:bg-black/20 transition-colors text-sm font-bold"
                    >
                      Editar
                    </Link>
                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors text-sm font-bold"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
