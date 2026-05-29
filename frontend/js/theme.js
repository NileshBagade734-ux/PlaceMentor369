const toggleBtn = document.getElementById("theme-toggle");

// Apply theme on load
function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-bs-theme", "dark");
    if (toggleBtn) toggleBtn.innerText = "☀️";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-bs-theme", "light");
    if (toggleBtn) toggleBtn.innerText = "🌙";
  }
}

// Check saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  applyTheme(true);
} else {
  applyTheme(false);
}

// Toggle on click
if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    applyTheme(!isCurrentlyDark);
    localStorage.setItem("theme", !isCurrentlyDark ? "dark" : "light");
  });
}