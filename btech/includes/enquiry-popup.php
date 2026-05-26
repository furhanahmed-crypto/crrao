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
?>
<link rel="stylesheet" href="css/enquiry-modal.css">
<?php include __DIR__ . '/enquiry-home-modal.php'; ?>
<script src="js/enquiry-form.js"></script>
