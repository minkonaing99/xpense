<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

include_once 'dbinfo.php';

try {
    // Get all transactions for chart data
    $sql = "SELECT * FROM transactions ORDER BY date DESC";
    $result = $con->query($sql);

    if (!$result) {
        throw new Exception('Database error: ' . $con->error);
    }

    $transactions = [];
    while ($row = $result->fetch_assoc()) {
        // Ensure amount is properly formatted as float
        $row['amount'] = floatval($row['amount']);
        $transactions[] = $row;
    }

    // Get category totals for pie chart
    $categorySql = "SELECT category, SUM(amount) AS total FROM transactions GROUP BY category ORDER BY total DESC";
    $categoryResult = $con->query($categorySql);

    $categoryData = [];
    if ($categoryResult) {
        while ($row = $categoryResult->fetch_assoc()) {
            $categoryData[] = [
                'category' => $row['category'] ?: 'Uncategorized',
                'total' => floatval($row['total'])
            ];
        }
    }

    // Get daily spending data for line chart
    $dailySql = "SELECT date, SUM(amount) AS daily_total FROM transactions GROUP BY date ORDER BY date ASC";
    $dailyResult = $con->query($dailySql);

    $dailyData = [];
    if ($dailyResult) {
        while ($row = $dailyResult->fetch_assoc()) {
            $dailyData[] = [
                'date' => $row['date'],
                'daily_total' => floatval($row['daily_total'])
            ];
        }
    }

    // Calculate summary statistics
    $totalSpent = array_sum(array_column($transactions, 'amount'));
    $totalTransactions = count($transactions);
    $uniqueCategories = count($categoryData);

    // Calculate average daily spending
    $averageDaily = 0;
    if (count($dailyData) > 0) {
        $averageDaily = $totalSpent / count($dailyData);
    }

    // Get date range
    $dateRange = ['start' => null, 'end' => null];
    if (!empty($transactions)) {
        $dates = array_column($transactions, 'date');
        $dateRange['start'] = min($dates);
        $dateRange['end'] = max($dates);
    }

    echo json_encode([
        'success' => true,
        'transactions' => $transactions,
        'categoryData' => $categoryData,
        'dailyData' => $dailyData,
        'summary' => [
            'totalSpent' => $totalSpent,
            'totalTransactions' => $totalTransactions,
            'uniqueCategories' => $uniqueCategories,
            'averageDaily' => $averageDaily,
            'dateRange' => $dateRange
        ],
        // Legacy format for backward compatibility
        'labels' => array_column($categoryData, 'category'),
        'values' => array_column($categoryData, 'total')
    ]);

    // Clean up
    $result->close();
    if ($categoryResult) $categoryResult->close();
    if ($dailyResult) $dailyResult->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
} finally {
    $con->close();
}
