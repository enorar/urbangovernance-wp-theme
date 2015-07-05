var displayCities = function(error, cities, surveyData){
	var width = $('#vis').width();
	var rawHeight = 4000;
	var margin = {top:50, left:0, bottom:10, right:0};
	var height = rawHeight -margin.top-margin.bottom;
	var scale = width * 140 / 878;

    var infEconLabels = ["don't know or no answer","0-5","5-10","10-20","20-30","30-40","40-50","50-60","60-70","70-80","70-80","> 90","I don't know."];
   
	var activeColour = 'reg';//'UN Region Level 2';
	var activeIndicator = '_exprev';

	var cityCircles, cityInfo, cityData;
	
	var maxValue = {}, minValue = {}, minValueColour = {}, maxValueColour = {};
	
	var continentColors = {'Africa':'#D97196','Latin America and the Caribbean':'#F69A4D','Asia':'#8781A7','Europe':'#67B064','Northern America':'#3393C1','Oceania':'#F44228'};

	var populationColors = ['#ffCCCD','#ff7f84','#ff0009','#B20006','#7f0004']

	var populationQuantile = d3.scale.quantile()
		.domain([0,500000,1000000,5000000,10000000,100000000])
		.range(populationColors)

	var wealthColors = ['#ff0009', '#ff8504', '#fac808'].reverse();

	var wealthQuantile = d3.scale.quantile()
		.domain([0,2000,20000,100000000])
		.range(wealthColors)

	var surveyDataByCity = d3.map();
	
	var projection = d3.geo.equirectangular()
		.scale(scale)
		.rotate([-10,0])
		.translate([width / 2, 280])
		.precision(.1);
	
	var path = d3.geo.path()
		.projection(projection);
	   
	var tooltipdiv = d3.select("body")
		.append("div")
		.attr("class", "arrow_box");

	var legenddiv = d3.select(".legend-color")
		.append("div")
		.attr("class", "legenddiv")

	// continent legend
	var continentLegend = legenddiv.append('div')
		.attr('class','reg-legend legend')
		.append('svg')
		.attr('width',602)
		.attr('height',60)
		.append('g')
		.attr("transform","translate(0,50)")
		.selectAll('.legendItem')
		.data(d3.entries(continentColors))
		.enter()
		.append("g")
		.attr('class','legendItem')
	
	continentLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -4)
		.attr('fill',function(d){return d.value})
		.attr('r',5)

	continentLegend.append('text')		
		.attr('x', 18)
		.style("text-anchor", 'start')
		.text(function(d){return d.key})

	rearrangeLegendItem('reg-legend')	
	
	// population legend
	var populationLegend = legenddiv.append('div')
		.attr('class','pop-legend legend')
		.append('svg')
		.attr('width',660)
		.attr('height',60)
		.append('g')
		.attr("transform","translate(0,50)")
		.selectAll('.legendItem')
		.data([' < 500,000', '500,000 - 1,000,000','1,000,000 - 5,000,000','5,000,000 - 10,000,000', ' >  10,000,000'])
		.enter()
		.append("g")
		//.attr("transform",function(d,i){ return "translate(0,"+ i*22 +")"})
		.attr('class','legendItem')
	
	populationLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -4)
		.attr('fill',function(d,i){return populationColors[i]})
		.attr('r',5)
	
	populationLegend.append('text')
		.attr('x', 18)
		.style("text-anchor", 'start')
		.text(function(d){return d})

	rearrangeLegendItem('pop-legend')	
	
	legenddiv.select('.pop-legend').style('display','none')
	

	// wealth legend
	var wealthLegend = legenddiv.append('div')
		.attr('class','gdp-legend legend')
		.append('svg')
		.attr('width',305)
		.attr('height',60)
		.append('g')
		.attr("transform","translate(0,50)")
		.selectAll('.legendItem')
		.data(['low income', 'middle income', 'high income'])
		.enter()
		.append("g")
		.attr('class','legendItem')
	
	wealthLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -4)
		.attr('fill',function(d,i){return wealthColors[i]})
		.attr('r',5)
	
	wealthLegend.append('text')
		.attr('x', 18)
		.style("text-anchor", 'start')
		.text(function(d){return d})

	rearrangeLegendItem('gdp-legend')		
	legenddiv.select('.gdp-legend').style('display','none')

