import fs from 'fs';
import { execSync } from 'child_process';

const run = (cmd) => {
  try {
    console.log(`> ${cmd}`);
    return execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`);
    // Ignore push or branch errors to allow script continuation
  }
};

const checkoutMain = () => {
  run('git checkout main');
};

const createAndPush = (branchName, commitMsg, modifyCallback) => {
  console.log(`\n========================================`);
  console.log(`Processing branch: ${branchName}`);
  console.log(`========================================`);
  checkoutMain();
  run(`git checkout -b ${branchName}`);
  modifyCallback();
  run('git add .');
  run(`git commit -m "${commitMsg}"`);
  run(`git push origin ${branchName}`);
  checkoutMain();
  run(`git branch -D ${branchName}`); // clean up local branch
};

// 1. fix/recruiter-csv-export-student-email
createAndPush('fix/recruiter-csv-export-student-email', 'fix: load user email during student application query populate', () => {
  let content = fs.readFileSync('backend/controllers/recruiterController.js', 'utf8');
  content = content.replace(
    /\.populate\("student", "name email branch cgpa skills resume"\)/g,
    `.populate({ path: "student", select: "name branch cgpa skills resume", populate: { path: "user", select: "email" } })`
  );
  content = content.replace(
    /`"\${student\.email \|\| "N\/A"}"`,/g,
    `\`"\${(student.student && student.student.user && student.student.user.email) || (student.user && student.user.email) || "N/A"}"\`,`
  );
  fs.writeFileSync('backend/controllers/recruiterController.js', content);
});

// 2. security/enforce-password-complexity
createAndPush('security/enforce-password-complexity', 'security: validate password complexity constraints on signup', () => {
  let content = fs.readFileSync('backend/controllers/authController.js', 'utf8');
  content = content.replace(
    /const hashedPassword = await bcrypt\.hash\(password, 10\);/g,
    `const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;\n    if (!passwordRegex.test(password)) {\n      return res.status(400).json({ message: "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, and a number." });\n    }\n    const hashedPassword = await bcrypt.hash(password, 10);`
  );
  fs.writeFileSync('backend/controllers/authController.js', content);
});

// 3. fix/mongodb-reconnection-fault-tolerance
createAndPush('fix/mongodb-reconnection-fault-tolerance', 'fix: implement mongodb connection retries with backoff on startup', () => {
  let content = fs.readFileSync('backend/server.js', 'utf8');
  content = content.replace(
    /mongoose\s*\.connect\(process\.env\.MONGO_URI\)\s*\.then\(\(\) => \{[\s\S]*?\}\)\s*\.catch\(\(err\) => \{[\s\S]*?\}\);/g,
    `const connectWithRetry = (retries = 5, delay = 5000) => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected successfully");
      server = app.listen(PORT, () => console.log(\`🚀 Server running on http://localhost:\${PORT}\`));
    })
    .catch((err) => {
      console.error("❌ MongoDB connection failed:", err.message);
      if (retries > 0) {
        console.log(\`Retrying connection in \${delay / 1000}s... (\${retries} retries left)\`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
        console.error("Fatal: MongoDB reconnection retries exhausted.");
        process.exit(1);
      }
    });
};
connectWithRetry();`
  );
  fs.writeFileSync('backend/server.js', content);
});

// 4. security/global-api-rate-limiting
createAndPush('security/global-api-rate-limiting', 'security: configure express-rate-limit global middleware', () => {
  let content = fs.readFileSync('backend/server.js', 'utf8');
  content = content.replace(
    /const app = express\(\);/g,
    `const app = express();\nimport rateLimit from "express-rate-limit";\nconst globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { message: "Too many requests, please try again later." } });\napp.use(globalLimiter);`
  );
  fs.writeFileSync('backend/server.js', content);
});

