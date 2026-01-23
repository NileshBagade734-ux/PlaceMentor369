const modal = document.getElementById("modal");
const title = document.getElementById("modal-title");

function openModal(type) {
  title.innerText = type === "student" ? "Student Login" : "Admin Login";
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

function login(e) {
  e.preventDefault();
  alert("Login successful (demo)");
  closeModal();
}