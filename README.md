# Barber of Friends — Base Full Stack (Urban SP)

Estrutura base de um sistema de agendamento para barbearia com:
- **Front-end:** React + Vite + TypeScript + Tailwind CSS
- **Back-end:** Node.js + Express + TypeScript
- **Banco:** MySQL

## Identidade Visual (Urban SP)
- **Paleta:** vermelho (`#E63946`), azul claro (`#76C7FF`), preto (`#111111`), branco (`#F5F5F5`)
- **Tipografia de título:** Google Font `Permanent Marker`
- **Tema:** urbano, alto contraste, estilo mural/grafite

## Estrutura sugerida

```txt
.
├── backend
│   ├── src
│   │   ├── config
│   │   │   ├── db.ts
│   │   │   └── env.ts
│   │   ├── controllers
│   │   │   ├── appointmentController.ts
│   │   │   └── authController.ts
│   │   ├── routes
│   │   │   ├── appointmentRoutes.ts
│   │   │   ├── authRoutes.ts
│   │   │   └── index.ts
│   │   ├── services
│   │   │   ├── agendaService.ts
│   │   │   └── mailService.ts
│   │   ├── types
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── database
│   └── schema.sql
├── frontend
│   ├── src
│   │   ├── components
│   │   │   └── BookingWidget.tsx
│   │   ├── hooks
│   │   │   └── useCountdown.ts
│   │   ├── pages
│   │   │   ├── AdminPage.tsx
│   │   │   └── ClientPage.tsx
│   │   ├── services
│   │   │   └── api.ts
│   │   ├── styles
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

## Banco de Dados (MySQL)
Execute `database/schema.sql` para criar:
- `users (nome, email, telefone, idade, corte_favorito)`
- `agendamentos (user_id, data, hora, status, preco)`
- `configuracoes (dia_semana, abre, fecha, intervalo_minutos, preco_padrao)`

### Regras de negócio implementadas
- Preço fixo: **R$ 35,00**
- Funcionamento: **segunda a domingo, 09:00 às 20:00**
- Intervalo: **1 em 1 hora**
- `UNIQUE(data, hora)` para evitar dupla reserva

## Rotas da API (Node/Express)
Base URL: `/api`

### Auth
- `POST /auth/login`
  - Login por e-mail se existir
  - Cadastro se não existir

### Agendamentos (cliente)
- `GET /agendamentos/slots?date=YYYY-MM-DD`
  - Retorna horários disponíveis já filtrando ocupados
- `POST /agendamentos`
  - Cria agendamento (`user_id`, `data`, `hora`)

### Agendamentos (admin)
- `GET /agendamentos/admin/upcoming`
  - Lista próximos clientes + `corte_favorito`
- `PATCH /agendamentos/:id`
  - `{ status: 'confirmado' }` → confirmar atendimento
  - `{ status: 'cancelado' }` → cancelar e liberar vaga
  - `{ novaData, novaHora }` → editar horário

## E-mail 10 minutos antes
No arquivo `backend/src/services/mailService.ts` há:
- Integração com **Nodemailer** quando SMTP estiver configurado
- Modo simulado via `console.log` quando não houver SMTP


## Corrigindo o erro 404 (NOT_FOUND) no deploy
Se aparecer tela `404: NOT_FOUND` (como na imagem enviada), normalmente o problema é de roteamento em SPA.

Este projeto já inclui `vercel.json` com rewrite para `index.html`, evitando 404 ao atualizar rotas (`/admin`, por exemplo).

Também foi adicionado `frontend/.env.example` para configurar a API via `VITE_API_URL`.

## Como rodar

### 1) Banco
```bash
mysql -u root -p < database/schema.sql
```

### 2) Back-end
```bash
cd backend
npm install
npm run dev
```

### 3) Front-end
```bash
cd frontend
npm install
npm run dev
```

Acesse:
- Cliente: `http://localhost:5173/`
- Admin: `http://localhost:5173/admin`

## Deploy (Vercel)

1. Importe o repositório no Vercel.
2. Mantenha o projeto apontando para a **raiz** do repositório (o `vercel.json` já executa build dentro de `frontend/`).
3. Garanta que a variável `VITE_API_URL` esteja configurada no painel da Vercel.
4. Redeploy após salvar as variáveis.

### Observações importantes para não cair em 404
- O arquivo `vercel.json` usa `outputDirectory: frontend/dist` e fallback SPA para `index.html`.
- Se você configurar `Root Directory = frontend` no painel, **remova o `vercel.json` da raiz** ou ajuste os caminhos, para evitar conflito de build.
- Se o backend estiver fora da Vercel, use URL pública completa em `VITE_API_URL`.
