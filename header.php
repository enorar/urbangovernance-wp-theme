<?php
/**
 * The theme header
 * 
 * @package bootstrap-basic
 */
?>
<!DOCTYPE html>
<!--[if lt IE 7]>  <html class="no-js lt-ie9 lt-ie8 lt-ie7" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 7]>     <html class="no-js lt-ie9 lt-ie8" <?php language_attributes(); ?>> <![endif]-->
<!--[if IE 8]>     <html class="no-js lt-ie9" <?php language_attributes(); ?>> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js" <?php language_attributes(); ?>> <!--<![endif]-->
	<head>
		<meta charset="<?php bloginfo('charset'); ?>">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title><?php wp_title('|', true, 'right'); ?></title>
		<meta name="viewport" content="width=device-width">
		<link rel="profile" href="http://gmpg.org/xfn/11">
		<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
		<!--wordpress head-->
		<?php wp_head(); ?>
	</head>
	<body <?php body_class(); ?>>
		<!--[if lt IE 8]>
			<p class="chromeframe">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> or <a href="http://www.google.com/chromeframe/?redirect=true">activate Google Chrome Frame</a> to improve your experience.</p>
		<![endif]-->
<div id="wrap">
<header role="banner">
	<div class="container-fluid">
	<?php do_action('before'); ?> 
		<div class="row main-title">
			<div class="container">	
				<div class="row">
					<div class="col-xs-10 col-md-10"><h1>
						<a href="<?php echo esc_url(home_url('/')); ?>" title="<?php echo esc_attr(get_bloginfo('name', 'display')); ?>" rel="home"><?php bloginfo('name'); ?></a></h1>
						<div class="site-description">
							<?php bloginfo('description'); ?> 
						</div>
					</div>
					<div class="col-xs-2 col-md-2 page-header-top-right">
							<?php if (is_active_sidebar('header-right')) { ?> 
							<div class="pull-right">
								<?php dynamic_sidebar('header-right'); ?> 
							</div>
							<div class="clearfix"></div>
							<?php } // endif; ?> 
					</div>
				</div>
			</div>
		</div>
		<div class="row nav-header">
			<div class="container">
				<div class="row">	
					<div class="col-md-12">
					   <nav id="site-navigation" class="main-navigation" role="navigation">
						  <?php
						  if ( has_nav_menu( 'primary' ) ) {
							 wp_nav_menu(
								array(
								   'theme_location' => 'primary',
								   'menu_class'    => 'menu menu-primary-container'
								)
							 );
						  }
						  else {
							 wp_page_menu();
						  }
						  ?>
					   </nav>  
					</div>
				</div>
			</div><!--.nav-header--> 
		</div>
		<div class="row nav-breadcrumb">
			<div class="container">
				<div class="row">	
					<div class="col-md-12">
						<div class="breadcrumbs" xmlns:v="http://rdf.data-vocabulary.org/#">
							<?php if(function_exists('bcn_display'))
							{
								bcn_display();
							}?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div> <!-- container fluid -->
</header>		
<?php 
if( is_front_page() ) { ?>
	<div class= "container-fluid page-container">
<?php
}
else {  ?>
<div class= "container page-container">
<?php 
} 
if( is_home() ) { ?>
	<div id="content" class="site-content">
<?php
}
else {  ?>
	<div id="content" class="row site-content">
<?php 
} ?>

			
			