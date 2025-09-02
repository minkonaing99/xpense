<?php
// Set timezone to Thailand
date_default_timezone_set('Asia/Bangkok');

// Turn off error reporting for production
error_reporting(0);
ini_set('display_errors', 0);

// Set JSON header
header('Content-Type: application/json');

$correctKey = "merxy";
$cookieName = "xpenses_access";
$cookieValue = "granted";

// Already has access
if (isset($_COOKIE[$cookieName]) && $_COOKIE[$cookieName] === $cookieValue) {
    echo json_encode(['success' => true, 'message' => 'Access granted']);
    exit;
}

// Key check
if (isset($_POST['key']) && $_POST['key'] === $correctKey) {
    // Set cookie for 7 days
    setcookie($cookieName, $cookieValue, time() + (86400 * 7), "/");
    echo json_encode(['success' => true, 'message' => 'Access granted']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid access key']);
}
