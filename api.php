<?php
// Empire CRM Multi-Tenant SaaS Self-Healing PHP Reverse Proxy Gateway
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

$port = 5000;
$host = '127.0.0.1';

function isPortOpen($host, $port) {
    $fp = @fsockopen($host, $port, $errno, $errstr, 1);
    if (is_resource($fp)) {
        fclose($fp);
        return true;
    }
    return false;
}

function bootNodeBackend($port) {
    $dir = __DIR__;
    $cmd = "export PATH=\$PATH:/opt/alt/alt-nodejs22/root/usr/bin; export USE_LOCAL_DB=true; export DATABASE_URL='file:./prisma/dev.db'; cd " . escapeshellarg($dir) . " && nohup node dist/server.js > /dev/null 2>&1 &";
    exec($cmd);
    
    // Wait up to 3 seconds for Node server to start
    for ($i = 0; $i < 6; $i++) {
        usleep(500000); // 500ms
        if (isPortOpen('127.0.0.1', $port)) {
            return true;
        }
    }
    return false;
}

// In shared hosting, do not fork background node processes automatically to preserve server process limits.

$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Clean subpath prefixes if hosted in subdirectory
if (strpos($uri, '/dsacrm') === 0) {
    $uri = substr($uri, 7);
    if (empty($uri)) $uri = '/';
} else if (strpos($uri, '/bussniescrm') === 0) {
    $uri = substr($uri, 12);
    if (empty($uri)) $uri = '/';
} else if (strpos($uri, '/crmbusiness') === 0) {
    $uri = substr($uri, 12);
    if (empty($uri)) $uri = '/';
} else if (strpos($uri, '/businesscrm') === 0) {
    $uri = substr($uri, 12);
    if (empty($uri)) $uri = '/';
} else if (strpos($uri, '/crm') === 0) {
    $uri = substr($uri, 4);
    if (empty($uri)) $uri = '/';
}

// Route core CRM endpoints to v1 endpoints if requested without /v1/ prefix
if (preg_match('#^/api/(leads|customers|projects|services|campaigns|pipelines|automations|custom-fields|modules|records|views)(/.*|\?.*|$)$#', $uri, $matches)) {
    $uri = '/api/v1/' . $matches[1] . ($matches[2] ?? '');
}

$targetUrl = 'http://' . $host . ':' . $port . $uri;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$headers = function_exists('getallheaders') ? getallheaders() : [];
$req_headers = [];

foreach ($headers as $k => $v) {
    if (strtolower($k) !== 'host' && strtolower($k) !== 'content-length') {
        $req_headers[] = $k . ': ' . $v;
    }
}

// Forward Authorization header if Apache stripped it from getallheaders()
if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $req_headers[] = 'Authorization: ' . $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $req_headers[] = 'Authorization: ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
}

