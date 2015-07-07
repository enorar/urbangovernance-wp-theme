<?php if (is_active_sidebar('sidebar-right-study-case')) { ?> 
				<div class="col-md-3" id="sidebar-right">
					<div class="details">
						<h4 class="title">Case study details</h4>
						<?php 
						$authors = get_post_meta($post->ID, 'Author', false);
						$authors_label = (1 == count($authors)) ? 'Author' : 'Authors';

						$institutions = get_post_meta($post->ID, 'Institution', false);
						$institutions_label = (1 == count($institutions)) ? 'Institution' : 'Institutions'; ?>
						<?php if(!empty($authors)) : ?>
						<h4><?php echo $authors_label; ?></h4>
						<ul>
						<?php foreach($authors as $author) {
							echo '<li>'.$author.'</li>';
							} ?>				
						</ul>
						<?php endif; // (!empty($authors)) ?>
						<?php if(!empty($institutions)) : ?>
						<h4><?php echo $institutions_label; ?></h4>
						<ul>
						<?php foreach($institutions as $institution) {
							echo '<li>'.$institution.'</li>';
							} ?>
						</ul>
						<?php endif; // (!empty($institutionss)) ?>
						<?php do_action('before_sidebar'); ?> 
						<?php dynamic_sidebar('sidebar-right-study-case'); ?>
					</div>
				</div>
<?php } ?> 
