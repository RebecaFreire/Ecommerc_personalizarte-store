"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useUser } from '@/hooks/useAuth';

export default function AdminRelatorios() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const { data: orders, isLoading } = useOrders();
  const { data: user } = useUser();

  // Get user from localStorage as fallback for immediate role check
  const localUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const userRole = user?.role || localUser?.role;

  // Show loading while user data is being fetched
  if (!user && !localUser) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p className="text-gray-500 mb-4">Você não tem permissão para acessar esta página</p>
          <Link href="/cliente" className="bg-[#D4A017] text-white px-6 py-3 rounded hover:bg-yellow-700">
            Voltar para Área do Cliente
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

  const ordersByStatus = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {}) || {};

  const recentOrders = orders?.slice(0, 10) || [];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900 overflow-x-hidden">
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuOpen={() => setIsMenuOpen(true)} cartCount={cartCount} />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/admin" className="text-sm text-[#D4A017] hover:underline">
              ← Voltar para Painel Admin
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Relatórios de Vendas</h1>
            <p className="text-sm text-gray-500 pb-4 border-b">Visualize as métricas do seu negócio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-sm text-gray-500 uppercase mb-2">Receita Total</h3>
              <p className="text-3xl font-bold text-[#D4A017]">
                R$ {totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-sm text-gray-500 uppercase mb-2">Total de Pedidos</h3>
              <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-sm text-gray-500 uppercase mb-2">Pedidos Pendentes</h3>
              <p className="text-3xl font-bold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-sm text-gray-500 uppercase mb-2">Pedidos Entregues</h3>
              <p className="text-3xl font-bold text-green-600">{completedOrders}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Pedidos por Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pendente</span>
                  <span className="font-bold">{ordersByStatus.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processando</span>
                  <span className="font-bold">{ordersByStatus.processing || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Enviado</span>
                  <span className="font-bold">{ordersByStatus.shipped || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Entregue</span>
                  <span className="font-bold">{ordersByStatus.delivered || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cancelado</span>
                  <span className="font-bold">{ordersByStatus.cancelled || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Ticket Médio</h3>
              <p className="text-4xl font-bold text-[#D4A017] mb-4">
                R$ {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
              </p>
              <p className="text-sm text-gray-600">
                Valor médio por pedido
              </p>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Pedidos Recentes</h3>
            {isLoading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pedido</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">#{order.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#D4A017]">
                          R$ {order.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
