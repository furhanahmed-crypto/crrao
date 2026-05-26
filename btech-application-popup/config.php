<?php
/**
 * Paths for the B.Tech application promo popup (main domain root).
 *
 * Deploy this folder at:  https://yourdomain.com/btech-application-popup/
 * B.Tech site stays at:   https://yourdomain.com/btech/
 *
 * Then add before </body> on the main domain homepage (index.php):
 *   <?php include __DIR__ . '/btech-application-popup/include.php'; ?>
 */
$btech_popup_base_url = '/btech-application-popup';

/** Folder name where the btech site is deployed (no trailing slash). */
$btech_subdir = '/btech';

$btech_application_url = $btech_subdir . '/application/application-2026.php';
$btech_popup_image_url = $btech_subdir . '/images/application/crrao-application.png';
