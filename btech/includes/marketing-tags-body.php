<?php
/**
 * Marketing tags for immediately after <body> (GTM + Meta Pixel noscript).
 * Set $skip_marketing_tags = true to opt out.
 */
if (!empty($skip_marketing_tags) || defined('MARKETING_TAGS_BODY')) {
    return;
}
define('MARKETING_TAGS_BODY', true);
?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5MCWFC6V"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<!-- Meta Pixel Code (noscript) -->
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=27354579694146357&ev=PageView&noscript=1"
/></noscript>
