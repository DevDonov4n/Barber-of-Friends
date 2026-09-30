# ✂️ Barber of Friends

Sistema moderno de **agendamento para barbearia**, com área do cliente, painel do barbeiro, agenda diária, painel financeiro e programa de fidelidade.

🔗 **Demo online:** [barberoffriends.vercel.app](https://barberoffriends.vercel.app)

---

## 📌 Sobre o projeto

O **Barber of Friends** nasceu para simplificar a rotina de uma barbearia: o cliente escolhe o dia e o horário em poucos cliques, e o barbeiro acompanha a agenda, os atendimentos e o faturamento em um único painel.

### Serviços

| Serviço | Valor |
| --- | --- |
| Corte Normal | R$ 45,00 |
| Corte Premium | R$ 80,00 |

> ✦ **Fidelidade:** a cada 5 cortes concluídos com o barbeiro, o cliente ganha **50% de desconto no próximo Corte Premium** (benefício aplicado uma vez por ciclo).

---

## ✨ Funcionalidades

### Para o cliente
- 📅 Agendamento em blocos de **30 minutos**, com disponibilidade por dia
- 🙋 **Agendamento sem cadastro** (apenas nome) ou com **conta de cliente**
- 🧾 Acompanhamento de horários e histórico de cortes
- ⏱️ Bloqueio de horários passados em tempo real, com indicação visual de horários encerrados
- ❌ Cancelamento de agendamentos com modal de confirmação
- 🎁 Consulta e aplicação do benefício de fidelidade
- 📍 Seção de localização com mapa integrado ao Google Maps
- 📱 WhatsApp obrigatório no cadastro (validado também no backend)

### Para o barbeiro
- 🔐 Rotas protegidas por **middleware** de autenticação
- 🗓️ **Agenda diária** com os cortes do dia
- 💬 Botão de contato direto via **WhatsApp** com o cliente
- ✅ Conclusão e cancelamento de atendimentos
- 💰 **Painel financeiro** com totais de receita

---

## 🛠️ Tecnologias

> A lista abaixo foi levantada a partir do histórico de commits e do site publicado. Ajuste caso algum item tenha mudado.

- [Next.js](https://nextjs.org/) (App Router, API Routes e Middleware)
- [React](https://react.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- Autenticação com sessão/login para clientes e barbeiros
- [Vercel](https://vercel.com/) para deploy
- Google Maps Embed para a localização

---

## 📂 Estrutura do repositório

```
Barber-of-Friends/
└── barber-of-friends/   # Aplicação Next.js
```

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [MySQL](https://www.mysql.com/) em execução (local ou em nuvem)
- Git

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/DevDonov4n/Barber-of-Friends.git

# 2. Acesse a pasta da aplicação
cd Barber-of-Friends/barber-of-friends

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env   # ou crie o arquivo .env manualmente

# 5. Gere o client do Prisma e aplique o schema no banco
npx prisma generate
npx prisma migrate dev   # ou: npx prisma db push

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Variáveis de ambiente

Exemplo de `.env` (confira os nomes exatos usados no projeto):

```env
# Conexão com o banco MySQL
DATABASE_URL="mysql://usuario:senha@localhost:3306/barber_of_friends"

# Segredo usado na autenticação/sessão
AUTH_SECRET="troque-por-uma-chave-segura"
```

> ⚠️ Nunca faça commit do arquivo `.env`.

---

## 📜 Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa o linter |

---

## 🗺️ Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial (serviços, preços, sobre e localização) |
| `/agendar` | Agendamento de horários |
| `/login` | Acesso de clientes e barbeiro |
| Painel do barbeiro | Agenda diária e painel financeiro (rota protegida) |

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit suas alterações seguindo o padrão: `feat: descrição`, `fix: descrição`, `style: descrição`
4. Envie para o seu fork: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

## 👨‍💻 Autor

Desenvolvido por **[DevDonov4n](https://github.com/DevDonov4n)**.

---

## 📄 Licença

Este projeto ainda não possui uma licença definida. Adicione um arquivo `LICENSE` (por exemplo, MIT) caso deseje torná-lo open source.
