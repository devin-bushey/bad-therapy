# Bad Therapy

Bad Therapy is an AI Agent chatbot that provides mental health coaching.

<p align="center">
  <img src="https://media.giphy.com/media/fV7Uit32tfBp9QDyYB/giphy.gif?cid=ecf05e47t8k8uir6fg5jjbqw8qmmkvgn9j17qy8acgxo48h9&ep=v1_gifs_search&rid=giphy.gif&ct=g" alt="Conan" width="600"/>
</p>


## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript
- **Backend**: Python, FastAPI
- **Database**: PostgreSQL (via Supabase)
- **AI**: LangGraph, OpenAI, Perplexity
- **Auth**: Auth0

## Features

- **Conversational AI (Arlo)**:
  - Safety checks for harmful language
  - Context-aware conversations with relevant history retrieval
  - AI-powered primary therapist (coaching, journaling)
  - Therapist finder (uses Perplexity to suggest real therapists)
  - Smart router to decide next steps
- **User Profiles**: Personalized sessions and recommendations.
- **Journaling**: Save and review your thoughts securely with rich text editing (TipTap) and AI-powered insights generator.
- **Daily Tips**: AI-generated wellness tips with curated resource links and credibility scoring.
- **Mood Tracking**: Daily mood logging with trend visualization and analytics.
- **Rate Limiting**: API protection with user-based rate limiting (30/min for AI, 100/min general).
- **Message Formatting**: Markdown-rendered AI responses with streaming support.
- **Security**: All data is encrypted and protected with Auth0 authentication.

## Upcoming

- **MCP (Model Context Protocol)**:
  - Future-proof for multi-agent and multi-model workflows


## 🧠 How It Works

### State Management
- Each session uses a [`TherapyState`](server/models/therapy.py) object to track conversation, safety, and next actions.

### Graph Structure
- The core workflow is a LangGraph [`StateGraph`](server/graphs/therapy_graph.py) (see `server/graphs/therapy_graph.py`).
- Nodes:
  - [`safety`](server/nodes/safety_node.py): Checks for harmful language.
  - [`router`](server/nodes/router_node.py): Decides next step.
  - [`context`](server/nodes/context_node.py): Retrieves and summarizes relevant conversation history using GPT-4o-mini.
  - [`primary_therapist`](server/nodes/primary_therapist_node.py): Main chatbot including custom tool calls to save messages to the user journal.
  - [`find_therapist`](server/nodes/find_therapist_node.py): Searches for and suggests real therapists based on user input and conversation history using the Perplexity api.
  - [`journal_insights`](server/nodes/journal_insights_node.py): Analyzes user journal entries to provide AI-powered insights and patterns.

### Conditional Routing
- Edges between nodes are conditional, so the agent can branch based on user input and state (e.g., escalate to human therapist if unsafe).

### Streaming Responses
- FastAPI streams AI responses node-by-node for real-time feedback.

### Tool Calling
- The `primary_therapist` node can call the [`save_to_journal` tool](server/tools/save_to_journal_tool.py) to save user messages to their journal.

### Prompt Engineering
- All prompts are saved in the [`prompts`](server/prompts/) directory

### Long-Term Memory
- Conversations are saved in a PostgreSQL database for persistent memory.
- Each message is vector-embedded for future Retrieval-Augmented Generation (RAG).

### Security
- Sensitive data is encrypted at rest.
- Auth0 is used for authentication and access control.
- Rate limiting with slowapi

## LangStudio 
- All LangGraph runs can be visualized with LangGraph Studio debugging.

```sh
langgraph dev
```

<p align="left">
  <img src="docs/LanggraphStudio.png" alt="LangGrapgStudio"/>
</p>

## LangSmith Tracing
- All LangGraph runs are traced with LangSmith for cloud-based debugging and observability.
- See tracings and monitoring here: https://smith.langchain.com/o/65c77578-2a48-42ef-a24f-8d83c29bc984/
- **Production Security**: Use `LANGSMITH_HIDE_INPUTS=true` and `LANGSMITH_HIDE_OUTPUTS=true` environment variables to protect sensitive mental health data in production environments.

<p align="left">
  <img src="docs/LangSmith.png" alt="LangSmith"/>
</p>

## LangSmith Evaluations

Bad Therapy includes a comprehensive evaluation system that integrates with LangSmith for tracking AI performance across safety, therapy quality, and system performance dimensions.

<p align="left">
  <img src="docs/LangSmithEvals.png" alt="LangSmithEvals"/>
</p>

### Evaluation Categories

**Safety Evaluators**
- **Crisis Detection**: Evaluates ability to identify suicidal ideation, self-harm, and crisis situations
- **Harmful Content Prevention**: Tests filtering of inappropriate medical/therapeutic advice
- **Referral Appropriateness**: Assesses when the system correctly escalates to human professionals

**Therapy Quality Evaluators**
- **Empathy Assessment**: Measures emotional validation and therapeutic understanding
- **Clinical Appropriateness**: Ensures responses follow therapeutic boundaries and best practices
- **Therapeutic Effectiveness**: Evaluates the therapeutic value and insight promotion
- **Boundary Maintenance**: Prevents inappropriate personal disclosure or advice-giving

**System Performance Evaluators**
- **Router Accuracy**: Tests intent classification (therapy vs. therapist search vs. journal insights)
- **Context Retention**: Evaluates multi-turn conversation coherence and memory
- **Response Relevance**: Measures how well responses address user concerns
- **Consistency**: Assesses reliability and coherence across interactions

### Privacy-Compliant Evaluation

The evaluation system respects your production privacy settings:
- **Input/Output Hiding**: Works with `LANGSMITH_HIDE_INPUTS=true` and `LANGSMITH_HIDE_OUTPUTS=true`
- **Metadata Tracking**: Monitors performance metrics without exposing sensitive therapy content
- **Synthetic Data**: Uses realistic but non-sensitive test scenarios for comprehensive evaluation

### Evaluation Commands

**Set up LangSmith datasets:**
```bash
cd server
python -m evaluations.runners.evaluation_runner --type langsmith-setup
```

**Run safety-critical evaluation:**
```bash
python -m evaluations.runners.evaluation_runner --type langsmith-eval --langsmith-dataset "bad-therapy-safety-critical"
```

**Run therapy quality evaluation:**
```bash
python -m evaluations.runners.evaluation_runner --type langsmith-eval --langsmith-dataset "bad-therapy-quality"
```

**Run system performance evaluation:**
```bash
python -m evaluations.runners.evaluation_runner --type langsmith-eval --langsmith-dataset "bad-therapy-performance"
```

**Run comprehensive batch evaluation:**
```bash
python -m evaluations.runners.evaluation_runner --type langsmith-batch --experiment-name "my_evaluation"
```

**Run traditional local evaluation (without LangSmith):**
```bash
python -m evaluations.runners.evaluation_runner --type full
python -m evaluations.runners.evaluation_runner --type safety
python -m evaluations.runners.evaluation_runner --type quality
python -m evaluations.runners.evaluation_runner --type performance
```


## Server (FastAPI)

**Install dependencies:**
```sh
cd server
source .venv/bin/activate
uv pip install -r pyproject.toml

# For production deployment
uv pip freeze > requirements.txt 
```

**Run development server:**
```sh
uv run fastapi dev
```

**Run server unit tests:**
```sh
PYTHONPATH=. uv run pytest
```

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



