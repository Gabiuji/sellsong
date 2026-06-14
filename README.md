# 📈 Diário de Progresso — SellSong

Este arquivo registra a evolução técnica, correções de arquitetura e funcionalidades implementadas no **SellSong**.

---

## [13/06/2026] - Ajustes de busca da API do Spotify, Filtro de busca e Atualização da interface

### Backend (Integração Spotify & Docker)

- **Correção no Motor de Busca:** Ajustada a rota `/api/spotify/search` para capturar e respeitar dinamicamente o parâmetro `type` (`track`, `album`, `artist`), eliminando o comportamento que forçava apenas a busca de músicas.
- **Resolução de Conflitos no Docker:** Identificado e corrigido travamento de cache de volumes no container do backend, forçando o build limpo para sincronização em tempo real dos controladores do Express.
- **Tratamento de Exceções e Dados Nulos:** Blindagem no mapeamento dos dados retornados pelo Spotify com encadeamento opcional (`?.`) e fallbacks visuais (placeholders) para artistas sem imagem de perfil ou sem gêneros listados.
- **Endpoint de Tracklist:** Rota `/api/spotify/albums/:id/tracks` totalmente corrigida, realizando o cruzamento de dados para injetar automaticamente a capa do álbum pai em todas as faixas filhas.

### Frontend (Interface & Experiência do Usuário)

- **Busca Unificada com Tabs:** Implementação de seletores visuais em formato de abas arredondadas (Bootstrap) para alternar instantaneamente os escopos de busca.
- **Segurança e Persistência:** Ajustada a captura de credenciais no fluxo do Axios para ler a chave criptografada correta do Local Storage (`@SellSong:token`), sanando os erros `401 Unauthorized` na comunicação com o backend.
- **Navegação em Funil (Drill-down):** Criação de estados dinâmicos que permitem ao usuário navegar de forma fluida: clicar em um Artista ➔ Ver seus Álbuns ➔ Ver suas Músicas ➔ Avaliar com notas e resenhas.

## [12/06/2026] — Sistema de Crítica Estilo Letterboxd (Meias-Estrelas) e Alinhamento de Banco

Dia focado na implementação da mecânica core de avaliações da rede social, refinando a precisão das notas e superando gargalos de sincronismo entre contêineres e o ORM.

### O que foi implementado:

- **Interface de Meia-Estrela (`views/Search.tsx`):** Desenvolvimento de lógica matemática baseada no bounding box do mouse (`onMouseMove`) para permitir avaliações fracionadas (ex: 3.5, 4.5) usando vetores nativos do _Bootstrap Icons_.
- **Migração para Dados Decimais (Prisma + Postgres):** Alteração do modelo `Post` no banco de dados mudando a coluna `rating` de `Int` para `Float` para suportar notas quebradas sem perda de precisão.
- **Módulo de Publicação Visual Concluído:** Integração bem-sucedida entre o clique no card do Spotify, abertura do Modal dinâmico com blur de fundo e disparo do payload para a rota `POST /api/posts`.

### Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Schema Desalinhado (Erro 400):** Identificação e correção de divergência de nomenclatura onde o controller tentava persistir o argumento inválido `content` em vez da chave mapeada `review`.
2. **Sincronização de Estado Pós-Clean (Erro P2021 e P2003):** Resolução de quebra de integridade referencial (_Foreign Key constraint_) forçando a execução do `prisma db push` após limpeza de volumes do Docker e expurgando tokens obsoletos do cache local via reautenticação limpa.

## [11/06/2026] — Inicialização e Dockerização Completa do Frontend (React + Vite)

O objetivo principal de hoje foi inaugurar a interface visual da aplicação e acoplá-la ao ecossistema de containers, alcançando um ambiente de desenvolvimento 100% orquestrado e isolado.

### O que foi implementado:

