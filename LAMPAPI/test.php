<?php
// Enable full error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get input data
$inData = getRequestInfo();

// Log raw input to a file (for debugging)
file_put_contents("raw_input.txt", print_r($inData, true));

// Check if input is valid
if ($inData === null || !isset($inData["login"]) || !isset($inData["password"])) {
    returnWithError("Invalid JSON input or missing login/password");
    exit();
}

// Extract login and password
$login = $inData["login"];
$password = $inData["password"];

// Connect to MySQL
$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "ContactManagerDB");

if ($conn->connect_error) {
    returnWithError($conn->connect_error);
} else {
    // Prepare and execute SQL query
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName FROM Users WHERE Login=? AND Password=?");
    $stmt->bind_param("ss", $login, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check for matching user
    if ($row = $result->fetch_assoc()) {
        returnWithInfo($row['FirstName'], $row['LastName'], $row['ID']);
    } else {
        returnWithError("No Records Found");
    }

    // Clean up
    $stmt->close();
    $conn->close();
}

// Helper functions

function getRequestInfo() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err) {
    $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($firstName, $lastName, $id) {
    $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
    sendResultInfoAsJson($retValue);
}
?>
