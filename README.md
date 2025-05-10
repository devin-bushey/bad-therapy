# Bad Therapy

## Server (FastAPI)

**Install dependencies:**
```sh
cd server
uv pip install -r pyproject.toml
```

**Run development server:**
```sh
uv run fastapi dev --host 0.0.0.0 --port 10000
```

---

## Client (React/TypeScript)

**Install dependencies:**
```sh
cd client
npm install
```

**Run development server:**
```sh
npm run dev
```

---

## Deployment (Render)
- Use the same install and run commands as above for the server.
- Ensure environment variables are set in the Render dashboard.
