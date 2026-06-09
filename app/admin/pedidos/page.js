"use client"
import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useOrders, useUpdateOrderStatus, useCancelOrder, useArchiveOrder } from '@/hooks/useOrders';
import { useUser } from '@/hooks/useAuth';
import { Package, CheckCircle, XCircle, Clock, Truck, MessageCircle, Phone, Mail, MapPin, User, Eye, Archive, Filter } from 'lucide-react';

export default function AdminPedidos() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const cartCount = useCartCount();
  const { data: user } = useUser();
  const { data: orders, isLoading } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const archiveOrder = useArchiveOrder();

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      try {
        await cancelOrder.mutateAsync(orderId);
      } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
      }
    }
  };

  const handleArchive = async (orderId) => {
    if (window.confirm('Tem certeza que deseja arquivar este pedido?')) {
      try {
        await archiveOrder.mutateAsync(orderId);
      } catch (err) {
        console.error('Erro ao arquivar pedido:', err);
      }
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'all') return !order.archived;
    if (statusFilter === 'archived') return order.archived;
    return order.status === statusFilter && !order.archived;
  }) || [];

  const handleWhatsApp = (order) => {
    const itemsText = order.orderItems?.map(item =>
      `- ${item.product?.name} (Qtd: ${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}${item.customization ? ` - Personalização: ${item.customization}` : ''}`
    ).join('\n');

    const customizationsText = order.orderItems?.some(item => item.customizations?.length > 0)
      ? '\n\nPersonalizações:\n' + order.orderItems?.map(item =>
          item.customizations?.map(c =>
            `- ${item.product?.name}: ${c.type === 'text' ? `Texto: ${c.text}` : `Imagem: ${c.imageUrl}`}`
          ).join('\n')
        ).filter(Boolean).join('\n')
      : '';

    const address = order.address || order.shippingAddress;
    let addressText = '';
    if (address) {
      if (typeof address === 'object') {
        addressText = `\n\nEndereço de Entrega:\n${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}\n${address.neighborhood}\n${address.city} - ${address.state}\nCEP: ${address.cep}`;
      } else {
        addressText = `\n\nEndereço de Entrega:\n${address}`;
      }
    }

    const message = `*Pedido #${order.id}*\n\n` +
      `Cliente: ${order.user?.name}\n` +
      `Email: ${order.user?.email}\n` +
      `Telefone: ${order.user?.phone || 'Não informado'}\n` +
      `Status: ${statusConfig[order.status]?.label || order.status}\n\n` +
      `Itens do Pedido:\n${itemsText}` +
      customizationsText +
      addressText +
      `\n\nTotal: R$ ${order.total?.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/5512991130311?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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

  const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'text-secondary', bg: 'bg-secondary/20' },
    processing: { label: 'Em produção', icon: Package, color: 'text-primary', bg: 'bg-primary/20' },
    ready: { label: 'Pronto', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
    shipped: { label: 'Enviado', icon: Truck, color: 'text-sage', bg: 'bg-sage/20' },
    delivered: { label: 'Entregue', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'text-rose', bg: 'bg-rose/20' },
  };

  const getPaymentLabel = (method) => {
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return method || 'Não informado';
    }
  };

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
            <h1 className="font-cursive text-4xl text-primary mb-2">Gestão de Pedidos</h1>
            <p className="text-sm text-charcoal/60 pb-4 border-b border-primary/30">Gerencie os pedidos dos clientes</p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <Filter size={20} className="text-charcoal/60 mt-1" />
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'all' ? 'bg-primary text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'pending' ? 'bg-secondary text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'processing' ? 'bg-primary text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Em produção
            </button>
            <button
              onClick={() => setStatusFilter('ready')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'ready' ? 'bg-blue-600 text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Prontos
            </button>
            <button
              onClick={() => setStatusFilter('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'shipped' ? 'bg-sage text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Enviados
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'delivered' ? 'bg-green-600 text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Entregues
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'cancelled' ? 'bg-rose text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Cancelados
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${statusFilter === 'archived' ? 'bg-charcoal text-white' : 'bg-accent/30 text-charcoal hover:bg-accent/50'}`}
            >
              Arquivados
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <p className="text-charcoal/60">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-accent/30 rounded-2xl">
              <p className="text-charcoal/60">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Clock;
                const statusColor = statusConfig[order.status]?.color || 'text-charcoal';
                const statusBg = statusConfig[order.status]?.bg || 'bg-charcoal/20';
                const isExpanded = expandedOrder === order.id;
                
                return (
                  <div key={order.id} className="bg-accent/30 rounded-2xl border border-primary/20 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${statusBg}`}>
                            <StatusIcon size={24} className={statusColor} />
                          </div>
                          <div>
                            <p className="font-bold text-charcoal">Pedido #{order.id}</p>
                            <p className="text-sm text-charcoal/60">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusBg} ${statusColor}`}>
                            {statusConfig[order.status]?.label || order.status}
                          </span>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-4 py-2 rounded-xl border border-primary/30 bg-white text-charcoal text-sm focus:outline-none focus:border-primary"
                          >
                            <option value="pending">Pendente</option>
                            <option value="processing">Em produção</option>
                            <option value="ready">Pronto</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors text-sm font-bold"
                          >
                            <Eye size={16} />
                            {isExpanded ? 'Ocultar' : 'Ver Detalhes'}
                          </button>
                          <button
                            onClick={() => handleWhatsApp(order)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-bold"
                          >
                            <MessageCircle size={16} />
                            WhatsApp
                          </button>
                          {order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancel(order.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose text-white hover:bg-rose/80 transition-colors text-sm font-bold"
                            >
                              <XCircle size={16} />
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() => handleArchive(order.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal text-white hover:bg-charcoal/80 transition-colors text-sm font-bold"
                          >
                            <Archive size={16} />
                            Arquivar
                          </button>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-primary/20 p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                              <Package size={18} className="text-primary" />
                              Itens do Pedido
                            </h3>
                            <div className="space-y-3">
                              {order.orderItems?.map((item) => (
                                <div key={item.id} className="p-4 bg-white rounded-xl border border-primary/20 shadow-sm">
                                  <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-accent/50 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={item.product?.image || '/placeholder.jpg'}
                                        alt={item.product?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-charcoal mb-1">{item.product?.name}</p>
                                      <p className="text-sm text-charcoal/60 mb-2">
                                        Qtd: {item.quantity} × R$ {item.price?.toFixed(2)}
                                      </p>
                                      <p className="font-bold text-primary text-lg">
                                        R$ {(item.price * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                  {(item.customization || (item.customizations && item.customizations.length > 0)) && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                      <p className="font-bold text-blue-800 text-sm mb-2">✨ Personalização</p>
                                      {item.customization && (
                                        <p className="text-sm text-blue-700">{item.customization}</p>
                                      )}
                                      {item.customizations && item.customizations.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                          {item.customizations.map((c, idx) => (
                                            <li key={idx} className="text-sm text-blue-700">
                                              {c.type === 'text' ? `📝 Texto: ${c.text}` : `🖼️ Imagem: ${c.imageUrl}`}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                              <User size={18} className="text-primary" />
                              Dados do Cliente
                            </h3>
                            <div className="bg-white rounded-xl border border-primary/20 p-4 shadow-sm space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <User size={18} className="text-charcoal/60 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-charcoal/60 font-medium">Nome</p>
                                    <p className="font-bold text-charcoal">{order.user?.name}</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <Mail size={18} className="text-charcoal/60 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-charcoal/60 font-medium">Email</p>
                                    <p className="text-charcoal break-all">{order.user?.email}</p>
                                  </div>
                                </div>
                                {order.user?.phone && (
                                  <div className="flex items-start gap-3">
                                    <Phone size={18} className="text-charcoal/60 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs text-charcoal/60 font-medium">Telefone</p>
                                      <p className="text-charcoal font-medium">{order.user?.phone}</p>
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-start gap-3">
                                  <Package size={18} className="text-charcoal/60 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs text-charcoal/60 font-medium">Pagamento</p>
                                    <p className="text-charcoal">{getPaymentLabel(order.paymentMethod)}</p>
                                  </div>
                                </div>
                              </div>

                              {(order.address || order.shippingAddress) && (
                                <div className="border-t border-primary/20 pt-4">
                                  <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-charcoal/60 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                      <p className="text-xs text-charcoal/60 font-medium mb-1">Endereço de Entrega</p>
                                      {typeof (order.address || order.shippingAddress) === 'object' ? (
                                        <p className="text-charcoal text-sm whitespace-pre-line">
                                          {order.address?.street || order.shippingAddress?.street}, {order.address?.number || order.shippingAddress?.number}
                                          {order.address?.complement || order.shippingAddress?.complement ? ` - ${order.address?.complement || order.shippingAddress?.complement}` : ''}
                                          {order.address?.neighborhood || order.shippingAddress?.neighborhood}
                                          {order.address?.city || order.shippingAddress?.city} - {order.address?.state || order.shippingAddress?.state}
                                          CEP: {order.address?.cep || order.shippingAddress?.cep}
                                        </p>
                                      ) : (
                                        <p className="text-charcoal text-sm whitespace-pre-line">
                                          {order.address || order.shippingAddress}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="border-t border-primary/20 pt-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-charcoal font-bold text-lg">Total do Pedido</span>
                                  <span className="text-primary font-bold text-2xl">R$ {order.total?.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
