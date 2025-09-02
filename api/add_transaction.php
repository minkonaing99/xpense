<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'dbinfo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['date'] ?? '';
    $category = $_POST['category'] ?? '';
    $details = $_POST['details'] ?? '';
    $amount = $_POST['amount'] ?? '';

    // Validate input
    if (empty($date) || empty($category) || empty($details) || empty($amount)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    $sql = "INSERT INTO transactions (date, category, details, amount) VALUES (?, ?, ?, ?)";
    $stmt = $con->prepare($sql);

    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $con->error]);
        exit;
    }

    $stmt->bind_param("sssi", $date, $category, $details, $amount);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Transaction added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $stmt->error]);
    }

    $stmt->close();
    $con->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
