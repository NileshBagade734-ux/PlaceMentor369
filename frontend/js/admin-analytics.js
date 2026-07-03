/* =================================================
   Admin Analytics Dashboard — Chart.js Rendering
   ================================================= */
"use strict";

/* ── Color Palette ── */
const COLORS = {
  indigo:    { solid: "#818cf8", bg: "rgba(129, 140, 248, 0.15)", border: "rgba(129, 140, 248, 0.6)" },
  emerald:   { solid: "#34d399", bg: "rgba(52, 211, 153, 0.15)",  border: "rgba(52, 211, 153, 0.6)"  },
  amber:     { solid: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)",  border: "rgba(251, 191, 36, 0.6)"  },
  rose:      { solid: "#f472b6", bg: "rgba(244, 114, 182, 0.15)", border: "rgba(244, 114, 182, 0.6)" },
  sky:       { solid: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)",  border: "rgba(56, 189, 248, 0.6)"  },
  violet:    { solid: "#c084fc", bg: "rgba(192, 132, 252, 0.15)", border: "rgba(192, 132, 252, 0.6)" },
  teal:      { solid: "#2dd4bf", bg: "rgba(45, 212, 191, 0.15)",  border: "rgba(45, 212, 191, 0.6)"  },
  orange:    { solid: "#fb923c", bg: "rgba(251, 146, 60, 0.15)",  border: "rgba(251, 146, 60, 0.6)"  },
  cyan:      { solid: "#22d3ee", bg: "rgba(34, 211, 238, 0.15)",  border: "rgba(34, 211, 238, 0.6)"  },
  fuchsia:   { solid: "#e879f9", bg: "rgba(232, 121, 249, 0.15)", border: "rgba(232, 121, 249, 0.6)" }
};

const PALETTE_SOLIDS = Object.values(COLORS).map(c => c.solid);
const PALETTE_BGS    = Object.values(COLORS).map(c => c.bg);
const PALETTE_BORDERS = Object.values(COLORS).map(c => c.border);

/* ── Chart.js Global Defaults ── */
Chart.defaults.color = "#94a3b8";
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = "circle";
Chart.defaults.plugins.legend.labels.padding = 16;

/* ── Chart Instances (for cleanup on refresh) ── */
let chartInstances = {};

/* =========================
   CREATE GRADIENT FILL
========================= */
function createGradient(ctx, color) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, color.bg.replace("0.15", "0.4"));
  gradient.addColorStop(1, color.bg.replace("0.15", "0.02"));
  return gradient;
}

