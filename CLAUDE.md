# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Client (React/TypeScript)
```bash
cd client
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
```

### Server (FastAPI/Python)
```bash
cd server
uv pip install -r pyproject.toml
uv run fastapi dev
PYTHONPATH=. uv run pytest
PYTHONPATH=. uv run pytest tests/routes/test_ai.py
```

## Architecture Overview

### Core Technology Stack
- **Frontend**: React 19, TypeScript, TailwindCSS, Auth0
- **Backend**: FastAPI, Python, uv package manager
- **AI/Agents**: LangGraph, LangChain, OpenAI, Perplexity
- **Database**: PostgreSQL (via Supabase)

### Agent Architecture (LangGraph)
The core AI system is built using LangGraph with a `StateGraph` that manages conversation flow through specialized nodes:

- **State Management**: `TherapyState` object tracks conversation, safety flags, and routing decisions
- **Main Graph**: `server/graphs/therapy_graph.py` orchestrates the entire conversation flow
- **Nodes**:
  - `safety_node.py`: Detects harmful content and safety concerns
  - `router_node.py`: Determines conversation routing based on user input
  - `primary_therapist_node.py`: Main therapy chatbot with tool calling capabilities
  - `find_therapist_node.py`: Uses Perplexity API to find real therapists

### Key Features
- **Conditional Routing**: Graph edges dynamically route based on safety checks and user needs
- **Tool Calling**: Primary therapist can save messages to user journal via `save_to_journal_tool.py`
- **Streaming Responses**: FastAPI streams AI responses node-by-node for real-time feedback
- **LangSmith Tracing**: All graph executions are traced for debugging and observability
- **Persistent Memory**: Conversations stored in PostgreSQL with vector embeddings for RAG

### Code Organization
- **Client Features**: Organized by feature (`dashboard/`, `journal/`, `session/`, `profile/`)
- **Server Structure**: Follows domain-driven design with `nodes/`, `graphs/`, `models/`, `routes/`, `service/`
- **Prompts**: All AI prompts centralized in `server/prompts/` directory
- **Database**: SQL schemas and connection logic in `server/database/`

### Development Guidelines
- Use camelCase for React components and filenames
- Use snake_case for Python files and functions
- Follow functional programming patterns in both frontend and backend
- Implement early returns and guard clauses for error handling
- All AI components should be async and handle streaming responses
- Use Pydantic models for API validation and type safety