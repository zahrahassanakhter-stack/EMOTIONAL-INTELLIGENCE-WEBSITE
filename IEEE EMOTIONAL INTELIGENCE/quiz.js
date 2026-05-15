let questions_array = document.getElementsByClassName("question");
let questionCount = document.getElementById("question_count");
let bar_level = document.getElementsByClassName("fill");
let count = 0;
for (let i = 0; i < questions_array.length; i++) {
  let span_array = questions_array[i].querySelectorAll("span");
  for (let j = 0; j < span_array.length; j++) {
    span_array[j].addEventListener("click", () => {
      for (let k = 0; k < span_array.length; k++) {
        span_array[k].style.background = "none";
        span_array[k].style.border = "1px solid #ccc"; // Default border
      }
      span_array[j].style.border = "2px solid green";
      span_array[j].style.background = "lightgreen";
      if (!questions_array[i].classList.contains("answered")) {
        count = count + 1;
        questions_array[i].classList.add("answered");
        let percentage = (count / questions_array.length) * 100;
        questionCount.textContent = count;
        bar_level[0].style.width = percentage + "%";
      }
    });
  }
}
//submit button
let submit = document.getElementsByClassName("submit")[0];
submit.addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
// codee

// 👇 yahan se tumhara purana quiz code start hoga
document.addEventListener("DOMContentLoaded", function () {
  // all questions
  const allQuestions = document.querySelectorAll(".question");
  const submitBtn = document.querySelector(".submit");

  // score storage
  let scores = {
    self: 0,
    regulation: 0,
    empathy: 0,
    social: 0,
  };

  // each question category mapping
  const questionType = [
    "self",
    "self",
    "self",
    "self",
    "regulation",
    "regulation",
    "regulation",
    "regulation",
    "empathy",
    "empathy",
    "empathy",
    "empathy",
    "social",
    "social",
    "social",
  ];

  // track if question already answered
  let isAnswered = new Array(15).fill(false);

  // loop through questions
  allQuestions.forEach((question, index) => {
    let options = question.querySelectorAll("input");

    options.forEach((option, optionIndex) => {
      option.addEventListener("click", function () {
        // only first selection counts
        if (isAnswered[index] === false) {
          isAnswered[index] = true;

          // value based scoring (1 to 5)
          let points = optionIndex + 1;

          let category = questionType[index];

          scores[category] += points;
        }
      });
    });
  });

  // submit button click
  submitBtn.addEventListener("click", function () {
    // convert to percentage
    let selfScore = (scores.self / 20) * 100;
    let regScore = (scores.regulation / 20) * 100;
    let empScore = (scores.empathy / 20) * 100;
    let socScore = (scores.social / 15) * 100;

    // store in browser
    localStorage.setItem("self", selfScore);
    localStorage.setItem("regulation", regScore);
    localStorage.setItem("empathy", empScore);
    localStorage.setItem("social", socScore);

    // total average score
    let totalScore = (selfScore + regScore + empScore + socScore) / 4;
    localStorage.setItem("total", totalScore);

    // go to dashboard
    window.location.href = "dashboard.html";
  });
});
