# SentinelX — AI-Powered Security Decision Intelligence Platform

SentinelX detects privileged access misuse and insider threats inside enterprise banking environments. SentinelX is designed as a lightweight intelligence layer that sits above existing core banking security registries (such as CyberArk, Splunk, or Microsoft Sentinel), intercepting activities, profiling entity behavior, and rendering real-time risk decisioning.

This repository implements the enterprise-grade foundation architecture approved for the Bank of Maharashtra Hackathon. It utilizes strict separation of concerns, framework-independent business engines, dynamic event pipeline normalizers, and a cryptographic tamper-evident log ledger.

---

## Workspace Structure

The project is structured as a modular mono-repository:

```
SentinelX/
├── sentinelx-frontend/    # Next.js 15 App Router Frontend
└── sentinelx-backend/     # FastAPI Backend & Analytics Engines
```

---

## 1. Frontend Architecture (`sentinelx-frontend/`)

The frontend application uses a **Feature-First Architecture** inside the `features/` domain directory to isolate components, dynamic hooks, configurations, API services, types, and schema validations. This eliminates circular dependencies and allows visual units to be easily updated or replaced.

### Folder Structure
*   `app/`: Core route entry points mapping to Next.js App Router folders. Uses layouts inside parent pages.
*   `layouts/`: Layout Isolation. Contains isolated visual frames for `Employee` (self-service portal), `SOC` (incident monitoring system), and `Manager` (approvals desk).
*   `features/`: Isolated domains:
    *   `employee/`: Access request forms, session duration calculators, and validation configurations.
    *   `soc/`: Real-time incident logs, active event monitors, and threat maps.
    *   `risk/`: Risk radars, metric gauges, and dynamic weight tuners.
    *   `audit/`: Cryptographic log validators and integrity verification trackers.
    *   `behaviour/`: UEBA baseline charts, feature distributions, and anomaly indicators.
    *   `authentication/`: Demo role switching selectors (Employee, SOC Analyst, Manager).
*   `components/ui/`: UI primitive components wrapping Tailwind and Framer Motion elements.
*   `lib/` & `providers/`: Context and theme providers, alongside global state stores (Zustand).

### State Management
*   **Zustand**: Selected as the primary global state manager to handle rapid log streams and security telemetry. It uses selector-based component re-rendering to prevent UI lag.
*   **React Context**: Reserved exclusively for static UI parameters (theme configurations, notifications, form hooks).

---

## 2. Backend Architecture (`sentinelx-backend/`)

The backend is built around **Clean Architecture**, completely decoupling database models and API frameworks from core security logic.

```
app/
├── api/                   # Presentation Layer (FastAPI Routers)
├── core/                  # Security configs & exception handlers
├── database/              # DB Session factories & Alembic migrations
├── models/                # SQLAlchemy schemas
├── schemas/               # Pydantic data schemas
├── repositories/          # Abstract CRUD repository definitions
├── services/              # Orchestration services linking Routers -> Engines
│
# --- Framework-Independent Business Engines ---
├── event_pipeline/        # Collects, normalizes, validates, and parses raw logs
├── behaviour_intelligence/# UEBA statistics, baseline models, profiling, and features
├── risk_engine/           # Dynamic weighted multi-factor risk calculator
├── pdp/                   # Policy Decision Point (Attribute-Based Access Control)
├── orchestration/         # SOAR execution playbooks & overrides coordinator
├── audit_chain/           # Cryptographic signature chaining & verifications
├── simulation/            # Simulated banking activity & threat generators
└── ai/                    # Machine Learning staging layer & LLM prompt definitions
```

### Module Flow & Rules
1.  **Ingestion Inward**: Simulation generates raw feeds → Event Pipeline normalizes them → UEBA computes profiles → Risk Engine adjusts user risk scores.
2.  **Access Decision**: A request is submitted → PDP evaluates access policies and user risk scores → Orchestrator executes actions (Permits, Denies, or Triggers approvals) → Audit Chain cryptographically seals the logs.
3.  **Strict Dependency Rules**: Engines are pure Python classes. They do **not** import API parameters or database connections. Communication is strictly driven by schemas defined in `shared/`.

---

## 3. Development Foundation & Launching

To start developing the components and business logic, set up the workspace:

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd sentinelx-backend
   ```
2. Set up a python virtual environment and install configurations:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # Windows PowerShell
   pip install -r requirements.txt
   ```
3. Initialize the database schema using Alembic revisions:
   ```bash
   alembic upgrade head
   ```
4. Run the API developer server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd sentinelx-frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the hot-reloading Next.js dev server:
   ```bash
   npm run dev
   ```

---

## 4. Coding Standards

*   **No Circular Imports**: Keep domains encapsulated. If multiple feature blocks need a utility or schema, hoist it to the `shared/` package or a parent helper framework.
*   **Dependency Boundaries**: Presentation flows downward to Persistence. Controllers import Repository contracts; Repositories access SQL Alchemy engines. Core modules (`behaviour_intelligence`, `risk_engine`, etc.) remain pure math/logic blocks.
*   **TypeScript**: Explicit type definitions are required. `tsconfig` has strict compilation flags active. Avoid using type bypass variables like `any`.
*   **Python Typing**: Use clear type annotations across all function definitions.
