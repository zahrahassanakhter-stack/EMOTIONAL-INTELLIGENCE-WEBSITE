
<?php

header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . "/initiate.php";

// Check login
if (
    !isset($_SESSION['logged_in']) ||
    $_SESSION['logged_in'] !== true ||
    !isset($_SESSION['user_id'])
) {
    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Please login first."
    ]);

    exit;
}

$user_id = (int) $_SESSION['user_id'];

// Fetch user profile
$stmt = $conn->prepare(
    "SELECT full_name, email
     FROM users
     WHERE user_id = ?
     LIMIT 1"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();

$user_result = $stmt->get_result();
$user = $user_result->fetch_assoc();

$stmt->close();

if (!$user) {
    http_response_code(404);

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

    exit;
}

// Count completed assessments
$stmt = $conn->prepare(
    "SELECT COUNT(*) AS total
     FROM assessment_sessions
     WHERE user_id = ? AND is_complete = 1"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();

$count_result = $stmt->get_result();
$count_data = $count_result->fetch_assoc();

$tests_taken = (int) $count_data['total'];

$stmt->close();

// Fetch latest completed assessment
$stmt = $conn->prepare(
    "SELECT session_id, total_score, max_score
     FROM assessment_sessions
     WHERE user_id = ? AND is_complete = 1
     ORDER BY completed_at DESC, session_id DESC
     LIMIT 1"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();

$assessment_result = $stmt->get_result();
$assessment = $assessment_result->fetch_assoc();

$stmt->close();

$categories = [];
$total_percentage = 0;

if ($assessment) {

    $total_score = (float) $assessment['total_score'];
    $max_score = (float) $assessment['max_score'];

    if ($max_score > 0) {
        $total_percentage = ($total_score / $max_score) * 100;
    }

    // Fetch category scores for this assessment
    $session_id = (int) $assessment['session_id'];

    $stmt = $conn->prepare(
        "SELECT domain, total_score, max_score
         FROM assessment_category_scores
         WHERE session_id = ?"
    );

    $stmt->bind_param("i", $session_id);
    $stmt->execute();

    $category_result = $stmt->get_result();

    while ($row = $category_result->fetch_assoc()) {

        $category_max = (float) $row['max_score'];
        $category_score = (float) $row['total_score'];

        $percentage = 0;

        if ($category_max > 0) {
            $percentage = ($category_score / $category_max) * 100;
        }

        $categories[] = [
            "domain" => $row['domain'],
            "total_score" => $category_score,
            "max_score" => $category_max,
            "percentage" => round($percentage, 2)
        ];
    }

    $stmt->close();

    $assessment['percentage'] = round($total_percentage, 2);
}

// Return all dashboard data
echo json_encode([
    "success" => true,

    "user" => [
        "full_name" => $user['full_name'],
        "email" => $user['email']
    ],

    "tests_taken" => $tests_taken,

    "assessment" => $assessment,

    "categories" => $categories
]);

?>
