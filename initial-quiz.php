<?php
require_once __DIR__ . "/initiate.php";
session_start();

header("Content-Type: application/json");

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Check login
if (
    !isset($_SESSION['logged_in']) ||
    !isset($_SESSION['user_id'])
) {
    sendResponse(["error" => "Please login first."], 401);
}

$user_id = (int) $_SESSION['user_id'];
$action = $_GET['action'] ?? "";


// ==================================================
// GET: LOAD 15 RANDOM QUESTIONS (ONLY IDs 1 TO 30)
// ==================================================

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'questions') {

    // Reuse existing quiz session only if IDs are 1-30
    if (
        isset($_SESSION['initial_quiz_ids']) &&
        isset($_SESSION['initial_quiz_session']) &&
        count($_SESSION['initial_quiz_ids']) === 15 &&
        count(array_diff($_SESSION['initial_quiz_ids'], range(1, 30))) === 0
    ) {

        $session_id = (int) $_SESSION['initial_quiz_session'];
        $ids = $_SESSION['initial_quiz_ids'];

        $check = $conn->prepare(
            "SELECT session_id
             FROM assessment_sessions
             WHERE session_id = ?
             AND user_id = ?
             AND is_complete = 0"
        );

        $check->bind_param("ii", $session_id, $user_id);
        $check->execute();

        if (!$check->get_result()->num_rows) {
            unset(
                $_SESSION['initial_quiz_ids'],
                $_SESSION['initial_quiz_session']
            );

            sendResponse([
                "error" => "Quiz session is no longer available. Reload the quiz."
            ], 400);
        }

    } else {

        // Remove old invalid session data
        unset(
            $_SESSION['initial_quiz_ids'],
            $_SESSION['initial_quiz_session']
        );

        // Fetch ONLY questions with IDs 1 to 30
        $result = $conn->query(
            "SELECT question_id, question_text, domain,
                    scale_min, scale_max, is_reverse
             FROM questions
             WHERE question_id BETWEEN 1 AND 30"
        );

        if (!$result) {
            sendResponse(["error" => "Could not load questions."], 500);
        }

        $allQuestions = [];

        while ($row = $result->fetch_assoc()) {
            $allQuestions[] = $row;
        }

        if (count($allQuestions) < 15) {
            sendResponse([
                "error" => "At least 15 valid questions are required."
            ], 400);
        }

        // Shuffle all eligible questions
        shuffle($allQuestions);

        // Select 15 random questions
        $selected = array_slice($allQuestions, 0, 15);

        // Store selected question IDs
        $ids = array_map(
            fn($q) => (int) $q['question_id'],
            $selected
        );

        // Create assessment session
        $stmt = $conn->prepare(
            "INSERT INTO assessment_sessions
             (user_id, started_at, is_complete)
             VALUES (?, NOW(), 0)"
        );

        $stmt->bind_param("i", $user_id);

        if (!$stmt->execute()) {
            sendResponse(["error" => "Could not start quiz."], 500);
        }

        $session_id = $conn->insert_id;

        // Save selected IDs in PHP session
        $_SESSION['initial_quiz_ids'] = $ids;
        $_SESSION['initial_quiz_session'] = $session_id;
    }

    // Fetch selected questions in saved order
    $idList = implode(",", array_map('intval', $ids));

    $result = $conn->query(
        "SELECT question_id, question_text, domain,
                scale_min, scale_max, is_reverse
         FROM questions
         WHERE question_id IN ($idList)"
    );

    if (!$result) {
        sendResponse(["error" => "Could not retrieve selected questions."], 500);
    }

    $questions = [];

    while ($row = $result->fetch_assoc()) {
        $questions[$row['question_id']] = $row;
    }

    $orderedQuestions = [];

    foreach ($ids as $id) {
        if (isset($questions[$id])) {
            $orderedQuestions[] = $questions[$id];
        }
    }

    if (count($orderedQuestions) !== 15) {
        sendResponse(["error" => "Some selected questions are missing."], 500);
    }

    sendResponse(["questions" => $orderedQuestions]);
}


