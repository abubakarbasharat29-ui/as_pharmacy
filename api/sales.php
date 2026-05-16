<?php
/**
 * AS Pharmacy - Sales API
 */
require_once 'config.php';
session_start();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;
$db     = getDB();

switch ($method) {

    case 'GET':
        $search = $_GET['search'] ?? '';
        $date   = $_GET['date'] ?? '';

        $sql    = "SELECT * FROM sales WHERE 1=1";
        $params = [];

        if ($search) {
            $sql     .= " AND (id LIKE ? OR customer LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($date) {
            $sql     .= " AND sale_date = ?";
            $params[] = $date;
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $sales = $stmt->fetchAll();

        foreach ($sales as &$s) {
            $s['items']    = json_decode($s['items'], true);
            $s['subtotal'] = (float)$s['subtotal'];
            $s['discount'] = (float)$s['discount'];
            $s['total']    = (float)$s['total'];
            // Map to frontend format
            $s['date'] = $s['sale_date'];
            $s['time'] = $s['sale_time'];
        }
        respond($sales);
        break;

    case 'POST':
        $body = getBody();

        $saleId   = 'INV-' . substr(time(), -6);
        $customer = $body['customer'] ?? 'Walk-in Patient';
        $items    = $body['items'] ?? [];
        $subtotal = (float)($body['subtotal'] ?? 0);
        $discount = (float)($body['discount'] ?? 0);
        $total    = (float)($body['total'] ?? 0);
        $date     = $body['date'] ?? date('Y-m-d');
        $time     = $body['time'] ?? date('H:i:s');

        if (empty($items)) respond(['error' => 'No items in sale'], 400);

        // Save sale
        $stmt = $db->prepare("INSERT INTO sales (id, customer, items, subtotal, discount, total, sale_date, sale_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$saleId, $customer, json_encode($items), $subtotal, $discount, $total, $date, $time]);

        // Deduct stock
        foreach ($items as $item) {
            $upd = $db->prepare("UPDATE medicines SET qty = qty - ? WHERE id = ?");
            $upd->execute([(int)$item['qty'], (int)$item['id']]);
        }

        respond(['success' => true, 'id' => $saleId], 201);
        break;

    case 'DELETE':
        if ($id === 'all') {
            $db->exec("DELETE FROM sales");
            respond(['success' => true]);
        } elseif ($id) {
            $stmt = $db->prepare("DELETE FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            respond(['success' => true]);
        } else {
            respond(['error' => 'ID required'], 400);
        }
        break;

    default:
        respond(['error' => 'Method not allowed'], 405);
}
