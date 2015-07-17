<?php
/**
 * Template Name: Exploring the data
 * Description: Page template for data explorer
 * 
 * @package Urban Governance
 * @since Urban Governance 1.1
 */

get_header();

?> 
	<script>
	  $(document).ready(function(){
		$("#sticker1").sticky({topSpacing:0});
	  });
	</script> 
				<div class="col-md-12 content-area" id="main-column">
					<main id="main" class="site-main" role="main">
						<?php 
						while (have_posts()) {
							the_post();

							get_template_part('content', 'page');

						} //endwhile;
						?> 
					</main>
<div id="sticker1">
					<div class='vis-header container' >	
						<div class="row selection-row">
							<div class="col-xs-3 col-md-1 colourby">Sort by:</div>
							<div class="col-xs-9 col-md-4">
								<div class="dropdown">
									<div id="mainitem-sort">
										<div class="selected-item-sort pull-left">Revenue vs Expenditure</div> 
										<div class="split pull-right"></div>				
									</div>
									<div id="subitem-sort">
										<ul></ul>
									</div>			
								</div>		
							</div>
							<div class="col-xs-3 col-md-2 colourby">
								Colour by:
							</div>
							<div class= "col-xs-9 col-md-5">
								<div class="dropdown">
									<div id="mainitem">
										<div class="selected-item pull-left">World Region</div> 
										<div class="split pull-right"></div>
									</div>
									<div id="subitem">
										<ul></ul>
									</div>	<!-- subitem -->		
								</div>
							</div>
						</div>
						<div class="row legend-row">
							<div class="col-xs-12 col-md-5 legend-sort">
							</div>
							<div class= "col-xs-12 col-md-7 legend-color">
							</div>
						</div>
					</div>
</div>
					<div class='container' >
						<div class="row">
							<div id='vis' class="col-md-12">
							</div>
						</div>	
					</div>
				</div>
<?php get_footer(); ?> 

<script> loadVis();
</script>
