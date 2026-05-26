<?php
/**
 * Router for PHP built-in dev server (php -S localhost:8000 router.php).
 * Apache/nginx use .htaccess instead.
 */
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($path === '/btech-notification-2026' || $path === '/btech-notification-2026/') {
	require __DIR__ . '/btech-notification-2026.php';
	return true;
}

return false;
