<?php
/**
 * Thank-you page content — driven by ?type= preset with optional overrides.
 *
 * Query params (all optional):
 *   type     — preset key: enquiry | contact | application (default: enquiry)
 *   name     — personalises heading when no custom heading is given
 *   title    — browser tab title
 *   banner   — hero banner H1
 *   heading  — main greeting; use {name} as placeholder
 *   message  — supporting body copy
 */

function thank_you_get_param($key, $default = '')
{
    if (!isset($_GET[$key])) {
        return $default;
    }
    $value = trim((string) $_GET[$key]);
    if ($value === '') {
        return $default;
    }

    return mb_substr($value, 0, 240);
}

$thank_you_presets = [
    'enquiry' => [
        'page_title' => 'Thank You',
        'banner_title' => 'Thank You',
        'heading' => 'Thank you for your enquiry',
        'message' => 'We have received your message. Our admissions team will get back to you shortly.',
    ],
    'contact' => [
        'page_title' => 'Thank You',
        'banner_title' => 'Thank You',
        'heading' => 'Thank you for contacting us',
        'message' => 'We have received your message and will respond as soon as possible.',
    ],
    'application' => [
        'page_title' => 'Application Received',
        'banner_title' => 'Application Received',
        'heading' => 'Thank you for your application',
        'message' => 'Your application has been submitted successfully. We will review it and contact you with further updates.',
    ],
];

$thank_you_type = thank_you_get_param('type', 'enquiry');
if (!isset($thank_you_presets[$thank_you_type])) {
    $thank_you_type = 'enquiry';
}
$thank_you_preset = $thank_you_presets[$thank_you_type];

$thank_you_name = thank_you_get_param('name');
$thank_you_page_title = thank_you_get_param('title', $thank_you_preset['page_title']);
$thank_you_banner_title = thank_you_get_param('banner', $thank_you_preset['banner_title']);
$thank_you_message = thank_you_get_param('message', $thank_you_preset['message']);

$thank_you_heading = thank_you_get_param('heading', '');
if ($thank_you_heading === '') {
    if ($thank_you_name !== '') {
        $thank_you_heading = 'Thank you, ' . $thank_you_name . '!';
    } else {
        $thank_you_heading = $thank_you_preset['heading'];
    }
} elseif ($thank_you_name !== '' && strpos($thank_you_heading, '{name}') !== false) {
    $thank_you_heading = str_replace('{name}', $thank_you_name, $thank_you_heading);
}
