// logout btn
document.addEventListener("DOMContentLoaded", function () {
  // NAV MENU
  const navbar = document.getElementById("menuitem");
  const nav = document.querySelector("nav");
  const removebar = document.getElementById("cross");

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

  // HEADER / LOGIN SYSTEM
  const leftbar = document.getElementById("leftbar");
  const logoutBtn = document.getElementById("logoutBtn");
  const arrow = document.getElementById("toggleArrow");
  const usernameText = document.getElementById("username");

  let save_name = localStorage.getItem("username");

  console.log("USER:", save_name);

  if (save_name) {
    leftbar.style.display = "flex";
    usernameText.innerText = save_name;
  } else {
    leftbar.style.display = "none";
  }

  // toggle logout
  arrow?.addEventListener("click", () => {
    logoutBtn.style.display =
      logoutBtn.style.display === "block" ? "none" : "block";
  });

  // logout
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("username");
    leftbar.style.display = "none";
  });
});
