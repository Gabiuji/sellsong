# 📈 Diário de Progresso — SellSong

Este arquivo registra a evolução técnica, correções de arquitetura e funcionalidades implementadas no **SellSong**.

---

## 🛠️ [12/06/2026] — Criação da Landing Page e Máquina de Estados de Navegação

A meta do dia foi refinar o fluxo de entrada da aplicação (UX), construindo uma página de apresentação institucional e um gerenciador de estados robusto para controlar o acesso às telas do sistema.

### ✨ O que foi implementado:

- **Landing Page Institucional (`views/Landing.tsx`):** Criação de uma página de entrada moderna utilizando seções do Bootstrap (_Hero_, _Features_ e _Footer_), destacando as propostas de valor do app (Spotify, Resenhas e Conexões).
- **Animações Fluidas via CSS:** Inclusão de regras de @keyframes no `index.css` para animação tridimensional de flutuação e rotação suave do elemento visual central (Vinil).
- **Arquitetura de Navegação Condicional (State Machine):** Reestruturação do arquivo `App.tsx` para operar como uma máquina de estados finitos provisória, chaveando o ciclo de renderização entre: `Landing Page` $\rightarrow$ `Formulário de Autenticação` $\rightarrow$ `Dashboard Protegido`.
- **Desconexão Segura (Logout Avançado):** Ajuste do gatilho de saída para realizar a limpeza atômica dos tokens do `localStorage` e retroceder o estado de visualização do cliente diretamente para a Landing Page inicial.

## 🛠️ [11/06/2026] — Inicialização e Dockerização Completa do Frontend (React + Vite)

O objetivo principal de hoje foi inaugurar a interface visual da aplicação e acoplá-la ao ecossistema de containers, alcançando um ambiente de desenvolvimento 100% orquestrado e isolado.

### ✨ O que foi implementado:

- **Core do Frontend:** Inicialização do projeto utilizando **React**, **TypeScript** e **Vite** como empacotador de alta performance na pasta `frontend/`.
- **Estilização e Componentes Visuais:** Integração global do **Bootstrap v5** e **Bootstrap Icons** para a construção de interfaces responsivas e limpas.
- **Dockerização do Frontend:** Criação de um `Dockerfile` baseado em Node 24 Alpine dedicado para o ambiente SPA do Vite, expondo a porta `5173`.
- **Orquestração Multicluster (Docker Compose):** Inclusão do serviço de frontend no `docker-compose.yml`, unificando a inicialização do Banco de Dados (PostgreSQL), da API (Express) e da Interface (React) com um único comando.
- **Hot Reload Distribuído:** Configuração fina do mecanismo de HMR (_Hot Module Replacement_) e pooling de arquivos no `vite.config.ts`, permitindo que qualquer alteração de código feita no editor reflita instantaneamente no navegador, mesmo rodando de dentro do container Linux.
- **Camada de Serviço HTTP (Axios):** Criação da instância centralizada do Axios em `src/services/api.ts` pré-configurada com interceptors para injeção automática de tokens JWT do `localStorage` nas requisições para a porta `3000`.

---

## 🛠️ [10/06/2026] — Modelagem Avançada, Middleware de Segurança e Conteinerização da API

O foco deste dia foi descentralizar a execução híbrida da aplicação, migrando o servidor Express inteiramente para dentro do ecossistema Docker, expandindo a modelagem de dados e aplicando barreiras de autenticação com middlewares.

### ✨ O que foi implementado:

- **Expansão do Banco de Dados (Relacionamentos):** Atualização do `schema.prisma` com a criação do modelo de `Post` e o modelo de `Follow` (auto-relacionamento muitos-para-muitos).
- **Middleware de Autenticação JWT:** Desenvolvimento do `authMiddleware` para interceptação estrita de cabeçalhos HTTP (`Authorization: Bearer <token>`).
- **Módulo de Publicações (Posts) & Amizades (Follows):** Criação das rotas e lógica do `postController` e `followController` para gerenciamento de resenhas e conexões sociais (sistema de _toggle_ para seguir/unfollow).
- **Conteinerização Completa do Backend:** Criação do `Dockerfile` multiestágio baseado em imagens Alpine do Node 24 para isolamento total da API Express.
- **Orquestração Segura via Docker Compose:** Configuração da leitura de variáveis de ambiente dinâmicas usando `env_file`.

### 🐛 Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Escopo de Rede Interna:** Correção do erro clássico `P1001` substituindo a referência de `localhost` pelo nome lógico do serviço do banco de dados (`postgres_db`) no `.env`.
2. **Correção de Rotas de API:** Identificação de um erro de 404 de rotas no Express decorrente de incompatibilidade de strings de caminhos literais (plural vs singular) no mapeamento do roteador em `index.ts`.

---

## 🛠️ [09/06/2026] — Segurança, Autenticação JWT e Integração com Spotify

Transformação da infraestrutura básica em uma API de rede social funcional, estabelecendo segurança no tráfego de dados e conectando o ecossistema do SellSong à base de dados oficial do Spotify.

---

## 🛠️ [08/06/2026] — Fundação do Ecossistema & Integração de Banco de Dados

Nesta etapa inicial, o foco total foi estabelecer uma infraestrutura moderna, segura e com tipagem estática ponta a ponta para o Backend da aplicação usando Docker, PostgreSQL, Express e Prisma v6.

---

## 📅 Próximos Passos (Backlog)

- [x] **Tela de Login / Cadastro (`views/Auth.tsx`):** Criação do formulário para autenticar o usuário, receber o Token JWT e salvá-lo no `localStorage`. (concluído em 12/06/2026)
- [ ] **Tela de Busca Musical (`views/Search.tsx`):** Componentização da barra de pesquisa consumindo o catálogo do Spotify através do nosso Axios.
- [ ] **Módulo de Publicação Visual:** Modal ou formulário para o usuário escolher uma música buscada, atribuir uma nota em estrelas (1 a 5) e digitar uma resenha.
- [ ] **Feed Global e Perfil:** Criação das telas para exibição das postagens e gerenciamento de seguidores.
