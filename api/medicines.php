<?php
/**
 * AS Pharmacy - Medicines API
 */
require_once 'config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

switch ($method) {

    case 'GET':
        $search   = $_GET['search'] ?? '';
        $category = $_GET['category'] ?? '';

        $sql    = "SELECT * FROM medicines WHERE 1=1";
        $params = [];

        if ($search) {
            $sql     .= " AND (name LIKE ? OR company LIKE ? OR category LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($category) {
            $sql     .= " AND category = ?";
            $params[] = $category;
        }

        $sql .= " ORDER BY name ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $meds = $stmt->fetchAll();

        // Convert types
        foreach ($meds as &$m) {
            $m['id']    = (int)$m['id'];
            $m['price'] = (float)$m['price'];
            $m['qty']   = (int)$m['qty'];
        }
        respond($meds);
        break;

    case 'POST':
        $body = getBody();

        $name     = trim($body['name'] ?? '');
        $category = $body['category'] ?? 'Other';
        $company  = $body['company'] ?? '';
        $price    = (float)($body['price'] ?? 0);
        $qty      = (int)($body['qty'] ?? 0);
        $expiry   = $body['expiry'] ?? null;

        if (!$name) respond(['error' => 'Medicine name required'], 400);

        $stmt = $db->prepare("INSERT INTO medicines (name, category, company, price, qty, expiry) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $category, $company, $price, $qty, $expiry ?: null]);
        $newId = $db->lastInsertId();

        $row = $db->prepare("SELECT * FROM medicines WHERE id = ?");
        $row->execute([$newId]);
        $med = $row->fetch();
        $med['id']    = (int)$med['id'];
        $med['price'] = (float)$med['price'];
        $med['qty']   = (int)$med['qty'];
        respond($med, 201);
        break;

    case 'PUT':
        if (!$id) respond(['error' => 'ID required'], 400);
        $body = getBody();

        $fields = [];
        $params = [];

        $allowed = ['name', 'category', 'company', 'price', 'qty', 'expiry'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $body)) {
                $fields[] = "$field = ?";
                $params[] = $body[$field];
            }
        }

        if (empty($fields)) respond(['error' => 'Nothing to update'], 400);

        $params[] = $id;
        $stmt = $db->prepare("UPDATE medicines SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        respond(['success' => true]);
        break;

    case 'DELETE':
        if (!$id) respond(['error' => 'ID required'], 400);
        $stmt = $db->prepare("DELETE FROM medicines WHERE id = ?");
        $stmt->execute([$id]);
        respond(['success' => true]);
        break;

    default:
        respond(['error' => 'Method not allowed'], 405);
}
