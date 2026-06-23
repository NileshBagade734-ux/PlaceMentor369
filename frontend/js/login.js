document.addEventListener("DOMContentLoaded", () => {
if (window.lucide) lucide.createIcons();

if (window.gsap) {
gsap.to("#login-card", {
opacity: 1,
y: 0,
duration: 0.8,
ease: "power3.out",
});
}
});

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const passwordToggleBtn = document.getElementById("togglePassword");
const btnText = document.getElementById("btnText");
const passwordField = document.getElementById("password");
const roleField = document.getElementById("role");
const emailField = document.getElementById("email");

// =========================
// Validation Helpers
// =========================

function showError(field) {
field.classList.add("is-invalid");
field.classList.remove("is-valid");
}

function showSuccess(field) {
field.classList.remove("is-invalid");
field.classList.add("is-valid");
}

function validateRole(field) {
if (!field.value) {
showError(field);
return false;
}
showSuccess(field);
return true;
}

function validateEmail(field) {
const ok = /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(field.value.trim());

if (!field.value.trim() || !ok) {
showError(field);
return false;
}

showSuccess(field);
return true;
}

function validatePassword(field) {
if (field.value.length < 6) {
showError(field);
return false;
}

showSuccess(field);
return true;
}

// =========================
// Live Validation
// =========================

roleField?.addEventListener("change", () => validateRole(roleField));
emailField?.addEventListener("input", () => validateEmail(emailField));
passwordField?.addEventListener("input", () => validatePassword(passwordField));

// =========================
// Password Toggle
// =========================

passwordToggleBtn?.addEventListener("click", () => {
const isPassword = passwordField.type === "password";

passwordField.type = isPassword ? "text" : "password";

const icon = passwordToggleBtn.querySelector("[data-lucide]");

if (icon) {
icon.setAttribute(
"data-lucide",
isPassword ? "eye-off" : "eye"
);

```
if (window.lucide) {
  lucide.createIcons();
}
```

}
});

// =========================
// Login Submit
// =========================

loginForm?.addEventListener("submit", async (e) => {
e.preventDefault();

const roleOk = validateRole(roleField);
const emailOk = validateEmail(emailField);
const passwordOk = validatePassword(passwordField);

if (!roleOk || !emailOk || !passwordOk) return;

loginBtn.disabled = true;
btnText.textContent = "Authenticating...";

try {
const res = await fetch(
"http://localhost:5000/api/auth/login",
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
email: emailField.value.trim(),
password: passwordField.value,
role: roleField.value,
}),
}
);

```
const data = await res.json();

if (!res.ok) {
  alert(data.message || "Login failed");
  return;
}

localStorage.setItem(
  "placementor_session",
  JSON.stringify({
    token: data.token,
    user: data.user,
  })
);

if (data.user.role === "admin") {
  window.location.href = "/admin/admin-dashboard.html";
} else if (data.user.role === "recruiter") {
  window.location.href =
    "/recruiter/recruiter-dashboard.html";
} else {
  window.location.href =
    "/student/student-dashboard.html";
}
```

} catch (err) {
console.error("Login Error:", err);
alert("Server error. Try again later.");
} finally {
loginBtn.disabled = false;
btnText.textContent = "Sign In";
}
});

