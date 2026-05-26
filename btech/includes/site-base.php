<?php
/**
 * Web path to the site root (the folder containing css/, js/, images/).
 * Ensures asset URLs resolve correctly when deployed in a subdirectory (e.g. /btech/).
 */
if (!defined('SITE_BASE_HREF')) {
    $siteRoot = realpath(dirname(__DIR__));
    $docRoot = isset($_SERVER['DOCUMENT_ROOT']) ? realpath($_SERVER['DOCUMENT_ROOT']) : false;

    if ($siteRoot && $docRoot) {
        $siteRootNorm = str_replace('\\', '/', $siteRoot);
        $docRootNorm = str_replace('\\', '/', $docRoot);

        if (strpos($siteRootNorm, $docRootNorm) === 0) {
            $base = substr($siteRootNorm, strlen($docRootNorm));
        } else {
            $base = '';
        }
    } else {
        $scriptName = isset($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '';
        $base = str_replace('\\', '/', dirname($scriptName));
        if (preg_match('#/application$#', $base)) {
            $base = dirname($base);
        }
        if ($base === '/' || $base === '.') {
            $base = '';
        }
    }

    $base = rtrim($base, '/') . '/';
    define('SITE_BASE_HREF', $base === '/' ? '/' : $base);
}
