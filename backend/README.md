# System Monitor — Backend

API WebSocket em tempo real para coleta de métricas do sistema operacional, construída com Python e FastAPI.

---

## Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| **Python** | 3.9+ | Linguagem base |
| **FastAPI** | 0.115 | Framework web assíncrono |
| **Uvicorn** | 0.30 | Servidor ASGI |
| **psutil** | 6.0 | Coleta de métricas do sistema (CPU, RAM, disco, rede, processos) |
| **GPUtil** | 1.4 | Coleta de métricas de GPU NVIDIA |
| **websockets** | 13.1 | Suporte a conexões WebSocket |

---

## Arquitetura

```
Cliente (browser)
      │
      │  WebSocket  ws://localhost:8000/ws/metrics
      │
   FastAPI (Uvicorn)
      │
      ├── main.py         ← ponto de entrada, roteamento HTTP + WebSocket
      └── metrics.py      ← coleta de dados via psutil / GPUtil
```

O fluxo principal é:

1. O cliente abre uma conexão WebSocket com `/ws/metrics`
2. O servidor entra em loop infinito: coleta todas as métricas (`collect_all`) e envia o JSON ao cliente
3. O intervalo entre envios é de **1 segundo** (`asyncio.sleep(1)`)
4. Quando o cliente desconecta, a exceção `WebSocketDisconnect` encerra o loop silenciosamente

Não há banco de dados, cache externo ou workers adicionais. Todo o estado de "taxa" (MB/s de rede e disco) é calculado diferencialmente com base na última leitura, armazenado em variáveis de módulo em `metrics.py`.

---

## Estrutura de pastas

```
backend/
├── main.py           ← aplicação FastAPI, endpoint WebSocket e rota de health check
├── metrics.py        ← funções de coleta de métricas do sistema
├── requirements.txt  ← dependências Python
├── venv/             ← ambiente virtual (gerado localmente, não versionado)
└── README.md
```

---

## Arquivos

### `main.py`

Ponto de entrada da aplicação.

- Inicializa o app FastAPI e configura o middleware de **CORS**, permitindo conexões a partir de `localhost:5173` (Vite dev server)
- Faz uma chamada de aquecimento a `psutil.cpu_percent` no startup — necessário porque a primeira chamada desta função sempre retorna 0 (psutil precisa de uma leitura anterior para calcular a diferença)
- Expõe dois endpoints:
  - `GET /health` — retorna `{"status": "ok"}`, usado para verificar se o servidor está no ar
  - `WS /ws/metrics` — WebSocket que envia o payload JSON completo a cada segundo

### `metrics.py`

Módulo de coleta. Cada função retorna um dicionário pronto para serialização JSON.

| Função | O que coleta | Detalhe técnico |
|---|---|---|
| `get_cpu()` | Uso total (%), uso por core (%), frequência atual (MHz), núcleos físicos e lógicos | Usa `cpu_percent(interval=None)` — não bloqueia; depende de leitura anterior para calcular delta |
| `get_ram()` | Total, usado, disponível (GB) e percentual de uso | `virtual_memory()` — snapshot instantâneo |
| `get_disk()` | Uso de cada partição (GB, %) e taxa de leitura/escrita (MB/s) | A taxa é calculada pela diferença entre a leitura atual e a anterior, dividida pelo tempo decorrido; estado mantido em `_last_disk_io` e `_last_disk_time` |
| `get_network()` | Taxa de download e upload (MB/s), total enviado e recebido (GB) | Mesmo mecanismo de `get_disk()`, usando `_last_net_io` e `_last_net_time` |
| `get_processes()` | Top 10 processos por CPU: PID, nome, CPU (%), RAM (MB), status | Usa `process_iter` com atributos pré-carregados; ignora processos que somem ou negam acesso durante a iteração |
| `get_gpu()` | Nome, load (%), VRAM usada/total (MB), temperatura (°C) | Encapsulado em `try/except` — retorna lista vazia se não houver GPU NVIDIA ou se o driver não estiver instalado |
| `collect_all()` | Chama todas as funções acima e retorna o payload consolidado | É esta função que o WebSocket chama a cada ciclo |

### `requirements.txt`

Lista de dependências com versões fixadas para garantir reprodutibilidade.

---

## Payload JSON enviado pelo WebSocket

```json
{
  "cpu": {
    "percent": 18.5,
    "per_core": [10.0, 25.0, 12.0, 8.0],
    "freq_mhz": 3600.0,
    "count_logical": 8,
    "count_physical": 4
  },
  "ram": {
    "total_gb": 16.0,
    "used_gb": 9.2,
    "available_gb": 6.8,
    "percent": 57.5
  },
  "disk": {
    "partitions": [
      {
        "device": "C:\\",
        "mountpoint": "C:\\",
        "total_gb": 476.94,
        "used_gb": 200.1,
        "free_gb": 276.84,
        "percent": 41.9
      }
    ],
    "read_mb_s": 0.0,
    "write_mb_s": 1.24
  },
  "network": {
    "sent_mb_s": 0.002,
    "recv_mb_s": 0.015,
    "total_sent_gb": 1.234,
    "total_recv_gb": 5.678
  },
  "processes": [
    {
      "pid": 1234,
      "name": "chrome.exe",
      "cpu_percent": 5.2,
      "memory_mb": 512.0,
      "status": "running"
    }
  ],
  "gpu": [
    {
      "name": "NVIDIA GeForce RTX 3080",
      "load_percent": 30.0,
      "memory_used_mb": 2048.0,
      "memory_total_mb": 10240.0,
      "temperature_c": 65
    }
  ]
}
```

---

## Como executar

```bash
# 1. Criar e ativar o ambiente virtual
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux / macOS

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Iniciar o servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

O servidor estará disponível em `http://localhost:8000`.  
O WebSocket estará em `ws://localhost:8000/ws/metrics`.

> **Nota:** a flag `--reload` reinicia o servidor automaticamente ao salvar arquivos. Remova-a em produção.
