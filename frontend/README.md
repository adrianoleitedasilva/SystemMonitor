# System Monitor — Frontend

Dashboard web em tempo real para visualização de métricas do sistema, construído com React e Vite.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18 | Biblioteca de UI com hooks |
| **Vite** | 5 | Bundler e dev server com HMR |
| **Recharts** | 2 | Gráficos declarativos baseados em SVG |
| **CSS Modules** | — | Escopo de estilos por componente |

Não há gerenciador de estado externo (Redux, Zustand etc.). Todo o estado vive no hook `useSystemMetrics`, que distribui os dados via props.

---

## Arquitetura

```
WebSocket (backend)
        │
        ▼
useSystemMetrics (hook)
        │  metrics (snapshot atual)
        │  history (últimos 60s por métrica)
        │  status  (connected / reconnecting / error)
        ▼
     App.jsx
        │
        ├── CpuCard
        ├── RamCard
        ├── GpuCard
        ├── NetworkCard
        ├── DiskCard
        └── ProcessTable
```

O fluxo de dados é **unidirecional**: o WebSocket empurra dados para o hook, que atualiza o estado React, que re-renderiza os componentes afetados. Nenhum componente faz requisição direta ao backend.

### Histórico de 60 segundos

O hook mantém um buffer circular de 60 pontos para CPU, RAM, download e upload. A cada mensagem recebida, o ponto mais antigo é descartado e o novo é adicionado. Esse buffer alimenta os gráficos de linha/área (`SparklineChart`, `NetworkCard`).

### Reconexão automática

Se o WebSocket fechar (backend reiniciado, erro de rede), o hook agenda uma nova tentativa após 3 segundos via `setTimeout`. O status `reconnecting` é refletido no badge do header.

---

## Estrutura de pastas

```
frontend/
├── index.html               ← entry point HTML, monta o div#root
├── vite.config.js           ← configuração do Vite (plugin React)
├── package.json             ← dependências e scripts npm
└── src/
    ├── main.jsx             ← monta o App no DOM via ReactDOM.createRoot
    ├── App.jsx              ← layout principal, relógio, uptime, roteamento de cards
    ├── App.module.css       ← estilos do header, grid responsivo, spinner
    ├── index.css            ← variáveis CSS globais, reset, keyframes, scrollbar
    ├── hooks/
    │   └── useSystemMetrics.js   ← WebSocket, estado de métricas e histórico
    └── components/
        ├── MetricCard.jsx         ← card base reutilizável (título + slot de conteúdo)
        ├── MetricCard.module.css
        ├── CircularGauge.jsx      ← gauge circular SVG com animação por CSS
        ├── GaugeBar.jsx           ← barra de progresso horizontal com cor dinâmica
        ├── GaugeBar.module.css
        ├── SparklineChart.jsx     ← gráfico de área minimalista (histórico 60s)
        ├── CpuCard.jsx            ← uso total, por core, frequência
        ├── CpuCard.module.css
        ├── RamCard.jsx            ← uso de memória com gauge circular e stats
        ├── RamCard.module.css
        ├── DiskCard.jsx           ← I/O em MB/s e uso por partição
        ├── DiskCard.module.css
        ├── NetworkCard.jsx        ← download/upload em tempo real com gráfico de área
        ├── NetworkCard.module.css
        ├── ProcessTable.jsx       ← top 10 processos com mini barra de CPU
        ├── ProcessTable.module.css
        ├── GpuCard.jsx            ← load, VRAM e temperatura (só aparece se houver GPU)
        └── GpuCard.module.css
```

---

## Arquivos

### `index.html`

Entry point carregado pelo Vite. Contém apenas o `<div id="root">` onde o React é montado e o `<script>` que importa `src/main.jsx`.

### `vite.config.js`

Configuração mínima do Vite: registra o plugin `@vitejs/plugin-react` para suporte a JSX e Fast Refresh.

### `src/main.jsx`

Monta o componente raiz `<App>` dentro de `React.StrictMode` no elemento `#root`.

### `src/index.css`

Estilos globais da aplicação:
- **Reset** — `box-sizing`, `margin`, `padding` zerados
- **Variáveis CSS** — paleta completa de cores (`:root`): fundo, superfícies, bordas, accent colors (blue, green, yellow, red, purple, cyan) e suas variantes de glow
- **Fundo** — dois gradientes radiais sutis que criam um efeito de luz ambiente azul/roxo
- **Scrollbar** — estilização custom para Webkit
- **Keyframes** — `pulse-dot` (animação do indicador de status), `fade-in` (entrada dos cards), `spin` (spinner de loading)

### `src/App.jsx`

Componente raiz e layout da página.

- Consome `useSystemMetrics` para obter métricas, histórico e status da conexão
- Dois hooks internos:
  - `useUptime()` — contador de segundos desde que a página foi aberta, formatado como `HH:MM:SS`
  - `useClock()` — relógio local atualizado a cada segundo via `toLocaleTimeString`
