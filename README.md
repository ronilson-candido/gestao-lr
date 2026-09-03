# Gestão LR

Aplicação web de acompanhamento de clientes e operações de portabilidade/empréstimos.

Construída com **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**, persistida em **Supabase PostgreSQL**, autenticação via **Supabase Auth** e pronta para deploy na **Vercel**.

---

## Funcionalidades

- Autenticação por e-mail/senha (Supabase Auth)
- CRUD de clientes com validação e máscara de CPF
- CRUD de operações (1 cliente → N operações)
- CRUD de observações com histórico cronológico
- Pesquisa por nome/CPF/banco (server-side)
- Filtros (banco, banco de origem, status, período)
- Paginação server-side
- Dashboard com métricas reais
- Sidebar responsiva (desktop drawer / mobile)
- RLS (Row Level Security) em todas as tabelas
- Deploy contínuo na Vercel

---

## Setup Local

### 1. Pré-requisitos

- Node.js 18+
- Projeto Supabase (https://app.supabase.com)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA-PUBLISHABLE-KEY
```

> Ambas as chaves estão em **Supabase Dashboard → Project Settings → API**.

### 4. Criar o schema no Supabase

No **Supabase Dashboard → SQL Editor**, execute na ordem:

1. `supabase/migrations/20250903000001_init_schema.sql`
2. `supabase/migrations/20250903000002_rls_policies.sql`
3. `supabase/migrations/20250903000003_triggers.sql`

> A primeira migration já insere a tabela de referência `banks` com bancos comuns. Nenhum dado de cliente é criado por seed.

### 5. Criar o primeiro usuário

Como o signup público pode estar desabilitado, crie o primeiro usuário diretamente em **Supabase Dashboard → Authentication → Users → Add user**.

O trigger `handle_new_user` criará automaticamente um registro em `profiles`.

### 6. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 → será redirecionado para `/login`.

---

## Estrutura

```
src/
├── app/
│   ├── (app)/                    # Rotas protegidas (auth via middleware)
│   │   ├── dashboard/
│   │   ├── clientes/
│   │   ├── operacoes/
│   │   └── configuracoes/
│   ├── login/
│   └── auth/callback/             # handler OAuth/Recovery
├── components/                    # UI + domínio
├── lib/
│   ├── actions/                   # Server Actions (mutations)
│   ├── queries/                   # queries de leitura server-side
│   ├── supabase/                  # client/server/middleware
│   ├── validations/               # Zod + CPF
│   └── utils/
├── types/                         # tipos de domínio
└── middleware.ts                  # auth guard
supabase/
└── migrations/                    # SQL pronto para colar
```

---

## Deploy na Vercel

### 1. Subir para o GitHub

```bash
git init
git add .
git commit -m "feat: setup inicial"
git branch -M main
git remote add origin git@github.com:SEU-USER/gestao-lr.git
git push -u origin main
```

### 2. Importar na Vercel

- https://vercel.com/new → selecione o repositório
- Framework preset: **Next.js** (detectado automaticamente)
- Build command: `next build`
- Install command: `npm install`

### 3. Variáveis de ambiente na Vercel

Em **Project Settings → Environment Variables**, adicione:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 4. Configurar Redirect URLs no Supabase

Em **Supabase Dashboard → Authentication → URL Configuration**, adicione:

- **Site URL**: `https://seu-app.vercel.app`
- **Additional Redirect URLs**:
  - `https://seu-app.vercel.app/auth/callback`

### 5. Deploy

Faça um commit vazio ou um push — a Vercel detecta e deploya automaticamente.

```bash
git commit --allow-empty -m "trigger deploy"
git push
```

---

## Notas de Segurança

- Senhas são gerenciadas EXCLUSIVAMENTE pelo Supabase Auth. Nunca armazenamos senhas de usuário.
- Senhas bancárias de clientes **NÃO SÃO** armazenadas (campo inexistente).
- Todas as 4 tabelas operacionais têm RLS habilitado.
- A service role key do Supabase **nunca** é exposta no frontend.

---

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção
npm start          # inicia build de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

---

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth + RLS)
- Zod (validação)
- React Hook Form (form helpers)
- Lucide React (ícones)

---

Licença: privada.
