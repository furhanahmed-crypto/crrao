<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <?php include __DIR__ . '/../includes/head-base-tag.php'; ?>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#1a3a6b" />

  <title>Application Submitted | CR Rao AIMSCS B.Tech 2026-27</title>
  <meta
    name="description"
    content="Your B.Tech 2026-27 application has been submitted to CR Rao AIMSCS." />

  <link
    rel="icon"
    type="image/svg+xml"
    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%231a3a6b'/%3E%3Ctext x='50' y='66' font-family='Outfit,sans-serif' font-size='52' font-weight='800' text-anchor='middle' fill='%23fff'%3ECR%3C/text%3E%3C/svg%3E" />
  <link href="https://fonts.googleapis.com/css?family=Montserrat:600,700%7COpen+Sans:400,600" rel="stylesheet">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet" />

  <link rel="stylesheet" href="css/assets/bootstrap.min.css">
  <link rel="stylesheet" href="css/assets/font-awesome.min.css">
  <link rel="stylesheet" href="css/assets/meanmenu.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/responsive.css">
  <link rel="stylesheet" href="application/style.css" />
  <script src="js/vendor/jquery-1.12.4.min.js"></script>
</head>

<body class="application-submitted-thankyou">
<?php include __DIR__ . '/../includes/marketing-tags-body.php'; ?>
  <?php include __DIR__ . '/../header.php'; ?>

  <section class="apply-shell apply-thankyou-shell">
    <div class="container">
      <div class="apply-thankyou-wrap">
        <div class="apply-success">
          <div class="apply-success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Application Submitted Successfully!</h2>
          <p>
            Your B.Tech 2026-27 application has been received by our
            admissions cell. Our team will review and reach out within
            <strong>24 working hours</strong>.
          </p>
          <p>
            A confirmation copy has been sent to your registered email.
            Please save your reference ID below.
          </p>
          <div class="reference-id" id="refId">CRR-2026-XXXXXX</div>
          <div class="apply-success-actions">
            <button
              type="button"
              class="btn btn-outline"
              id="downloadApplicationSuccessBtn">
              Download Application Copy (PDF)
            </button>
            <a href="index.php" class="btn btn-outline">Back to Home</a>
            <a
              href="https://wa.me/917331155319"
              class="btn btn-whatsapp"
              target="_blank"
              rel="noopener noreferrer">WhatsApp Admissions</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <?php
  $skip_enquiry_popup = true;
  include __DIR__ . '/../footer.php';
  ?>

  <script src="js/assets/bootstrap.min.js"></script>
  <script src="js/assets/jquery.sticky.js"></script>
  <script src="js/assets/jquery.meanmenu.min.js"></script>
  <script src="js/custom.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
  <script src="application/application-download.js" defer></script>
  <script src="application/application-submitted-thankyou.js" defer></script>
</body>

</html>
