<?php if (is_active_sidebar('sidebar-right-study-case')) { ?> 
				<div class="col-md-3" id="sidebar-right">
					<div class="details">
						<h4 class="title">STUDY CASE DETAILS</h4>
						<?php 
						$authors = get_post_meta($post->ID, 'Author', false); 
						$institutions = get_post_meta($post->ID, 'Institution', false); ?>
						<h4>Author/s</h4>
						<ul>
						<?php foreach($authors as $author) {
							echo '<li>'.$author.'</li>';
							} ?>				
						</ul>
						<h4>Institution</h4>
						<ul>
						<?php foreach($institutions as $institution) {
							echo '<li>'.$institution.'</li>';
							} ?>
						</ul>
						<?php do_action('before_sidebar'); ?> 
						<?php dynamic_sidebar('sidebar-right-study-case'); ?>
					</div>
				</div>
<?php } ?> 