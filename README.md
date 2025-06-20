# Sistema de Agendamento - Node.js

## Instalação

```bash
npm install
cp .env.example .env
```

## Rodar o servidor

```bash
node server.js
```

## Rotas disponíveis

- POST /api/login
- GET /api/horarios-disponiveis/:data
- POST /api/agendar
- GET /api/painel-secreto-agendamentos?token=meu-token-super-secreto-123