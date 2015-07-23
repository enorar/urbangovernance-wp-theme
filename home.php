<?php
/**
 * Template Name: Blog home
 * Description: WP Blog home, repurposed to display case studies
 * The main template file
 * 
 * @package bootstrap-basic
 */

get_header();
$counter = 0;
?>

				<div class="content-area" id="main-column">
					<main id="main" class="site-main" role="main">
						<div class="row">
							<div class="col-md-12">
								<h1 class="entry-title">Case Studies</h1>
							</div>
						</div>
						<?php if ( is_home() ) : ?>
							<?php get_sidebar('header-home'); ?>
						<?php endif ?>
						<div class="row">
							<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
								<article class="col-md-4" id="post-<?php the_ID(); ?>" role="article">
								<div class="post-block">
								<?php get_template_part('content-all', get_post_format()); 	?>		
								</div>
								</article>
							<?php $counter++;
							  if ($counter % 3 == 0) {
							  echo '</div><div class="row">';
							}
							endwhile; endif; ?>
						</div><!-- /row -->
						<?php bootstrapBasicPagination(); ?>
					</main>
				</div>
<?php get_sidebar('right'); ?> 
<?php get_footer(); ?> 
