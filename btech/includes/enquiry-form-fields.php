<?php
/**
 * Shared enquiry form fields for contact.php and index.php popup.
 *
 * Expected variables:
 *   $enquiry_form_id      — form element id
 *   $enquiry_form_source  — value stored in Google Sheet "Source" column
 *   $enquiry_message_id   — id of the message container above the form
 *   $enquiry_form_variant — "page" (contact.php) or "modal" (homepage popup)
 */
$enquiry_form_id = isset($enquiry_form_id) ? $enquiry_form_id : 'enquiryForm';
$enquiry_form_source = isset($enquiry_form_source) ? $enquiry_form_source : 'Contact Page';
$enquiry_message_id = isset($enquiry_message_id) ? $enquiry_message_id : 'enquiryMessage';
$enquiry_form_variant = isset($enquiry_form_variant) ? $enquiry_form_variant : 'page';
$is_modal = $enquiry_form_variant === 'modal';
?>
<div id="<?php echo htmlspecialchars($enquiry_message_id, ENT_QUOTES, 'UTF-8'); ?>" class="enquiry-message-slot" style="display:none;"></div>
<form method="post"
      class="enquiry-form<?php echo $is_modal ? ' enquiry-form--modal' : ''; ?>"
      id="<?php echo htmlspecialchars($enquiry_form_id, ENT_QUOTES, 'UTF-8'); ?>"
      data-source="<?php echo htmlspecialchars($enquiry_form_source, ENT_QUOTES, 'UTF-8'); ?>"
      data-message-target="<?php echo htmlspecialchars($enquiry_message_id, ENT_QUOTES, 'UTF-8'); ?>"
      novalidate>

<?php if ($is_modal) : ?>
    <div class="enquiry-fields">
        <div class="enquiry-field-row">
            <div class="enquiry-field">
                <label for="<?php echo $enquiry_form_id; ?>-name">Full Name <span aria-hidden="true">*</span></label>
                <input type="text" class="enquiry-input" id="<?php echo $enquiry_form_id; ?>-name" name="name" placeholder="Your name" autocomplete="name" required>
            </div>
            <div class="enquiry-field">
                <label for="<?php echo $enquiry_form_id; ?>-email">Email <span aria-hidden="true">*</span></label>
                <input type="email" class="enquiry-input" id="<?php echo $enquiry_form_id; ?>-email" name="email" placeholder="you@example.com" autocomplete="email" required>
            </div>
        </div>
        <div class="enquiry-field">
            <label for="<?php echo $enquiry_form_id; ?>-mobile">Mobile Number <span aria-hidden="true">*</span></label>
            <input type="tel" class="enquiry-input" id="<?php echo $enquiry_form_id; ?>-mobile" name="mobile" placeholder="10-digit mobile number" autocomplete="tel" inputmode="numeric" maxlength="10" required>
        </div>
        <div class="enquiry-field">
            <label for="<?php echo $enquiry_form_id; ?>-message">Message <span aria-hidden="true">*</span></label>
            <textarea class="enquiry-input enquiry-textarea" id="<?php echo $enquiry_form_id; ?>-message" name="comments" rows="4" placeholder="Tell us about your query…" required></textarea>
        </div>
        <div class="enquiry-form-actions">
            <button type="submit" class="enquiry-submit">Send Enquiry</button>
            <button type="button" class="enquiry-dismiss" data-enquiry-dismiss>Not now</button>
        </div>
        <p class="enquiry-consent">By submitting, you agree to be contacted by CR Rao AIMSCS regarding admissions.</p>
    </div>
<?php else : ?>
    <div class="row">
        <div class="col-sm-6">
            <div class="form-group">
                <input type="text" class="form-control" placeholder="Name" name="name" autocomplete="name" required>
            </div>
        </div>
        <div class="col-sm-6">
            <div class="form-group">
                <input type="email" class="form-control" placeholder="Email" name="email" autocomplete="email" required>
            </div>
        </div>
        <div class="col-sm-12">
            <div class="form-group">
                <input type="tel" class="form-control" placeholder="Mobile Number" name="mobile" autocomplete="tel" inputmode="numeric" maxlength="10" required>
            </div>
        </div>
        <div class="col-sm-12">
            <div class="form-group">
                <textarea class="form-control" rows="6" placeholder="Message" name="comments" required></textarea>
            </div>
        </div>
        <div class="col-sm-12">
            <div class="full-width">
                <input value="Submit" type="submit">
            </div>
        </div>
    </div>
<?php endif; ?>
</form>
