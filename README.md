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

**Resumo da varredura de segurança (rápida)**
- Varredura rápida por padrões inseguros mostrou: nenhum segredo ou credenciais embutidas no código-fonte encontrado.
- Observações importantes:
  - backend/main.py usa CORS com allow_origins=["*"] — inseguro em produção. Restrinja a origens confiáveis.
  - backend/requirements.txt e frontend/package.json usam dependências sem versões fixas — pinagem recomendada e verificação de vulnerabilidades.
  - backend/scanner/engine.py roda Playwright com ignore_https_errors=True — pode mascarar problemas TLS; evite em ambientes de produção.
  - SonarQube IDE: a análise local foi acionada, mas para receber Security Hotspots integrais é necessário configurar o binding do workspace a um servidor SonarQube (Connected Mode).

**Recomendações de segurança**
- Remover/limitar `allow_origins` em `backend/main.py` para as origens necessárias.
- Fixar versões das dependências e adicionar verificação automática (`pip-audit`, `dependabot` ou `npm audit`).
- Não ignorar erros de TLS em produção; remova `ignore_https_errors=True` ou condicione-o a uma variável de ambiente.
- Adicionar um `.env`/configurações para credenciais e segredos; não comitar arquivos com segredos; criar/atualizar `.gitignore` para `frontend/dist` e arquivos sensíveis.
- Configurar CI que rode linters, testes e varredura de dependências.
- Para análises de segurança mais profundas, configure SonarQube em modo conectado e execute scans regulares.

**Comandos úteis para auditoria**

```bash
# Verificar dependências Python (instale pip-audit primeiro)
pip install pip-audit
pip-audit

# Verificar dependências Node
cd frontend
npm audit --production
```

**Próximos passos sugeridos**
- Deseja que eu:
  - fixe versões das dependências e adicione um `requirements.txt`/`package-lock.json` com versões específicas?
  - crie um workflow de CI (GitHub Actions) que rode `pip-audit` / `npm audit` e testes automatizados?

Arquivo criado: [README.md](README.md)