- **Core do Frontend:** Inicialização do projeto utilizando **React**, **TypeScript** e **Vite** como empacotador de alta performance na pasta `frontend/`.
- **Estilização e Componentes Visuais:** Integração global do **Bootstrap v5** e **Bootstrap Icons** para a construção de interfaces responsivas e limpas.
- **Dockerização do Frontend:** Criação de um `Dockerfile` baseado em Node 24 Alpine dedicado para o ambiente SPA do Vite, expondo a porta `5173`.
- **Orquestração Multicluster (Docker Compose):** Inclusão do serviço de frontend no `docker-compose.yml`, unificando a inicialização do Banco de Dados (PostgreSQL), da API (Express) e da Interface (React) com um único comando.
- **Hot Reload Distribuído:** Configuração fina do mecanismo de HMR (_Hot Module Replacement_) e pooling de arquivos no `vite.config.ts`, permitindo que qualquer alteração de código feita no editor reflita instantaneamente no navegador, mesmo rodando de dentro do container Linux.
- **Camada de Serviço HTTP (Axios):** Criação da instância centralizada do Axios em `src/services/api.ts` pré-configurada com interceptors para injeção automática de tokens JWT do `localStorage` nas requisições para a porta `3000`.

---

## [10/06/2026] — Modelagem Avançada, Middleware de Segurança e Conteinerização da API

O foco deste dia foi descentralizar a execução híbrida da aplicação, migrando o servidor Express inteiramente para dentro do ecossistema Docker, expandindo a modelagem de dados e aplicando barreiras de autenticação com middlewares.

### O que foi implementado:

- **Expansão do Banco de Dados (Relacionamentos):** Atualização do `schema.prisma` com a criação do modelo de `Post` e o modelo de `Follow` (auto-relacionamento muitos-para-muitos).
- **Middleware de Autenticação JWT:** Desenvolvimento do `authMiddleware` para interceptação estrita de cabeçalhos HTTP (`Authorization: Bearer <token>`).
- **Módulo de Publicações (Posts) & Amizades (Follows):** Criação das rotas e lógica do `postController` e `followController` para gerenciamento de resenhas e conexões sociais (sistema de _toggle_ para seguir/unfollow).
- **Conteinerização Completa do Backend:** Criação do `Dockerfile` multiestágio baseado em imagens Alpine do Node 24 para isolamento total da API Express.
- **Orquestração Segura via Docker Compose:** Configuração da leitura de variáveis de ambiente dinâmicas usando `env_file`.

### Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Escopo de Rede Interna:** Correção do erro clássico `P1001` substituindo a referência de `localhost` pelo nome lógico do serviço do banco de dados (`postgres_db`) no `.env`.
2. **Correção de Rotas de API:** Identificação de um erro de 404 de rotas no Express decorrente de incompatibilidade de strings de caminhos literais (plural vs singular) no mapeamento do roteador em `index.ts`.

---

## [09/06/2026] — Segurança, Autenticação JWT e Integração com Spotify

Transformação da infraestrutura básica em uma API de rede social funcional, estabelecendo segurança no tráfego de dados e conectando o ecossistema do SellSong à base de dados oficial do Spotify.

---

## [08/06/2026] — Fundação do Ecossistema & Integração de Banco de Dados

Nesta etapa inicial, o foco total foi estabelecer uma infraestrutura moderna, segura e com tipagem estática ponta a ponta para o Backend da aplicação usando Docker, PostgreSQL, Express e Prisma v6.

---

## Próximos Passos (Backlog)

- [x] **Tela de Login / Cadastro (`views/Auth.tsx`):** Criação do formulário para autenticar o usuário, receber o Token JWT e salvá-lo no `localStorage`. (concluído em 12/06/2026)
- [x] **Tela de Busca Musical (`views/Search.tsx`):** Componentização da barra de pesquisa consumindo o catálogo do Spotify através do nosso Axios. (concluído em 12/06/2026)
- [x] **Módulo de Publicação Visual:** Modal ou formulário para o usuário escolher uma música buscada, atribuir uma nota em estrelas (1 a 5) e digitar uma resenha.
- [ ] **Feed Global e Perfil:** Criação das telas para exibição das postagens e gerenciamento de seguidores.
