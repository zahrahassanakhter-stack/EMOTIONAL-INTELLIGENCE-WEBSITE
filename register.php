
<?php
require_once __DIR__ . '/initiate.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Receive form data
    $name = trim($_POST['full_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';
    // Validate fields
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        $error = "Please fill in all fields.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please enter a valid email address.";
    } elseif (strlen($password) < 8) {
        $error = "Password must be at least 8 characters.";
    } elseif ($password !== $confirm_password) {
        $error = "Passwords do not match.";
    } else {

        // Check whether email already exists
        $stmt = $conn->prepare(
            "SELECT user_id FROM users WHERE email = ?"
        );

        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $error = "Email already exists. Please login.";

        } else {

            $stmt->close();

            // Hash password
            $hashed_password = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            // Insert user into database
            $stmt = $conn->prepare(
                "INSERT INTO users (full_name, email, password)
                 VALUES (?, ?, ?)"
            );

            $stmt->bind_param(
                "sss",
                $name,
                $email,
                $hashed_password
            );

            if ($stmt->execute()) {
                $stmt->close();

                echo "<script>
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                </script>";
                exit();
            } else {

                $error = "Registration failed: " . $stmt->error;

            }
        }

        $stmt->close();
    }

    // Show error message
    if (isset($error)) {

        echo "<script>
            alert(" . json_encode($error) . ");
            window.location.href = 'register.html';
        </script>";
        exit();
    }

} else {
    header("Location: register.html");
    exit();
}

?>
