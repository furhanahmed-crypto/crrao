<!doctype html>
<html class="no-js" lang="zxx">
<head>
    <?php include __DIR__ . '/includes/head-base-tag.php'; ?>
    <meta charset="utf-8">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="description" content="Training & Placements">
	<meta name="keywords" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Training & Placements</title>
	<link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="css/assets/bootstrap.min.css">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="css/assets/font-awesome.min.css">
    <!-- Google Fonts -->
	<link href="https://fonts.googleapis.com/css?family=Montserrat:600,700&7COpen+Sans:400,600" rel="stylesheet">
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
<body class="t-profile-01">
<?php include __DIR__ . '/includes/marketing-tags-body.php'; ?>
<!-- Preloader -->
<div id="preloader">
	<div id="status">&nbsp;</div>
</div>
<style>
  @media only screen and (max-width: 600px) {
    .Welcome-area {
      padding-top: 0px;
    }
  }

  .placements-highlight-area {
    padding: 80px 0;
    background: #f4f7fa;
  }

  .placements-highlight-area .section-header-l h2 {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    color: #1a3a6b;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .placements-highlight-area .section-header-l p {
    color: #555;
    font-size: 16px;
    max-width: 700px;
    margin: 0 auto;
  }

  .placement-flex-row {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    margin-top: 40px;
  }

  .placement-flex-row > [class*="col-"] {
    display: flex;
    flex-direction: column;
  }

  .placement-flex-row > [class*="col-"] > .placement-card,
  .placement-flex-row .placements-carousel-wrap {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .placement-card {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .placement-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-color: #cbd5e1;
  }

  /* Featured Card specific styles */
  .placement-card.featured-card {
    border-top: 4px solid #fec722;
    background: linear-gradient(180deg, #ffffff 0%, #fcf9f0 100%);
  }

  .featured-badge {
    position: absolute;
    top: 16px;
    left: 16px;
    background: #fec722;
    color: #1a3a6b;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 20px;
    z-index: 10;
    box-shadow: 0 4px 10px rgba(254, 199, 34, 0.3);
    letter-spacing: 0.5px;
  }

  .placement-card-photo {
    width: 100%;
    height: 250px;
    overflow: hidden;
    background: #f1f5f9;
    position: relative;
  }

  .placement-card-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%; /* Centers the face perfectly */
    display: block;
    transition: transform 0.5s ease;
  }

  .placement-card:hover .placement-card-photo img {
    transform: scale(1.04);
  }

  .placement-card-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    text-align: center;
    align-items: center;
  }

  .placement-card-body h3 {
    font-family: "Montserrat", sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #1a3a6b;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .placement-company {
    font-family: "Montserrat", sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #fec722;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .placement-offers-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: auto;
    /* Reserve space for 2 offer pills so 1-offer cards match 2-offer height */
    min-height: 92px;
    justify-content: flex-end;
  }

  .placement-offer-pill {
    background: #f1f5f9;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #334155;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e2e8f0;
  }

  .placement-offer-pill .company-name {
    font-weight: 600;
    color: #1e293b;
  }

  .placement-offer-pill .package-val {
    background: #1a3a6b;
    color: #ffffff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }

  /* Featured Specific Offer Pill */
  .featured-card .placement-offer-pill {
    background: #fffbeb;
    border-color: #fef08a;
  }

  .featured-card .placement-offer-pill .package-val {
    background: #fec722;
    color: #1a3a6b;
  }

  /* Owl carousel v1: stretch visible items to equal height */
  #placements-carousel.owl-carousel .owl-wrapper {
    display: flex !important;
    align-items: stretch;
  }

  #placements-carousel.owl-carousel .owl-item {
    float: none;
    display: flex;
    align-items: stretch;
    height: auto;
  }

  #placements-carousel.owl-carousel .owl-item > .item {
    display: flex;
    width: 100%;
    padding: 0 8px;
  }

  #placements-carousel.owl-carousel .owl-item .placement-card {
    flex: 1;
    width: 100%;
  }

  /* Carousel Navigation overrides */
  .placements-carousel-wrap {
    position: relative;
    padding: 0 15px;
  }

  .placements-carousel-wrap .owl-nav {
    margin-top: 0;
  }

  .placements-carousel-wrap .owl-prev,
  .placements-carousel-wrap .owl-next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    background: #1a3a6b !important;
    color: #fff !important;
    border-radius: 50%;
    font-size: 20px;
    opacity: 0.9;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(26, 58, 107, 0.2);
    z-index: 10;
  }

  .placements-carousel-wrap .owl-prev:hover,
  .placements-carousel-wrap .owl-next:hover {
    background: #fec722 !important;
    color: #1a3a6b !important;
    transform: translateY(-50%) scale(1.05);
    opacity: 1;
  }

  .placements-carousel-wrap .owl-prev {
    left: -22px;
  }

  .placements-carousel-wrap .owl-next {
    right: -22px;
  }

  @media (max-width: 991px) {
    .placement-flex-row {
      row-gap: 30px;
    }
    .placements-carousel-wrap {
      padding: 0;
    }
    .placements-carousel-wrap .owl-prev {
      left: -10px;
    }
    .placements-carousel-wrap .owl-next {
      right: -10px;
    }
  }

  @media (max-width: 767px) {
    .placements-highlight-area {
      padding: 60px 0;
    }
    .placement-card-photo {
      height: 280px;
    }
  }
