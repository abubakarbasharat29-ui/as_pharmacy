<?php
/**
 * AS Pharmacy - Auth API
 * Endpoints: login, logout, session, register
 */
require_once 'config.php';

session_start();

$action = $_GET['action'] ?? '';

switch ($action) {

    // ── LOGIN ────────────────────────────────────────────────────────────────
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['error' => 'POST required'], 405);
        $body = getBody();
        $email    = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');

        if (!$email || !$password) respond(['success' => false, 'message' => 'Email and password required'], 400);

        $db   = getDB();
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || $user['password'] !== $password) {
            respond(['success' => false, 'message' => 'Invalid email or password']);
        }

        // Store session
        $_SESSION['user_id'] = $user['id'];
        $safe = $user;
        unset($safe['password']);

        respond(['success' => true, 'user' => $safe]);
        break;

    // ── REGISTER ─────────────────────────────────────────────────────────────
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(['error' => 'POST required'], 405);
        $body = getBody();

        $name     = trim($body['name'] ?? '');
        $email    = trim($body['email'] ?? '');
        $password = trim($body['password'] ?? '');
        $phone    = trim($body['phone'] ?? '');
        $dob      = trim($body['dob'] ?? '');

        if (!$name || !$email || !$password) respond(['success' => false, 'message' => 'Name, email and password required'], 400);

        $db = getDB();
        $check = $db->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$email]);
        if ($check->fetch()) {
            respond(['success' => false, 'message' => 'Email already registered']);
        }

        $stmt = $db->prepare("INSERT INTO users (name, email, password, phone, dob, role, joined) VALUES (?, ?, ?, ?, ?, 'staff', CURDATE())");
        $stmt->execute([$name, $email, $password, $phone, $dob ?: null]);

        respond(['success' => true, 'message' => 'Account created successfully']);
        break;

    // ── GET CURRENT SESSION ──────────────────────────────────────────────────
    case 'session':
        if (empty($_SESSION['user_id'])) {
            respond(['user' => null]);
        }
        $db   = getDB();
        $stmt = $db->prepare("SELECT id, name, email, role, phone, dob, joined FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        respond(['user' => $user ?: null]);
        break;

    // ── LOGOUT ───────────────────────────────────────────────────────────────
    case 'logout':
        session_destroy();
        respond(['success' => true]);
        break;

    // ── VERIFY RESET IDENTITY ────────────────────────────────────────────────
    case 'verify_identity':
        $body  = getBody();
        $email = trim($body['email'] ?? '');
        $dob   = trim($body['dob'] ?? '');

        $db   = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND dob = ?");
        $stmt->execute([$email, $dob]);
        $user = $stmt->fetch();

        if ($user) {
            respond(['success' => true]);
        } else {
            $emailCheck = $db->prepare("SELECT id FROM users WHERE email = ?");
            $emailCheck->execute([$email]);
            if (!$emailCheck->fetch()) {
                respond(['success' => false, 'message' => 'Email not found in our records.']);
            }
            respond(['success' => false, 'message' => 'Security verification failed. Date of birth does not match.']);
        }
        break;

    // ── RESET PASSWORD ───────────────────────────────────────────────────────
    case 'reset_password':
        $body        = getBody();
        $email       = trim($body['email'] ?? '');
        $newPassword = trim($body['password'] ?? '');

        if (!$email || !$newPassword) respond(['success' => false, 'message' => 'Email and new password required'], 400);

        $db   = getDB();
        $stmt = $db->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->execute([$newPassword, $email]);

        if ($stmt->rowCount() > 0) {
            respond(['success' => true]);
        } else {
            respond(['success' => false, 'message' => 'User not found']);
        }
        break;

    default:
        respond(['error' => 'Invalid action'], 400);
}
