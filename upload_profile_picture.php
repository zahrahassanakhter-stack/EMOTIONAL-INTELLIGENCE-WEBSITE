
<?php

header("Content-Type: application/json");

session_start();
require_once __DIR__ . "/initiate.php";

// Check login
if (!isset($_SESSION['logged_in']) || !isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);
    exit;
}

$user_id = (int) $_SESSION['user_id'];

// Check database connection
if (!$conn) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);
    exit;
}

// Check uploaded file
if (!isset($_FILES['profile_picture'])) {
    echo json_encode([
        "success" => false,
        "message" => "Please select a picture."
    ]);
    exit;
}

$file = $_FILES['profile_picture'];

// Check upload error
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode([
        "success" => false,
        "message" => "Upload error: " . $file['error']
    ]);
    exit;
}

// Maximum size: 5 MB
if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode([
        "success" => false,
        "message" => "Picture must be smaller than 5 MB."
    ]);
    exit;
}

// Check actual image type
$allowed_types = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

$file_info = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($file_info, $file['tmp_name']);
finfo_close($file_info);

if (!in_array($mime_type, $allowed_types)) {
    echo json_encode([
        "success" => false,
        "message" => "Only JPG, PNG and WEBP pictures are allowed."
    ]);
    exit;
}

// Check image dimensions
$image_size = getimagesize($file['tmp_name']);

if (!$image_size) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid image file."
    ]);
    exit;
}

// Create upload folder
$folder = __DIR__ . "/uploads/profile_pictures/";

if (!is_dir($folder)) {
    mkdir($folder, 0755, true);
}

// Get old picture path before updating database
$stmt = $conn->prepare(
    "SELECT profile_picture FROM users WHERE user_id = ?"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

$stmt->close();

$old_picture = $user['profile_picture'] ?? null;

// Generate unique filename
$file_name = "user_" . $user_id . "_" .
             bin2hex(random_bytes(8)) . ".jpg";

$destination = $folder . $file_name;

$file_path = "uploads/profile_pictures/" . $file_name;

// Load uploaded image
switch ($mime_type) {

    case "image/jpeg":
        $source = imagecreatefromjpeg($file['tmp_name']);
        break;

    case "image/png":
        $source = imagecreatefrompng($file['tmp_name']);
        break;

    case "image/webp":
        $source = imagecreatefromwebp($file['tmp_name']);
        break;

    default:
        $source = false;
}

if (!$source) {
    echo json_encode([
        "success" => false,
        "message" => "Could not process image. Check PHP GD extension."
    ]);
    exit;
}

// Resize image if larger than 1200 x 1200
$width = imagesx($source);
$height = imagesy($source);

$max_dimension = 1200;

$ratio = min(
    $max_dimension / $width,
    $max_dimension / $height,
    1
);

$new_width = (int) ($width * $ratio);
$new_height = (int) ($height * $ratio);

$new_image = imagecreatetruecolor($new_width, $new_height);

// White background for transparent images
$white = imagecolorallocate($new_image, 255, 255, 255);
imagefill($new_image, 0, 0, $white);

imagecopyresampled(
    $new_image,
    $source,
    0, 0, 0, 0,
    $new_width, $new_height,
    $width, $height
);

// Compress and save as JPEG
$saved = imagejpeg($new_image, $destination, 80);

imagedestroy($source);
imagedestroy($new_image);

if (!$saved) {
    echo json_encode([
        "success" => false,
        "message" => "Could not save compressed picture."
    ]);
    exit;
}

// Update database with new picture path
$stmt = $conn->prepare(
    "UPDATE users SET profile_picture = ? WHERE user_id = ?"
);

if (!$stmt) {
    unlink($destination);

    echo json_encode([
        "success" => false,
        "message" => "Database query error: " . $conn->error
    ]);
    exit;
}

$stmt->bind_param("si", $file_path, $user_id);

if ($stmt->execute()) {

    // Delete old picture only after successful database update
    if (!empty($old_picture)) {

        $old_file = __DIR__ . "/" . $old_picture;

        // Only delete files inside this user's profile picture folder
        $real_folder = realpath($folder);
        $real_old_file = realpath($old_file);

        if (
            $real_old_file &&
            $real_folder &&
            strpos($real_old_file, $real_folder . DIRECTORY_SEPARATOR) === 0
        ) {
            unlink($real_old_file);
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Profile picture saved successfully!",
        "picture" => $file_path
    ]);

} else {

    // Remove new file if database update fails
    unlink($destination);

    echo json_encode([
        "success" => false,
        "message" => "Database update failed: " . $stmt->error
    ]);
}

$stmt->close();

?>
