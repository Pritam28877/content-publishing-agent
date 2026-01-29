# Content Publishing Agent

## Project Overview
This project is an automated content publishing system built with **Next.js**, **Temporal**, and **Node.js**. It orchestrates the entire workflow of generating content (simulated LLM), checking safety, publishing to a CMS (Local Filesystem), and sending notifications.

## Architecture

### 1. Frontend (Next.js)
*   **Role**: User Interface and API Gateway.
*   **Port**: `3000`
*   **Key File**: `app/api/publish/route.ts` - Triggers the Temporal Workflow.

### 2. Backend Worker (Temporal Worker)
*   **Role**: Executes the business logic (Workflows and Activities).
*   **Port**: Connects to Temporal Server.
*   **Key Files**:
    *   `src/worker.ts`: Entry point for the worker.
    *   `src/workflows.ts`: Defines the orchestration logic (`contentPublishingWorkflow`).
    *   `src/activities.ts`: Performs the actual tasks (Generate, Check, Publish, Notify).

### 3. Temporal Server (Docker)
*   **Role**: Orchestration Engine. Manages state, retries, and queues.
*   **Services**: Frontend, History, Matching, Worker Services + Cassandra/Postgres.
*   **UI**: `http://localhost:8080`

## Workflow Steps

1.  **Start**: API request receives `topic` and `authorEmail`.
2.  **Generate Content**: 
    *   *Activity*: `generateContent`
    *   *Simulated*: Returns a string about the topic.
3.  **Safety Check**: 
    *   *Activity*: `checkContentSafety`
    *   *Logic*: Checks for forbidden words (mocked).
4.  **Publish**: 
    *   *Activity*: `publishToCMS`
    *   *Implementation*: **Local File System**. 
    *   *Output*: Creates a file in `backend/published_content/`.
5.  **Notify**: 
    *   *Activity*: `sendNotification`
    *   *Simulated*: Logs email sending.

## How to Run

### Prerequisites
*   Node.js v20+
*   Docker & Docker Compose

### 1. Start Temporal Server
```bash
docker compose up -d
```
Verify at `http://localhost:8080`.

### 2. Start Backend Worker
```bash
cd backend
npm start
```
*Note: Ensure `.env` is configured.*

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Trigger Workflow
```bash
curl -X POST http://localhost:3000/api/publish \
  -H "Content-Type: application/json" \
  -d '{"topic": "Local CMS Test", "authorEmail": "tester@local"}'
```

## Verification
Check the `backend/published_content` folder. You will see a new `.md` file for every published article.