/* sort legend */	
	var legenddivsort = d3.select(".legend-sort")
		.append("div")
		.attr("class", "legenddiv")

	var sortLegend = legenddivsort.append('div')
		.attr('class','size-legend legend')
		.append('svg')
		.attr('width',250)
		.attr('height',87)
		.append('g')
		.attr("transform","translate(15,50)")
		.selectAll('.legendItem')
		.data([{'label':'min','size':5},{'label':'max','size':40}])
		.enter()
		.append("g")
		.attr('class',function(d){ return 'legendItem '+d.label})
	
	sortLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -4)
		.attr('fill','#CCC')
		.attr('r',10)

	sortLegend.append('text')
		//.attr('x', 18)
		.style("text-anchor", 'start')
		.text(function(d){return d.label})
	
	var svg = null;
	var g = null;
	var labelsGroup = null;
	var qCircles = null;

	var citySelected, citySelectedId;

	//change array depending on language 
	var colourByOptions= [{'id':'reg','name':'World Region', 'value':'UN Region Level 2'},{'id':'pop','name':'Population', 'value':'Population'},{'id':'gdp','name':'Wealth','value':'GDP/Capita (per country) 2013 - World Bank Data'}];

	d3.select('#subitem ul').selectAll('li')
		.data(colourByOptions)
		.enter()
		.append('li')
		.attr('id',function(d){return d.id})
		.text(function(d){return d.name})
		.on('click', colourBy)

	// circle size
	var sortByOptions = [{'id':'exp-rev','name':'Revenue vs Expenditure','value':'_exprev'},{'id':'inf-eco','name':'% of informal economy','value':'_infeco'},{'id':'num-pol','name':'No. of policy sectors led by the city','value':'Policy sectors count'},{'id':'loc-pol','name':'No. of participatory mechanisms available to citizens','value':'Local policies count'},{'id':'voter','name':'Voters Turnout (latest election)','value':'Voters Turnout (latest election)'}]

	d3.select('#subitem-sort ul').selectAll('li')
		.data(sortByOptions)
		.enter()
		.append('li')
		.attr('id',function(d){return d.id})
		.text(function(d){return d.name})
		.on('click', sortBy)

	var iconWidth = 100;
	var iconHeight = 120;
	var iconMargin = 20;
	var iconsPerRow = Math.floor(width/iconWidth);
	var rawHeight = (Math.floor(cities.length/iconsPerRow)+1)*iconHeight + iconMargin;

	svg = d3.select("#vis").append("svg")
		.attr("width", width+ margin.left + margin.right)
		.attr("height", rawHeight)
		.append('g')
		.attr('transform',"translate("+margin.left+','+margin.top+")")
		.style("display","block")
		.style("margin","auto")				

	g = svg.append("g").attr('class','circles')

	var allCityNames = [];

	surveyDataByCity = d3.map(surveyData, function(d) {return d.Name.trim()})
	
	//initializing different values for the cities
	cities.forEach(function(d,i){
		d.Name = d.Name.trim();
		d.x = {};
		d.y = {};
		d.radius = {};
		d._id = i;
		
		if (!isNaN(d.Expenditure) && !isNaN(d.Revenue)) d._exprev = (d.Revenue/d.Expenditure)*100;
		else d._exprev = -1;

		if (!isNaN(d.Revenue) && !isNaN(d.Population)) d._revpercap = (d.Revenue/d.Population);
		else d._revpercap = -1;

		// cleaning up data
		console.log(d.Name)
		d._infeco = +surveyDataByCity.get(d.Name.trim()).q0902; 
		if (d._infeco == 12) d._infeco = 0; // 12 is "I don't know"
		
		d['Policy sectors count'] = (d['Policy sectors count'] == 'n/a')? -1 : parseInt(d['Policy sectors count']);
		d['Voters Turnout (latest election)'] = (d['Voters Turnout (latest election)'] == 'n/a')? -1 : Number(d['Voters Turnout (latest election)'].replace('%',''));
		allCityNames.push({'name':d.Name,'id':i})
	})

	cities.sort(function(obj1, obj2) {
		var textA = obj1['UN Region Level 2'].toUpperCase();
		var textB = obj2['UN Region Level 2'].toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});

	sortByOptions.forEach(function(g){ 
		var indicator = g['value'];
		if (g.id == 'inf-eco') minValue[indicator] = 1;
		else minValue[indicator] = d3.min(cities, function(d){if (d[indicator]!= 'n/a' && d[indicator] >= 0) return +d[indicator]});
		maxValue[indicator] = d3.max(cities, function(d){if (d[indicator]!= 'n/a' && d[indicator] >= 0) return +d[indicator]});
	})
	colourByOptions.forEach(function(g){ 
		var indicator = g['value'];
		minValueColour[indicator] = d3.min(cities, function(d){if (d[indicator]!= 'n/a' && d[indicator] >= 0) return +d[indicator]});
		maxValueColour[indicator] = d3.max(cities, function(d){if (d[indicator]!= 'n/a' && d[indicator] >= 0) return +d[indicator]});
	})

	cities.forEach(function(d,i){
		d.pos = {};
		d.rank = {};
		d.order = i;
	})

	sortByOptions.forEach(function(g){ //recalculating for all indicators
		var indicator = g.value;
		cities.sort(function(a, b){
			 return (b[indicator] - a[indicator]);
		})

		cities.forEach(function(d, i){
			var x = (i - iconsPerRow * Math.floor(i/iconsPerRow)) * iconWidth + iconMargin;
			var y = Math.floor(i/iconsPerRow) * iconHeight + iconMargin;
			d.pos[indicator] = [x,y];
		})
	})


	
	var scaleCircle = function(indicator,value){
		var range = [5,40];
		var domain = [minValue[indicator],maxValue[indicator]];
		var scale = d3.scale.sqrt() 
		.domain(domain)
		.range(range);		
		return scale(value);
	}

	sortLegendContent(sortByOptions[0])
	
	cityCircles = g.selectAll(".city")
		.data(cities)
		.enter()
		.append('g')
		.attr('class','city')
		.attr("transform", function(d){return "translate("+d.pos['_exprev'][0]+","+d.pos['_exprev'][1]+")";})
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)

	cityCircles.append('circle')
		.attr('cx', iconWidth/2)
		.attr('cy', 10)
		.attr('r', function(d){return scaleCircle('_exprev',d._exprev)})
		.attr('fill',function(d){return continentColors[d['UN Region Level 2']]})
		.style('pointer-events','all')

	
	cityCircles.append('g').attr('transform','translate(50,-40)')
		.attr('class','label')
		.append("text")
		//.attr("x",iconWidth)
		.attr("y",0)
		.attr("dy",0)
		.text(function(d){return d.Name})
		.call(wrap,90)

	cityCircles.filter(function(d){ return (d._exprev < 0)})	
		.style('opacity',0)
		.style('pointer-events','none')

	/*---- single choice functions --- */

	function circleColour(d){
		if (activeColour == 'pop') return populationQuantile(d['Population']);
		else if (activeColour == 'reg') return continentColors[d['UN Region Level 2']]
		else if (activeColour == 'gdp'){
			var gdp = d['GDP/Capita (per country) 2013 - World Bank Data'];
			return wealthQuantile(gdp);
		}
		else if (activeColour =='exp') return expenditureQuantile(d._exppercap);
		else if (activeColour =='rev') return revenueQuantile(d._revpercap);
	}

	function colourBy(d){
		activeColour = d.id;
		$('.selected-item').text(d.name);
		$('#subitem').slideUp()
		d3.selectAll('.city circle')
			.attr('fill', function(g){return circleColour(g)} )

		//legend
		legenddiv.selectAll('.legend').style('display','none');
		legenddiv.select('.'+ d.id +'-legend').style('display','block')
	}
	
	function sortBy(g){
		activeIndicator = g.value;
		$('.selected-item-sort').text(g.name);
		$('#subitem-sort').slideUp()
		
		var transition = cityCircles
			.style('pointer-events','all')
			.transition()
			.duration(1000)
			.style('opacity',1)
			
		transition.attr("transform", function(d){return "translate("+d.pos[g.value][0]+","+d.pos[g.value][1]+")";})
		transition.filter(function(d){ return (d[g.value] <= 0)})
			.style('opacity',0)
			.style('pointer-events','none')
		transition.select('circle')
			.attr('r', function(d){return scaleCircle(g.value,d[g.value])})
			
		sortLegendContent(g)
	
	}

	function mouseover(d){
		var sortOption = $.grep(sortByOptions, function(e){ return e.value == activeIndicator; });
		var colourOption = $.grep(colourByOptions, function(e){ return e.id == activeColour; });

		var value = formatSizeValue(d[activeIndicator]);
		
		if (activeColour == 'pop' || activeColour == 'reg' ) var colourValue = d[colourOption[0].value]
		else if (activeColour == 'gdp') var colourValue = d[colourOption[0].value];
		else var colourValue = d[colourOption[0].value].toFixed(2);
		
		var textTooltip = '<div class="title">'+d.Name+', '+d.Country+'</div>'+sortOption[0].name+': <strong>'+ value+'</strong></br>'+ colourOption[0].name+': <strong>'+ colourValue+'</strong>';
		//+'</br>Expenditure: '+numberWithCommasDolarFormat(d.Expenditure)+'</br>Revenue: '+numberWithCommasDolarFormat(d.Revenue);
		tooltipdiv.html(textTooltip)
			.style("top", d3.event.pageY - 40 + "px")
			.style("left", d3.event.pageX + 25 + "px")
		$('.arrow_box').css('display','block');
		
		
	}

	function mouseout(){
		//d3.selectAll('.mouseover').classed('mouseover', false)
		$('.arrow_box').css('display','none');
	}

	function sortLegendContent(g){
		//circles
		sortLegend.select('.min circle')
			.attr('cx',scaleCircle(g.value,minValue[g.value]))
			.attr('r',scaleCircle(g.value,minValue[g.value]))
		sortLegend.select('.max circle')
			.attr('cx',scaleCircle(g.value,maxValue[g.value]))
			.attr('r',scaleCircle(g.value,maxValue[g.value]))
		// text
		sortLegend.select('.min text').text(formatSizeValue(minValue[g.value]))
			.attr('x',15)
		sortLegend.select('.max text').text(formatSizeValue(maxValue[g.value]))
			.attr('x',90)
		
		rearrangeLegendItem('size-legend')
		
	}

	function rearrangeLegendItem(legendClass){
		var previousWidth = 0;		
		d3.selectAll('.'+legendClass+' .legendItem')
			.each(function(d){
				d3.select(this).attr("transform","translate("+previousWidth+",0)")
				var bbox = d3.select(this).node().getBBox();
				previousWidth += Math.round(bbox.width) + 10;
			})		
	}
	function formatSizeValue(value){
		if (activeIndicator == '_infeco') return infEconLabels[value]; 
		else if (activeIndicator == '_exprev' || activeIndicator == 'Voters Turnout (latest election)') return  +value.toFixed(2)+'%';
		else return value;
	}
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(), //.split(/\s|-/).reverse()
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1, // ems
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

		if (words.length > 1){
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
			  if (tspan.node().getComputedTextLength() > width){
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em")
				.attr('class','line-'+lineNumber).text(word);
			  }
			}
		}
		// no wrapping in case the text has only one word even when it's too long
		else tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", "0em").text(words.pop());
	  });
	}

	$('#subitem').hide();
	
	$('#mainitem').click(function() { 
		$('#subitem').slideToggle()
	})

	$('#subitem-sort').hide();
	
	$('#mainitem-sort').click(function() { 
		$('#subitem-sort').slideToggle()
	})

	
	function numberWithCommasDolarFormat(x) {
		return '$'+x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
}

d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

/*$(document).ready(function(){
    $(this).scrollTop(0);
});*/

function loadVis(){
	var url = '/app/themes/urbangovernance/';
	//var url ='';
	
	queue()
		.defer(d3.csv, url+"data/Surveydatawebsite_FINAL.csv")
		.defer(d3.csv, url+"data/Survey81_Respondents-2.csv")
		.await(displayCities);
}
