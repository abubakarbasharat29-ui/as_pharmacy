<?php
/**
 * AS Pharmacy - Users API
 * GET /api/users.php         → get all users
 * POST /api/users.php        → add user
 * PUT /api/users.php?id=X    → update user
 * DELETE /api/users.php?id=X → delete user
 */
require_once 'config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$db     = getDB();

switch ($method) {

    case 'GET':
        $stmt = $db->query("SELECT id, name, email, role, phone, dob, joined FROM users ORDER BY id ASC");
        respond($stmt->fetchAll());
        break;

    case 'POST':
        $body = getBody();
        $name     = trim($body['name'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');
        $role     = $body['role'] ?? 'staff';
        $phone    = $body['phone'] ?? '';
        $dob      = $body['dob'] ?? null;

        if (!$name || !$email || !$password) respond(['error' => 'Name, email, password required'], 400);

        // Check duplicate
        $check = $db->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) respond(['error' => 'Email already exists'], 409);

        $stmt = $db->prepare("INSERT INTO users (name, email, password, role, phone, dob, joined) VALUES (?, ?, ?, ?, ?, ?, CURDATE())");
        $stmt->execute([$name, $email, $password, $role, $phone, $dob ?: null]);
        $newId = $db->lastInsertId();

        $row = $db->prepare("SELECT id, name, email, role, phone, dob, joined FROM users WHERE id = ?");
        $row->execute([$newId]);
        respond($row->fetch(), 201);
        break;

    case 'PUT':
        if (!$id) respond(['error' => 'ID required'], 400);
        $body = getBody();

        $fields = [];
        $params = [];

        if (isset($body['name']))  { $fields[] = 'name = ?';     $params[] = $body['name']; }
        if (isset($body['email'])) { $fields[] = 'email = ?';    $params[] = $body['email']; }
        if (isset($body['role']))  { $fields[] = 'role = ?';     $params[] = $body['role']; }
        if (isset($body['phone'])) { $fields[] = 'phone = ?';    $params[] = $body['phone']; }
        if (isset($body['password']) && $body['password']) {
            $fields[] = 'password = ?';
            $params[] = $body['password'];
        }

        if (empty($fields)) respond(['error' => 'Nothing to update'], 400);

        $params[] = $id;
        $stmt = $db->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        respond(['success' => true]);
        break;

    case 'DELETE':
        if (!$id) respond(['error' => 'ID required'], 400);
        $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        // Attendance will cascade delete due to FK
        respond(['success' => true]);
        break;

    default:
        respond(['error' => 'Method not allowed'], 405);
}