// ==================================================
// POST: SAVE ANSWERS AND CALCULATE SCORES
// ==================================================

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'submit') {

    if (
        !isset($_SESSION['initial_quiz_ids']) ||
        !isset($_SESSION['initial_quiz_session'])
    ) {
        sendResponse([
            "error" => "Quiz session not found. Reload the quiz."
        ], 400);
    }

    $ids = $_SESSION['initial_quiz_ids'];
    $session_id = (int) $_SESSION['initial_quiz_session'];

    // Safety check: selected IDs must all be between 1 and 30
    if (
        count($ids) !== 15 ||
        count(array_diff($ids, range(1, 30))) !== 0
    ) {
        sendResponse([
            "error" => "Invalid quiz questions. Reload the quiz."
        ], 400);
    }

    // Read submitted answers
    $data = json_decode(file_get_contents("php://input"), true);
    $answers = $data['answers'] ?? null;

    if (!is_array($answers) || count($answers) !== 15) {
        sendResponse([
            "error" => "Please answer all 15 questions."
        ], 400);
    }

    foreach ($ids as $id) {
        if (!isset($answers[$id]) || !is_numeric($answers[$id])) {
            sendResponse([
                "error" => "An answer is missing."
            ], 400);
        }
    }

    $conn->begin_transaction();

    try {

        // Verify session belongs to logged-in user
        $check = $conn->prepare(
            "SELECT session_id
             FROM assessment_sessions
             WHERE session_id = ?
             AND user_id = ?
             AND is_complete = 0"
        );

        $check->bind_param("ii", $session_id, $user_id);
        $check->execute();

        if (!$check->get_result()->num_rows) {
            throw new Exception("Invalid or completed quiz session.");
        }

        // Fetch only the selected 15 questions
        $idList = implode(",", array_map('intval', $ids));

        $result = $conn->query(
            "SELECT question_id, domain, scale_min,
                    scale_max, is_reverse
             FROM questions
             WHERE question_id IN ($idList)"
        );

        if (!$result) {
            throw new Exception("Could not load question scoring data.");
        }

        $questionData = [];

        while ($row = $result->fetch_assoc()) {
            $questionData[$row['question_id']] = $row;
        }

        $domainScores = [];
        $totalScore = 0;
        $maxScore = 0;

        // Prepare response insert
        $insert = $conn->prepare(
            "INSERT INTO responses
             (session_id, user_id, question_id, response_value, submitted_at)
             VALUES (?, ?, ?, ?, NOW())"
        );

        foreach ($ids as $id) {

            if (!isset($questionData[$id])) {
                throw new Exception("Question not found.");
            }

            $q = $questionData[$id];

            $rawAnswer = (int) $answers[$id];

            $min = (int) $q['scale_min'];
            $max = (int) $q['scale_max'];

            if ($rawAnswer < $min || $rawAnswer > $max) {
                throw new Exception("Invalid answer value.");
            }

            // Reverse scoring
            $scoreAnswer = (int) $q['is_reverse']
                ? ($min + $max - $rawAnswer)
                : $rawAnswer;

            // Calculate points
            $points = $scoreAnswer - $min;
            $possible = $max - $min;

            $domain = $q['domain'];

            if (!isset($domainScores[$domain])) {
                $domainScores[$domain] = [
                    "total" => 0,
                    "max" => 0
                ];
            }

            $domainScores[$domain]['total'] += $points;
            $domainScores[$domain]['max'] += $possible;

            $totalScore += $points;
            $maxScore += $possible;

            // Save original answer
            $insert->bind_param(
                "iiii",
                $session_id,
                $user_id,
                $id,
                $rawAnswer
            );

            if (!$insert->execute()) {
                throw new Exception("Could not save response.");
            }
        }

        // Save domain-wise scores
        $categoryInsert = $conn->prepare(
            "INSERT INTO assessment_category_scores
             (session_id, domain, total_score, max_score)
             VALUES (?, ?, ?, ?)"
        );

        foreach ($domainScores as $domain => $scores) {

            $categoryTotal = $scores['total'];
            $categoryMax = $scores['max'];

            $categoryInsert->bind_param(
                "isdd",
                $session_id,
                $domain,
                $categoryTotal,
                $categoryMax
            );

            if (!$categoryInsert->execute()) {
                throw new Exception("Could not save category scores.");
            }
        }

        // Mark assessment session as complete
        $update = $conn->prepare(
            "UPDATE assessment_sessions
             SET total_score = ?,
                 max_score = ?,
                 completed_at = NOW(),
                 is_complete = 1
             WHERE session_id = ?
             AND user_id = ?"
        );

        $update->bind_param(
            "ddii",
            $totalScore,
            $maxScore,
            $session_id,
            $user_id
        );

        if (!$update->execute()) {
            throw new Exception("Could not complete quiz.");
        }

        // Commit all database changes
        $conn->commit();

        unset(
            $_SESSION['initial_quiz_ids'],
            $_SESSION['initial_quiz_session']
        );

        sendResponse([
            "success" => true,
            "total_score" => $totalScore,
            "max_score" => $maxScore,
            "message" => "Quiz submitted successfully."
        ]);

    } catch (Exception $e) {

        $conn->rollback();

        sendResponse([
            "error" => $e->getMessage()
        ], 400);
    }
}


// Invalid request
sendResponse(["error" => "Invalid request."], 400);

