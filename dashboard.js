// ===============================
// PROFILE PICTURE
// ===============================

const user_image = document.getElementById("profile_picture");
const upload_button = document.getElementById("pictureupload");

if (upload_button && user_image) {
  upload_button.addEventListener("change", async function () {
    const file = upload_button.files[0];

    if (!file) return;

    user_image.src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const response = await fetch("upload_profile_picture.php", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      console.log("Upload PHP Response:", text);

      let result;

      try {
        result = JSON.parse(text);
      } catch (error) {
        throw new Error("Invalid upload PHP response: " + text);
      }

      if (result.success) {
        user_image.src = result.picture;
        alert("Profile picture saved successfully!");
      } else {
        alert(result.message || "Picture upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload Error: " + error.message);
    }
  });
}

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
  console.log("Dashboard DOM Loaded!");
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const apiURL =
      "http://localhost/IEEE%20EMOTIONAL%20INTELIGENCE/get_dashboard_data.php";

    console.log("PAGE URL:", window.location.href);
    console.log("API URL:", apiURL);
    console.log("Fetching dashboard data...");

    const response = await fetch(apiURL, {
      method: "GET",
      cache: "no-store",
    });

    console.log("PHP Status:", response.status);

    // Read response only once
    const responseText = await response.text();

    console.log("PHP Response:", responseText);

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error("Invalid JSON response from PHP: " + responseText);
    }

    console.log("Dashboard Response:", data);

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(data.message || "HTTP Error: " + response.status);
    }

    if (!data.success) {
      throw new Error(data.message || "Unable to fetch dashboard data.");
    }

    // ===============================
    // USER PROFILE
    // ===============================

    if (data.user) {
      document.querySelectorAll(".u_name").forEach(function (element) {
        element.textContent = data.user.full_name || "";
      });

      const emailElement = document.getElementById("emailaddress");

      if (emailElement) {
        emailElement.textContent = data.user.email || "";
      }

      if (data.user.profile_picture && user_image) {
        user_image.src = data.user.profile_picture;
      }
    }

    const testsElement = document.getElementById("testsTaken");

    if (testsElement) {
      testsElement.textContent = (data.tests_taken ?? 0) + " completed";
    }

    // ===============================
    // DEFAULT SCORES
    // ===============================

    let total = 0;
    let social = 0;
    let regulation = 0;
    let openMindedness = 0;
    let taskPerformance = 0;

    // ===============================
    // FETCH CATEGORY SCORES
    // ===============================

    if (data.assessment) {
      total = Number(data.assessment.percentage) || 0;

      let collaborationTotal = 0;
      let collaborationMax = 0;

      let engagementTotal = 0;
      let engagementMax = 0;

      const categories = data.categories || [];

      categories.forEach(function (category) {
        let domain = (category.domain || "").trim().toLowerCase();

        let score = Number(category.total_score) || 0;
        let max = Number(category.max_score) || 0;

        if (domain === "collaboration") {
          collaborationTotal += score;
          collaborationMax += max;
        } else if (domain === "engagement with others") {
          engagementTotal += score;
          engagementMax += max;
        } else if (domain === "emotional regulation") {
          regulation = max > 0 ? (score / max) * 100 : 0;
        } else if (domain === "open-mindedness") {
          openMindedness = max > 0 ? (score / max) * 100 : 0;
        } else if (domain === "task performance") {
          taskPerformance = max > 0 ? (score / max) * 100 : 0;
        }
      });

      // COMBINE SOCIAL SKILLS

      let socialMax = collaborationMax + engagementMax;

      social =
        socialMax > 0
          ? ((collaborationTotal + engagementTotal) / socialMax) * 100
          : 0;
    }

    // ===============================
    // TOTAL SCORE
    // ===============================

    const circleText = document.querySelector(".circle .inner");
    const remarkText = document.querySelector(".scoreremark");

    // UPDATE CIRCULAR PROGRESS

    const circle = document.querySelector(".circle");

    if (circle) {
      const percentage = Math.min(100, Math.max(0, total));

      circle.style.background = `conic-gradient(
    from -90deg,
   #5c8a3c 0%,
 #5c8a3c ${percentage}%,
    rgb(232, 230, 230) ${percentage}%,
    rgb(232, 230, 230) 100%
  )`;
    }

    if (circleText) {
      circleText.textContent = Math.round(total) + "%";
    }

    // ===============================
    // PROGRESS BAR FUNCTION
    // ===============================

    function updateBar(selector, score) {
      let fill = document.querySelector(selector);

      if (fill) {
        fill.style.width = Math.min(100, Math.max(0, score)) + "%";
      }
    }

    // SOCIAL SKILLS

    updateBar(".socialskills .fill", social);

    const score1 = document.getElementById("score1");

    if (score1) {
      score1.textContent = Math.round(social) + "%";
    }

    // EMOTIONAL REGULATION

    updateBar(".emotionalregulation .fill", regulation);

    const score2 = document.getElementById("score2");

    if (score2) {
      score2.textContent = Math.round(regulation) + "%";
    }

    // OPEN-MINDEDNESS

    updateBar(".awarebar .fill", openMindedness);

    const score3 = document.getElementById("score3");

    if (score3) {
      score3.textContent = Math.round(openMindedness) + "%";
    }

    // TASK PERFORMANCE

    updateBar(".emphatybar .fill", taskPerformance);

    const score4 = document.getElementById("score4");

    if (score4) {
      score4.textContent = Math.round(taskPerformance) + "%";
    }

    // ===============================
    // CATEGORY REMARKS
    // ===============================

    const emotionalRemark = document.querySelector(".emotional-remark");

    if (emotionalRemark) {
      emotionalRemark.textContent = getRemark(regulation);
    }

    const discussionRemark = document.querySelector(".discussion-remark");

    if (discussionRemark) {
      discussionRemark.textContent = getRemark(social);
    }

    const awarenessRemark = document.querySelector(".awareness-remark");

    if (awarenessRemark) {
      awarenessRemark.textContent = getRemark(openMindedness);
    }

    const esteemRemark = document.querySelector(".esteem-remark");

    if (esteemRemark) {
      esteemRemark.textContent = getRemark(taskPerformance);
    }

    // ===============================
    // DEBUG SCORES
    // ===============================

    console.log("Total Score:", total);
    console.log("Social Skills:", social);
    console.log("Emotional Regulation:", regulation);
    console.log("Open-Mindedness:", openMindedness);
    console.log("Task Performance:", taskPerformance);
  } catch (error) {
    console.error("ACTUAL DASHBOARD ERROR:", error);

    alert("Dashboard Error:\n" + error.message);
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

if (navbar && nav) {
  navbar.addEventListener("click", () => {
    nav.style.transform = "translateX(-160px)";
  });
}

if (removebar && nav) {
  removebar.addEventListener("click", () => {
    nav.style.transform = "translateX(0)";
  });
}
