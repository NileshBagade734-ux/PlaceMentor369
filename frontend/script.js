const themeToggle = document.getElementById("theme-toggle");

const applyTheme = (theme) => {
    const themeIcon = themeToggle?.querySelector("i");

    document.body.classList.toggle(
        "dark-mode",
        theme === "dark"
    );

    localStorage.setItem("theme", theme);

    if (themeIcon) {
        if (theme === "dark") {
            themeIcon.classList.replace("fa-moon", "fa-sun");
        } else {
            themeIcon.classList.replace("fa-sun", "fa-moon");
        }
    }
};

const savedTheme = localStorage.getItem("theme") || "light";

applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark =
            document.body.classList.contains("dark-mode");

        applyTheme(isDark ? "light" : "dark");
    });
}
