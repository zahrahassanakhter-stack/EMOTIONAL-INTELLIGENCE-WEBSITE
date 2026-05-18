let questions_array = document.getElementsByClassName("question");
let questionCount = document.getElementById("question_count");
let bar_level = document.getElementsByClassName("fill");
let quizquestions = document.getElementById("quiz-questions");
let backbtn = document.getElementsByClassName("backtoold")[0];
let nextbtn = document.getElementsByClassName("nextstatement")[0];

let questionbank = [
  "1. I understand my emotions as they happen in real time.",
  "2. I can stay calm under pressure and high-stress situations.",
  "3. I pick up on the emotions of others without them saying anything.",
  "4. I adjust my communication style based on who I'm talking to.",
  "5. I can identify what triggers my negative emotional reactions.",
  "6. I take responsibility for my emotional reactions rather than blaming others.",
  "7. I listen actively without interrupting or planning my response.",
  "8. I recover quickly after emotional setbacks or disappointments.",
  "9. I feel comfortable expressing my emotions in appropriate settings.",
  "10. I notice when others are uncomfortable even if they don't say so.",
  "11. I can delay gratification to achieve longer-term goals.",
  "12. I maintain positive relationships even during conflict.",
  "13. I reflect on my emotions and what they tell me about myself.",
  "14. I adapt well to unexpected changes or new situations.",
  "15. I motivate myself even when tasks feel difficult or boring.",
];

let count = 0;
let currentquestion = 0;
let answers = [];

quizquestions.textContent = questionbank[0];
for (let i = 0; i < questionbank.length; i++) {
  answers[i] = false;
}

nextbtn.addEventListener("click", nextstatement);
function nextstatement() {
  if (answers[currentquestion] == false) {
    return;
  }
  if (currentquestion < questionbank.length - 1) {
    currentquestion++;
    quizquestions.textContent = questionbank[currentquestion];
    progressbarincrease(count++);
  }
  for (let i = 0; i < questions_array.length; i++) {
    let span_array = questions_array[i].querySelectorAll("span");
    for (let j = 0; j < span_array.length; j++) {
      span_array[j].style.background = "none";
      span_array[j].style.border = "1px solid #ccc"; // Default border
    }
  }
}
backbtn.addEventListener("click", previousstatement);
function previousstatement() {
  if (currentquestion > 0) {
    currentquestion--;
    quizquestions.textContent = questionbank[currentquestion];
    progressbarincrease(count--);
  }
}
// progress bar increase kro

let span_array = document.querySelectorAll("span");
for (let j = 0; j < span_array.length; j++) {
  span_array[j].addEventListener("click", () => {
    for (let k = 0; k < span_array.length; k++) {
      span_array[k].style.background = "none";
      span_array[k].style.border = "1px solid #ccc"; // Default border
    }
    span_array[j].style.border = "1px solid #2d5016";
    span_array[j].style.background = " rgba(45,80,22,0.06)";
    if (answers[currentquestion] == false) {
      answers[currentquestion] = j;
    }
  });
}

function progressbarincrease() {
  let percentage = (count / questionbank.length) * 100;
  questionCount.textContent = count;
  bar_level[0].style.width = percentage + "%";
}

//submit button
// let submit = document.getElementsByClassName("submit")[0];
// submit.addEventListener("click", () => {
//   window.location.href = "dashboard.html";
// });
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
    // window.location.href = "dashboard.html";
  });
});
