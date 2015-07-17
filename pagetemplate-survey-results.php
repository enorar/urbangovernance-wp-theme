<?php
/**
 * Template Name: Survey results
 * Description: Page template for survey results visualisation
 * 
 * @package Urban Governance
 * @since Urban Governance 1.1
 */

get_header();

?> 
	<script>
	  $(document).ready(function(){
		$("#sticker1").sticky({topSpacing:0});
		//var visheaderheight= $(".vis-header")
		$("#sticker2").sticky({topSpacing:46});
	  });
	</script> 
<div class='vis-header container' id="sticker1" >
	<div class="row">
		<div class="col-xs-12 col-md-3 borderright">
			<!--div class="theme-title pull-left">Theme title</div-->
			<div class="next-previous pull-right">
				<span class="pull-left" id="previous">previous</span>
				<span class="pull-right" id="next">next</span>				
			</div>
		</div>
		<div class="col-xs-8 col-md-6">
			<input class="form-control" type="text" placeholder="Highlight cities" id="city-search" ></input>
		</div>
		<div class= "col-xs-4 col-md-3">
			<div class="colourby pull-left">
				Colour by:
			</div>
			<div class="dropdown pull-right">
				<div id="mainitem">
					<div class="selected-item pull-left">World Region</div> 
					<div class="split pull-right"></div>
				</div>
				<div id="subitem">
					<ul></ul>
				</div>			
			</div>
		</div>
	</div>
</div>
<div class='fixed-container container no-events' id="sticker2">
	  <div class="row">
	  	<div class="col-md-3 ">
	  		<div id="question-area">
	  		</div>
	  		<div id="city-info">
	  			<div class="pull-right" id="close">close</div>
				<div class="city-name"></div>
				<div class="city-data"></div>
	  		</div>
		</div>
		<div class="col-md-9 no-gutter">
			<div id='vis'>
	  		</div>
	  		<div class="col-md-9 logos-vis">
			<h4>How Cities are Governed</h4>
			A global survey by LSE Cities, UN-Habitat and UCLG	
			</div>
			<div class="col-md-3 logos-vis"><div class='mail'><a href="mailto:survey@urbangovernance.net">Send us your feedback</a></div></div>
		</div>
	</div>
</div>

<div class='container' id='graphic'>
	<div class="row">
		<div id='sections' class="col-md-3 borderright">
			<section id="sectionq00" class="step">
				<ol>
					<li>Scroll slowly to see the charts</li>
					<li>Click on a dot for information about a city</li>
					<div id="scroll" class="centered">scroll</div>
				</ol>
			</section>
		</div>
	</div>	
</div>
					
					
<script>loadSurvey()</script>

<?php //get_footer(); ?> 
