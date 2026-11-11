
<?php
session_start();

header('Content-Type: application/json');

$otp = trim($_POST['otp'] ?? '');

if (
    empty($_SESSION['otp_hash']) ||
    empty($_SESSION['reset_email']) ||
    !isset($_SESSION['otp_expiry'])
) {
    echo json_encode([
        'success' => false,
        'message' => 'Please request a new OTP.'
    ]);
    exit;
}

if (time() > $_SESSION['otp_expiry']) {
    unset(
        $_SESSION['otp_hash'],
        $_SESSION['otp_expiry'],
        $_SESSION['otp_verified']
    );

    echo json_encode([
        'success' => false,
        'message' => 'OTP expired. Request a new one.'
    ]);
    exit;
}

if (!password_verify($otp, $_SESSION['otp_hash'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Incorrect OTP.'
    ]);
    exit;
}

$_SESSION['otp_verified'] = true;

echo json_encode([
    'success' => true,
    'message' => 'OTP verified successfully.'
]);
