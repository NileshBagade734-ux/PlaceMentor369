/**
 * Interview Readiness Score
 * --------------------------
 * Shared helper used by both prep-dashboard.html and student-dashboard.html.
 *
 * It treats each "preparation module" (Aptitude, DSA, Core CS, Mock Interviews, etc.)
 * as a category with `completed` / `total` counts, and combines them into a single
 * Interview Readiness Score (0-100%).
 *
 * The module list is persisted to localStorage under PREP_MODULES_KEY so that any
 * progress recorded on the Prep Tracker page is immediately reflected on the
 * dashboard's Readiness Score card (and vice versa).
 */

const PREP_MODULES_KEY = "placementor_prep_modules";

// Default seed data — used only the first time a student visits (no saved progress yet).
const DEFAULT_PREP_MODULES = [
  {
    id: "aptitude",
    name: "Aptitude & Logical Reasoning",
    total: 40,
    completed: 28,
    color: "bg-amber-500",
    icon: "brain",
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    total: 150,
    completed: 95,
    color: "bg-indigo-500",
    icon: "code-2",
  },
  {
    id: "core",
    name: "Core CS Subjects (OS, DBMS, CN)",
    total: 30,
    completed: 12,
    color: "bg-blue-500",
    icon: "database",
  },
  {
    id: "mock",
    name: "Mock Interviews & Soft Skills",
    total: 10,
    completed: 6,
    color: "bg-emerald-500",
    icon: "video",
  },
];

/**
 * Reads prep module progress from localStorage, seeding defaults if nothing is saved yet.
 */
function getPrepModules() {
  try {
    const saved = localStorage.getItem(PREP_MODULES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error("Error reading prep modules:", err);
  }
  savePrepModules(DEFAULT_PREP_MODULES);
  return DEFAULT_PREP_MODULES;
}

/**
 * Persists prep module progress to localStorage.
 */
function savePrepModules(modules) {
  localStorage.setItem(PREP_MODULES_KEY, JSON.stringify(modules));
}

/**
 * Calculates the overall Interview Readiness Score plus a simple insight message.
 *
 * Score = total topics completed / total topics available, across all modules
 * (i.e. modules with more topics naturally weigh more — DSA matters more than Aptitude).
 *
 * Insight logic:
 *  - >= 75%            -> "Excellent Progress"
 *  - Mock Interviews module is the weakest relative to its own total -> "Focus on Mock Interviews"
 *  - otherwise          -> "Needs More Practice"
 */
function calculateReadinessScore(modules) {
  const totalTasks = modules.reduce((sum, m) => sum + m.total, 0);
  const totalCompleted = modules.reduce((sum, m) => sum + m.completed, 0);
  const percentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  // Find the weakest module by its own completion percentage.
  const withPercents = modules.map((m) => ({
    ...m,
    pct: m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0,
  }));
  const weakest = withPercents.reduce(
    (worst, m) => (m.pct < worst.pct ? m : worst),
    withPercents[0],
  );

  let insight = "Needs More Practice";
  let insightIcon = "alert-circle";
  let insightColor = "text-amber-600 bg-amber-50 border-amber-100";

  if (percentage >= 75) {
    insight = "Excellent Progress";
    insightIcon = "trophy";
    insightColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  } else if (weakest && weakest.id === "mock" && weakest.pct < 60) {
    insight = "Focus on Mock Interviews";
    insightIcon = "video";
    insightColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
  } else if (percentage < 40) {
    insight = "Needs More Practice";
    insightIcon = "alert-circle";
    insightColor = "text-rose-600 bg-rose-50 border-rose-100";
  }

  return { percentage, insight, insightIcon, insightColor, weakest };
}

/**
 * Renders the Interview Readiness Score card into the given container element.
 * Safe to call multiple times (e.g. after progress updates) — it just re-renders.
 */
function renderReadinessScoreCard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const modules = getPrepModules();
  const { percentage, insight, insightIcon, insightColor } = calculateReadinessScore(modules);

  container.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <div>
        <h3 class="font-semibold text-slate-900">Interview Readiness Score</h3>
        <p class="text-xs text-slate-500">Based on your prep modules, practice & mock interviews</p>
      </div>
      <span class="text-lg font-bold text-indigo-600">${percentage}%</span>
    </div>
    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
      <div
        class="bg-indigo-600 h-full transition-all duration-1000"
        style="width: ${percentage}%"
      ></div>
    </div>
    <span class="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${insightColor}">
      <i data-lucide="${insightIcon}" class="w-3.5 h-3.5"></i> ${insight}
    </span>
  `;

  if (window.lucide) lucide.createIcons();
}
