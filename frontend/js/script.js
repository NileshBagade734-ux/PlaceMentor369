const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");

function openModal(type) {
  if (title && modal) {
    title.innerText =
      type === "student" ? "Student Login" : "Admin Login";

    modal.style.display = "flex";
  }
}

function closeModal() {
  if (modal) {
    modal.style.display = "none";
  }
}

function login(e) {
  e.preventDefault();
  alert("Login successful (demo)");
  closeModal();
}

/* ACCESSIBILITY */
document.querySelectorAll("button, a").forEach((element) => {
  element.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      element.click();
    }
  });
});

/* MOBILE MENU */
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinksTarget = document.getElementById("nav-links-target");
const menuIcon = document.getElementById("menu-icon");

if (mobileMenuBtn && navLinksTarget && menuIcon) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinksTarget.classList.toggle("active");

    const expanded =
      navLinksTarget.classList.contains("active");

    mobileMenuBtn.setAttribute(
      "aria-expanded",
      expanded
    );

    if (expanded) {
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-xmark");
    } else {
      menuIcon.classList.remove("fa-xmark");
      menuIcon.classList.add("fa-bars");
    }
  });
}