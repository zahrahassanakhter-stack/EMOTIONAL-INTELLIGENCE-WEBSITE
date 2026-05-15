// upload picture
const user_image = document.getElementById("profile_picture");
const upload_button = document.getElementById("pictureupload");
upload_button.onchange = function () {
  let file = upload_button.files[0];
  let url = URL.createObjectURL(file);
  user_image.src = url;
};
//fetch save data from register page
let save_name = localStorage.getItem("username");
let save_email = localStorage.getItem("email");
document.getElementsByClassName("u_name")[0].textContent = save_name;
document.getElementsByClassName("u_name")[1].textContent = save_name;
document.getElementById("emailaddress").textContent = " " + save_email;
//logout
function logout() {
  window.location.href = "login.html";
}

//aicontent
function gotoAipage(type) {
  window.location.href = "AIcontent.html?tab=" + type;
}
//nav bar

let navbar = document.getElementById("menuitem");
let nav = document.getElementsByTagName("nav")[0];
let removebar = document.getElementById("cross");
navbar.addEventListener("click", () => {
  nav.style.transform = "translateX(-160px)";
});
removebar.addEventListener("click", () => {
  nav.style.transform = "translateX(0)";
});
//codee
document.addEventListener("DOMContentLoaded", function () {
  // get data from storage
  let self = Number(localStorage.getItem("self")) || 0;
  let regulation = Number(localStorage.getItem("regulation")) || 0;
  let empathy = Number(localStorage.getItem("empathy")) || 0;
  let social = Number(localStorage.getItem("social")) || 0;
  let total = Number(localStorage.getItem("total")) || 0;

  // helper function for remark
  function getRemark(value) {
    if (value >= 75) return "Strong";
    if (value >= 50) return "Good";
    if (value >= 30) return "Improving";
    return "Weak";
  }

  // ===== TOTAL SCORE =====
  const circleText = document.querySelector(".circle .inner");
  const remarkText = document.querySelector(".scoreremark");

  circleText.textContent = Math.round(total) + "%";
  remarkText.textContent = getRemark(total);

  // ===== PROGRESS BARS =====
  document.querySelector(".socialskills .fill").style.width = social + "%";
  document.querySelector("#score1").textContent = Math.round(social) + "%";

  document.querySelector(".emotionalregulation .fill").style.width =
    regulation + "%";
  document.querySelector("#score2").textContent = Math.round(regulation) + "%";

  document.querySelector(".awarebar .fill").style.width = self + "%";
  document.querySelector("#score3").textContent = Math.round(self) + "%";

  document.querySelector(".emphatybar .fill").style.width = empathy + "%";
  document.querySelector("#score4").textContent = Math.round(empathy) + "%";

  // ===== CARD REMARKS =====
  document.querySelector(".emotional-remark").textContent =
    getRemark(regulation);
  document.querySelector(".discussion-remark").textContent = getRemark(social);
  document.querySelector(".awareness-remark").textContent = getRemark(self);
  document.querySelector(".esteem-remark").textContent = getRemark(empathy);
});
