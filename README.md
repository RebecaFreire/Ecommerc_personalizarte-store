# PersonalizArte Store

Loja de produtos personalizados para eventos especiais (Batizado, Casamento, Maternidade, etc.).

## Tecnologias

- **Next.js 16** - Framework React
- **React 19** - Biblioteca UI
- **Tailwind CSS 4** - Estilização
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Lucide React** - Ícones

## Estrutura do Projeto

```
personalizarte-store/
├── app/                    # Páginas da aplicação
│   ├── cadastro/           # Página de cadastro
│   ├── login/              # Página de login
│   ├── page.js             # Página inicial
│   ├── layout.js          # Layout raiz
│   └── globals.css        # Estilos globais
├── components/            # Componentes reutilizáveis
│   ├── layout/            # Componentes de layout
│   │   ├── Header.js      # Cabeçalho
│   │   ├── Sidebar.js     # Menu lateral
│   │   ├── Banner.js      # Banner principal
│   │   └── Footer.js      # Rodapé
│   └── ui/                # Componentes UI
│       └── WhatsAppButton.js
├── hooks/                 # Hooks customizados
│   └── useCart.js         # Hook para carrinho
├── prisma/               # Schema do banco de dados
│   └── schema.prisma
└── public/               # Arquivos estáticos
```

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```
DATABASE_URL="file:./dev.db"
WHATSAPP_NUMBER="5511999999999"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Execute as migrações do Prisma:
```bash
npx prisma migrate dev
```

## Desenvolvimento

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Build para Produção

```bash
npm run build
npm start
```

## Funcionalidades

- ✅ Layout responsivo
- ✅ Menu lateral com categorias
- ✅ Carrinho de compras
- ✅ Página de login
- ✅ Página de cadastro
- ✅ Integração com WhatsApp
- ✅ Design moderno com Tailwind CSS

## Próximos Passos

- [ ] Implementar autenticação completa
- [ ] Criar API routes para produtos
- [ ] Implementar sistema de pedidos
- [ ] Adicionar validação de formulários
- [ ] Criar página de checkout
- [ ] Adicionar testes

## Licença

© 2026 PersonalizArte 012 - Excelência em Personalizados
