# System Monitor

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

Dashboard web em tempo real para monitorar recursos do sistema. O backend coleta métricas via `psutil` e as transmite por WebSocket a cada segundo; o frontend React as exibe com gráficos históricos e gauges coloridos.

## O que é monitorado

| Recurso | Dados exibidos |
|---------|----------------|
| **CPU** | Uso total (%), uso por núcleo, frequência atual (MHz), contagem de núcleos físicos/lógicos |
| **RAM** | Uso (%), total, usado e disponível em GB |
| **Disco** | Uso por partição (%), taxa de leitura e escrita em tempo real (MB/s) |
| **Rede** | Taxa de envio e recebimento em tempo real (MB/s), total transferido (GB) |
| **Processos** | Top 10 processos por consumo de CPU (PID, nome, CPU%, memória RSS, status) |
| **GPU** | Carga (%), memória usada/total (MB), temperatura (°C) — requer NVIDIA com drivers instalados |

O frontend mantém um histórico dos últimos 60 segundos para CPU, RAM e Rede, exibido em gráficos de linha.

## Stack

- **Backend:** Python · FastAPI · WebSocket · psutil · GPUtil
- **Frontend:** React 18 · Vite · Recharts

## Pré-requisitos

- Python 3.9+
- Node.js 18+

## Como rodar

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS
pip install -r requirements.txt
uvicorn main:app --reload
```

Disponível em `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`

## Observações

- GPU só aparece se houver placa NVIDIA com drivers instalados.
- O WebSocket reconecta automaticamente (a cada 3 s) se o backend cair.
- Histórico de 60 segundos nos gráficos de CPU, RAM e Rede.
