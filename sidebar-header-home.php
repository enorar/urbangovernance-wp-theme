<?php if (is_active_sidebar('sidebar-header-home')) : ?>
<div class="row">
	<div class="col-md-12" id="sidebar-header-home">
		<div class="blurb">
			<?php do_action('before_sidebar'); ?> 
			<?php dynamic_sidebar('sidebar-header-home'); ?>
		</div>
	</div>
</div>
<?php endif; // (is_active_sidebar('sidebar-header-home')) ?>
