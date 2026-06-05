<!-- Site-wide enquiry popup (once per session, 5s after landing) -->
<div class="enquiry-modal" id="enquiryHomeModal" role="dialog" aria-modal="true" aria-labelledby="enquiryModalTitle" aria-hidden="true">
	<div class="enquiry-modal-inner enquiry-modal-inner--split">
		<button type="button" class="enquiry-modal-close" aria-label="Close dialog">
			<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" aria-hidden="true">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
		<div class="enquiry-modal-img-panel">
			<img src="images/application/crrao-admission-banner-img.jpeg" alt="CR Rao AIMSCS B.Tech Application" loading="lazy">
		</div>
		<div class="enquiry-modal-form-panel">
			<div class="enquiry-modal-header">
				<span class="enquiry-modal-badge">B.Tech Admissions 2026-27</span>
				<h3 id="enquiryModalTitle">Enquire about admissions?</h3>
				<p>Leave your details and our admissions team will reach out within 24 working hours.</p>
			</div>
			<div class="enquiry-modal-body">
				<?php
					$enquiry_form_id = 'enquiryHomeForm';
					$enquiry_form_source = 'Website Popup';
					$enquiry_message_id = 'enquiryHomeMessage';
					$enquiry_form_variant = 'modal';
					include __DIR__ . '/enquiry-form-fields.php';
				?>
			</div>
		</div>
	</div>
</div>
