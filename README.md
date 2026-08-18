# DevConf Vertigo 2026 · Sistema de Inscrições

Gestão de inscrições do DevConf Vertigo 2026: inscrição pública, acompanhantes
e ciclo de status (pendente → confirmada → check-in; lista de espera → confirmada).

## Stack

FastAPI + SQLAlchemy + PostgreSQL 16 (API) · React + TypeScript + Vite (web) · Docker Compose.

## Subir o ambiente

```bash
./scripts/warmup.sh        # sobe tudo, aguarda a API e roda os testes
./scripts/reset-db.sh      # recria os containers e o banco do zero, com o seed
```

| Serviço | URL |
|---------|-----|
| API | http://localhost:18000 (docs em /docs) |
| Web | http://localhost:13000 |
| PostgreSQL | localhost:55432 (devconf/devconf) |

Na subida a API roda `alembic upgrade head`, carrega o seed (19 inscrições e
3 acompanhantes; idempotente) e sobe o uvicorn com `--reload`.

## Domínio

Uma inscrição tem **categoria** (`participante`, `palestrante`, `vip`, `imprensa`),
**status** e zero ou mais **acompanhantes** (nome e restrição alimentar opcional).

Toda inscrição nasce `pendente`. As transições válidas são:

| De | Para |
|----|------|
| `pendente` | `confirmada`, `lista_de_espera` |
| `lista_de_espera` | `confirmada` |
| `confirmada` | `check_in_feito` |
| `check_in_feito` | — (terminal) |

Qualquer outra transição responde **409** com a mensagem de erro. Não há volta
atrás nem cancelamento.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Liveness |
| `GET` | `/api/inscricoes` | Lista inscrições |
| `POST` | `/api/inscricoes` | Cria inscrição (formulário público) → 201 |
| `GET` | `/api/inscricoes/{id}` | Detalhe + total de acompanhantes |
| `PATCH` | `/api/inscricoes/{id}/status` | Muda o status → 409 se inválido |
| `GET` | `/api/inscricoes/{id}/acompanhantes` | Lista acompanhantes da inscrição |
| `POST` | `/api/inscricoes/{id}/acompanhantes` | Adiciona acompanhante → 201 |

## Desenvolvimento

Tudo roda em Docker — não é preciso Python nem Node na máquina.
O código de `backend/` e `frontend/` é montado nos containers com
hot-reload: edite localmente e o serviço recarrega sozinho.

```bash
docker compose exec -T api uv run pytest -q   # testes (SQLite in-memory, no container)
docker compose exec -T api uv run alembic revision --autogenerate -m "..."   # migration
```

A API usa camadas: `routers/` (HTTP) → `services/` (regra de negócio) → `repositories/` (dados).

Dois pontos que costumam pegar quem chega:

- um hook do `.claude/` **bloqueia `git commit` se o pytest falhar** — inclusive
  quando o ambiente está parado; nesse caso rode `./scripts/warmup.sh` antes;
- o CORS da API libera **apenas** `http://localhost:13000`. Servindo o front em
  outra origem, o navegador bloqueia as chamadas (a API responde normal no curl).
  A URL da API no front vem de `VITE_API_URL`.

Convenções do time em `.claude/CLAUDE.md`.
Visão completa para quem está chegando em [`onboarding-devconf.md`](onboarding-devconf.md).
