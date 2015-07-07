<?php
/**
 * support for sidebars in pages
 * If the Sidebar content box (aside Pods field) has any content,
 * main content is shrunk to 9/12 cols and a 3/12 cols sidebar
 * is added with the content of the aside field.
 */
$pod = pods('page', pods_v('last', 'url'));
$aside = $pod->display('aside');
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('row'); ?>>
	<header class="entry-header col-md-12">
		<h1 class="entry-title"><?php the_title(); ?></h1>
	</header><!-- .entry-header -->

	<div class="entry-content<?php if(!empty($aside)) { echo ' col-md-9'; } else { echo ' col-md-12'; } ?>">
		<?php the_content(); ?> 
		<div class="clearfix"></div>
		<?php
		/**
		 * This wp_link_pages option adapt to use bootstrap pagination style.
		 * The other part of this pager is in inc/template-tags.php function name bootstrapBasicLinkPagesLink() which is called by wp_link_pages_link filter.
		 */
		wp_link_pages(array(
			'before' => '<div class="page-links">' . __('Pages:', 'bootstrap-basic') . ' <ul class="pagination">',
			'after'  => '</ul></div>',
			'separator' => ''
		));
		?>
	</div><!-- .entry-content -->
	
	<?php if(!empty($aside)) : ?>
	<aside class="col-md-3">
	<?php echo $aside; ?>
	</aside>
	<?php endif; // (!empty($aside)) ?>
	
	<footer class="entry-meta">
		<?php bootstrapBasicEditPostLink(); ?> 
	</footer>
</article><!-- #post-## -->
