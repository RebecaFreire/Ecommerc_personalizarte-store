'use client';
import Link from 'next/link';
import { X, User, ChevronRight, Share2, MessageCircle, Home, Heart } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

export default function Sidebar({ isOpen, onClose }) {
  const { data: categories } = useCategories();

  const categoryList = categories?.map(c => c.name) || ['Batizado', 'Casamento', 'Maternidade', 'Empresarial', 'Kits', 'Necessaire'];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-80 bg-accent z-[110] shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b flex justify-between items-center bg-primary/20">
          <span className="font-cursive text-2xl text-primary">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-primary/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <nav className="p-6 space-y-1 overflow-y-auto h-full pb-32">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 p-4 bg-sage/20 rounded-2xl text-charcoal font-bold text-sm mb-4 hover:bg-sage/30 transition-all">
            <Home size={20} /> Início
          </Link>

          <Link href="/favoritos" onClick={onClose} className="flex items-center gap-3 p-4 bg-primary/20 rounded-2xl text-primary font-bold text-sm mb-6 hover:bg-primary/30 transition-all">
            <Heart size={20} /> Favoritos
          </Link>

          <Link href="/login" onClick={onClose} className="flex items-center gap-3 p-4 bg-secondary/20 rounded-2xl text-secondary font-bold text-sm mb-6 hover:bg-secondary/30 transition-all">
            <User size={20} /> Minha Conta
          </Link>

          <p className="text-[10px] font-bold text-charcoal/60 uppercase tracking-[0.2em] mb-4 px-2">Categorias</p>

          {categoryList.map((item) => (
            <Link
              key={item}
              href={`/produtos?categoria=${item.toLowerCase()}`}
              onClick={onClose}
              className="flex justify-between items-center p-4 hover:bg-primary/10 rounded-xl font-bold text-sm text-charcoal transition-colors"
            >
              {item} <ChevronRight size={16} className="text-charcoal/40" />
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-8 flex gap-6 text-primary">
           <Share2 size={22} className="hover:text-primary-dark cursor-pointer transition-colors" />
           <MessageCircle size={22} className="hover:text-sage cursor-pointer transition-colors" />
        </div>
      </aside>
    </>
  );
}
