<?php
/**
 * AS Pharmacy - Settings API
 */
require_once 'config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {

    case 'GET':
        $stmt = $db->query("SELECT key_name, value FROM settings");
        $rows = $stmt->fetchAll();
        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['key_name']] = $row['value'];
        }
        respond($settings);
        break;

    case 'POST':
        $body = getBody();
        foreach ($body as $key => $value) {
            $stmt = $db->prepare("INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?");
            $stmt->execute([$key, $value, $value]);
        }
        respond(['success' => true]);
        break;

    default:
        respond(['error' => 'Method not allowed'], 405);
}
