
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/autoload.php';

function sendOTPEmail($recipient, $otp) {

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;

    // Your new Gmail account
    $mail->Username = '';

    // Your 16-character Google App Password
    $mail->Password = '';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('', 'EQ Lab Support');
    $mail->addAddress($recipient);

    $mail->isHTML(true);
    $mail->Subject = 'EQ Lab - Password Reset OTP';

    $mail->Body = "
        <h2>EQ Lab Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>$otp</h1>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you did not request this, ignore this email.</p>
    ";

    $mail->send();
}
