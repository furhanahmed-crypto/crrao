<!doctype html>
<html class="no-js" lang="zxx">
<head>
    <?php include __DIR__ . '/includes/head-base-tag.php'; ?>
    <meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="description" content="Contact Us">
	<meta name="keywords" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Contact Us</title> 
	<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/assets/bootstrap.min.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="css/assets/font-awesome.min.css">
    <!-- Google Fonts -->
	<link href="https://fonts.googleapis.com/css?family=Montserrat:600,700%7COpen+Sans:400,600" rel="stylesheet">     
	<!-- Popup -->
	<link href="css/assets/magnific-popup.css" rel="stylesheet"> 
	<!-- Slick Slider -->
	<link href="css/assets/slick.css" rel="stylesheet"> 	
	<link href="css/assets/slick-theme.css" rel="stylesheet"> 	   
	<!-- owl carousel -->
	<link href="css/assets/owl.carousel.css" rel="stylesheet">
	<link href="css/assets/owl.theme.css" rel="stylesheet">
	<!-- Main Menu-->
	<link rel="stylesheet" href="css/assets/meanmenu.css">   
	<!-- Custom CSS -->
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="css/responsive.css">
</head>
<body class="contact">
<?php include __DIR__ . '/includes/marketing-tags-body.php'; ?>
<!-- Preloader -->
<div id="preloader">
	<div id="status">&nbsp;</div>
</div>
<?php include 'header2.php';?>
		
		<div class="container">
			<div class="row">
				<div class="col-md-12">
					<div class="intro-text ">
						<h1>Contact Us</h1>
						<p><span><a href="index.php">Home <i class='fa fa-angle-right'></i></a></span> <span class="b-active">Contact Us</span></p>
					</div>
				</div>
			</div><!-- /.row -->
		</div><!-- /.container -->
	</div>
</header>
	<!--  End header section-->


<!-- Contact Area section -->
<section class="contact-area-02">
	<div class="container">
		<div class="row">
			<div class="col-sm-5 contact-info">
				<div class="col-sm-12 contact-title">
					<h2>Contact Info</h2>		
					<!--<p class="content-sub_p">Welcome to our Website. We are glad to have you around.</p>-->
				</div>
				<div class="col-sm-12 contact-box">
					<div class="row">
						<div class="col-sm-12 col-md-6 single-address-box">
                            <div class="single-address">
                                <i class="fa fa-phone"></i>
                                <h4>Make A Call</h4>
                                <br>
                                <p>+91 733 1155 319</p>
                                <p>040 29 55 33 22/23</p>
                            </div>
                        </div>  
                        <div class="col-sm-12 col-md-6  single-address-box">
                            <div class="single-address">
                                <i class="fa fa-envelope"></i>
                                <h4>Send A Mail</h4>
                                <p>btechadmissions.crr@gmail.com</p>
                            </div>
                        </div> 
                        <div class="col-sm-12 col-md-12 single-address-box">
                            <div class="single-address">
                                <i class="fa fa-map-marker"></i>
                                <h4>Location:</h4>
                                <br>
                                <p>C.R.Rao Advanced Institute of Mathematics, Statistics and Computer Science (AIMSCS), University of Hyderabad Campus, Central University Post Office, Prof. CRRao Road, Hyderabad – 500 046, (Telangana) India.</p>
                            </div>
	                    </div> 
	                	<div class="col-sm-12 single-address-box">
	                        <ul class="list-unstyled">
								<li><a href="https://www.facebook.com/people/C-R-Rao-Advanced-Institute-of-Mathematics-Statistics-and-Computer-Science/100070068110483/" target="_blank"><i class="fa fa-facebook teacher-icon"></i></a></li>
								<!--<li><a href=""><i class="fa fa-twitter teacher-icon"></i></a></li>
								<li><a href=""><i class="fa fa-google-plus teacher-icon"></i></a></li>-->
								<li><a href="https://www.linkedin.com/company/70564289/admin/" target="_blank"><i class="fa fa-linkedin teacher-icon"></i></a></li>
								<li><a href="https://www.instagram.com/aimscs/" target="_blank"><i class="fa fa-instagram teacher-icon"></i></a></li>
							</ul>	 
	                	</div> 
                    </div>
                </div>                          	                        
			</div>	

			<div class="col-sm-6  col-sm-offset-1 contact-form">
				<div class="row">
					<div class="col-sm-12 contact-title-btm">
						<h2>Send A Message</h2>		
					<!--	<p class="content-sub_p">Welcome to our Website. We are glad to have you around.</p>-->
					</div>
				</div>
				<div class="input-contact-form">
					<div id="contact">
                    <?php
                        $enquiry_form_id = 'enquiryForm';
                        $enquiry_form_source = 'Contact Page';
                        $enquiry_message_id = 'enquiryMessage';
                        include 'includes/enquiry-form-fields.php';
                    ?>
                    </div>
				</div>
			</div>																
		</div>
	</div>
</section>
<!-- ./ End Contact Area section -->

<?php include 'footer.php';?>
    <!-- ============================
    JavaScript Files
    ============================= -->
    <!-- jQuery -->
	<script src="js/vendor/jquery-1.12.4.min.js"></script>
	<!-- Bootstrap JS -->
	<script src="js/assets/bootstrap.min.js"></script>
	<!-- Sticky JS -->
	<script src="js/assets/jquery.sticky.js"></script>
	<!-- Popup -->
    <script src="js/assets/jquery.magnific-popup.min.js"></script>
	<!-- Counter Up -->
    <script src="js/assets/jquery.counterup.min.js"></script>
    <script src="js/assets/waypoints.min.js"></script>
 	<!-- owl carousel -->
    <script src="js/assets/owl.carousel.min.js"></script>
   <!-- Slick Slider-->
    <script src="js/assets/slick.min.js"></script>
    <!-- Main Menu -->
	<script src="js/assets/jquery.meanmenu.min.js"></script>
	<!-- Custom JS -->
	<script src="js/custom.js"></script>
</body>
</html>
