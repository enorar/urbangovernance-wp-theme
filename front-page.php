<?php
/**
 * The main template file
 * 
 * @package bootstrap-basic
 */

get_header();

?>
				<div class="col-md-12 no-gutter">
					<div id='vis' >
	  				</div>
	  				<div class="overlay">
						<div class="top">
							<div class="overlay-big">
								<span id="cities-count"></span> cities</div> 
								currently included
							</div>
						<div class="bottom">
							<a href="?page_id=46&lang=en">See the results</a>
						</div>
					</div>
				</div>
				<div class="front-page-footer-container">
					<?php get_template_part('templates/partials/footer', 'logos'); ?>
				</div>
				<div class="col-md-12 home-text-container">
					<div class="container">				
						<div class="col-md-12 content-area" id="main-column">
							<main id="main" class="site-main" role="main">
							
								<?php if (have_posts()) { ?> 
								<?php 
								// start the loop
								while (have_posts()) {
									the_post();
									
									/* Include the Post-Format-specific template for the content.
									* If you want to override this in a child theme, then include a file
									* called content-___.php (where ___ is the Post Format name) and that will be used instead.
									*/
									get_template_part('content', get_post_format());
								}// end while
								
								//bootstrapBasicPagination();
								?> 
								<?php } else { ?> 
								<?php get_template_part('no-results', 'index'); ?>
								<?php } // endif; ?> 
								<div class="red-button centered"><a href="?page_id=12&lang=en"><?php echo pll__('View more'); ?></a></div>
							</main>
						</div>
					</div>
				</div>
				<script>loadMap();</script>
<?php //get_footer(); ?> 
