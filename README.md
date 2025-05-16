# Bad Therapy

Bad Therapy is an AI Agent chatbot that provides mental health coaching.

<p align="center">
  <img src="https://media.giphy.com/media/fV7Uit32tfBp9QDyYB/giphy.gif?cid=ecf05e47t8k8uir6fg5jjbqw8qmmkvgn9j17qy8acgxo48h9&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="Conan" width="600"/>
</p>


## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI, LangGraph
- **Auth**: Auth0


## Server (FastAPI)

**Install dependencies:**
```sh
cd server
uv pip install -r pyproject.toml
```

**Run development server:**
```sh
uv run fastapi dev
```

**Run unit tests on server:**
```sh
PYTHONPATH=. uv run pytest

# or for a specific test:
PYTHONPATH=. uv run pytest tests/routes/test_ai.py
---

## Client (React/TypeScript)

**Install dependencies:**
```sh
cd client
npm install
```

**Run development:**
```sh
npm run dev
```

---

