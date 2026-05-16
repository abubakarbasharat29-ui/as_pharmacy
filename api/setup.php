<?php
/**
 * AS Pharmacy - Database Installer
 * Run this ONCE to create all tables and seed data
 * URL: https://aspharmacy-production.up.railway.app/api/setup.php
 */

header('Content-Type: text/html; charset=utf-8');

$host = 'maglev.proxy.rlwy.net';
$user = 'root';
$pass = 'hNZKGzThVGeWEQvVsgeEZFfchYBosbdu';
$port = '27912';
$dbname = 'railway';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // ── USERS TABLE
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id`       INT AUTO_INCREMENT PRIMARY KEY,
            `name`     VARCHAR(100) NOT NULL,
            `email`    VARCHAR(150) UNIQUE NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `role`     ENUM('admin','staff') DEFAULT 'staff',
            `phone`    VARCHAR(20),
            `dob`      DATE,
            `joined`   DATE DEFAULT (CURDATE()),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
    ");

    // ── MEDICINES TABLE
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `medicines` (
            `id`       INT AUTO_INCREMENT PRIMARY KEY,
            `name`     VARCHAR(200) NOT NULL,
            `category` VARCHAR(100),
            `company`  VARCHAR(100),
            `price`    DECIMAL(10,2) NOT NULL DEFAULT 0,
            `qty`      INT NOT NULL DEFAULT 0,
            `expiry`   DATE,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
    ");

    // ── SALES TABLE
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `sales` (
            `id`        VARCHAR(20) PRIMARY KEY,
            `customer`  VARCHAR(150) DEFAULT 'Walk-in Patient',
            `items`     JSON NOT NULL,
            `subtotal`  DECIMAL(10,2) NOT NULL DEFAULT 0,
            `discount`  DECIMAL(10,2) NOT NULL DEFAULT 0,
            `total`     DECIMAL(10,2) NOT NULL DEFAULT 0,
            `sale_date` DATE NOT NULL,
            `sale_time` VARCHAR(20),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
    ");

    // ── ATTENDANCE TABLE
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `attendance` (
            `id`        INT AUTO_INCREMENT PRIMARY KEY,
            `user_id`   INT NOT NULL,
            `user_name` VARCHAR(100) NOT NULL,
            `date`      DATE NOT NULL,
            `time`      VARCHAR(20),
            `status`    VARCHAR(20) DEFAULT 'Present',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_user_date` (`user_id`, `date`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB
    ");

    // ── SETTINGS TABLE
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `settings` (
            `key_name`  VARCHAR(50) PRIMARY KEY,
            `value`     TEXT
        ) ENGINE=InnoDB
    ");

    // ── SEED DEFAULT ADMIN
    $adminExists = $pdo->query("SELECT COUNT(*) FROM users WHERE email='admin@aspharmacy.com'")->fetchColumn();
    if (!$adminExists) {
        $pdo->exec("
            INSERT INTO `users` (name, email, password, role, dob, joined) VALUES
            ('Admin User',   'admin@aspharmacy.com', 'admin', 'admin', '1990-01-01', '2024-01-01'),
            ('Staff Member', 'staff@aspharmacy.com', 'staff', 'staff', '1995-05-15', '2024-02-15')
        ");
    }

    // ── SEED SAMPLE MEDICINES
    $medsExist = $pdo->query("SELECT COUNT(*) FROM medicines")->fetchColumn();
    if (!$medsExist) {
        $pdo->exec("
            INSERT INTO `medicines` (name, category, company, price, qty, expiry) VALUES
            ('Panadol 500mg',    'Analgesic',  'GSK',     35,  500, '2026-12-31'),
            ('Augmentin 625mg',  'Antibiotic', 'GSK',    180,    8, '2025-08-15'),
            ('Gaviscon Liquid',  'Antacid',    'Reckitt', 250,   45, '2026-06-30'),
            ('Vitamin C 1000mg', 'Vitamin',    'ICI',    120,    3, '2025-05-20'),
            ('Metformin 850mg',  'Other',      'Sanofi',  95,  200, '2027-01-15')
        ");
    }

    // ── SEED DEFAULT SETTINGS
    $pdo->exec("
        INSERT IGNORE INTO `settings` (key_name, value) VALUES
        ('theme', 'light'),
        ('pharmacy_name', 'AS Pharmacy'),
        ('currency', 'Rs.')
    ");

    echo "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <title>AS Pharmacy - Setup</title>
        <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { background: #1e293b; padding: 2rem 3rem; border-radius: 12px; text-align: center; border: 1px solid #334155; max-width: 500px; }
            h1 { color: #10b981; margin-bottom: 0.5rem; }
            p { color: #94a3b8; margin: 0.5rem 0; }
            .step { background: #0f172a; padding: 0.75rem 1rem; border-radius: 8px; margin: 0.5rem 0; text-align: left; font-size: 0.9rem; border-left: 3px solid #10b981; }
            a { display: inline-block; margin-top: 1.5rem; background: #10b981; color: white; padding: 0.75rem 2rem; border-radius: 8px; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class='box'>
            <h1>Setup Complete!</h1>
            <p>AS Pharmacy database created successfully.</p>
            <br>
            <div class='step'>Admin: admin@aspharmacy.com / admin</div>
            <div class='step'>Staff: staff@aspharmacy.com / staff</div>
            <div class='step'>Database: railway (MySQL)</div>
            <a href='../index.html'>Go to App</a>
        </div>
    </body>
    </html>
    ";

} catch (PDOException $e) {
    echo "<pre style='background:#1e293b;color:#f87171;padding:2rem;border-radius:8px;'>
Setup Failed!

Error: " . htmlspecialchars($e->getMessage()) . "
    </pre>";
}