</style>


<?php include 'header2.php';?>

		<div class="container">
			<div class="row">
				<div class="col-md-12">
					<div class="intro-text ">
						<h1>Training & Placements</h1>
						<p><span><a href="index.php">Home <i class='fa fa-angle-right'></i></a></span> <span class="b-active"> Training & Placements</span></p>
					</div>
				</div>
			</div><!-- /.row -->
		</div><!-- /.container -->
	</div>
</header>
<!--  End header section-->

<section class="placements-highlight-area">
	<div class="container">
		<div class="row">
			<div class="col-sm-12 section-header-box">
				<div class="section-header section-header-l text-center">
					<h2>Our Placed Students</h2>
					<p>Celebrating the success of CR Rao AIMSCS graduates placed with leading global organizations.</p>
				</div>
			</div>
		</div>

		<div class="row placement-flex-row">
			<!-- Featured Star Placement -->
			<div class="col-md-4 col-sm-12">
				<div class="placement-card featured-card">
					<div class="featured-badge">★ STAR PLACEMENT</div>
					<div class="placement-card-photo">
						<img src="images/placements/nihal-reddy-singasani.jpeg" alt="Nihal Reddy Singasani">
					</div>
					<div class="placement-card-body">
						<h3>Nihal Reddy Singasani</h3>
						<div class="placement-company">Goldman Sachs</div>
						<div class="placement-offers-container">
							<div class="placement-offer-pill">
								<span class="company-name">Goldman Sachs</span>
								<span class="package-val">30 LPA</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Other Placed Students Carousel -->
			<div class="col-md-8 col-sm-12">
				<div class="placements-carousel-wrap">
					<div class="owl-carousel" id="placements-carousel">

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/gayathri-settipalli.jpeg" alt="Gayathri Settipalli">
								</div>
								<div class="placement-card-body">
									<h3>Gayathri Settipalli</h3>
									<div class="placement-company">TCS &amp; Servcrust</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">TCS</span>
											<span class="package-val">7 LPA</span>
										</div>
										<div class="placement-offer-pill">
											<span class="company-name">Servcrust</span>
											<span class="package-val">9 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/shaik-zaheer-hussain.jpeg" alt="Shaik Zaheer Hussain">
								</div>
								<div class="placement-card-body">
									<h3>Shaik Zaheer Hussain</h3>
									<div class="placement-company">TCS &amp; Servcrust</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">TCS</span>
											<span class="package-val">9 LPA</span>
										</div>
										<div class="placement-offer-pill">
											<span class="company-name">Servcrust</span>
											<span class="package-val">9 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/sai-hardhik-duvasi.jpeg" alt="Sai Hardhik Duvasi">
								</div>
								<div class="placement-card-body">
									<h3>Sai Hardhik Duvasi</h3>
									<div class="placement-company">Waisl</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Waisl</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/pranavi-singamala.jpeg" alt="Pranavi Singamala">
								</div>
								<div class="placement-card-body">
									<h3>Pranavi Singamala</h3>
									<div class="placement-company">Joly AI</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Joly AI</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/yashaswini-kothapeta.jpeg" alt="Yashaswini Kothapeta">
								</div>
								<div class="placement-card-body">
									<h3>Yashaswini Kothapeta</h3>
									<div class="placement-company">Joly AI</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Joly AI</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/hrithika-chowdary-maddineni.jpeg" alt="Hrithika Chowdary Maddineni">
								</div>
								<div class="placement-card-body">
									<h3>Hrithika Chowdary Maddineni</h3>
									<div class="placement-company">Waisl</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Waisl</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/harshit-vishwas-patil.jpg" alt="Harshit Vishwas Patil">
								</div>
								<div class="placement-card-body">
									<h3>Harshit Vishwas Patil</h3>
									<div class="placement-company">Waisl</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Waisl</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="item">
							<div class="placement-card">
								<div class="placement-card-photo">
									<img src="images/placements/sanju-bhargav-ganugula.jpeg" alt="Sanju Bhargav Ganugula">
								</div>
								<div class="placement-card-body">
									<h3>Sanju Bhargav Ganugula</h3>
									<div class="placement-company">Servcrust</div>
									<div class="placement-offers-container">
										<div class="placement-offer-pill">
											<span class="company-name">Servcrust</span>
											<span class="package-val">8 LPA</span>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="Welcome-area">
	<div class="container">
		<div class="row">

			<div class="col-sm-6 Welcome-area-text">
				<div class="row">
					<div class="col-sm-12 section-header-box">
						<div class="section-header section-header-l">
							<h2>Mentoring Objectives</h2>
						</div><!-- ends: .section-header -->
					</div>
				</div>


							<p>1. Provide the students with the most congenial environment to enhance their Growth and help achieve their goals.</p>
							<p>2. Groom the student into a confident, competent, self-disciplined individual, fully equipped with academic prowess, practical acumen, and strong personal skills.</p>
							<p>3. Assist the students who need extra support to maximize their learning outcomes</p>

			</div><!-- Ends: . -->

			<div class="col-sm-6 welcome-img">
				<img src="images/training1.jpg" alt="" class="img-responsive" style="padding: 20px;">
			</div><!-- Ends: . -->
		</div>
	</div>
