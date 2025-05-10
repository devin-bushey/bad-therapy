# Bad Therapy

Bad Therapy is an AI Agent chatbot that provide mental health coaching.

<p align="center">
  <img src="https://media.giphy.com/media/fV7Uit32tfBp9QDyYB/giphy.gif?cid=ecf05e47t8k8uir6fg5jjbqw8qmmkvgn9j17qy8acgxo48h9&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="Conan" width="600"/>
</p>


## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI
- **Auth**: Auth0


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
