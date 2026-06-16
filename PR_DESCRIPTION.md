## Summary

**What problem does this PR solve?**
Hey! I noticed that filling out student profiles manually (inputs, CGPA, skills, etc.) felt a bit slow and tedious. To make the onboarding experience much smoother, I wanted to give students a "magic auto-fill" experience! 

This PR adds full AI-powered resume PDF parsing. Now, students can just drop or select their resume, and the system automatically reads it, extracts all relevant data, splits names cleanly, and populates the profile fields instantly. I also focused heavily on making this bulletproof—handling concurrency conflicts and self-healing rate limits so the app stays incredibly robust.

**What changed?**
- **Google Gemini Integration (`gemini-flash-latest`):** Swapped the model to the flagship stable model. This ensures native support, fast JSON extraction, and unlocks a massive **1,500 daily requests free quota** (so we don't get blocked by the 20-request limit on preview models!).
- **Self-Healing Rate Limit Recovery:** Added an intelligent API error handler. If we hit a short rate limit, the backend dynamically reads Google's requested `retryDelay` and silently sleeps in the background before retrying. Zero crashes!
- **Double-Upload UI Lock:** Integrated a concurrency lock (`isProcessingResume`). While a resume is actively parsing, the browser blocks concurrent drops and disables the "Save" and "Reset Profile" buttons to prevent state corruption.
- **Split First/Last Name Inputs:** Replaced the obsolete Roll Number input with separate "First Name" and "Last Name" fields. The AI extracts these cleanly from the resume and maps them dynamically.
- **Unified Checklist Math:** Unified the checklist requirements to exactly 6 genuine fields (First Name, Last Name, Branch, CGPA, Skills, Resume). The completion percentage now calculates identically on both the Student Dashboard and Profile pages.
- **Instant MongoDB Persistence:** Conversion of PDF buffers to base64 Data URLs is done automatically inside `POST /upload-resume` and saved straight to Mongoose so the student's file is kept safe instantly.

⚠️ **ATTENTION (CRITICAL REQUIREMENT):**
**To run and test this feature locally, you MUST add your Gemini API key to your `backend/.env` file. Without this, the AI parser will not be able to connect! Please add:**
```env
GEMINI_API_KEY=your_actual_gemini_api_key
```

## Validation

- [x] Tested consecutive, back-to-back resume uploads with a small gap (verified concurrency locks blocked overlapping inputs perfectly)
- [x] Verified profile data reset clears fields and resets completion status to baseline
- [x] Tested console logs under Gemini API limits to verify retry backoff sleeping works autonomously

*(I made sure that ESLint, server routes, and frontend API calls run perfectly without throwing any console or terminal errors!)*

## Screenshots

<img width="1855" height="908" alt="Screenshot 2026-05-19 184807" src="https://github.com/user-attachments/assets/8c1321ec-d38d-4e6a-b9db-26c5570775af" />
<img width="1901" height="893" alt="Screenshot 2026-05-19 184815" src="https://github.com/user-attachments/assets/12667971-ba38-4f5d-8a07-c3bad5fc0f3a" />
<img width="1896" height="889" alt="Screenshot 2026-05-19 184827" src="https://github.com/user-attachments/assets/e4de248f-5c0e-4a96-a04b-ce29ad9658cd" />
<img width="1909" height="909" alt="Screenshot 2026-05-19 184832" src="https://github.com/user-attachments/assets/9406ee4b-0c65-4f03-9112-227908f93a89" />

## Risks

This should be a super safe merge! There are zero recruiter or admin changes required. The AI auto-fill features and name splitting piggyback directly off the existing student profile schema structure without needing any database migrations or breaking backward compatibility.
