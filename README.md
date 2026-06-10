# 📈 Diário de Progresso — SellSong

Este arquivo registra a evolução técnica, correções de arquitetura e funcionalidades implementadas no **SellSong**.

---

## 🛠️ [10/06/2026] — Modelagem Avançada, Middleware de Segurança e Conteinerização da API

O foco de hoje foi descentralizar a execução híbrida da aplicação, migrando o servidor Express inteiramente para dentro do ecossistema Docker, expandindo a modelagem de dados para sustentar as interações de rede social e aplicando barreiras de autenticação com middlewares.

### ✨ O que foi implementado:

- **Expansão do Banco de Dados (Relacionamentos):** Atualização do `schema.prisma` com a criação do modelo de `Post` (relacionamento $1 \rightarrow N$ com usuários para resenhas de músicas) e o modelo de `Follow` (auto-relacionamento muitos-para-muitos com restrição única de tupla para gerenciar a rede de seguidores).
- **Middleware de Autenticação JWT:** Desenvolvimento do `authMiddleware` para interceptação estrita de cabeçalhos HTTP (`Authorization: Bearer <token>`), validação de assinaturas de sessão e injeção dinâmica do escopo de usuário nas requisições.
- **Módulo de Publicações (Posts):** Criação das rotas e lógica do `postController` para salvamento de resenhas associadas a metadados da API do Spotify e estruturação do feed global público.
- **Conteinerização Completa do Backend:** Criação do `Dockerfile` multiestágio baseado em imagens Alpine do Node 24 para isolamento total da API Express.
- **Orquestração Segura via Docker Compose:** Configuração da leitura de variáveis de ambiente dinâmicas usando `env_file`, removendo por completo dados sensíveis de credenciais (Banco e chaves do Spotify) da estrutura exposta do `docker-compose.yml`.

### 🐛 Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Escopo de Rede Interna (Docker Swarm/Bridge):** Correção do erro clássico `P1001 (Can't reach database server)` ajustando a string de conexão `DATABASE_URL` no arquivo `.env`. Substituiu-se a referência física de `localhost` pelo nome lógico do serviço do banco de dados (`postgres_db`), alinhando o roteamento DNS interno dos contêineres do Docker Compose.
2. **Sincronização de Banco Isolado:** Uso do utilitário `docker compose exec` injetando flags de ambiente explícitas para rodar a esteira de `prisma migrate deploy` e criar a estrutura relacional de tabelas de forma direta no PostgreSQL ativo no Docker.
3. **Persistência e Feedback Visual:** Integração bem-sucedida do banco de dados orquestrado a extensões visuais de gerenciamento DB internas do VS Code, validando a persistência estrutural de dados após ciclos de reboots dos contêineres.

---

## 🛠️ [09/06/2026] — Segurança, Autenticação JWT e Integração com Spotify

O foco principal deste dia foi transformar a infraestrutura básica em uma API de rede social funcional, estabelecendo segurança no tráfego de dados e conectando o ecossistema do SellSong à base de dados oficial do Spotify.

### ✨ O que foi implementado:

- **Módulo de Autenticação Segura:** Criação das rotas e controllers de Cadastro (`POST /api/auth/register`) e Login (`POST /api/auth/login`).
- **Criptografia de Senhas:** Integração da biblioteca `bcrypt` para aplicar hashing seguro (Salt de 10 rounds) nas senhas dos usuários antes do salvamento no PostgreSQL.
- **Emissão de Tokens de Sessão:** Implementação de tokens **JWT (JSON Web Tokens)** no fluxo de login para autenticação stateless de rotas protegidas.
- **Consumo da API do Spotify:** Criação de um serviço isolado (`spotifyService`) utilizando o fluxo _Client Credentials_ para autenticação com o Spotify Developer Portal.
- **Mecanismo de Cache de Token:** Lógica em memória para controlar a expiração do token do Spotify (evitando requisições redundantes de autenticação à API externa).
- **Endpoint de Busca Musical:** Rota (`GET /api/spotify/search`) que filtra o catálogo do Spotify e devolve um JSON limpo e estruturado ready para o consumo do Frontend.

### 🐛 Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Escopo Estrito (ESM):** Correção do erro de compilação do TypeScript referente à flag `--moduleResolution NodeNext`, aplicando explicitamente as extensões `.js` nos caminhos de importação relativos de rotas e controllers locais.
2. **Saneamento de Segurança no Git (Cache de Credenciais):** Identificação e correção de um vazamento acidental do arquivo `backend/.env` para o histórico do GitHub. O arquivo foi removido da memória de rastreamento de forma segura (`git rm --cached`) sem comprometer o ambiente local, e o escopo do `.gitignore` foi blindado.
3. **Resolução de Conexão Local:** Diagnóstico do erro `ECONNREFUSED` no Postman através do alinhamento de portas de execução (`3000`) e reinicialização ativa do processo de desenvolvimento em background.

---

## 🛠️ [08/06/2026] — Fundação do Ecossistema & Integração de Banco de Dados

Nesta etapa inicial, o foco total foi estabelecer uma infraestrutura moderna, segura e com tipagem estática ponta a ponta para o Backend da aplicação.

### ✨ O que foi implementado:

- **Conteinerização do Banco de Dados:** Configuração do ambiente isolado utilizando **Docker** e **Docker Compose** para rodar um banco de dados relacional **PostgreSQL** na porta `5432`.
- **Arquitetura Base do Servidor:** Criação do servidor **Express** em **TypeScript** estruturado com suporte a módulos nativos do Node (ESM).
- **Mapeamento de Dados (ORM):** Modelagem inicial do banco de dados e integração do **Prisma ORM (v6)**.
- **Roteamento e Teste de Carga:** Criação da rota de verificação de saúde da API (`/api/health`) para validar, em tempo de execução, a comunicação assíncrona entre o Express, o Prisma e o container do PostgreSQL.

### 🐛 Desafios Superados & Decisões de Arquitetura:

1. **Ambiente Node.js:** Atualização do interpretador local para o **Node v24.16.0 (LTS)** para garantir compatibilidade com as flags mais modernas de execução TypeScript.
2. **Estratégia de ORM (Downgrade de Versão):** Durante a inicialização com o Prisma 7, identificou-se um conflito de isolamento de escopo na leitura de variáveis de ambiente com o executor `tsx watch` no Windows. Tomou-se a decisão técnica de adotar o **Prisma v6.2.0**, centralizando a resolução da string de conexão via `env("DATABASE_URL")` diretamente no `schema.prisma`. Isso garantiu estabilidade imediata e eliminou validações redundantes no construtor da API.
3. **Resolução de Tipos:** Forçada a regeneração do Prisma Client (`npx prisma generate`) para limpar o cache do compilador do TypeScript, estabelecendo contratos de dados seguros para as futuras consultas.

---

## 📅 Próximos Passos (Backlog)

- [ ] **Módulo de Amizades (Follows):** Desenvolver o controller e rotas protegidas para permitir que usuários sigam/parem de seguir uns aos outros.
- [ ] **Feed Dinâmico Customizado:** Criar uma rota de feed que filtre apenas os posts das pessoas que o usuário autenticado segue.
- [ ] **Setup do Frontend:** Inicialização do projeto React + TypeScript + Vite com Bootstrap para começar a dar cara à nossa rede social e consumir estes endpoints.
