import { ThemeManager } from "./theme-manager.js";

document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const activeTheme = ThemeManager.toggle();
      toggleBtn.setAttribute("aria-label", `Switch to ${activeTheme === "dark" ? "light" : "dark"} mode`);
    });
  }
});