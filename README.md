# Content Publishing Agent 🚀

A robust, Temporal-backed workflow agent that automates the content publishing lifecycle. Built with **Next.js** and **Temporal TypeScript SDK**.

## 🧠 System Architecture

This project implements a **Resilient Workflow** pattern:
1.  **Frontend (Next.js)**: Submits tasks and polls for status.
2.  **Backend (Temporal Worker)**: Executes the `ContentPublishingWorkflow`.
3.  **Orchestrator (Temporal Server)**: Manages state, retries, and timeouts.

### Workflow Logic (`Saga Pattern`)
The agent follows a strict pipeline:
1.  `generateContent`: Mocks an LLM call to draft text.
2.  `checkContentSafety`: **Gatekeeper**. If content is unsafe, the workflow terminates early (Rejection).
3.  `publishToCMS`: **Flaky Operation**. configured with a **30% failure rate** to demonstrate Temporal's automatic retries.
4.  `sendNotification`: Final confirmation.

## 🛠️ Setup Instructions

### Prerequisites
-   Node.js 18+
-   [Temporal CLI](https://docs.temporal.io/cli) installed and running locally.

### 1. Start Temporal Server
Run this in a separate terminal to start the local development server:
```bash
temporal server start-dev
```

### 2. Start the Backend Worker
This worker listens for tasks and executes activities.
```bash
cd backend
npm install
npm start  # Runs ts-node src/worker.ts
```

### 3. Start the Frontend
The Next.js UI for submitting tasks and visualizing progress.
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

## 🧪 How to Test

1.  **Happy Path**:
    -   Topic: "The Future of AI"
    -   Email: "me@test.com"
    -   *Result*: You will see the steps complete. If "Publishing" fails, you'll see it retry (the activity might take longer) until success.

2.  **Rejection Path (Safety Check)**:
    -   Topic: "How to send spam" (or any topic containing "spam" or "violation")
    -   *Result*: The workflow will stop at Step 2 and show "❌ Publication Rejected".

3.  **Resilience**:
    -   Watch the `backend` terminal. You will see "Publishing failed! Retrying..." messages occasionally. The workflow recovers automatically.

## 🏗️ Design Decisions

-   **Deterministic Logic**: All non-deterministic operations (random failures, API calls) are isolated in **Activities**. The **Workflow** code is pure.
-   **Monorepo Structure**: Kept frontend and backend close for easier context switching in this demo, though they are logically decoupled.
-   **Polling vs WebSockets**: Used simple HTTP polling for the UI to keep the stack minimal and robust for this scope. In production, I would use WebSockets or Server-Sent Events.

## 📂 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── activities.ts   # Side-effects (API calls)
│   │   ├── workflows.ts    # Business logic
│   │   └── worker.ts       # Worker entrypoint
│   └── tsconfig.json
└── frontend/
    ├── app/
    │   ├── api/publish/    # API Route to trigger Temporal
    │   └── page.tsx        # UI Dashboard
    └── ...
```
