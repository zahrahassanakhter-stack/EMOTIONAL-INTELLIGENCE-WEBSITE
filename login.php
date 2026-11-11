
<?php

// Database connection file
require_once __DIR__ . '/initiate.php';

// Session start
session_start();

// Check if login form was submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    // Get email and password from login form
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Check empty fields
    if (empty($email) || empty($password)) {
        echo "<script>
                alert('Please enter email and password.');
                window.location.href = 'login.html';
              </script>";
        exit();
    }

    // Search user by email
    $stmt = $conn->prepare(
        "SELECT user_id, full_name, email, password FROM users WHERE email = ?"
    );

    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();

    // Check if user exists
    if ($result->num_rows == 1) {

        $user = $result->fetch_assoc();

        // Verify entered password with hashed password
        if (password_verify($password, $user['password'])) {

            // Save user information in session
            $_SESSION['logged_in'] = true;
            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['email'] = $user['email'];

            $stmt->close();

            // Go to aboutus
           header("Location: aboutus.html");
            exit();

        } else {
            echo "<script>
                    alert('Incorrect password!');
                    window.location.href = 'login.html';
                  </script>";
        }

    } else {
        echo "<script>
                alert('Email not found! Please register first.');
                window.location.href = 'login.html';
              </script>";
    }

    $stmt->close();

} else {

    // If someone opens login.php directly
    header("Location: login.html");
    exit();
}

?>
