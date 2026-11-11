
<?php

// Database connection details

$servername = "localhost";
$username = "root";
$password = "";
$database = "eqlab_db";

// Create database connection

$conn = new mysqli(
    $servername,
    $username,
    $password,
    $database
);

// Check connection

if ($conn->connect_error) {

    die("Database connection failed: " . $conn->connect_error);

}

?>