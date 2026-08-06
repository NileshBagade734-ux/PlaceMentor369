const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
  const themeIcon = themeToggle.querySelector("i");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  }

  themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
      themeIcon.classList.replace("fa-moon", "fa-sun");
    } else {
      localStorage.setItem("theme", "light");
      themeIcon.classList.replace("fa-sun", "fa-moon");
    }
  });
}
/* ============================================================
   PLACEMENT JOURNEY — Scroll Reveal
   Paste this at the BOTTOM of script.js
   (or just before the closing </script> tag in index.html)
   ============================================================ */

(function () {
  const revealItems = document.querySelectorAll(".journey-reveal");

  if (!revealItems.length) return;

  // Use IntersectionObserver for smooth scroll reveal
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // Stagger each card slightly
          const index = Array.from(revealItems).indexOf(entry.target);
          setTimeout(function () {
            entry.target.classList.add("is-visible");
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 0px 0px",
    }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });

  // Keyboard accessibility — Enter/Space triggers focus styles
  revealItems.forEach(function (item) {
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        item.focus();
      }
    });
  });
})();

/**
 * Job Recommendation Engine Client Integration
 */
async function fetchJobRecommendations() {
  const container = document.getElementById("recommendations-container");
  if (!container) return;

  try {
    const session = JSON.parse(localStorage.getItem("placementor_session") || "{}");
    const token = session.token;

    const res = await fetch("http://localhost:5000/api/student/recommended-jobs", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) return;
    const data = await res.json();
    if (!data.jobs || !data.jobs.length) return;

    container.innerHTML = data.jobs.map(job => `
      <div class="job-recommendation-card border p-4 rounded-xl shadow-sm hover:shadow-md transition bg-white dark:bg-slate-800 mb-4">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-bold text-lg text-indigo-600">${job.title}</h4>
            <p class="text-xs text-slate-500">${job.company} • ${job.location || 'Remote'}</p>
          </div>
          <span class="px-3 py-1 text-xs font-extrabold rounded-full ${
            job.matchScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
            job.matchScore >= 65 ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }">
            ${job.matchScore}% Match
          </span>
        </div>
        <p class="text-xs text-slate-600 mt-2">${job.description ? job.description.slice(0, 120) + '...' : ''}</p>
        <div class="mt-3 flex flex-wrap gap-1">
          ${(job.matchingSkills || []).map(s => `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-semibold">✓ ${s}</span>`).join('')}
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load recommendations:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchJobRecommendations();
});



// Function to update the reading progress bar position
function updateReadingProgressBar() {
  const progressBar = document.getElementById('readingProgressIndicator');
  if (!progressBar) return; 

  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
  
  progressBar.style.width = `${scrolled}%`;
}

// Attach optimized passive scroll listener
window.addEventListener('scroll', updateReadingProgressBar, { passive: true });

// Utility function to dynamically highlight matching text queries
function highlightSearchKeywords(element, query) {
  if (!element.getAttribute('data-original-text')) {
    element.setAttribute('data-original-text', element.innerHTML);
  }

  const originalContent = element.getAttribute('data-original-text');

  if (!query.trim()) {
    element.innerHTML = originalContent; // 
    return;
  }

  try {
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    element.innerHTML = originalContent.replace(regex, '<mark class="custom-highlight">$1</mark>');
  } catch (error) {
    console.error("Highlighting error:", error);
  }
}
// Live Search Filtering for Success Metrics Layout
document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("metricSearchInput");
  if (!searchBar) return; 

  // Select all target metric cards matching the actual repository structure
  const cards = document.querySelectorAll(".metric-card");

  searchBar.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    const lowerQuery = query.toLowerCase();

    cards.forEach((card) => {
      // Look inside headings and descriptive sub-paragraphs inside the metric card
      const heading = card.querySelector("h2");
      const paragraph = card.querySelector("p");
      if (!heading || !paragraph) return;

      // Match queries inside both the numeric values and text descriptions
      const targetText = `${heading.textContent} ${paragraph.textContent}`.toLowerCase();

      if (targetText.includes(lowerQuery)) {
        card.style.display = ""; // Show card
        
        // Highlight logic applied on descriptions for search context clarity
        highlightSearchKeywords(paragraph, query);
      } else {
        card.style.display = "none"; // Hide card
      }
    });
  });
});

