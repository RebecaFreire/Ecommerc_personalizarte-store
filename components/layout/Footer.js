import { Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 py-12 border-t border-primary/20 bg-accent/80 text-center shadow-inner">
      {/* Social Icons */}
      <div className="mb-8 flex justify-center gap-6 text-primary">
        <Share2
          size={24}
          className="hover:text-primary-dark cursor-pointer transition-colors"
        />
        <MessageCircle
          size={24}
          className="hover:text-sage cursor-pointer transition-colors"
        />
      </div>

      {/* Contact Information */}
      <div className="max-w-4xl mx-auto mb-8 px-4">
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          <div className="flex flex-col items-center gap-2">
            <Phone size={20} className="text-primary" />
            <p className="font-bold text-charcoal">Telefone</p>
            <p className="text-charcoal/70">(11) 99999-9999</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mail size={20} className="text-primary" />
            <p className="font-bold text-charcoal">E-mail</p>
            <p className="text-charcoal/70">contato@personalizarte.com.br</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MapPin size={20} className="text-primary" />
            <p className="font-bold text-charcoal">Localização</p>
            <p className="text-charcoal/70">São Paulo, SP</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-[10px] text-charcoal uppercase font-black tracking-[0.3em] px-4 font-cursive">
        © 2026 PersonalizArte — Cada lembrança carrega um pedaço de carinho
      </p>
    </footer>
  );
}
