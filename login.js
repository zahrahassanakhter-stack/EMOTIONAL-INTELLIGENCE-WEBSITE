let login_Email = document.getElementById("mail");
let login_passwrd = document.getElementById("pswrd");

let save_email = localStorage.getItem("email");
let save_password = localStorage.getItem("password");
function gotohome() {
  document.getElementById("errormsg").style.display = "block";
  if (
    login_Email.value === save_email &&
    login_passwrd.value === save_password
  ) {
    // 🔥 OLD QUIZ DATA DELETE

    window.location.href = "aboutus.html";
  } else
    document.getElementById("errormsg").textContent =
      "Invalid Email or Password. Please try again.";
}

// show password
function seepassword() {
  let password = document.getElementById("pswrd");
  if (password.type == "password") {
    password.type = "text";
    document.getElementsByClassName("fa-eye")[0].style.display = "block";
    document.getElementsByClassName("fa-eye-low-vision")[0].style.display =
      "none";
  }
}
function hidepasswrd() {
  let password = document.getElementById("pswrd");
  if (password.type == "text") {
    password.type = "password";
    document.getElementsByClassName("fa-eye")[0].style.display = "none";
    document.getElementsByClassName("fa-eye-low-vision")[0].style.display =
      "block";
  }
}
