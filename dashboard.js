// ===============================
// PROFILE PICTURE
// ===============================
console.log("DASHBOARD JS FILE LOADED");
const user_image = document.getElementById("profile_picture");
const upload_button = document.getElementById("pictureupload");

upload_button.onchange = function () {
  let file = upload_button.files[0];

  if (file) {
    let url = URL.createObjectURL(file);
    user_image.src = url;
  }
};

// ===============================
// REMARK FUNCTION
// ===============================

function getRemark(value) {
  if (value >= 80) return "Strong";

  if (value >= 65) return "Good";

  if (value >= 40) return "Developing";

  return "Needs Improvement";
}

// ===============================
// FETCH DASHBOARD DATA
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const response = await fetch("get_dashboard_data.php");

    const data = await response.json();

    console.log("Dashboard Response:", data);

    // Check login
    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!data.success) {
      alert(data.message);
      return;
    }

    // ===============================
    // USER PROFILE
    // ===============================

    document.querySelectorAll(".u_name").forEach(function (element) {
      element.textContent = data.user.full_name;
    });

    document.getElementById("emailaddress").textContent = data.user.email;

    document.getElementById("testsTaken").textContent =
      data.tests_taken + " completed";

    // ===============================
    // DEFAULT SCORES
    // ===============================

    let total = 0;

    let social = 0;
    let regulation = 0;
    let self = 0;
    let empathy = 0;

    // ===============================
    // FETCH ASSESSMENT SCORES
    // ===============================

    if (data.assessment) {
      total = Number(data.assessment.percentage);

      data.categories.forEach(function (category) {
        let domain = category.domain.toLowerCase().replace(/[^a-z]/g, "");

        let score = Number(category.percentage);

        if (domain === "socialskills") {
          social = score;
        } else if (domain === "emotionalregulation") {
          regulation = score;
        } else if (domain === "selfawareness") {
          self = score;
        } else if (domain === "empathy") {
          empathy = score;
        }
      });
    }

    // ===============================
    // TOTAL SCORE
    // ===============================

    const circleText = document.querySelector(".circle .inner");

    const remarkText = document.querySelector(".scoreremark");

    circleText.textContent = Math.round(total) + "%";

    remarkText.textContent = getRemark(total);

    // EQ LEVEL
    document.getElementById("eqlevel").textContent =
      getRemark(total) + " (" + Math.round(total) + "/100)";

    // ===============================
    // PROGRESS BARS
    // ===============================

    function updateBar(selector, score) {
      let fill = document.querySelector(selector);

      if (fill) {
        fill.style.width = Math.min(100, Math.max(0, score)) + "%";
      }
    }

    updateBar(".socialskills .fill", social);

    document.getElementById("score1").textContent = Math.round(social) + "%";

    updateBar(".emotionalregulation .fill", regulation);

    document.getElementById("score2").textContent =
      Math.round(regulation) + "%";

    updateBar(".awarebar .fill", self);

    document.getElementById("score3").textContent = Math.round(self) + "%";

    updateBar(".emphatybar .fill", empathy);

    document.getElementById("score4").textContent = Math.round(empathy) + "%";

    // ===============================
    // CATEGORY REMARKS
    // ===============================

    document.querySelector(".emotional-remark").textContent =
      getRemark(regulation);

    document.querySelector(".discussion-remark").textContent =
      getRemark(social);

    document.querySelector(".awareness-remark").textContent = getRemark(self);

    document.querySelector(".esteem-remark").textContent = getRemark(empathy);
  } catch (error) {
    console.error("Dashboard Error:", error);

    alert("Unable to load dashboard data. Please try again.");
  }
}

// ===============================
// LOGOUT
// ===============================

function logout() {
  window.location.href = "logout.php";
}

// ===============================
// AI CONTENT NAVIGATION
// KEEPING EXISTING FUNCTIONALITY
// ===============================

function gotoAipage(type) {
  window.location.href = "AIcontent.html?tab=" + type;
}

// ===============================
// NAVBAR
// ===============================

let navbar = document.getElementById("menuitem");

let nav = document.getElementsByTagName("nav")[0];

let removebar = document.getElementById("cross");

navbar.addEventListener("click", () => {
  nav.style.transform = "translateX(-160px)";
});

removebar.addEventListener("click", () => {
  nav.style.transform = "translateX(0)";
});
