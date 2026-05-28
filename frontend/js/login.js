/* ==========================================
   INIT ICONS
========================================== */
lucide.createIcons();

/* ==========================================
   ELEMENTS
========================================== */
const loginForm = document.getElementById("loginForm");

const loginBtn = document.getElementById("loginBtn");

const btnText = document.getElementById("btnText");

/* ==========================================
   LOGIN
========================================== */
loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const role = document
        .getElementById("role")
        .value
        .trim()
        .toLowerCase();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value
        .trim();

    /* ==========================================
       VALIDATION
    ========================================== */
    if (!role || !email || !password) {

        alert("Please fill all fields");

        return;
    }

    try {

        /* ==========================================
           BUTTON LOADING
        ========================================== */
        loginBtn.disabled = true;

        btnText.innerText = "Signing In...";

        /* ==========================================
           API CALL
        ========================================== */
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    email,
                    password,
                    role
                }),
            }
        );

        const data = await response.json();

        /* ==========================================
           LOGIN FAILED
        ========================================== */
        if (!response.ok) {

            alert(
                data.message || "Login failed"
            );

            loginBtn.disabled = false;

            btnText.innerText = "Sign In";

            return;
        }

        /* ==========================================
           SAVE SESSION
        ========================================== */
        localStorage.setItem(
            "placementor_session",
            JSON.stringify({
                token: data.token,
                user: data.user,
            })
        );

        /* ==========================================
           REDIRECT
        ========================================== */

        if (data.user.role === "student") {

            window.location.href =
                "student/student-dashboard.html";

        }

        else if (
            data.user.role === "recruiter"
        ) {

            window.location.href =
                "recruiter/recruiter-dashboard.html";

        }

        else if (
            data.user.role === "admin"
        ) {

            window.location.href =
                "admin/admin-dashboard.html";

        }

        else {

            alert("Unknown role");
        }

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert(
            "Server error. Please try again."
        );

        loginBtn.disabled = false;

        btnText.innerText = "Sign In";
    }
});