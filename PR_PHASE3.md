## Summary

**What problem does this PR solve?**
This PR officially implements **Phase 3: Background Queue Integration** as outlined in our epic! Previously, the AI parsing blocked the main Express thread, causing the frontend to hang while waiting for Gemini's response. To make this feature production-grade and highly scalable, I've integrated a distributed background queue using **BullMQ** and **Redis**. 

Now, when a student uploads a resume, the server instantly returns a `202 Accepted` response, and a dedicated background worker (`aiWorker.js`) safely handles the Gemini extraction and MongoDB updates in isolation.

**What changed?**
- **BullMQ & ioredis:** Installed robust enterprise-grade queue management.
- **Dedicated AI Worker:** Created `backend/workers/aiWorker.js` to completely isolate the heavy LLM logic from the main API thread.
- **Redis Configuration:** Added a clean `backend/config/redis.js` setup.
- **Non-Blocking Controller:** Updated `uploadResume` to push jobs to the `ai-analysis-queue` and immediately return a success status to the frontend.
- **Graceful Fallbacks:** If the Redis connection is ever missing or fails, the controller automatically falls back to synchronous processing to ensure zero application downtime!
- **Frontend Asynchronous Support:** Handled the new 202 response to show an immediate "processing" toast, preparing the architectural groundwork for real-time WebSockets (Phase 4).

## Resolves Issue
Closes #101 

## Screenshots/Video (If applicable)
*(Feel free to add a screenshot here showing how the frontend instantly responds with a success toast!)*

## Verification Plan

Reviewers can test this locally by:
1. Ensuring a Redis server (or Upstash URI) is available and added to `.env` as `REDIS_URI`.
2. Running `npm run dev`. The console will log `✅ Redis Connected successfully` and `👷 Starting BullMQ Worker: ai-analysis-queue`.
3. Uploading a resume on the frontend. The UI will *instantly* show a success message without hanging.
4. Checking the backend terminal to see the BullMQ worker processing the job asynchronously!

## Contributor Checklist

- [x] I am participating via GSSoC
- [x] I have read the contribution guidelines
- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my own code
