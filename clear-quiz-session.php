<?php
session_start();

unset(
    $_SESSION['initial_quiz_ids'],
    $_SESSION['initial_quiz_session']
);

echo "Old quiz session cleared. Now open quiz.html again.";
?>