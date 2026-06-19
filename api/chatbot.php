<?php
/**
 * AS Pharmacy - Chatbot API
 * Gemini API ko call karta hai sirf medicine/health questions ke liye
 */
require_once 'config.php';

session_start();

// Sirf logged-in users hi chatbot use kar sakein
if (empty($_SESSION['user_id'])) {
    respond(['success' => false, 'message' => 'Login required'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'POST required'], 405);
}

// ── APNI GEMINI API KEY YAHAN PASTE KARO ──
define('GEMINI_API_KEY', getenv('GEMINI_API_KEY') ?: 'your_key_here');
define('GEMINI_URL', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' . GEMINI_API_KEY);

$body = getBody();
$userMessage = trim($body['message'] ?? '');

if (!$userMessage) {
    respond(['success' => false, 'message' => 'Message required'], 400);
}

// ── SYSTEM PROMPT: Sirf medicine/health questions ka jawab de ──
$systemPrompt = "Aap AS Pharmacy ke ek medical assistant chatbot hain. Aapka kaam sirf medicine, health, symptoms, aur pharmacy se related sawalon ka accurate aur helpful jawab dena hai. " .
    "Agar koi sawal medicine ya health se related nahi hai, to politely bata dein ke aap sirf medical/health questions mein madad kar sakte hain. " .
    "Hamesha yeh disclaimer zaroor dein jab koi specific dosage ya treatment poochay: 'Yeh general information hai, kisi bhi medicine lene se pehle doctor ya pharmacist se zaroor consult karein.' " .
    "Jawab Roman Urdu ya English mein dein, jis tarah user ne sawal poocha ho. Jawab clear, mukhtasir aur madadgar hona chahiye.";

// ── Gemini API ko call karo ──
$payload = [
    'contents' => [
        [
            'role' => 'user',
            'parts' => [
                ['text' => $systemPrompt . "\n\nUser ka sawal: " . $userMessage]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.4,
        'maxOutputTokens' => 500
    ]
];

$ch = curl_init(GEMINI_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    respond(['success' => false, 'message' => 'Connection error: ' . $curlError], 500);
}

$result = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $result['error']['message'] ?? 'Gemini API error';
    respond(['success' => false, 'message' => $errMsg], 500);
}

$reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$reply) {
    respond(['success' => false, 'message' => 'Koi jawab nahi mila, dobara try karein.'], 500);
}

respond(['success' => true, 'reply' => $reply]);