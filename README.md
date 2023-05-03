# Rubcamp - MVC Boiterplate

Para rodar o projeto, siga os passos:

1. No terminal, rode o comando: `make up-build`

Para Instalar o Make:

1. `sudo apt install make`

A estrutura do projeto está organizado da seguinte maneira:

```
rubcamp
│   README.md - Instruções de como rodar o projeto
│   .env - Iremos guardar as variáveis de ambiente aqui
│   .dockerignore - Arquivos que serão ignorados pelo Docker
│   .gitignore - Arquivos ignorados pelo Git
│   docker-compose.yml - Arquivo de configuração do Docker Compose
│   Dockerfile - Configurações da Imagem Docker de produção
│   Dockerfile.dev - Configurações da Imagem Docker de desenvolvimento
│   heroku.yml - Configurações da Imagem Docker do Heroku
│   Makefile - Arquivo pra simplificar os comandos digitados
│   package.json - Arquivo de configuração de dependências do projeto
│   tsconfig.json - Arquivo de configuração do Typescript
│   yarn.lock - Arquivo de configuração das dependências (gerado automaticamente)
│
└───src
│   │   index.ts - Configurações do servidor (Express)
│   │
│   └───prisma
│       │   schema.prisma - Esquema do Prisma
│   │
│   └───controllers
│       │   UserController.ts - Exemplo de Controle do Usuário
│   │
│   └───models
│       │   UserModel.ts - Exemplo de Modelo do Usuário
│   │
│   └───routes
│       │   UserRoute.ts - Exemplo de Visão do Usuário
```