- **Header** — exibe logo, relógio, uptime e badge de status com ponto animado
- **Grid** — layout responsivo de 3 colunas (2 em telas médias, 1 em mobile) que posiciona os cards; se não houver GPU, o DiskCard ocupa o terceiro slot da primeira linha
- **Loading** — exibe spinner enquanto a primeira mensagem WebSocket não chegou

### `src/App.module.css`

- Header sticky com `backdrop-filter: blur` e fundo semi-transparente
- Grid CSS com classes `.col` (1 coluna), `.wide` (3 colunas) e `.full` (largura total)
- Media queries para 1100px e 700px

---

### `src/hooks/useSystemMetrics.js`

Hook central de dados. É o único ponto de contato com o WebSocket.

| Estado | Tipo | Descrição |
|---|---|---|
| `metrics` | `object \| null` | Último payload recebido do backend |
| `history` | `object` | Buffers circulares de 60 pontos: `cpu`, `ram`, `net_sent`, `net_recv` |
| `status` | `string` | `'connecting'` → `'connected'` → `'reconnecting'` → `'error'` |

**Reconexão:** ao fechar o WebSocket, um `setTimeout` de 3s chama `connect()` novamente. O cleanup do `useEffect` cancela o timer e fecha a conexão ao desmontar o componente.

---

### `src/components/MetricCard.jsx`

Componente de layout reutilizável que envolve todos os cards. Recebe:
- `title` — texto exibido no topo (em caixa alta, tamanho pequeno)
- `accent` — cor da borda superior e do glow ao hover (`'blue'`, `'green'`, `'yellow'`, `'cyan'`, `'purple'`, `'red'`)
- `children` — conteúdo do card

O CSS aplica glassmorphism (`backdrop-filter: blur`), borda superior colorida e `box-shadow` com glow no hover.

---

### `src/components/CircularGauge.jsx`

Gauge circular implementado em SVG puro, sem biblioteca externa.

- Dois `<circle>` sobrepostos: o de fundo (transparente) e o de progresso
- O progresso é controlado por `stroke-dashoffset`: `offset = circunferência × (1 - percent/100)`
- Transições CSS suaves em `stroke-dashoffset` (0.5s) e `stroke` (mudança de cor, 0.4s)
- Muda de cor automaticamente: verde → amarelo (≥70%) → vermelho (≥90%)
- O texto percentual dentro do gauge usa uma transformação de rotação para compensar o `rotate(-90deg)` do SVG pai

---

### `src/components/GaugeBar.jsx`

Barra de progresso horizontal com largura animada via CSS `transition`. Muda de cor conforme o percentual (verde / amarelo / vermelho). Aceita `label` e `sublabel` opcionais.

---

### `src/components/SparklineChart.jsx`

Gráfico de área minimalista usando `AreaChart` do Recharts. Exibe os últimos 60 pontos de histórico sem eixos visíveis, com gradiente de preenchimento e tooltip customizado. `isAnimationActive={false}` evita re-animação a cada atualização de dados.

---

### `src/components/CpuCard.jsx`

Exibe métricas de CPU:
- `CircularGauge` com uso total e frequência como sublabel
- Tabela de informações (núcleos físicos, threads lógicas, frequência)
- `SparklineChart` com histórico de 60s
- Grid de `GaugeBar` para uso de cada core (2 colunas)

---

### `src/components/RamCard.jsx`

Exibe métricas de memória:
- `CircularGauge` com percentual de uso
- Barra de progresso horizontal com memória usada
- Dois stat boxes: memória disponível e total
- `SparklineChart` com histórico de 60s

---

### `src/components/DiskCard.jsx`

Exibe métricas de disco:
- Dois stat boxes com ícones para taxa de leitura (↓) e escrita (↑) em MB/s
- Para cada partição: nome do ponto de montagem, GB usados/livres/total e barra de progresso com glow colorido

---

### `src/components/NetworkCard.jsx`

Exibe métricas de rede:
- Quatro `StatBox` internos: download, upload, total recebido, total enviado
- Gráfico de área duplo com linhas para download (cyan) e upload (roxo), com gradientes independentes
- Tooltip customizado que mostra as duas linhas simultaneamente

---

### `src/components/ProcessTable.jsx`

Tabela dos 10 processos com maior consumo de CPU:
- Colunas: PID, nome, CPU %, mini barra visual de CPU, RAM (MB), status
- A mini barra tem largura proporcional ao CPU% (escala 2×, limitada a 100%) e cor dinâmica
- O status é exibido como um chip com dot colorido: verde (running), cinza (sleeping), amarelo (outros)

---

### `src/components/GpuCard.jsx`

Só é renderizado se `metrics.gpu` contiver ao menos uma GPU. Para cada GPU:
- Nome da placa
- `CircularGauge` com load percentual
- Temperatura com cor dinâmica (verde / amarelo / vermelho)
- `GaugeBar` para uso de VRAM

---

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (hot reload)
npm run dev
```

O app estará disponível em `http://localhost:5173`.

> O backend precisa estar rodando em `localhost:8000` antes de abrir o browser.

---

## Build para produção

```bash
npm run build
```

Gera os arquivos estáticos em `dist/`. Para servir localmente:

```bash
npm run preview
```