/* =========================
   SHOW EMPTY STATE
========================= */
function showEmpty(cardId) {
  const card = document.getElementById(cardId);
  if (!card) return;
  card.classList.remove("loading");
  const wrapper = card.querySelector(".chart-wrapper");
  wrapper.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-chart-simple"></i>
      <span>No data available yet</span>
    </div>
  `;
}

/* =========================
   RENDER CHARTS
========================= */

// 1. Applications Per Month — Line Chart
function renderAppsByMonth(data) {
  const card = document.getElementById("card-appsByMonth");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-appsByMonth");

  const ctx = document.getElementById("chartAppsByMonth").getContext("2d");

  chartInstances.appsByMonth = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Applications",
        data: data.data,
        borderColor: COLORS.indigo.solid,
        backgroundColor: createGradient(ctx, COLORS.indigo),
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.indigo.solid,
        pointBorderColor: "#0f0f1a",
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          titleColor: "#e2e8f0",
          bodyColor: "#94a3b8",
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { maxRotation: 45, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// 2. Application Status Breakdown — Doughnut Chart
function renderStatusBreakdown(data) {
  const card = document.getElementById("card-statusBreakdown");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-statusBreakdown");

  const statusColors = {
    "Applied":     COLORS.amber,
    "Shortlisted": COLORS.emerald,
    "Rejected":    COLORS.rose
  };

  const bgColors = data.labels.map((l, i) => statusColors[l]?.solid || PALETTE_SOLIDS[i]);
  const borderColors = data.labels.map((l, i) => statusColors[l]?.border || PALETTE_BORDERS[i]);

  const ctx = document.getElementById("chartStatusBreakdown").getContext("2d");

  chartInstances.statusBreakdown = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: bgColors,
        borderColor: "#0f0f1a",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart", animateRotate: true },
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 20, font: { size: 12 } }
        },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// 3. Most Demanded Skills — Horizontal Bar Chart
function renderDemandedSkills(data) {
  const card = document.getElementById("card-skills");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-skills");

  const ctx = document.getElementById("chartSkills").getContext("2d");

  chartInstances.skills = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [{
        label: "Job Listings",
        data: data.data,
        backgroundColor: PALETTE_SOLIDS.map(c => c.replace(")", ", 0.7)").replace("rgb", "rgba")),
        borderColor: PALETTE_SOLIDS,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { precision: 0 }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11, weight: "500" } }
        }
      }
    }
  });
}

// 4. Applications Per Company — Bar Chart
function renderCompanyApps(data) {
  const card = document.getElementById("card-companies");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-companies");

  const ctx = document.getElementById("chartCompanies").getContext("2d");

  chartInstances.companies = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Applications",
        data: data.data,
        backgroundColor: COLORS.rose.bg.replace("0.15", "0.5"),
        borderColor: COLORS.rose.solid,
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { maxRotation: 45, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// 5. Students Per Branch — Pie Chart
function renderBranches(data) {
  const card = document.getElementById("card-branches");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-branches");

  const ctx = document.getElementById("chartBranches").getContext("2d");

  chartInstances.branches = new Chart(ctx, {
    type: "pie",
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: PALETTE_SOLIDS,
        borderColor: "#0f0f1a",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart", animateRotate: true },
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 16, font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// 6. Job Postings Trend — Area / Line Chart
function renderJobsTrend(data) {
  const card = document.getElementById("card-jobsTrend");
  card.classList.remove("loading");

  if (!data.labels.length) return showEmpty("card-jobsTrend");

  const ctx = document.getElementById("chartJobsTrend").getContext("2d");

  chartInstances.jobsTrend = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [{
        label: "Jobs Posted",
        data: data.data,
        borderColor: COLORS.violet.solid,
        backgroundColor: createGradient(ctx, COLORS.violet),
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: COLORS.violet.solid,
        pointBorderColor: "#0f0f1a",
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(15, 15, 26, 0.9)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { maxRotation: 45, font: { size: 11 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(99, 102, 241, 0.06)" },
          ticks: { precision: 0 }
        }
      }
    }
  });
}

/* =========================
   UPDATE SUMMARY CARDS
========================= */
function updateSummaryCards(analytics) {
  // Total applications
  const totalApps = analytics.statusBreakdown.data.reduce((a, b) => a + b, 0);
  document.getElementById("summaryTotalApps").textContent = totalApps.toLocaleString();

  // Acceptance rate
  document.getElementById("summaryAcceptRate").textContent = analytics.acceptanceRate + "%";

  // Top skill
  const topSkill = analytics.demandedSkills.labels[0];
  document.getElementById("summaryTopSkill").textContent = topSkill
    ? topSkill.charAt(0).toUpperCase() + topSkill.slice(1)
    : "—";
}

/* =========================
   DESTROY EXISTING CHARTS
========================= */
function destroyCharts() {
  Object.values(chartInstances).forEach(chart => {
    if (chart && typeof chart.destroy === "function") {
      chart.destroy();
    }
  });
  chartInstances = {};

  // Re-add loading state and fresh canvases
  const cards = [
    { id: "card-appsByMonth",     canvasId: "chartAppsByMonth" },
    { id: "card-statusBreakdown", canvasId: "chartStatusBreakdown" },
    { id: "card-skills",          canvasId: "chartSkills" },
    { id: "card-companies",       canvasId: "chartCompanies" },
    { id: "card-branches",        canvasId: "chartBranches" },
    { id: "card-jobsTrend",       canvasId: "chartJobsTrend" }
  ];

  cards.forEach(({ id, canvasId }) => {
    const card = document.getElementById(id);
    if (!card) return;
    card.classList.add("loading");
    const wrapper = card.querySelector(".chart-wrapper");
    wrapper.innerHTML = `<canvas id="${canvasId}"></canvas>`;
  });
}

/* =========================
   LOAD ANALYTICS DATA
========================= */
async function loadAnalytics() {
  try {
    const analytics = await apiRequest("/admin/analytics", "GET");

    // Update summary KPI cards
    updateSummaryCards(analytics);

    // Render all 6 charts
    renderAppsByMonth(analytics.applicationsPerMonth);
    renderStatusBreakdown(analytics.statusBreakdown);
    renderDemandedSkills(analytics.demandedSkills);
    renderCompanyApps(analytics.applicationsPerCompany);
    renderBranches(analytics.studentsPerBranch);
    renderJobsTrend(analytics.jobPostingsTrend);

  } catch (err) {
    console.error("Analytics load failed:", err);
    alert("Failed to load analytics. Please check your admin credentials.");
    window.location.href = "../login.html";
  }
}

/* =========================
   REFRESH BUTTON HANDLER
========================= */
async function refreshAnalytics() {
  const btn = document.getElementById("refreshBtn");
  const icon = btn.querySelector("i");

  // Spin the icon
  icon.style.transition = "transform 0.8s ease";
  icon.style.transform = "rotate(360deg)";

  destroyCharts();
  await loadAnalytics();

  // Reset icon rotation
  setTimeout(() => {
    icon.style.transition = "none";
    icon.style.transform = "rotate(0deg)";
  }, 900);
}

/* =========================
   LOGOUT
========================= */
function logout() {
  if (confirm("Logout from Admin Panel?")) {
    localStorage.removeItem("placementor_session");
    window.location.href = "../login.html";
  }
}

/* =========================
   INITIALIZE
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadAnalytics();
});
