<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'dbinfo.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $date = $_POST['date'] ?? '';
    $amount_mmk = $_POST['amount_mmk'] ?? '';
    $currency_rate = $_POST['currency_rate'] ?? '';
    $transfer_by = $_POST['transfer_by'] ?? '';
    $total_bhat = $_POST['total_bhat'] ?? '';

    // Validate input
    if (empty($date) || empty($amount_mmk) || empty($currency_rate) || empty($transfer_by) || empty($total_bhat)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }

    $sql = "INSERT INTO allowance (date, amount_mmk, currency_rate, total_bhat, transfer_by) VALUES (?, ?, ?, ?, ?)";
    $stmt = $con->prepare($sql);

    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $con->error]);
        exit;
    }

    // Use correct types: s = string, i = integer, d = double
    $stmt->bind_param("sidds", $date, $amount_mmk, $currency_rate, $total_bhat, $transfer_by);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Allowance added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'DB error: ' . $stmt->error]);
    }

    $stmt->close();
    $con->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
