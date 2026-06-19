# SellSong — Rede Social de Recomendações Musicais

O **SellSong** é uma plataforma web de nicho voltada para a curadoria, descoberta e compartilhamento de músicas, inspirada na dinâmica visual e estrutural de redes sociais de cinema como o _Letterboxd_.

A proposta central do aplicativo é permitir que os usuários façam **recomendações diárias de músicas**, escolham seus gêneros favoritos e criem conexões baseadas no gosto musical mútuo, além de destacar suas faixas preferidas diretamente no perfil.

---

## Funcionalidades Principais (Escopo do Projeto)

- **Feed Estilo "Stories" (Recomendações Diárias):** Um feed dinâmico onde os usuários compartilham uma única música por dia com uma breve descrição (limite de 150 caracteres) e a tag do gênero musical.
- **Integração Musical:** Integração com APIs de streaming para busca de faixas oficiais (título, artista, álbum e capa).
- **Player de Micro-audição:** Infelizmente a API do Spotify não permite usar áudio das músicas.
- **Rede de Amigos Mútuos:** O feed principal exibe conteúdos focados nas atualizações de pessoas que se seguem mutuamente (Amigos).
- **Os 4 Favoritos (Top 4):** Assim como os filmes favoritos no Letterboxd, cada usuário pode fixar 4 músicas especiais em destaque no topo do seu perfil.
- **Top Recomendações Semanais:** Um painel global que exibe quais músicas estão sendo mais recomendadas na plataforma nos últimos 7 dias.

---

## Stack Tecnológica & Ferramentas

O projeto adota uma arquitetura descentralizada (Decoupled Architecture), separando completamente as responsabilidades do ecossistema do cliente (Frontend) e do servidor (Backend).

### Frontend

- **React.js (com Vite):** Biblioteca base para a construção de uma interface de usuário componentizada, reativa e de alta performance.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática, garantindo contratos de dados mais seguros entre os componentes e as requisições de API.
- **Bootstrap & Bootstrap Icons:** Framework CSS utilizado para garantir um design responsivo, limpo e com foco em um layout escuro (Dark Mode) minimalista que valoriza as artes dos álbuns.

### Backend

- **Node.js & Express:** Ambiente de execução e micro-framework ágil para a construção da API RESTful que gerencia as regras de negócio, autenticação e rotas.
- **Prisma ORM (Versão 7):** Object-Relational Mapping de última geração para modelagem das tabelas do banco de dados, geração automatizada de tipos TypeScript e gerenciamento estruturado de migrações (`migrations`).

### Infraestrutura & Banco de Dados

- **PostgreSQL:** Banco de dados relacional robusto, ideal para lidar com a consistência de dados exigida pelas relações complexas de amizades e feeds.
- **Docker & Docker Compose:** Utilizado para conteinerizar o ambiente de banco de dados, garantindo que o projeto rode com as mesmas configurações em qualquer máquina de forma isolada e previsível.

---

## Arquitetura do Repositório

```text
sellsong/
├── backend/          # Servidor Node.js, rotas da API, regras de negócio e ORM Prisma
├── frontend/         # Interface SPA em React, componentes Bootstrap e consumo da API
├── docker-compose.yml# Arquivo de orquestração de containers (PostgreSQL)
└── SOBRE.md          # Documentação geral do projeto
```
