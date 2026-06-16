**Title:** [Feature] Phase 3: Background Queue Integration (BullMQ & Redis) for AI Processing

### Feature Description
As a continuation of the AI-Powered "Placementor Assistant" (following the successful merge of Phases 1 & 2), I am proposing the implementation of **Phase 3: Background Queue Integration**. 

While we successfully integrated the Gemini API for resume parsing, the current setup processes the PDF and calls the AI *synchronously* on the main thread. To ensure this feature is truly scalable and production-grade, I want to integrate a distributed background task queue using **BullMQ** and **Redis** to offload the heavy AI lifting.

### Problem It Solves
Currently, when a student uploads a resume, the `/upload-resume` endpoint is blocked waiting for the AI to finish its analysis. If 1,000 students upload their resumes simultaneously, this could bottleneck our Node.js event loop, cause severe UI lag, or lead to HTTP timeouts.

This feature solves:
*   **Main Thread Blocking:** The main server instantly responds to the frontend, keeping the UI lightning fast.
*   **Scalability:** We can seamlessly handle thousands of concurrent resume uploads without crashing the Express server.
*   **Resilience & Reliability:** If the AI API temporarily fails or times out, BullMQ can automatically retry the job in the background without losing the student's upload data.

### Proposed Solution
*   **The Scalability Part:** Install `bullmq` and `ioredis` to manage the queues.
*   **The Worker:** Create an isolated `aiWorker.js` background worker that listens for jobs on an `ai-analysis` queue and handles all Gemini API communication.
*   **The Controller Update:** Modify our existing `uploadResume` controller so that instead of waiting for the AI, it pushes the parsed PDF text into the BullMQ queue and immediately returns a `202 Accepted` response to the frontend.

### Alternatives Considered
I considered using native Node.js async functions (like "fire and forget" promises) or simple `setTimeout`. However, those approaches don't survive server restarts and lack built-in job management. If the server crashes mid-processing, the data is lost. BullMQ paired with Redis is the industry standard because it provides guaranteed delivery, job retries, and clean error handling.

### Mockups / Examples
From the user's perspective, the upload process will feel incredibly fast. Upon clicking "Upload," the UI will instantly receive a response: *"Your resume is being processed in the background."* (This prepares the architectural groundwork for Phase 4, where we will add Socket.io to ping the user when the background job finishes!)

### Acceptance Criteria
- [ ] A working Redis connection configuration implemented in the backend.
- [ ] `bullmq` integrated with a dedicated `ai-analysis` queue.
- [ ] A separate background worker (`aiWorker.js`) that handles the Gemini AI extraction logic.
- [ ] The `POST /upload-resume` endpoint responds immediately after adding the job to the queue, rather than waiting for the AI.
- [ ] Ensure backward compatibility with the database schema established in Phase 1 & 2.

### Contributor Checklist
- [x] I am participating via GSSoC
- [x] I have read the contribution guidelines
- [x] I checked for existing issues before creating this
