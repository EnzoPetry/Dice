# Project Dice

Plataforma para conectar jogadores e mestres de RPG de mesa. Crie grupos, encontre sua próxima aventura e converse em tempo real com sua mesa.

## Funcionalidades
 
- Cadastro com e-mail/senha ou Google
- Verificação de e-mail e redefinição de senha
- Grupos por sistema de RPG com aprovação opcional de membros
- Chat em tempo real via Socket.IO
- Gerenciamento de solicitações de entrada (admin)
## Stack
 
- **Next.js 15** — rotas, páginas e API num único projeto
- **PostgreSQL + Prisma** — banco relacional com ORM
- **Better Auth** — autenticação com suporte a OAuth e sessões
- **Socket.IO** — comunicação em tempo real entre cliente e servidor
- **Tailwind CSS + shadcn/ui** — estilização e componentes prontos

## Rodando com Docker
 
```bash
cp .env.example .env
# preencha o .env
 
docker compose up -d --build
```
 
Acesse em `http://localhost:3000`.
