'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, User, ShoppingCart, Search, Heart, LogOut } from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';

export default function Header({ onMenuOpen, cartCount = 0 }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const logout = useLogout();

  useEffect(() => {
    setMounted(true);

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token) {
        setIsLoggedIn(true);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkAuth();

    // Listen for storage changes to update auth state
    const handleStorageChange = () => {
      checkAuth();
    };

    // Listen for custom auth-change event
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onMenuOpen}
            className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-all"
          >
            <div className="p-2 hover:bg-gray-100 rounded-full">
              <Menu size={24} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:inline">
              Menu
            </span>
          </button>

          <div className="flex gap-4 md:gap-6 items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">
            <Link href="/favoritos" className="hover:text-gray-600 transition-colors flex items-center gap-1">
              <Heart size={14} />
            </Link>

            {isLoggedIn ? (
              <>
                {user?.role === 'admin' ? (
                  <Link href="/admin" className="hover:text-gray-600 transition-colors flex items-center gap-1">
                    <User size={14} /> Painel Admin
                  </Link>
                ) : (
                  <Link href="/cliente" className="hover:text-gray-600 transition-colors flex items-center gap-1">
                    <User size={14} /> Minha Conta
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="hover:text-gray-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut size={14} /> Sair
                </button>
              </>
            ) : (
              <Link href="/login" className="hover:text-gray-600 transition-colors flex items-center gap-1">
                <User size={14} /> Entrar
              </Link>
            )}

            <Link href="/carrinho" className="hover:text-gray-600 transition-colors flex items-center gap-1">
              <ShoppingCart size={14} /> Carrinho ({cartCount})
            </Link>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Link href="/" className="relative group text-center">
            <h1 className="font-cursive text-4xl md:text-5xl text-gray-900 hover:text-gray-600 transition-colors">
              PersonalizArte
            </h1>
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-900 mt-1">
              Cada lembrança carrega um pedaço de carinho
            </p>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto relative group">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          >
            <input
              type="text"
              placeholder="O que você deseja personalizar hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-gray-900 rounded-full py-3 px-6 pr-12 outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-900 transition-all text-sm bg-white shadow-sm text-gray-900 placeholder:text-gray-500"
            />
          </form>

          <Search
            className="absolute right-4 top-3.5 text-gray-900 pointer-events-none"
            size={18}
          />
        </div>
      </div>

      <nav className="bg-white border-t border-gray-200 hidden lg:block shadow-sm">
        <ul className="flex justify-center gap-8 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-gray-900">
          {[
            'Todos os Produtos',
            'Batizado',
            'Casamento',
            'Maternidade',
            'Empresarial',
            'Kits',
            'Necessaire',
          ].map((cat) => (
            <li key={cat}>
              <Link
                href={cat === 'Todos os Produtos' ? '/produtos' : `/produtos?categoria=${cat.toLowerCase()}`}
                className="hover:text-gray-600 transition-colors relative group"
              >
                {cat}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}