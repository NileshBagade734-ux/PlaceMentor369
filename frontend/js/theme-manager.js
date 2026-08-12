/**
 * Theme Manager Utility — Handles persistent dark/light theme switching,
 * system color scheme preference listeners, and DOM theme attribute toggles.
 */
export const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
    this.applyTheme(theme);

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.applyTheme(e.matches ? "dark" : "light");
      }
    });
  },

  applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body?.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body?.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  },

  toggle() {
    const current = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    this.applyTheme(next);
    return next;
  }
};
