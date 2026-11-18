# 🛞 SOS Pneus & Borracharia 24H — Auto Socorro Emergencial

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68A063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Local_Storage-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase_Ready-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-M%C3%A9todo_ENDS_100%25-blueviolet?style=for-the-badge&logo=shield)](https://github.com/NuveTecBR)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> 🌐 **Visualização Online (GitHub Pages):** [https://nuvetecbr.github.io/SOSPneus/](https://nuvetecbr.github.io/SOSPneus/)

---

## 📌 Visão Geral do Projeto

O **SOS Pneus 24 Horas** é uma plataforma emergencial desenvolvida para operações de assistência rápida a condutores com problemas de pneus, rodas ou suspensão em vias urbanas e rodovias. Construído sobre o **Método ENDS (Eficiência, Nível técnico, Defesa e Segurança)**, o sistema prioriza velocidade extrema de carregamento, clareza em situações de estresse e precisão no despacho de viaturas.

O design adota uma abordagem *Mobile-First* de alto contraste visual com base nas diretrizes do ecossistema **Avada Prebuilt Websites**, assegurando legibilidade sob iluminação noturna ou solar direta.

---

## 🌟 Principais Funcionalidades

- **Botão de Chamado de Emergência Imediato ("SOS 24H"):**
  - Acionamento em 1 toque com captura de geolocalização e envio direto para a central de socorro.
  - Geração instantânea de protocolo com estimativa de chegada em tempo real (ex.: ~28 min).
- **Calculadora de Deslocamento & Atendimento:**
  - Estimativa server-side precisa de custo de deslocamento e taxa de socorro conforme a quilometragem até o local da emergência.
- **Buscador Inteligente de Pneus por Medida:**
  - Filtro por Largura, Perfil e Aro (ex.: 205/55 R16) para conferência imediata de estoque do furgão de resgate.
- **Painel Operacional do Socorrista:**
  - Interface administrativa para atualização de status da viatura (*A Caminho*, *No Local*, *Serviço Concluído*) protegida por JWT.
- **Canal de Privacidade LGPD:**
  - Gestão de dados pessoais e canal direto para exercício de direitos do condutor (Lei 13.709/2018).

---

## 🎨 Design & Layout (Padrão Avada + Princípios PARC)

- **Trust Strip Avada de Emergência:** Faixa de alta visibilidade com os 4 diferenciais operacionais:
  1. *Atendimento em até 30 Minutos na Região Metropolitana*
  2. *Furgão Oficina Completo com Equipamentos Pneumáticos no Local*
  3. *Pneus Novos com Certificação INMETRO e Garantia de Fábrica*
  4. *Pagamento Facilitado no Local (Pix, Cartão de Crédito ou Débito)*
- **Contraste & Acessibilidade:** Cores contrastantes e tipografia robusta pensadas para condutores em situações emergenciais ao ar livre.
- **Design Modular:** Layout responsivo com espaçamento generoso e elementos táteis dimensionados para toque rápido no smartphone.

---

## 🛡️ Arquitetura & Segurança (Método ENDS)

- **Proteção Anti-Spam (Honeypot):** Campos invisíveis que detectam e bloqueiam disparos automáticos de bots sem afetar chamados reais de socorro.
- **Sanitização de Dados:** Tratamento rigoroso de todas as entradas para neutralização de ameaças de XSS e injeção.
- **Políticas de Cabeçalho HTTP:** CSP restrito, proteção contra frame hijacking (`X-Frame-Options: DENY`) e desativação de detecção de tipo MIME.
- **Rate Limiting Reforçado:**
  - Controle de requisições por IP na abertura de chamados para prevenir saturação do serviço de emergência.
  - Rate limiting restritivo na rota de autenticação de operadores.
- **Autenticação Técnica:** Tokens **JWT** com tempo de vida definido e senhas protegidas com **Bcrypt**.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, CSS3 Moderno (Variáveis CSS, Flexbox, Mobile-First), JavaScript Vanilla modular (sem frameworks pesados).
- **Backend:** Node.js (v20+), Express.js (v4.21).
- **Banco de Dados:** SQLite embutido de baixa latência e compatibilidade com PostgreSQL (Supabase).
- **Segurança:** Bcrypt.js, JsonWebToken, Dotenv, Middlewares customizados.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior).
- Gerenciador de pacotes `npm`.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NuveTecBR/SOSPneus.git
   cd SOSPneus
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env` dentro de `backend`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *(No Windows PowerShell: `Copy-Item backend\.env.example backend\.env`)*

4. **Inicie o servidor:**
   ```bash
   npm start
   ```
   O serviço estará online na porta **3336**:
   - **Interface do Usuário:** [http://localhost:3336](http://localhost:3336)
   - **Health Check:** [http://localhost:3336/api/health](http://localhost:3336/api/health)

5. **Execute a Suíte de Testes Automatizados:**
   ```bash
   npm test
   ```

---

## 🧪 Suíte de Testes Automatizados

O repositório possui uma bateria de testes automatizados (`backend/test_suite.js`) com 100% de aprovação:

- [x] Verificação de integridade do Health Check e Security Headers.
- [x] Filtro de pneus por medida exata (ex.: 205/55 R16) e validação de atributos.
- [x] Cálculo server-side do valor de deslocamento e tempo estimado de socorro.
- [x] Submissão de chamado emergencial com prevenção de duplicidade e Honeypot anti-bot.
- [x] Login administrativo JWT e atualização do status da viatura de resgate.

---

## 📡 Endpoints da API REST

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Público | Telemetria e disponibilidade da central |
| `GET` | `/api/pneus` | Público | Consulta de pneus e medidas disponíveis |
| `POST` | `/api/socorro/calcular` | Público | Cálculo server-side de rota, deslocamento e custo |
| `POST` | `/api/socorro/chamados` | Público (Rate-Limited) | Abertura de chamado de emergência |
| `POST` | `/api/lgpd` | Público (Rate-Limited) | Solicitações de proteção e direitos do titular |
| `POST` | `/api/auth/login` | Público (Rate-Limited) | Login técnico de socorristas e operadores de base |
| `GET` | `/api/socorro/chamados` | Privado (JWT) | Painel geral de chamados e viaturas em operação |

---

## 📂 Estrutura de Pastas

```
SOSPneus/
├── backend/
│   ├── controllers/      # Controle de chamados, pneus e socorro
│   ├── database/         # Configuração de banco de dados e seed
│   ├── middlewares/      # Rate limit, autenticação, sanitização e segurança
│   ├── routes/           # Rotas da API REST
│   ├── services/         # Algoritmos de cálculo de frete e deslocamento
│   ├── validators/       # Esquemas de validação
│   ├── .env.example      # Configurações de exemplo
│   ├── package.json      # Dependências do backend
│   ├── server.js         # Servidor Express principal
│   └── test_suite.js     # Suíte de testes automatizados
├── frontend/
│   ├── css/              # Estilos Mobile-First de alto contraste
│   ├── js/               # Scripts clientes e integração com APIs
│   └── index.html        # Página principal de atendimento emergencial
├── sql/
│   └── schema.sql        # Esquema SQL do banco de dados
├── .gitignore            # Diretrizes de exclusão do Git
├── iniciar.ps1           # Script PowerShell de inicialização
├── package.json          # Orquestrador de scripts npm
└── README.md             # Esta documentação
```

---

## 📄 Licença

Distribuído sob a licença [MIT](LICENSE). Desenvolvido por **NuveTec** ([@NuveTecBR](https://github.com/NuveTecBR)) integrando o portfólio de engenharia web Nuvetec.
