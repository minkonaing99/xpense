<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'dbinfo.php';

// Query to fetch all allowance records ordered by latest date first
$sqltoday = "SELECT * FROM allowance ORDER BY date DESC, allowance_id DESC";

$result = $con->query($sqltoday);

if ($result) {
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode(['success' => true, 'allowances' => $data]);
    $result->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $con->error]);
}

$con->close();
