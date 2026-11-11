
<?php
session_start();
require_once __DIR__ . '/initiate.php';
header('Content-Type: application/json');
if (
    empty($_SESSION['otp_verified']) ||
    empty($_SESSION['reset_email'])
) {
    echo json_encode([
        'success' => false,
        'message' => 'Please verify your OTP first.'
    ]);
    exit;
}

$password = $_POST['password'] ?? '';
$confirm = $_POST['confirm_password'] ?? '';

if (strlen($password) < 8) {
    echo json_encode([
        'success' => false,
        'message' => 'Password must be at least 8 characters.'
    ]);
    exit;
}

if ($password !== $confirm) {
    echo json_encode([
        'success' => false,
        'message' => 'Passwords do not match.'
    ]);
    exit;
}

$email = $_SESSION['reset_email'];
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "UPDATE users SET password = ? WHERE email = ?"
);

$stmt->bind_param("ss", $hashedPassword, $email);

if ($stmt->execute() && $stmt->affected_rows === 1) {

    unset(
        $_SESSION['reset_email'],
        $_SESSION['otp_hash'],
        $_SESSION['otp_expiry'],
        $_SESSION['otp_verified']
    );
    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully!'
    ]);

} else {
    echo json_encode([
        'success' => false,
        'message' => 'Password could not be updated.'
    ]);
}

$stmt->close();
