<?php
/**
 * Enquiry popup assets + markup for all /btech/ pages.
 * Set $skip_enquiry_popup = true before including footer.php to opt out
 * (e.g. on the application form page).
 */
if (!empty($skip_enquiry_popup) || defined('ENQUIRY_POPUP_RENDERED')) {
	return;
}
define('ENQUIRY_POPUP_RENDERED', true);
require_once __DIR__ . '/site-base.php';
$thank_you_url = rtrim(SITE_BASE_HREF, '/') . '/thank-you.php';
?>
<link rel="stylesheet" href="css/enquiry-modal.css">
<?php include __DIR__ . '/enquiry-home-modal.php'; ?>
<script>window.CRRAO_THANK_YOU_URL = <?php echo json_encode($thank_you_url, JSON_UNESCAPED_SLASHES); ?>;</script>
<script src="js/enquiry-form.js"></script>
