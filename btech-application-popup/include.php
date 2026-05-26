<?php
/**
 * B.Tech application promo popup — embed on the main domain (one level above /btech/).
 *
 * Usage (before </body> on any main-site page):
 *   <?php include __DIR__ . '/btech-application-popup/include.php'; ?>
 *
 * Deploy this entire folder next to btech on the server:
 *   /btech-application-popup/
 *   /btech/
 */
if (defined('BTECH_APP_POPUP_RENDERED')) {
	return;
}
define('BTECH_APP_POPUP_RENDERED', true);

require __DIR__ . '/config.php';

$popupBase = rtrim($btech_popup_base_url, '/');
$popupCss = $popupBase . '/css/application-popup.css';
$popupJs = $popupBase . '/js/application-popup.js';
?>
<link rel="stylesheet" href="<?php echo htmlspecialchars($popupCss, ENT_QUOTES, 'UTF-8'); ?>">
<div
	class="btech-app-popup"
	id="btechAppPopup"
	role="dialog"
	aria-modal="true"
	aria-label="B.Tech application"
	aria-hidden="true"
>
	<div class="btech-app-popup-inner">
		<button type="button" class="btech-app-popup-close" aria-label="Close dialog">
			<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
		<div class="btech-app-popup-img-panel">
			<img
				src="<?php echo htmlspecialchars($btech_popup_image_url, ENT_QUOTES, 'UTF-8'); ?>"
				alt="CR Rao AIMSCS B.Tech Application"
				loading="lazy"
			>
		</div>
		<div class="btech-app-popup-action-panel">
			<a class="btech-app-popup-cta" href="<?php echo htmlspecialchars($btech_application_url, ENT_QUOTES, 'UTF-8'); ?>">
				Go To Btech Application
			</a>
			<button type="button" class="btech-app-popup-dismiss" data-btech-app-dismiss>Not now</button>
		</div>
	</div>
</div>
<script>
window.BtechAppPopupConfig = <?php echo json_encode(array(
	'applicationUrl' => $btech_application_url,
	'imageUrl' => $btech_popup_image_url,
), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
</script>
<script src="<?php echo htmlspecialchars($popupJs, ENT_QUOTES, 'UTF-8'); ?>"></script>
