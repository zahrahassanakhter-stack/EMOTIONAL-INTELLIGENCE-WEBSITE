let questions = [];
let currentQuestion = 0;
let answers = {};

const questionText = document.getElementById("quiz-questions");
const questionCount = document.getElementById("question_count");
const progressBar = document.querySelector(".fill");
const backBtn = document.querySelector(".backtoold");
const nextBtn = document.querySelector(".nextstatement");
const radioButtons = document.querySelectorAll('.question input[type="radio"]');
const optionSpans = document.querySelectorAll(".question label span");

async function loadQuestions() {
  try {
    const response = await fetch("initial-quiz.php?action=questions");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load questions.");
    }

    questions = data.questions;
    showQuestion();
  } catch (error) {
    alert(error.message);
  }
}

function showQuestion() {
  const q = questions[currentQuestion];

  questionText.textContent = q.question_text;

  questionCount.textContent = currentQuestion + 1;

  progressBar.style.width =
    ((currentQuestion + 1) / questions.length) * 100 + "%";

  backBtn.disabled = currentQuestion === 0;

  nextBtn.textContent =
    currentQuestion === questions.length - 1 ? "Submit" : "Next";

  radioButtons.forEach((radio, index) => {
    const value = Number(q.scale_min) + index;

    radio.value = value;
    radio.disabled = value > Number(q.scale_max);
    radio.checked = Number(answers[q.question_id]) === value;

    optionSpans[index].style.background = radio.checked
      ? "rgba(45,80,22,0.06)"
      : "none";

    optionSpans[index].style.border = radio.checked
      ? "1px solid #2d5016"
      : "1px solid #ccc";
  });
}

// Save selected answer
radioButtons.forEach((radio) => {
  radio.addEventListener("change", function () {
    const q = questions[currentQuestion];

    answers[q.question_id] = Number(this.value);

    showQuestion();
  });
});

// Next or Submit
nextBtn.addEventListener("click", async function () {
  const q = questions[currentQuestion];

  if (answers[q.question_id] === undefined) {
    alert("Please select an answer first.");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    await submitQuiz();
  }
});

// Back button
backBtn.addEventListener("click", function () {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion();
  }
});

// Send answers to PHP
async function submitQuiz() {
  nextBtn.disabled = true;

  try {
    const response = await fetch("initial-quiz.php?action=submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: answers,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not submit quiz.");
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    alert(error.message);
    nextBtn.disabled = false;
  }
}

// Start quiz
loadQuestions();
