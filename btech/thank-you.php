<!doctype html>
<html class="no-js" lang="en">
<head>
    <?php include __DIR__ . '/includes/head-base-tag.php'; ?>
    <?php include __DIR__ . '/includes/thank-you-config.php'; ?>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="description" content="<?php echo htmlspecialchars($thank_you_page_title, ENT_QUOTES, 'UTF-8'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($thank_you_page_title, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" href="css/assets/bootstrap.min.css">
    <link rel="stylesheet" href="css/assets/font-awesome.min.css">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:600,700%7COpen+Sans:400,600" rel="stylesheet">
    <link rel="stylesheet" href="css/assets/meanmenu.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
    <link rel="stylesheet" href="css/thank-you.css">
</head>
<body class="contact thank-you">
<?php include __DIR__ . '/includes/marketing-tags-body.php'; ?>
<div id="preloader">
    <div id="status">&nbsp;</div>
</div>
<?php include 'header2.php'; ?>

        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="intro-text">
                        <h1><?php echo htmlspecialchars($thank_you_banner_title, ENT_QUOTES, 'UTF-8'); ?></h1>
                        <p>
                            <span><a href="index.php">Home <i class="fa fa-angle-right"></i></a></span>
                            <span class="b-active"><?php echo htmlspecialchars($thank_you_banner_title, ENT_QUOTES, 'UTF-8'); ?></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>

<section class="thank-you-area">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="thank-you-card">
                    <div class="thank-you-icon" aria-hidden="true">
                        <i class="fa fa-check"></i>
                    </div>
                    <h2><?php echo htmlspecialchars($thank_you_heading, ENT_QUOTES, 'UTF-8'); ?></h2>
                    <p><?php echo htmlspecialchars($thank_you_message, ENT_QUOTES, 'UTF-8'); ?></p>
                    <a href="index.php" class="thank-you-btn">Return to Home Page</a>
                </div>
            </div>
        </div>
    </div>
</section>

<?php
$skip_enquiry_popup = true;
include 'footer.php';
?>
    <script src="js/vendor/jquery-1.12.4.min.js"></script>
    <script src="js/assets/bootstrap.min.js"></script>
    <script src="js/assets/jquery.sticky.js"></script>
    <script src="js/assets/jquery.meanmenu.min.js"></script>
    <script src="js/custom.js"></script>
</body>
</html>