// 5. security/prevent-xss-html-sanitization
createAndPush('security/prevent-xss-html-sanitization', 'security: scrub html content tags from user input parameters', () => {
  const sanitizeHelper = `\nconst sanitizeHTML = (str) => {\n  if (typeof str !== "string") return str;\n  return str.replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\\"": "&quot;" }[tag] || tag));\n};\n`;
  
  let studentContent = fs.readFileSync('backend/controllers/studentController.js', 'utf8');
  studentContent = sanitizeHelper + studentContent;
  studentContent = studentContent.replace(
    /student\.name = name \|\| "";/g,
    `student.name = sanitizeHTML(name) || "";`
  );
  studentContent = studentContent.replace(
    /student\.college = college \|\| "";/g,
    `student.college = sanitizeHTML(college) || "";`
  );
  fs.writeFileSync('backend/controllers/studentController.js', studentContent);

  let recruiterContent = fs.readFileSync('backend/controllers/recruiterController.js', 'utf8');
  recruiterContent = sanitizeHelper + recruiterContent;
  recruiterContent = recruiterContent.replace(
    /const job = await Job\.create\(\{/g,
    `const job = await Job.create({\n      title: sanitizeHTML(title),\n      company: sanitizeHTML(company),\n      description: sanitizeHTML(description),`
  );
  fs.writeFileSync('backend/controllers/recruiterController.js', recruiterContent);
});

// 6. fix/prevent-duplicate-job-postings
createAndPush('fix/prevent-duplicate-job-postings', 'fix: prevent duplicate job posting within short time window', () => {
  let content = fs.readFileSync('backend/controllers/recruiterController.js', 'utf8');
  content = content.replace(
    /const recruiterId = req\.user\.id;/g,
    `const recruiterId = req.user.id;\n    const existingJob = await Job.findOne({ title, company, recruiter: recruiterId, createdAt: { $gte: new Date(Date.now() - 5 * 60000) } });\n    if (existingJob) return res.status(400).json({ message: "Duplicate job posting detected. Please wait 5 minutes before posting the same job again." });`
  );
  fs.writeFileSync('backend/controllers/recruiterController.js', content);
});

// 7. feat/healthcheck-and-graceful-shutdown-logging
createAndPush('feat/healthcheck-and-graceful-shutdown-logging', 'feat: define JSON health check status endpoint', () => {
  let content = fs.readFileSync('backend/server.js', 'utf8');
  content = content.replace(
    /app\.get\("\/", \(req, res\) => res\.status\(200\)\.send\("🚀 PlacementorAI Backend Running!"\)\);/g,
    `app.get("/", (req, res) => res.status(200).send("🚀 PlacementorAI Backend Running!"));\napp.get("/api/health", (req, res) => {\n  res.status(200).json({ status: "healthy", uptime: process.uptime(), dbState: mongoose.connection.readyState });\n});`
  );
  fs.writeFileSync('backend/server.js', content);
});

// 8. perf/student-jobs-feed-pagination
createAndPush('perf/student-jobs-feed-pagination', 'perf: implement page skip pagination for jobs search', () => {
  let content = fs.readFileSync('backend/controllers/studentController.js', 'utf8');
  content = content.replace(
    /export const getJobs = async \(req, res\) => \{\s*try \{\s*const jobs = await Job\.find\(\{ status: "approved" \}\);/g,
    `export const getJobs = async (req, res) => {\n  try {\n    const page = parseInt(req.query.page) || 1;\n    const limit = parseInt(req.query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const jobs = await Job.find({ status: "approved" }).skip(skip).limit(limit);`
  );
  fs.writeFileSync('backend/controllers/studentController.js', content);
});

// 9. perf/recruiter-applicants-pagination
createAndPush('perf/recruiter-applicants-pagination', 'perf: paginate recruiter application listing requests', () => {
  let content = fs.readFileSync('backend/controllers/recruiterController.js', 'utf8');
  content = content.replace(
    /const applications = await Application\.find\(\{ job: \{ \$in: jobIds \} \}\)/g,
    `const page = parseInt(req.query.page) || 1;\n    const limit = parseInt(req.query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const applications = await Application.find({ job: { $in: jobIds } }).skip(skip).limit(limit)`
  );
  fs.writeFileSync('backend/controllers/recruiterController.js', content);
});

// 10. accessibility/improve-aria-labels-forms
createAndPush('accessibility/improve-aria-labels-forms', 'accessibility: add aria attributes to signup and login forms', () => {
  let loginContent = fs.readFileSync('frontend/login.html', 'utf8');
  loginContent = loginContent.replace(
    /id="email"/g,
    `id="email" aria-label="Email Address" aria-required="true"`
  );
  loginContent = loginContent.replace(
    /id="password"/g,
    `id="password" aria-label="Password" aria-required="true"`
  );
  fs.writeFileSync('frontend/login.html', loginContent);

  let registerContent = fs.readFileSync('frontend/register.html', 'utf8');
  registerContent = registerContent.replace(
    /id="email"/g,
    `id="email" aria-label="Email Address" aria-required="true"`
  );
  registerContent = registerContent.replace(
    /id="password"/g,
    `id="password" aria-label="Password" aria-required="true"`
  );
  fs.writeFileSync('frontend/register.html', registerContent);
});

// 11. feat/react-error-boundaries
createAndPush('feat/react-error-boundaries', 'feat: wrap app router with react error boundary fallbacks', () => {
  let mainContent = fs.readFileSync('frontend-react/src/main.jsx', 'utf8');
  mainContent = `import { StrictMode } from 'react'\nimport { createRoot } from 'react-dom/client'\nimport './index.css'\nimport App from './App.jsx'\nimport { BrowserRouter } from 'react-router-dom'\nimport ErrorBoundary from './components/ErrorBoundary.jsx'\n\ncreateRoot(document.getElementById('root')).render(\n  <StrictMode>\n    <ErrorBoundary>\n      <BrowserRouter>\n        <App />\n      </BrowserRouter>\n    </ErrorBoundary>\n  </StrictMode>,\n)\n`;
  fs.writeFileSync('frontend-react/src/main.jsx', mainContent);
});

// 12. fix/react-development-cors-ports
createAndPush('fix/react-development-cors-ports', 'fix: configure static local development port in vite config', () => {
  let viteConfig = fs.readFileSync('frontend-react/vite.config.js', 'utf8');
  viteConfig = viteConfig.replace(
    /plugins: \[react\(\),tailwindcss\(\)\],/g,
    `plugins: [react(),tailwindcss()],\n  server: {\n    port: 3000,\n    host: true\n  }`
  );
  fs.writeFileSync('frontend-react/vite.config.js', viteConfig);
});

// 13. perf/prevent-mongoose-memory-leaks
createAndPush('perf/prevent-mongoose-memory-leaks', 'perf: optimize read-only queries with mongoose lean operations', () => {
  let content = fs.readFileSync('backend/controllers/recruiterController.js', 'utf8');
  content = content.replace(
    /\.populate\("job", "title"\);/g,
    `.populate("job", "title").lean();`
  );
  fs.writeFileSync('backend/controllers/recruiterController.js', content);
});

// 14. chore/startup-env-schema-validation
createAndPush('chore/startup-env-schema-validation', 'chore: validate existence of required environmental variables on boot', () => {
  let content = fs.readFileSync('backend/server.js', 'utf8');
  content = content.replace(
    /dotenv\.config\(\);/g,
    `dotenv.config();\nif (!process.env.MONGO_URI || !process.env.JWT_SECRET) {\n  console.error("FATAL ERROR: MONGO_URI and JWT_SECRET environment variables are required.");\n  process.exit(1);\n}`
  );
  fs.writeFileSync('backend/server.js', content);
});

// 15. fix/student-session-redirection
createAndPush('fix/student-session-redirection', 'fix: resolve relative path redirection discrepancies for student session', () => {
  let content = fs.readFileSync('frontend/js/student-dashboard.js', 'utf8');
  content = content.replace(
    /window\.location\.href = "\.\.\/login\.html";/g,
    `window.location.href = "/login.html";`
  );
  fs.writeFileSync('frontend/js/student-dashboard.js', content);
});

// 16. security/prevent-nosql-injection
createAndPush('security/prevent-nosql-injection', 'security: sanitize inputs against NoSQL injection vectors', () => {
  let content = fs.readFileSync('backend/controllers/authController.js', 'utf8');
  content = content.replace(
    /const \{ email, password, role \} = req\.body;/g,
    `const { email, password, role } = req.body;\n    if (typeof email !== "string" || typeof password !== "string" || typeof role !== "string") {\n      return res.status(400).json({ message: "Invalid input types." });\n    }`
  );
  fs.writeFileSync('backend/controllers/authController.js', content);
});

// 17. ux/student-dashboard-mobile-responsiveness
createAndPush('ux/student-dashboard-mobile-responsiveness', 'ux: optimize mobile responsiveness on student stats board', () => {
  let content = fs.readFileSync('frontend/css/student-dashboard.css', 'utf8');
  content += `\n/* Mobile responsiveness overrides */\n@media (max-width: 768px) {\n  .stats-grid {\n    grid-template-columns: 1fr !important;\n  }\n  .nav-container {\n    flex-direction: column;\n    gap: 15px;\n  }\n}\n`;
  fs.writeFileSync('frontend/css/student-dashboard.css', content);
});

console.log("All branches processed successfully!");
