"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useLogout, useUser } from '@/hooks/useAuth';

export default function ClienteArea() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const logout = useLogout();
  const { data: user } = useUser();
  const { data: orders, isLoading } = useOrders();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return method || 'Não informado';
    }
  };

  if (typeof window === 'undefined' || !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faça login para acessar sua área</h1>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso negado</h1>
          <p className="text-gray-500 mb-4">Administradores devem acessar o painel admin</p>
          <Link href="/admin" className="btn-primary">
            Ir para Painel Admin
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
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Minha Conta</h1>
              <p className="text-sm text-gray-500 pb-4 border-b">Gerencie seus pedidos</p>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
            >
              Sair
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando pedidos...</p>
            </div>
          ) : orders?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Você ainda não tem pedidos</p>
              <Link href="/produtos" className="btn-primary">
                Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders?.map((order) => (
                <div key={order.id} className="bg-white/50 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Pedido #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.image || '/placeholder.jpg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Qtd: {item.quantity}</p>
                          {item.customization && (
                            <p className="text-sm text-[#D4A017]">Personalização: {item.customization}</p>
                          )}
                        </div>
                        <p className="font-bold text-[#D4A017]">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Forma de pagamento: {getPaymentLabel(order.paymentMethod)}</p>
                      {order.shippingAddress && (
                        <p className="text-sm text-gray-600">Endereço: {order.shippingAddress}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-[#D4A017]">
                        R$ {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/pedidos/${order.id}`}
                      className="text-[#D4A017] font-bold hover:underline"
                    >
                      Ver detalhes do pedido →
                    </Link>
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
