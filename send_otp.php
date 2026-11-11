
<?php
session_start();

require_once __DIR__ . '/initiate.php';
require_once __DIR__ . '/mail_config.php';

header('Content-Type: application/json');

$email = trim($_POST['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email.'
    ]);
    exit;
}

// Check whether email exists
$stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    echo json_encode([
        'success' => false,
        'message' => 'Email not found.'
    ]);
    exit;
}

$otp = (string) random_int(100000, 999999);

try {
    sendOTPEmail($email, $otp);

    $_SESSION['reset_email'] = $email;
    $_SESSION['otp_hash'] = password_hash($otp, PASSWORD_DEFAULT);
    $_SESSION['otp_expiry'] = time() + 300;
    $_SESSION['otp_verified'] = false;

    echo json_encode([
        'success' => true,
        'message' => 'OTP sent successfully. Check your email.'
    ]);

} catch (Exception $e) {
    error_log($e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Email could not be sent. Please try again.'
    ]);
}

$stmt->close();