</section>

<section class="Welcome-area">
	<div class="container">
		<div class="row">
          <div class="col-sm-6 welcome-img">
				<img src="images/training2.jpg" alt="" class="img-responsive" style="padding: 20px;">
			</div><!-- Ends: . -->
			<div class="col-sm-6 Welcome-area-text">
				<div class="row">
					<div class="col-sm-12 section-header-box">
						<div class="section-header section-header-l">
							<h2>Training Objectives</h2>
						</div><!-- ends: .section-header -->
					</div>
				</div>

				<p>1. Design & organize training programs for the students on strategically relevant competencies along with academics to make them industry ready</p>
	<p>2. Provide necessary behavioral inputs thru a structured program so that our students can take up & overcome any challenges at work & the personal front</p>
	<p>3. Organize periodical review on the effectiveness of the training programs and establish a process for continuous learning</p>
	<p>4. Organize industry visits, and expert sessions to update the knowledge on industrial recent trends</p>

			</div><!-- Ends: . -->


		</div>
	</div>
</section>


<section class="Welcome-area">
	<div class="container">
		<div class="row">

			<div class="col-sm-6 Welcome-area-text">
				<div class="row">
					<div class="col-sm-12 section-header-box">
						<div class="section-header section-header-l">
							<h2>Placement Objectives</h2>
						</div><!-- ends: .section-header -->
					</div>
				</div>

				<p>1. Visualize and get requirements, connect to the recruiting companies thru placement portal, Visits, Built and maintain good relations</p>
<p>2. Integrate and interface with the industry continuously by organizing, and coordinating frequent guest lectures, industry tours, and implant training and projects of industrial relevance to the students</p>
<p>3. Provide expertise counseling to every aspirant student to define their career interests</p>
<p>4. Setup and strengthen the network with Alumni</p>

			</div><!-- Ends: . -->

			<div class="col-sm-6 welcome-img">
				<img src="images/training3.jpg" alt="" class="img-responsive" style="padding: 20px;">
			</div><!-- Ends: . -->

		</div>
	</div>
</section>



<section class="Welcome-area">
	<h2 style="text-align: center; text-decoration: underline;">Our Premium Recruiters</h2>
<img src="images/placement.png" alt="" class="img-responsive" style="padding: 20px; width: 70%; display: block; margin: 0 auto;">


</section>









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
	<script>
		function equalizePlacementCards() {
			var owl = $("#placements-carousel").data("owlCarousel");
			if (!owl) {
				return;
			}

			$("#placements-carousel .placement-card").css("min-height", "");
			$(".placement-flex-row .featured-card").css("min-height", "");

			var visibleCount = owl.options.items || 1;
			var maxHeight = 0;

			for (var i = owl.currentItem; i < owl.currentItem + visibleCount && i < owl.itemsAmount; i++) {
				maxHeight = Math.max(maxHeight, $(owl.owlItems[i]).find(".placement-card").outerHeight());
			}

			if (!maxHeight) {
				return;
			}

			for (var j = owl.currentItem; j < owl.currentItem + visibleCount && j < owl.itemsAmount; j++) {
				$(owl.owlItems[j]).find(".placement-card").css("min-height", maxHeight);
			}

			if ($(window).width() >= 992) {
				$(".placement-flex-row .featured-card").css("min-height", maxHeight);
			}
		}

		$(document).ready(function () {
			$("#placements-carousel").owlCarousel({
				items: 2,
				lazyLoad: true,
				navigationText: [
					"<i class='fa fa-angle-left'></i>",
					"<i class='fa fa-angle-right'></i>",
				],
				slideSpeed: 500,
				paginationSpeed: 1000,
				rewindSpeed: 1000,
				navigation: true,
				pagination: false,
				autoPlay: 5000,
				stopOnHover: true,
				responsive: {
					0: { items: 1, nav: true },
					600: { items: 2, nav: true },
					992: { items: 2, nav: true, loop: true },
				},
				afterInit: equalizePlacementCards,
				afterUpdate: equalizePlacementCards,
				afterMove: equalizePlacementCards,
			});

			$(window).on("resize", equalizePlacementCards);
		});
	</script>
</body>
</html>
