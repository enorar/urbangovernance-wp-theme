function loadMap(){

	var width = $('#vis').width();
	var height = width / 2.7;
	var scale = width * 140 / 970;

	var continentColors = {'Africa':'#D97196','Latin America and the Caribbean':'#F69A4D','Asia':'#8781A7','Europe':'#67B064','Northern America':'#3393C1','Oceania':'#F44228'};
	
	var cityCircles;
	
	var dataByCity = d3.map();
	
	var projection = d3.geo.equirectangular()
		.scale(scale)
		.rotate([-10,0])
		.translate([width / 2, height / 2 +60])
		.precision(.1);
	
	var path = d3.geo.path()
		.projection(projection);

	var mapSvg = d3.select("#vis").append("svg")
		.attr("width", width)
		.attr("height", height)
		.style("display","block")
		.style("margin","auto")
		
	var map= mapSvg.append("g")
	
	map.append("rect")
		.attr("class", "background")
		.attr("width", width)
		.attr("height", height);
	
	var url = '/app/themes/urbangovernance/'
	
	var tooltipdiv = d3.select("body")
		.append("div")
		.attr("class", "arrow_box");
	
	queue()
		.defer(d3.json, url + "data/world-countries.json")
		.defer(d3.csv, url+"data/Surveydatawebsite_FINAL.csv")
		.await(drawMap);
		
	function drawMap(error, borders, cities){
		d3.select('#cities-count').text(cities.length)
		//console.log(borders, cities)
		map.selectAll("path")
			.data(borders.features)
			.enter().append("path")
			.attr("d", path)

		cityCircles = map.selectAll("city")
			.data(cities)
			.enter().append("circle")
			.attr('class', 'citycircle')
			.attr('cx',function(d) { return projection([d.POINT_X,d.POINT_Y])[0]})
			.attr('cy',function(d) { return projection([d.POINT_X,d.POINT_Y])[1]})
			.attr('r', 0)
			.attr('fill', function(d) {return continentColors[d['UN Region Level 2']]})
			//.attr('opacity',.8)
			.on("mouseover", function(d){
				var textTooltip = '<div class="title">'+d.Name;
				tooltipdiv.html(textTooltip)
					.style("top", d3.event.pageY - 25 + "px")
					.style("left", d3.event.pageX + 20 + "px")
				$('.arrow_box').css('display','block');
			})
			.on("mouseout", function(){	$('.arrow_box').css('display','none');})
		cityCircles.transition()
			.delay(function(d, i){ return i * 200 })
			.attr('r', 10)
			.transition()
			.attr('r',4)
		
		d3.select('#vis').selectAll('.citynames')
		 .data(cities)
		 .enter()
		 .append('div')
		 .attr('class','citynames')
		 .style('left',function(d){ return (projection([d.POINT_X,d.POINT_Y])[0]+10)+'px'})
		 .style('top',function(d){ return (projection([d.POINT_X,d.POINT_Y])[1]-10)+'px'})
		 .text(function(d){return d.Name})
		 .style('opacity',0)
		 .transition()
			.delay(function(d, i){ return i * 200 })
			.style('opacity',1)
			.transition()
			.duration(2000)
			.style('opacity',0)	
			
		var cityNames = map.selectAll(".city").style('opacity',0)

		cityNames.transition()
			.delay(function(d, i){ return i * 200 })
			.style('opacity',1)
			.transition()
			.duration(2000)
			.style('opacity',0)			
	}
}
