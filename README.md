# Diário de Progresso — SellSong

Este arquivo registra a evolução técnica, correções de arquitetura e funcionalidades implementadas no **SellSong**.

---

## [09/06/2026] — Segurança, Autenticação JWT e Integração com Spotify

O foco principal de hoje foi transformar a infraestrutura básica em uma API de rede social funcional, estabelecendo segurança no tráfego de dados e conectando o ecossistema do SellSong à base de dados oficial do Spotify.

### O que foi implementado:

- **Módulo de Autenticação Segura:** Criação das rotas e controllers de Cadastro (`POST /api/auth/register`) e Login (`POST /api/auth/login`).
- **Criptografia de Senhas:** Integração da biblioteca `bcrypt` para aplicar hashing seguro (Salt de 10 rounds) nas senhas dos usuários antes do salvamento no PostgreSQL.
- **Emissão de Tokens de Sessão:** Implementação de tokens **JWT (JSON Web Tokens)** no fluxo de login para autenticação stateless de rotas protegidas.
- **Consumo da API do Spotify:** Criação de um serviço isolado (`spotifyService`) utilizando o fluxo _Client Credentials_ para autenticação com o Spotify Developer Portal.
- **Mecanismo de Cache de Token:** Lógica em memória para controlar a expiração do token do Spotify (evitando requisições redundantes de autenticação à API externa).
- **Endpoint de Busca Musical:** Rota (`GET /api/spotify/search`) que filtra o catálogo do Spotify e devolve um JSON limpo e estruturado (ID, nome, artista, álbum, capa e duração) pronto para o consumo do Frontend.

### Desafios Superados & Decisões de Arquitetura:

1. **Resolução de Escopo Estrito (ESM):** Correção do erro de compilação do TypeScript referente à flag `--moduleResolution NodeNext`, aplicando explicitamente as extensões `.js` nos caminhos de importação relativos de rotas e controllers locais.
2. **Saneamento de Segurança no Git (Cache de Credenciais):** Identificação e correção de um vazamento acidental do arquivo `backend/.env` para o histórico do GitHub. O arquivo foi removido da memória de rastreamento de forma segura (`git rm --cached`) sem comprometer o ambiente local, e o escopo do `.gitignore` foi blindado.

---

## [08/06/2026] — Fundação do Ecossistema & Integração de Banco de Dados

Nesta etapa inicial, o foco total foi estabelecer uma infraestrutura moderna, segura e com tipagem estática ponta a ponta para o Backend da aplicação.

### O que foi implementado:

- **Conteinerização do Banco de Dados:** Configuração do ambiente isolado utilizando **Docker** e **Docker Compose** para rodar um banco de dados relacional **PostgreSQL** na porta `5432`.
- **Arquitetura Base do Servidor:** Criação do servidor **Express** em **TypeScript** estruturado com suporte a módulos nativos do Node (ESM).
- **Mapeamento de Dados (ORM):** Modelagem inicial do banco de dados e integração do **Prisma ORM (v6)**.
- **Roteamento e Teste de Carga:** Criação da rota de verificação de saúde da API (`/api/health`) para validar, em tempo de execução, a comunicação assíncrona entre o Express, o Prisma e o container do PostgreSQL.

### Desafios Superados & Decisões de Arquitetura:

1. **Ambiente Node.js:** Atualização do interpretador local para o **Node v24.16.0 (LTS)** para garantir compatibilidade com as flags mais modernas de execução TypeScript.
2. **Estratégia de ORM (Downgrade de Versão):** Durante a inicialização com o Prisma 7, identificou-se um conflito de isolamento de escopo na leitura de variáveis de ambiente com o executor `tsx watch` no Windows. Tomou-se a decisão técnica de adotar o **Prisma v6.2.0**, centralizando a resolução da string de conexão via `env("DATABASE_URL")` diretamente no `schema.prisma`. Isso garantiu estabilidade imediata e eliminou validações redundantes no construtor da API.
3. **Resolução de Tipos:** Forçada a regeneração do Prisma Client (`npx prisma generate`) para limpar o cache do compilador do TypeScript, estabelecendo contratos de dados seguros para as futures consultas.

---

## Próximos Passos (Backlog)

- [ ] **Modelagem das Entidades Restantes:** Expandir o `schema.prisma` para incluir os modelos de `Post` (recomendações diárias) e `Follows` (rede de amigos mútuos) e rodar as devidas migrations.
- [ ] **Proteção de Rotas com Middleware:** Criar um middleware customizado no Express para interceptar o cabeçalho das requisições e validar o JWT antes de permitir ações como postar ou seguir.
- [ ] **Setup do Frontend:** Inicialização do projeto React + Vite com Bootstrap para começar a consumir estes endpoints.
