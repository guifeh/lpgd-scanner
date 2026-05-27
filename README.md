**Visão Geral**
- Projeto: LGPD Scanner — backend em FastAPI que usa Playwright para verificar práticas de privacidade em sites, e frontend em React + Vite.

**Como executar — Backend**
- Crie e ative um ambiente virtual Python:

```bash
python -m venv .venv
source .venv/bin/activate
```

- Instale dependências e navegadores do Playwright:

```bash
cd backend
pip install -r requirements.txt
python -m playwright install
# (opcional, em Debian/Ubuntu) python -m playwright install-deps
```

- Inicie a API (desenvolvimento):

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Testar a API (exemplos)**
- Health-check:

```bash
curl http://localhost:8000/health
```

- Rodar um scan (substitua a URL):

```bash
curl -sS -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}' | jq .
```

**Como executar — Frontend**
- Instalar e rodar em modo dev:

```bash
cd frontend
npm install
npm run dev
```

- Build de produção:

```bash
npm run build
npm run preview
```

**Comandos úteis para auditoria**

```bash
# Verificar dependências Python (instale pip-audit primeiro)
pip install pip-audit
pip-audit

# Verificar dependências Node
cd frontend
npm audit --production
```

