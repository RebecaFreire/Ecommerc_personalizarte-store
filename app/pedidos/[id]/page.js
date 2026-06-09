"use client"
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import { useCartCount } from '@/hooks/useCart';
import { useOrder } from '@/hooks/useOrders';

const WHATSAPP_NUMBER = "5512991130311";

export default function PedidoDetalhe() {
  const params = useParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const { data: order, isLoading } = useOrder(params.id);

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

  const generateWhatsAppMessage = () => {
    const items = order.orderItems.map(item => {
      let itemText = `• ${item.product.name} (Qtd: ${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}`;
      if (item.customization) {
        itemText += `\n  Personalização: ${item.customization}`;
      }
      return itemText;
    }).join('\n');

    const message = `*Pedido #${order.id}*\n\n` +
      `*Cliente:* ${order.user?.name || 'Não informado'}\n\n` +
      `*Itens do Pedido:*\n${items}\n\n` +
      `*Endereço de Entrega:*\n${order.shippingAddress || 'Não informado'}\n\n` +
      `*Total:* R$ ${order.total.toFixed(2)}\n` +
      `*Forma de Pagamento:* ${getPaymentLabel(order.paymentMethod)}\n` +
      `*Status:* ${getStatusLabel(order.status)}`;

    return encodeURIComponent(message);
  };

  const handleSendWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
  };

  if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faça login para ver seu pedido</h1>
          <Link href="/login" className="bg-[#D4A017] text-white px-6 py-3 rounded hover:bg-yellow-700">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <p>Carregando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pedido não encontrado</h1>
          <Link href="/cliente" className="bg-[#D4A017] text-white px-6 py-3 rounded hover:bg-yellow-700">
            Voltar para Minha Conta
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/cliente" className="text-sm text-[#D4A017] hover:underline">
              ← Voltar para Minha Conta
            </Link>
          </div>

          <div className="bg-white/50 p-8 rounded-lg mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Pedido #{order.id}</h1>
                <p className="text-sm text-gray-500">
                  Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(order.createdAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold mb-2">Informações de Entrega</h3>
                <p className="text-sm text-gray-600">{order.shippingAddress || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Forma de Pagamento</h3>
                <p className="text-sm text-gray-600">{getPaymentLabel(order.paymentMethod)}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-bold mb-4">Itens do Pedido</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.image || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/produtos/${item.product.id}`}
                        className="font-bold hover:text-[#D4A017]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-600">{item.product.category?.name}</p>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
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
            </div>

            <div className="border-t mt-6 pt-6 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Total do Pedido</p>
                <p className="text-3xl font-bold text-[#D4A017]">
                  R$ {order.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 p-6 rounded-lg">
            <h3 className="font-bold mb-4">Precisa de ajuda?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Se você tiver alguma dúvida sobre seu pedido, entre em contato conosco.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSendWhatsApp}
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-black px-6 py-3 rounded-sm transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Enviar pedido pelo WhatsApp
              </button>
              <Link
                href="/cliente"
                className="inline-block bg-[#D4A017] hover:bg-yellow-700 text-white font-black px-6 py-3 rounded-sm transition-all uppercase tracking-[0.2em] text-sm"
              >
                Voltar para Minha Conta
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
