import { apiRequest } from '../utils/api.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../login.html";
    return;
  }

  // DOM Elements
  const setupSection = document.getElementById("setup-section");
  const interviewSection = document.getElementById("interview-section");
  const feedbackSection = document.getElementById("feedback-section");
  
  const setupForm = document.getElementById("setup-form");
  const startBtn = document.getElementById("start-btn");
  
  const currentQuestionEl = document.getElementById("current-question");
  const currentAnswerEl = document.getElementById("current-answer");
  const nextBtn = document.getElementById("next-btn");
  const submitInterviewBtn = document.getElementById("submit-interview-btn");
  const questionCounter = document.getElementById("question-counter");
  
  // State
  let questions = [];
  let currentQuestionIndex = 0;
  let qnaList = [];
  let currentDomain = "";
  let currentType = "";

  setupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const domain = document.getElementById("domain").value.trim();
    const type = document.getElementById("type").value;
    const experience = document.getElementById("experience").value;

    if (!domain) return;

    currentDomain = domain;
    currentType = type;

    startBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Generating...';
    startBtn.disabled = true;

    try {
      const res = await apiRequest("/student/mock-interview/generate", "POST", {
        domain,
        type,
        experienceLevel: experience
      });

      if (res.questions && res.questions.length > 0) {
        questions = res.questions;
        currentQuestionIndex = 0;
        qnaList = [];
        
        setupSection.classList.add("hidden");
        interviewSection.classList.remove("hidden");
        showQuestion();
      } else {
        alert("Failed to generate questions. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server. Is the AI key set up?");
    } finally {
      startBtn.innerHTML = 'Start Mock Interview';
      startBtn.disabled = false;
      lucide.createIcons();
    }
  });

  function showQuestion() {
    currentQuestionEl.textContent = questions[currentQuestionIndex];
    currentAnswerEl.value = "";
    questionCounter.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
    
    if (currentQuestionIndex === questions.length - 1) {
      nextBtn.classList.add("hidden");
      submitInterviewBtn.classList.remove("hidden");
    } else {
      nextBtn.classList.remove("hidden");
      submitInterviewBtn.classList.add("hidden");
    }
  }

  function saveCurrentAnswer() {
    const answer = currentAnswerEl.value.trim();
    qnaList.push({
      question: questions[currentQuestionIndex],
      answer: answer || "No answer provided."
    });
  }

  nextBtn.addEventListener("click", () => {
    saveCurrentAnswer();
    currentQuestionIndex++;
    showQuestion();
  });

  submitInterviewBtn.addEventListener("click", async () => {
    saveCurrentAnswer();
    
    submitInterviewBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Evaluating...';
    submitInterviewBtn.disabled = true;

    try {
      const res = await apiRequest("/student/mock-interview/evaluate", "POST", {
        domain: currentDomain,
        type: currentType,
        qnaList
      });

      if (res.evaluation) {
        interviewSection.classList.add("hidden");
        feedbackSection.classList.remove("hidden");
        displayFeedback(res.evaluation);
      } else {
        alert("Failed to evaluate. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      submitInterviewBtn.innerHTML = 'Submit Interview';
      submitInterviewBtn.disabled = false;
      lucide.createIcons();
    }
  });

  function displayFeedback(evaluation) {
    document.getElementById("score-display").textContent = `${evaluation.score}/100`;
    document.getElementById("general-feedback").textContent = evaluation.feedback;
    
    const tipsList = document.getElementById("tips-list");
    tipsList.innerHTML = "";
    (evaluation.tips || []).forEach(tip => {
      const li = document.createElement("li");
      li.textContent = tip;
      tipsList.appendChild(li);
    });

    const analysisList = document.getElementById("detailed-analysis-list");
    analysisList.innerHTML = "";
    (evaluation.detailedAnalysis || []).forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "bg-white p-5 rounded-lg border border-slate-200 shadow-sm";
      div.innerHTML = `
        <div class="mb-3 border-b border-slate-100 pb-3">
            <p class="text-sm font-semibold text-slate-800 mb-1">Q${index + 1}: ${item.question}</p>
            <p class="text-sm text-slate-600 bg-slate-50 p-3 rounded italic">" ${item.answer} "</p>
        </div>
        <div>
            <p class="text-sm text-indigo-700 flex gap-2"><i data-lucide="message-circle" class="w-4 h-4 mt-0.5"></i> ${item.feedback}</p>
        </div>
      `;
      analysisList.appendChild(div);
    });
    
    lucide.createIcons();
  }

  document.getElementById("retry-btn").addEventListener("click", () => {
    feedbackSection.classList.add("hidden");
    setupSection.classList.remove("hidden");
    document.getElementById("setup-form").reset();
  });

  // Logout functionality
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../login.html";
  });
});
