<?php
/**
 * AS Pharmacy - Attendance API
 */
require_once 'config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {

    case 'GET':
        $userId = $_GET['user_id'] ?? null;
        $date   = $_GET['date'] ?? null;

        $sql    = "SELECT a.*, u.name as user_name FROM attendance a JOIN users u ON a.user_id = u.id WHERE 1=1";
        $params = [];

        if ($userId) {
            $sql     .= " AND a.user_id = ?";
            $params[] = (int)$userId;
        }
        if ($date) {
            $sql     .= " AND a.date = ?";
            $params[] = $date;
        }

        $sql .= " ORDER BY a.id DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        foreach ($rows as &$r) {
            $r['id']      = (int)$r['id'];
            $r['user_id'] = (int)$r['user_id'];
            // map to frontend format
            $r['userId']   = $r['user_id'];
            $r['userName'] = $r['user_name'];
        }
        respond($rows);
        break;

    case 'POST':
        $body   = getBody();
        $userId = (int)($body['userId'] ?? 0);
        $name   = $body['userName'] ?? '';
        $date   = $body['date'] ?? date('Y-m-d');
        $time   = $body['time'] ?? date('H:i A');

        if (!$userId) respond(['error' => 'User ID required'], 400);

        // Check if already marked today
        $check = $db->prepare("SELECT id FROM attendance WHERE user_id = ? AND date = ?");
        $check->execute([$userId, $date]);
        if ($check->fetch()) {
            respond(['success' => false, 'message' => 'Already marked for today']);
        }

        $stmt = $db->prepare("INSERT INTO attendance (user_id, user_name, date, time, status) VALUES (?, ?, ?, ?, 'Present')");
        $stmt->execute([$userId, $name, $date, $time]);

        respond(['success' => true, 'id' => (int)$db->lastInsertId()], 201);
        break;

    case 'DELETE':
        $userId = $_GET['user_id'] ?? null;
        if ($userId) {
            $stmt = $db->prepare("DELETE FROM attendance WHERE user_id = ?");
            $stmt->execute([(int)$userId]);
            respond(['success' => true]);
        } else {
            respond(['error' => 'user_id required'], 400);
        }
        break;

    default:
        respond(['error' => 'Method not allowed'], 405);
}
