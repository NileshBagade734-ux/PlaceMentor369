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
        item.classList.toggle("journey-focused");
      }
    });
  });
})();
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