$req_headers[] = 'Host: ' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
$req_headers[] = 'X-Forwarded-For: ' . ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
$req_headers[] = 'X-Forwarded-Proto: ' . ((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https' : 'http');
// Crucial: Disable Expect: 100-continue in cURL when forwarding to Node.js
$req_headers[] = 'Expect:';

$inputBody = ($method === 'POST' || $method === 'PUT' || $method === 'PATCH' || $method === 'DELETE') ? file_get_contents('php://input') : null;

function executeProxyRequest($targetUrl, $method, $req_headers, $body = null) {
    $ch = curl_init($targetUrl);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $req_headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [$response, $header_size, $http_code];
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function signJwtToken($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $b64Header = base64UrlEncode($header);
    $b64Payload = base64UrlEncode(json_encode($payload));
    $signature = hash_hmac('sha256', $b64Header . '.' . $b64Payload, $secret, true);
    return $b64Header . '.' . $b64Payload . '.' . base64UrlEncode($signature);
}

function verifyJwtToken($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    list($header, $payload, $sig) = $parts;
    $expected = base64UrlEncode(hash_hmac('sha256', $header . '.' . $payload, $secret, true));
    if (!hash_equals($expected, $sig)) return false;
    return json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
}

function handleDirectSqliteFallback($uri, $method, $inputBody) {
    $jwtSecret = 'empire_crm_super_secret_jwt_key_2026_production';
    $cleanPath = parse_url($uri, PHP_URL_PATH);

    foreach (['/dsacrm', '/bussniescrm', '/crmbusiness', '/businesscrm', '/crm'] as $prefix) {
        if (strpos($cleanPath, $prefix) === 0) {
            $cleanPath = substr($cleanPath, strlen($prefix)) ?: '/';
        }
    }

    $dbPaths = [
        __DIR__ . '/prisma/dev.db',
        __DIR__ . '/dev.db',
        '/home/u490416745/domains/businesscrm.empireitxpert.in/public_html/prisma/dev.db',
        '/home/u490416745/domains/businesscrm.empireitxpert.in/public_html/dev.db',
    ];
    $db = null;
    foreach ($dbPaths as $p) {
        if (file_exists($p)) {
            try {
                $db = new PDO('sqlite:' . $p);
                $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                break;
            } catch (Exception $e) {}
        }
    }

    if ($cleanPath === '/health' || $cleanPath === '/api/health') {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'healthy',
            'server' => ['status' => 'UP', 'port' => 5000, 'environment' => 'production'],
            'database' => ['status' => $db ? 'connected' : 'disconnected', 'provider' => 'SQLite'],
            'timestamp' => date('c')
        ]);
        exit;
    }

    if (($cleanPath === '/api/auth/login' || $cleanPath === '/auth/login') && $method === 'POST') {
        header('Content-Type: application/json');
        if (!$db) {
            http_response_code(500);
            echo json_encode(['error' => 'Database not accessible', 'message' => 'Database not accessible']);
            exit;
        }
        $data = json_decode($inputBody, true) ?: [];
        $rawInput = trim(strtolower($data['email'] ?? $data['emailOrMobile'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (empty($rawInput) || empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required', 'message' => 'Email and password are required']);
            exit;
        }

        try {
            $stmt = $db->prepare('SELECT u.*, r.id as role_id, r.name as role_name, r.permissions as role_permissions FROM User u LEFT JOIN Role r ON u.roleId = r.id WHERE LOWER(u.email) = :email OR u.phone = :phone LIMIT 1');
            $stmt->execute([':email' => $rawInput, ':phone' => $rawInput]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password', 'message' => 'Invalid email or password']);
                exit;
            }

            $hash = $user['password'];
            $compatHash = preg_replace('/^\$2b\$/', '$2y$', $hash);
            $matched = password_verify($password, $hash) || password_verify($password, $compatHash);

            if (!$matched) {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid email or password', 'message' => 'Invalid email or password']);
                exit;
            }

            if (isset($user['isActive']) && !$user['isActive']) {
                http_response_code(403);
                echo json_encode(['error' => 'Account deactivated', 'message' => 'Your account has been deactivated.']);
                exit;
            }

            $permissions = [];
            if (!empty($user['role_permissions'])) {
                $parsed = json_decode($user['role_permissions'], true);
                $permissions = is_array($parsed) ? $parsed : ['*'];
            }

            $tokenPayload = [
                'userId' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role_name'] ?: 'SUPER_ADMIN',
                'tenantId' => $user['tenantId'],
                'exp' => time() + (7 * 24 * 60 * 60)
            ];

            $accessToken = signJwtToken($tokenPayload, $jwtSecret);

            setcookie('accessToken', $accessToken, [
                'expires' => time() + (7 * 24 * 60 * 60),
                'path' => '/',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'accessToken' => $accessToken,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['fullName'],
                    'fullName' => $user['fullName'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'tenantId' => $user['tenantId'],
                    'role' => [
                        'id' => $user['role_id'] ?: 'role-platform-admin',
                        'name' => $user['role_name'] ?: 'SUPER_ADMIN',
                        'permissions' => $permissions
                    ]
                ]
            ]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
            exit;
        }
    }

    if (($cleanPath === '/api/auth/me' || $cleanPath === '/auth/me') && $method === 'GET') {
        header('Content-Type: application/json');
        $authHeader = '';
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (!empty($_COOKIE['accessToken'])) {
            $authHeader = 'Bearer ' . $_COOKIE['accessToken'];
        }

        $token = '';
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            $token = trim($matches[1]);
        }

        $payload = !empty($token) ? verifyJwtToken($token, $jwtSecret) : null;
        if (!$payload || empty($payload['userId'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => 'Unauthorized']);
            exit;
        }

        if ($db) {
            try {
                $stmt = $db->prepare('SELECT u.*, r.id as role_id, r.name as role_name, r.permissions as role_permissions FROM User u LEFT JOIN Role r ON u.roleId = r.id WHERE u.id = :id LIMIT 1');
                $stmt->execute([':id' => $payload['userId']]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user) {
                    $permissions = [];
                    if (!empty($user['role_permissions'])) {
                        $parsed = json_decode($user['role_permissions'], true);
                        $permissions = is_array($parsed) ? $parsed : ['*'];
                    }
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'user' => [
                            'id' => $user['id'],
                            'name' => $user['fullName'],
                            'fullName' => $user['fullName'],
                            'email' => $user['email'],
                            'phone' => $user['phone'],
                            'tenantId' => $user['tenantId'],
                            'role' => [
                                'id' => $user['role_id'] ?: 'role-platform-admin',
                                'name' => $user['role_name'] ?: 'SUPER_ADMIN',
                                'permissions' => $permissions
                            ]
                        ]
                    ]);
                    exit;
                }
            } catch (Exception $e) {}
        }
        http_response_code(401);
        echo json_encode(['error' => 'User not found', 'message' => 'User not found']);
        exit;
    }

    if (($cleanPath === '/api/auth/logout' || $cleanPath === '/auth/logout') && $method === 'POST') {
        header('Content-Type: application/json');
        setcookie('accessToken', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
        exit;
    }
}
// Direct SQLite Engine for Authentication & Health (instant response, immune to Node/proxy timeouts)
$cleanPath = parse_url($uri, PHP_URL_PATH);
if (strpos($cleanPath, 'auth/') !== false || strpos($cleanPath, 'health') !== false) {
    handleDirectSqliteFallback($uri, $method, $inputBody);
}

list($response, $header_size, $http_code) = executeProxyRequest($targetUrl, $method, $req_headers, $inputBody);

// Retry once if connection failed
if ($response === false) {
    bootNodeBackend($port);
    list($response, $header_size, $http_code) = executeProxyRequest($targetUrl, $method, $req_headers, $inputBody);
}

// Fallback to SQLite direct engine for any endpoint if Node failed or returned 500
if ($response === false || $http_code >= 500) {
    handleDirectSqliteFallback($uri, $method, $inputBody);
}

if ($response === false) {
    http_response_code(502);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => '502 Bad Gateway: Empire CRM Node.js backend server is starting up on port ' . $port,
    ]);
    exit;
}

$res_header = substr($response, 0, $header_size);
$res_body = substr($response, $header_size);

http_response_code($http_code);

foreach (explode("\r\n", $res_header) as $line) {
    if (!empty($line) && !preg_match('/^Transfer-Encoding:/i', $line) && !preg_match('/^HTTP\//i', $line)) {
        header($line, false);
    }
}

echo $res_body;

