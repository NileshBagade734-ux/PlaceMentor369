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