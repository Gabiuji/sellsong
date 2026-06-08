#  Diário de Progresso — SellSong

Este arquivo registra a evolução técnica, correções de arquitetura e funcionalidades implementadas no **SellSong**.

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
3. **Resolução de Tipos:** Forçada a regeneração do Prisma Client (`npx prisma generate`) para limpar o cache do compilador do TypeScript, estabelecendo contratos de dados seguros para as futuras consultas.

---

## Próximos Passos (Backlog)

- [ ] **Módulo de Autenticação:** Implementação de rotas de cadastro e login de usuários, criptografia de senhas com `bcrypt` e geração de tokens de sessão (JWT).
- [ ] **Modelagem das Entidades Restantes:** Expandir o `schema.prisma` para incluir os modelos de `Post` (recomendações diárias) e `Follows` (rede de amigos mútuos).
- [ ] **Consumo da API do Spotify:** Criação do service no backend para comunicação com o ecossistema do Spotify (OAuth e busca de faixas).
- [ ] **Setup do Frontend:** Inicialização do projeto React + Vite com Bootstrap para começar a consumir estes endpoints.
