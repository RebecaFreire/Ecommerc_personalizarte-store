import "./globals.css";
import { ReactQueryProvider } from '@/lib/react-query-provider';
import ToastProvider from '@/components/layout/ToastProvider';

export const metadata = {
  title: "PersonalizArte - Loja de Personalizados",
  description: "Cada lembrança carrega um pedaço de carinho.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ReactQueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

