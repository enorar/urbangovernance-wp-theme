var scrollVis = function(borders, cities, surveyData, titles, shortQuestions){
	var width = $('#vis').width();
	var rawHeight = 500;
	var margin = {top:20, left:0, bottom:10, right:0};
	var height = rawHeight -margin.top-margin.bottom;
	var scale = width * 140 / 878;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
	var lastIndex = -1;
	var activeIndex = 0;

	var activeQuestion = '';
	var activeColour = 'reg';//'UN Region Level 2';

	var cityCircles, borders, cityInfo, cityData;
	var radiusCircle = 5;
	var circlePad = 2;
	var qRadiusCircle = {};
	var qCountArray ={};
	
	var delayCircles = 10;
	var delayQCircles = 7;
	var delayLabels = 100;
	var delayAmount = 20;
	
	var opacityMap = .4;
	var opacityUnselected = 1;
	var removeDuration = 100;
	
	var highlightIndex = 0;
	var highlightIndexId = {};
	
	var continentColors = {'Africa':'#D97196','Latin America and the Caribbean':'#F69A4D','Asia':'#8781A7','Europe':'#67B064','Northern America':'#3393C1','Oceania':'#FF0009'};

	var populationColors = ['#ffCCCD','#ff7f84','#ff0009','#B20006','#7f0004']
	//['#006799','#2684B2','#4CA2CC','#72BFE5','#99DDFF'].reverse();blue 

	var populationQuantile = d3.scale.quantile()
		.domain([0,500000,1000000,5000000,10000000,100000000])
		.range(populationColors)

	var wealthColors = ['#ff0009', '#ff8504', '#fac808'].reverse();

	var wealthQuantile = d3.scale.quantile()
		.domain([0,2000,20000,100000000])
		.range(wealthColors)	

	var alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']; //for matrix

	var questions = [];
	shortQuestions.forEach(function(d){questions.push(d.qcode.trim())});

	// this is used for matrix chart which needs to be divided in sections
	var questionGroups = {'q05':[0,8],'q25a':[0,6],'q25b':[6,11],'q40a':[0,7],'q40b':[7,13],'q40c':[13,20]};

	var calculatedQuestions = []; //this array will store the questions from which the dot coordinates have already been calculated

	var titlesByCode = d3.map(titles, function(d) {return d.code})
	var surveyDataByCity = d3.map();
	var dataByCity = d3.map();
	
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

	var legenddiv = d3.select("#vis")
		.append("div")
		.attr("class", "legenddiv")
		.append('div')
		.attr('class','legendtoggle')

	var themetitle = d3.select("#vis")
		.append("div")
		.attr('class','theme-title')
	
	d3.select('.legenddiv').append('div')
		.attr('id','legendclose')
		.text('Show Legend')

	// continent legend
	var continentLegend = legenddiv.append('div')
		.attr('class','reg-legend legend')
		.append('svg')
		.append('g')
		.attr("transform","translate(0,18)")
		.selectAll('.legendItem')
		.data(d3.entries(continentColors))
		.enter()
		.append("g")
		.attr("transform",function(d,i){ return "translate(0,"+ i*22 +")"})
		.attr('class','legendItem')
	
	continentLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -5)
		.attr('fill',function(d){return d.value})
		.attr('r',5)
	
	continentLegend.append('text')		
		.attr('x', 22)
		.style("text-anchor", 'start')
		.text(function(d){return d.key})

	// population legend
	var populationLegend = legenddiv.append('div')
		.attr('class','pop-legend legend')
		.append('svg')
		.append('g')
		.attr("transform","translate(0,20)")
		.selectAll('.legendItem')
		.data([' < 500,000', '500,000 - 1,000,000','1,000,000 - 5,000,000','5,000,000 - 10,000,000', ' >  10,000,000'])
		.enter()
		.append("g")
		.attr("transform",function(d,i){ return "translate(0,"+ i*22 +")"})
		.attr('class','legendItem')
	
	populationLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -5)
		.attr('fill',function(d,i){return populationColors[i]})
		.attr('r',5)
	
	populationLegend.append('text')
		.attr('x', 22)
		.style("text-anchor", 'start')
		.text(function(d){return d})
		
	legenddiv.select('.pop-legend').style('display','none')
	

	// wealth legend
	var wealthLegend = legenddiv.append('div')
		.attr('class','gdp-legend legend')
		.append('svg')
		.append('g')
		.attr("transform","translate(0,20)")
		.selectAll('.legendItem')
		.data(['low income', 'middle income', 'high income'])
		.enter()
		.append("g")
		.attr("transform",function(d,i){ return "translate(0,"+ i*22 +")"})
		.attr('class','legendItem')
	
	wealthLegend.append('circle')
		.attr('cx', 10)
		.attr('cy', -5)
		.attr('fill',function(d,i){return wealthColors[i]})
		.attr('r',5)
	
	wealthLegend.append('text')
		.attr('x', 22)
		.style("text-anchor", 'start')
		.text(function(d){return d})
		
	legenddiv.select('.gdp-legend').style('display','none')
	
	var svg = null;
	var g = null;
	var labelsGroup = null;
	var qCircles = null;

	var citySelected, citySelectedId;

	//change array depending on language 
	var colourByOptions= [{'id':'reg','name':'World Region'},{'id':'pop','name':'Population'},{'id':'gdp','name':'Wealth'}];

	d3.select('#subitem ul').selectAll('li')
		.data(colourByOptions)
		.enter()
		.append('li')
		.attr('id',function(d){return d.id})
		.text(function(d){return d.name})
		.on('click', colourBy)

  // When scrolling to a new section
  // the activation function for that
  // section is called.
	var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
	var updateFunctions = [];
  
	var chart = function(selection){
		selection.each(function(){
			svg = d3.select("#vis").append("svg")
				.attr("width", width+ margin.left + margin.right)
				.attr("height", rawHeight)
				.append('g')
				.attr('transform',"translate("+margin.left+','+margin.top+")")
				.style("display","block")
				.style("margin","auto")				

			gBorders = 	svg.append("g").attr('class','borders')
			g = svg.append("g").attr('class','dots')
			
			labelsGroup = svg.append('g').attr('class','labels')
				.attr("transform", "translate(10)")
			
			setupVis();
			setupSections();
		});
	};
	
	var allCityNames = [];
	
	//initializing different values for the cities
	cities.forEach(function(d,i){
		d.x = {};
		d.y = {};
		d.radius = {};
		d._id = i;
		allCityNames.push({'name':d.Name, 'id':i})
	})

	cities.sort(function(obj1, obj2) {
		var textA = obj1['UN Region Level 2'].toUpperCase();
		var textB = obj2['UN Region Level 2'].toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	
	setupVis = function() {

		surveyDataByCity = d3.map(surveyData, function(d) {return d.Name})
		dataByCity = d3.map(cities, function(d) {return d.Name})

		borders = gBorders.selectAll(".borders")
			.data(borders.features)
			.enter()
			.append("path")
			.attr("class","borders")
			.attr("d", path)
			.style("opacity",0);
		
		cityCircles = g.selectAll("city")
			.data(cities)
			.enter().append("circle")
			.attr('id', function(d){return 'city_'+d._id})
			.attr('class', 'citycircle')
			.attr('cx',function(d) { return projection([d.POINT_X,d.POINT_Y])[0]})
			.attr('cy',function(d) { return projection([d.POINT_X,d.POINT_Y])[1]})
			.attr('r', 2)
			.attr('fill', function(d) {return circleColour(d)})
			.on("mouseover", mouseover)
			.on("mouseout", mouseout)
			.on("click", function(d){ selectCity(d)})
			
		cityInfo = d3.select('#city-info')
		cityData = cityInfo.select('.city-data')

	}

	setupSections = function(){

		// setting up text area
		var section = d3.select('#sections').selectAll()
			.data(shortQuestions)
			.enter()
			.append('section')
			.attr('id', function(q){ return 'section'+ q.qcode })
			.attr('class','step')
			//.html(function(q){ return titlesByCode.get(q.substring(0, 3)).questions[0].heading + ' ('+q.qcode+')'})
			.html(function(q){ return q.shortquestion})
			.on('click', function(q) {
					$('html,body').animate({
						scrollTop: $("#section"+q.qcode).offset().top -60
					}, 1000);			
			})

		d3.select('#sections').append('div').attr('id','extra-space')
		
		activateFunctions[0] = showMap;
		count = 1;
		shortQuestions.forEach(function(d){
			var q = d.qcode;
			var chart = titlesByCode.get(q.substring(0, 3)).questions[0].type.family;
			var subtype = titlesByCode.get(q.substring(0, 3)).questions[0].type.subtype;
			
			activateFunctions[count] = function(){ 
				if (chart == "single_choice")showSingleChoice(q);
				else if (chart == "multiple_choice")showMultipleChoice(q);
				else if (chart == "matrix"){
					if (subtype == "single") showMatrixSingle(q);
					else if (subtype ==  "multi") showGroupsMatrix(q, subtype);
					else showGroupsMatrix(q, subtype)
				}
				else console.log('unknown kind of chart', q, chart);
			}
			count ++;
		});

	    for(var i = 0; i < count; i++) { 
			updateFunctions[i] = function() {};
		}
	}

	function showMap(){
		activeQuestion = 'q00';
		borders.transition().style('opacity',1)
		labelsGroup.selectAll("*").style('opacity',0).remove()
		
		cityCircles
			cityCircles.style('opacity',1)
			.transition()
			.ease('cubic')
			.delay(function(d, i){ return i * delayCircles })
			.attr('cx',function(d) { return projection([d.POINT_X,d.POINT_Y])[0]})
			.attr('cy',function(d) { return projection([d.POINT_X,d.POINT_Y])[1]})
			.attr('r', 3)
	}
	/*---- single choice functions --- */
	function showSingleChoice(q){

		activeQuestion = q;
		borders.transition().style('opacity', opacityMap)
		if (qCircles) qCircles.transition().duration(removeDuration).style('opacity',0).remove()

		var titles = titlesByCode.get(q).questions[0].answers.filter(function(d){if (d.position) return true}).sort(function(a, b){ return a.position-b.position })
		var n = titles.length;
		var domain = [];
				
		for (var i = 0; i < n; i++) { domain.push(i+1) }

		var y = d3.scale.ordinal()
				.domain(domain)
				.rangeRoundBands([0, height - 20], .4);
				
		showLabelsVertically(q,titles,n,y.range());		
		positionCirclesY(q,n,y.range());

		cityCircles.style('opacity',function(d){return (d._id == citySelectedId)? 1: opacityUnselected})
			.transition()
			.ease('cubic')
			.delay(function(d, i){ return i * delayCircles })
			.attr('cx',function(d) { return d.x[q]})
			.attr('cy',function(d) { return d.y[q]})
			.attr('r', radiusCircle)

	}
	function showLabelsVertically(q,titles,n,yRange){		
		labelsGroup.selectAll("*").style('opacity',0).remove()
		
		labelsGroup.selectAll(".label")
			.data(titles)
			.enter()
			.append('text')
			.filter(function(d){if (d.position) return d})
			.attr('class','label')
			.attr('y', 5)
			.attr("text-anchor", "end")
  			.attr("transform", function(d,i){ return "translate(205," + yRange[i] + ")"})
  			.attr('dx',0)
			.attr('dy',0)
			.text(function(d){return d.text})
			.call(wrap,200)
			.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)
			
		labelsGroup.selectAll('line')
			.data(titles)
			.enter()		
			.append('line')
			.attr('class','axis-line')
			.attr('x1', 215)
			.attr('x2', 215)
			.attr('y1', 5)
			.attr('y2', height -30)
			
		labelsGroup.append('text')
			.attr('class','label-single-horizontal')
			.attr('y', height - 10)
			.attr('x', 0)
			.attr("text-anchor", "start")
			.text('No answer ')
			
	}
	function positionCirclesY(q,n,yRange) {		
		if (n > 6) circlePerRow = 2;
		else circlePerRow = 4;

		if (calculatedQuestions.indexOf(q) < 0){
			calculatedQuestions.push(q);

			qCountArray[q] = [];
			for (var i = 0; i < n; i++) { qCountArray[q][i] = 0; }

			var count = 0;
			cities.forEach(function(d){
				if (surveyDataByCity.has(d.Name)){
					cityResults = surveyDataByCity.get(d.Name)
					var resultValue = cityResults[q];
					if (resultValue) {
						d.y[q] = (qCountArray[q][resultValue-1] % circlePerRow) * (radiusCircle *2 + circlePad) + yRange[resultValue - 1];
						d.x[q] = 240 + Math.floor(qCountArray[q][resultValue-1]/circlePerRow)* (radiusCircle *2 + circlePad);
						qCountArray[q][resultValue-1] += 1;
					}
					else {
						d.x[q] = count*(radiusCircle *2 + circlePad) + 90;
						d.y[q] = height-13;					
						count += 1;
					}
				}
				else { // names city data and survey data doesn't match
					d.x[q] = 0;
					d.y[q] = 0;	
				}
			})
		}
		
		labelsGroup.append('g').selectAll('.amount')
			.data(qCountArray[q])
			.enter()
			.append('text')
			.attr('class','amount')
			.attr('y',function(d,i){return yRange[i] + 7 })
			.attr('x', function(d){ return Math.ceil(d/circlePerRow ) * (radiusCircle *2 + circlePad) + 230})
			.text(function(d){return d})
			//.attr('opacity',0)
			//.transition()
			//.delay(500)//function(d, i){ return i * delayLabels })
			//.attr('opacity',1)
	}
	
	/*---- multiple choice functions --- */
	function showMultipleChoice(q){
		activeQuestion = q;
		if (qCircles) qCircles.transition().duration(removeDuration).style('opacity',0).remove()

		var titles = titlesByCode.get(q).questions[0].answers.filter(function(d){if (d.position) return true}).sort(function(a, b){ return a.position-b.position })
		var n = titles.length;
		
		var domain = [];
				
		for (var i = 0; i < n; i++) { domain.push(i+1) }

		var x = d3.scale.ordinal()
				.domain(domain)
    			.rangeRoundBands([0, width], .4);
    			
    	var y = d3.scale.ordinal()
				.domain(domain)
    			.rangeRoundBands([0, height - 20 ], .4);
		
		showLabelsVertically(q,titles,n,y.range());
		positionCirclesMultipleChoiceY(q,n,y.range());

		// transition in two parts move circles to q position then show the multiple and hide the city circles
		cityCircles.style('opacity',function(d){return (d._id == citySelectedId)? 1: opacityUnselected})
			.transition()
			.ease('cubic')
			.delay(function(d, i){ return i * delayCircles })
			.attr('cx',function(d) { return d.x[q]})
			.attr('cy',function(d) { return d.y[q]})
			.attr('r', radiusCircle)

	
		qCircles.selectAll('circle')
			.transition()
			.delay(function(d, i){ return i * delayQCircles })
			.style('opacity',function(d){ 
				if (citySelectedId){
					var id = $(this).prop('id');
					id = Number(id.slice(5))
					return (id == citySelectedId)? 1: opacityUnselected;
				}
				else return 1;
			})

		qCircles.selectAll('#city_'+citySelectedId)
			.classed('selected',true)
		
	}
	function positionCirclesMultipleChoiceY(q,n,yRange) {
		var countArray = [];
		var resultValue;
		if (yRange.length > 9) var circlePerRow = 2;
		else var circlePerRow = 3;
		var count = 0;
				
		for (var i = 0; i < n; i++) { countArray[i] = 0; }
		
		qCircles = svg.append('g')
			.attr('class',q)
		
		cities.forEach(function(d){
			if (surveyDataByCity.has(d.Name)){
				var cloneCount = 0;
				resultValue = 0;
				cityResults = surveyDataByCity.get(d.Name)
				for (var i = 0; i <= n; i++){
					var nr = (i+1).toString();
					if (nr.length < 2) nr = '0'+ nr;
					qValue = q+ nr;
					if (cityResults[qValue] == 1){
						resultValue = i+1;		
						if (cloneCount == 0) {
							if (!d.y[q]){ // checking if coordinates have already been calculated
								d.y[q] = (countArray[resultValue-1] % circlePerRow) * (radiusCircle *2 + circlePad) + yRange[resultValue-1];
								d.x[q] = 240 + Math.floor(countArray[resultValue-1]/circlePerRow)* (radiusCircle *2 + circlePad)
							}
						}
						else {
							var newCircle = qCircles.append('circle')
								.attr('class', 'q_circle')
								.attr('id', 'city_'+d._id)
								.attr('r', radiusCircle)
								.attr('fill', circleColour(d))
								.on("mouseover", function(){ mouseover(d)})
								.on("mouseout", mouseout)
								.on("click", function(){ selectCity(d)})
								.attr('cy', (countArray[resultValue-1] % circlePerRow) * (radiusCircle *2 + circlePad) + yRange[resultValue-1])
								.attr('cx', 240 + Math.floor(countArray[resultValue-1]/circlePerRow)* (radiusCircle *2 + circlePad))
								.style('opacity',0)
						}
						countArray[resultValue-1] += 1;
						cloneCount += 1;
					}
				};
				if (cloneCount == 0) {
					d.x[q] = count*(radiusCircle *2 + circlePad) + 90;
					d.y[q] = height-13;
					
					count += 1;
				}
			}
			else { // names city data and survey data doesn't match
				d.x[q] = 0;
				d.y[q] = 0;	
			}
		})
		d3.select('.labels').append('g').selectAll('.amount')
			.data(countArray)
			.enter()
			.append('text')
			.attr('class','amount')
			.attr('y',function(d,i){return yRange[i] + 6 })
			.attr('x', function(d){ return Math.ceil(d/circlePerRow ) * (radiusCircle *2 + circlePad) + 225})
			.text(function(d){return d})
			/*.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)*/
	}

	
	/*---- Matrix menu/multi functions --- */
	
	function showGroupsMatrix(q, subtype){
		activeQuestion = q;
		if (qCircles) qCircles.transition().duration(removeDuration).style('opacity',0).remove()
		
		var xdomain= [], ydomain =[];
		var qRaw = q.substring(0,3);

		var allTitles = titlesByCode.get(qRaw).questions[0].answers;

		var rowTitles = allTitles.filter(function(d){return d.type == "row" }).sort(function(a, b){ return a.position-b.position }).slice(questionGroups[q][0],questionGroups[q][1]);
		var colTitles = allTitles.filter(function(d){return d.type == "col" }).sort(function(a, b){ return a.position-b.position });
		
		var nRow = rowTitles.length;
		var nCol = colTitles.length;
		
		for (var i = 0; i < nCol; i++) { xdomain.push(i+1) }
		for (var i = 0; i < nRow; i++) { ydomain.push(i+1) }

		if (subtype == 'multi') var paddingTop = 30;
		else paddingTop = 50;
		
		var x = d3.scale.ordinal()
				.domain(xdomain)
    			.rangeRoundBands([0, (width-150)], .2);  		

		var y = d3.scale.ordinal()
				.domain(ydomain)
    			.rangeRoundBands([0, (height-paddingTop)], .2); 

		positionCirclesMatrix(q,nRow,nCol,x.range(),y.range(),subtype)
		showLabelsMatrix(q,rowTitles,colTitles,nRow,nCol,x.range(),y.range(), subtype)
		// transition in two parts move circles to q position then show the multiple and hide the city circles
		cityCircles.style('opacity',1)
			.transition()
			.ease('cubic')
			.delay(function(d, i){ return i * delayCircles })
			.attr('r', radiusCircle)
			.attr('cx',function(d) { return d.x[q]})
			.attr('cy',function(d) { return d.y[q]})
			.style('opacity',0)

	}
	
	function showLabelsMatrix(q,rowTitles,colTitles,nRow,nCol,xRange,yRange, subtype) {
		labelsGroup.selectAll("*").style('opacity',0).remove()
		
		if (subtype == 'multi') {
			var paddingLeft = 290;
			var distanceHor = 200;
			var paddingTop = 20;
		}
		else {
			var paddingLeft = 220;
			var distanceHor = xRange[1]-xRange[0];
			var paddingTop = 30;
		}
		
		var distanceVer = yRange[1]-yRange[0];
		
		labelsGroup.append('g').selectAll(".label")
			.data(rowTitles)
			.enter()
			.append('text')
			.attr('class','label')
			.attr('y', 20)
			.attr("text-anchor", "end")
  			.attr("transform", function(d,i){ return "translate(140,"+ ((i+1) * distanceVer + paddingTop - 20) + ")"})
  			.attr('dx',0)
			.attr('dy',0)
			.text(function(d){return d.text})
			.call(wrap,140)
			.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)
			
		labelsGroup.append('g').selectAll(".label")
			.data(colTitles)
			.enter()
			.append('text')
			.attr('class','label')
			.attr('y', 20)
			.attr("text-anchor", "middle")
  			.attr("transform", function(d,i){ return "translate("+ ((i) * distanceHor + paddingLeft) + ", 0)"})
  			.attr('dx',0)
			.attr('dy',0)
			.text(function(d){return d.text})
			.call(wrap,distanceHor - 10)
			.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)
			
		// drawing axis
		if (subtype == 'multi') labelsGroup.selectAll('.xaxis-line')
					.data(rowTitles)
					.enter()		
					.append('line')
					.attr('class','xaxis-line')
					.attr('x1', 160)
					.attr('x2', width-200)
					.attr('y1', function(d,i){return (i+1) * distanceVer + paddingTop ; })
					.attr('y2', function(d,i){return (i+1) * distanceVer + paddingTop; })

		else labelsGroup.selectAll('.yaxis-line')
					.data(colTitles)
					.enter()		
					.append('line')
					.attr('class','yaxis-line')
					.attr('x1', function(d,i){return xRange[i]+ paddingLeft - 25; })
					.attr('x2', function(d,i){return xRange[i]+ paddingLeft - 25; })	
					.attr('y1', 50)
					.attr('y2', height )

	}
	
	function positionCirclesMatrix(q,nRow, nCol,xRange,yRange,subtype) {

		var countArray = [];
		var resultValue;
		if (subtype == 'multi') {
			var paddingLeft = 300;
			var distanceHor = 200;
			var paddingTop = 20;
		}
		else {
			var paddingLeft = 230;
			var distanceHor = xRange[1]-xRange[0];
			var paddingTop = 30;
		}

		var distanceVer = yRange[1]-yRange[0];
		if (subtype == 'multi') var rateValue = 1; // only for matrix multi 
		else rateValue = 4; // visualising only highest score			
		
		var qRaw = q.substring(0,3);
			
		for (var i = 0; i < nCol; i++) countArray[i] = 0;
		
		var circlePerRow = 3;
		var count = 0;
		
		qCircles = svg.append('g')
			.attr('class',q)
		
		var rateGroups = [];

		var max = 0;
		
		for (var j = 0; j < nCol; j++) { 
			for (var i = 1; i <= nRow; i++) { 
				var row = (i+questionGroups[q][0]).toString();
				if (row.length < 2) row = '0'+ row;
				//creating object which will contain all dots for a certain column/row combination				
				var rateGroup= {}
				rateGroup.rowNr = i;
				rateGroup.columnNr = j;
				rateGroup.row = row;
				rateGroup.column = alpha[j];
				rateGroup.values = [];
				
				qValue = qRaw+row+rateGroup.column;
					
				cities.forEach(function(d){		
					if (surveyDataByCity.has(d.Name)){
						var cloneCount = 0;
						cityResults = surveyDataByCity.get(d.Name)
						if (cityResults[qValue] == rateValue){
							if (cloneCount == 0) {
								if (!d.y[q]){ // checking if coordinates have already been calculated	
									d.x[q] = (j * distanceHor + paddingLeft);
									d.y[q] = i * distanceVer + paddingTop;
								}
							}
							rateGroup.values.push({name:d.Name, size:10})
							cloneCount += 1;
						}		
					}	
					else { // names city data and survey data doesn't match
						d.x[q] = 0;
						d.y[q] = 0;	
					}					
				})
				if (rateGroup.values.length > max) max = rateGroup.values.length;
				rateGroups.push(rateGroup)
			}
		}
		/// ----
		var min = 20;
		var rad = distanceVer/2;
		// this is used to scale the rateGroups, the largest group will 
		// be as big as the distance between rows (distanceVer)
		// the other will be scale accordingly. Circle areas have been
		// considered to compare rateGroups

		var areaFactor = Math.pow(rad, 2)/max;  
		if (areaFactor > 30) areaFactor = 30; // this is to avoid that the circles get too big
		
		qCircles.selectAll('.rate-groups')
			.data(rateGroups)
			.enter()
			.append('g')
			.attr('class','rate-groups')
			.each(function(d){
				d._side = 2* Math.sqrt(areaFactor * d.values.length)
				var data = {
				  name : "root",
				  children : d.values
				}

				var nodes = d3.layout.pack()
				  	.value(function(d) { return d.size; })
				  	.size([d._side, d._side])
				  	.padding(0)				  	
					.nodes(data)					

				nodes.shift();
				if (nodes[0]) var radius = nodes[0].r;
				if (radius < min) min = radius;
				
				d3.select(this).selectAll('.q_circle')
					.data(nodes)
					.enter()
					.append('circle')
					.attr('id', function(d) {return 'city_'+dataByCity.get(d.name)._id }) 
					.attr('class','q_circle')
					.attr('cx', function(d) { return d.x; })
					.attr('cy', function(d) { return d.y; })
					.attr('r', function(d) { return d.r; }) /// size smallest circle for all !!
					.attr('fill', function(d){return circleColour(dataByCity.get(d.name))} )
					.style('opacity',0)
					.on("mouseover", function(d){ mouseover(dataByCity.get(d.name))})
					.on("mouseout", mouseout)
					.on("click", function(d){ selectCity(dataByCity.get(d.name))})
					.transition()
					.delay(function(d, i){ return i * delayQCircles })
					.style('opacity',function(d){ 
						if (citySelectedId){
							var id = dataByCity.get(d.name)._id;
							return (id == citySelectedId)? 1: opacityUnselected;
						}
						else return 1;
					})
			})
			.attr('transform', function(d){ return 'translate('+ (d.columnNr * distanceHor - d._side/2 +paddingLeft) +','+(d.rowNr * distanceVer - d._side/2 + paddingTop) +')'})
			
		// adding amount			
		qCircles.selectAll('.rate-groups')
			.append('text')
			.attr('class','amount')
			.attr('dx',function(d){ return d._side})
			.attr('dy', 10)
			.text(function(d){return d.values.length})
			/*.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayAmount })
			.attr('opacity',1)*/

		qCircles.selectAll('.q_circle').attr('r',min)			
		qCircles.selectAll('#city_'+citySelectedId).classed('selected',true)	
	}
	
	/* ----- matrix single functions -----*/
	
	function showMatrixSingle(q){
		activeQuestion = q;
		if (qCircles) qCircles.transition().duration(removeDuration).style('opacity',0).remove()

		var xdomain = [];
		var ydomain = [];

		var marginLeft = 120, marginRight = 0;
		
		var allTitles = titlesByCode.get(q).questions[0].answers;

		var rowTitles = allTitles.filter(function(d){return d.type == "row" }).sort(function(a, b){ return a.position-b.position });
		var colTitles = allTitles.filter(function(d){return d.type == "col" }).sort(function(a, b){ return a.position-b.position });
		
		var nRow = rowTitles.length;
		var nCol = colTitles.length;
		
		for (var i = 0; i < nCol; i++) { xdomain.push(i+1) }
		for (var i = 0; i < nRow; i++) { ydomain.push(i+1) }

		var x = d3.scale.ordinal()
				.domain(xdomain)
    			.rangeRoundBands([0, (width - marginLeft - marginRight)]);  		

		var y = d3.scale.ordinal()
				.domain(ydomain)
    			.rangeRoundBands([0, height]); 

		showLabelsMatrixSingle(q,rowTitles,colTitles,nRow,nCol,x.range(),y.range())
		positionCirclesMatrixSingle(q,nRow,nCol,x.range(),y.range())
		
		cityCircles.style('opacity',function(d){return (d._id == citySelectedId)? 1: opacityUnselected})
			.transition()
			.ease('cubic')
			.delay(function(d, i){ return i * delayCircles })
			.attr('cx',function(d) { if(d.x[q]) return d.x[q]; else return -20})
			.attr('cy',function(d) { if(d.y[q]) return d.y[q]; else return -20})
			.attr('r', qRadiusCircle[q])

		qCircles.selectAll('circle')
			.transition()
			.delay(function(d, i){ return i * delayQCircles })
			.style('opacity',function(d){ 
				if (citySelectedId){
					var id = $(this).prop('id');
					id = Number(id.slice(5))
					return (id == citySelectedId)? 1: opacityUnselected;
				}
				else return 1;
			})

		qCircles.selectAll('#city_'+citySelectedId)
			.classed('selected',true)			

	}
	function showLabelsMatrixSingle(q,rowTitles,colTitles,nRow,nCol,xRange,yRange){
		labelsGroup.selectAll("*").style('opacity',0).remove()

		paddingLeft = 110, marginTop = 40;
		
		if (nRow== 1) var yHeight = 300;
		else var yHeight = (yRange[1] - yRange[0]);
		
		labelsGroup.append('g')
			.selectAll(".label")
			.data(rowTitles)
			.enter()
			.append('text')
			.attr('class','label')
			.attr('y', 20)
			.attr("text-anchor", "end")
  			.attr("transform", function(d,i){ return "translate("+ (paddingLeft -20) +","+ (yRange[i]+yHeight-marginTop) + ")"})
  			.attr('dx',0)
			.attr('dy',0)
			.text(function(d){return d.text})
			.call(wrap,(paddingLeft-20))
			.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)
			
		labelsGroup.append('g')
			.selectAll(".label")
			.data(colTitles)
			.enter()
			.append('text')
			.attr('class','label')
			.attr('y', 20)
			.attr("text-anchor", "start")
  			.attr("transform", function(d,i){ if (nRow == 1) return "translate("+ (xRange[i] + paddingLeft ) + ", 310)";
  				else return "translate("+ (xRange[i] + paddingLeft) + ","+ (height - 20)+")"})
  			.attr('dx',-5)
			.attr('dy',0)
			.text(function(d){return d.text})
			.call(wrap,80)
			
		if (nRow == 1) labelsGroup
			.append('line')
			.attr('class','axis-line')
			.attr('x1', paddingLeft - 10)
			.attr('x2', width)
			.attr('y1', 312)
			.attr('y2', 312)			

		else labelsGroup.selectAll('line')
			.data(rowTitles)
			.enter()		
			.append('line')
			.attr('class','axis-line')
			.attr('x1', paddingLeft - 10 )
			.attr('x2', width-30)
			.attr('y1', function(d,i){return yRange[i]+ yHeight-20; })
			.attr('y2', function(d,i){return yRange[i]+ yHeight-20; })
	}
	
	function positionCirclesMatrixSingle(q,nRow, nCol,xRange,yRange) {

		var countArray = []; //dots for each bar
		var resultValue;
		var paddingHor = 10, paddingVer = 30, marginLeft = 120, marginTop = 0; //paddingVer includes space for amount
		var circlePad = 1;
		var cityArray =[]; //cities which have already coordinates
		
		for (var i = 0; i < nCol; i++) countArray[i] = 0;
		
		var circlePerRow = 3;
		
		qCircles = svg.append('g')
			.attr('class',q)

		if (nRow > 1) { // to do check also with nrow = 1
			var max = 0 
			// detecting max number of cities for one group
			for (var i = 1; i <= nRow; i++) {
				var row = i.toString();
				if (row.length < 2) row = '0'+ row;
				qValue = q+row;
				cities.forEach(function(d){
					if (surveyDataByCity.has(d.Name)){
						cityResults = surveyDataByCity.get(d.Name);
						var resultValue = cityResults[qValue];
						if (resultValue) countArray[resultValue-1] += 1;
					}
				})
				var maxArray = Math.max.apply(null, countArray);
				if (maxArray > max) max = maxArray;
				for (var j = 0; j < nCol; j++) countArray[j] = 0;
			}
	
			// calculating width and height in which the circles must fit
			
			var xWidth = (xRange[1] - xRange[0])- paddingHor;
			var yHeight = (yRange[1] - yRange[0]) - paddingVer;
			
			var nw = Math.round(Math.sqrt(max * xWidth / yHeight))
			qRadiusCircle[q] = Math.floor((xWidth/nw-1)/2);
			if (qRadiusCircle[q] > 5) qRadiusCircle[q] = 5;
			circlePerRow= nw;
			
			var nh = nw*yHeight/xWidth;
			/*console.log('circlePerRow,nw, nh, max',circlePerRow, nw, nh, max)
			console.log('radius',qRadiusCircle[q])
			console.log('xWidth,yHeight',xWidth,yHeight)*/
		}
		else {
			qRadiusCircle[q] = radiusCircle;
		}

		for (var i = 1; i <= nRow; i++) { 
			var row = i.toString();
			if (row.length < 2) row = '0'+ row;
			qValue = q+row;
			if(nRow == 1) yPos = 300;
			else yPos = yRange[i-1] + yHeight + marginTop;
			for (var j = 0; j < nCol; j++) countArray[j] = 0;
			cities.forEach(function(d){
				var cloneCount = 0;
				if (surveyDataByCity.has(d.Name)){
					cityResults = surveyDataByCity.get(d.Name);
					var resultValue = cityResults[qValue];
					if (resultValue) {
						if (cityArray.indexOf(d.Name) < 0) {
								d.x[q] = (countArray[resultValue-1] % circlePerRow) * (qRadiusCircle[q] *2 + circlePad) + xRange[resultValue - 1] + marginLeft;
								d.y[q] = yPos - Math.floor(countArray[resultValue-1]/circlePerRow)* (qRadiusCircle[q] *2 + circlePad);
								cityArray.push(d.Name);
						}
						else {
							var newCircle = qCircles.append('circle')
								.attr('class', 'q_circle')
								.attr('id', 'city_'+d._id)
								.attr('r', qRadiusCircle[q])
								.attr('fill', circleColour(d))
								.on("mouseover", function(){ mouseover(d)})
								.on("mouseout", mouseout)
								.on("click", function(){ selectCity(d)})
								.attr('cx', (countArray[resultValue-1] % circlePerRow) * (qRadiusCircle[q] *2 + circlePad) + xRange[resultValue-1] + marginLeft)
								.attr('cy', yPos - Math.floor(countArray[resultValue-1]/circlePerRow)* (qRadiusCircle[q] *2 + circlePad))
								.style('opacity',0)					
						}
						countArray[resultValue-1] += 1;
					}
				}
			})
			labelsGroup.append('g').selectAll('.amount')
			.data(countArray)
			.enter()
			.append('text')
			.attr('class','amount')
			.attr('y', function(d){ return yPos - Math.ceil(d/circlePerRow ) * (qRadiusCircle[q] * 2 + circlePad) + 2})
			.attr('x', function(d,i){ return xRange[i] - 16 + marginLeft})
			.text(function(d){return d})
			/*.attr('opacity',0)
			.transition()
			.delay(function(d, i){ return i * delayLabels })
			.attr('opacity',1)*/		
		}
	}

	function circleColour(d){
		if (activeColour == 'pop') return populationQuantile(d['Population']);
		else if (activeColour == 'reg') return continentColors[d['UN Region Level 2']]
		else if (activeColour == 'gdp'){
			var gdp = d['GDP/Capita (per country) 2013 - World Bank Data'];
			return wealthQuantile(gdp);
		}
	}
	function circleColourQ(d){
		if (activeColour == 'pop') return populationQuantile(dataByCity.get(d.Name)['Population']);
		else if (activeColour == 'reg') return continentColors[dataByCity.get(d.Name)['UN Region Level 2']]
		else if (activeColour == 'gdp')	return wealthQuantile(dataByCity.get(d.Name)['GDP/Capita (per country) 2013 - World Bank Data'])
	}
	function colourBy(d){
		activeColour = d.id;
		$('.selected-item').text(d.name);
		$('#subitem').slideUp()
		d3.selectAll('.citycircle')
			.attr('fill', function(g){return circleColour(g)} )

		cities.forEach(function(d) { 
			circleColourQ(d)
			if (qCircles) qCircles.selectAll('#city_'+d._id).attr('fill', circleColourQ(d))
		})
		//legend
		legenddiv.selectAll('.legend').style('display','none');
		legenddiv.select('.'+ d.id +'-legend').style('display','block')
	}

	function mouseover(d){
		d3.selectAll('#city_'+d._id).classed('mouseover',true)
		var textTooltip = '<div class="title">'+d.Name+', '+d.Country+'</div>Population: <strong>'+ numberWithCommas(d.Population)+'</strong>';
		tooltipdiv.html(textTooltip)
			.style("top", d3.event.pageY - 40 + "px")
			.style("left", d3.event.pageX + 25 + "px")
		$('.arrow_box').css('display','block');
	}

	function mouseout(){
		d3.selectAll('.mouseover').classed('mouseover', false)
		$('.arrow_box').css('display','none');
	}

	function selectCity(d){
		citySelected = d.Name;
		citySelectedId = d._id;
		opacityUnselected = 0.7;
		showCityInfo();
		d3.selectAll('.selected').classed('selected',false);
		d3.selectAll('.q_circle').style('opacity',opacityUnselected);
		d3.selectAll('.citycircle').style('opacity',opacityUnselected);
		if (Object.keys(questionGroups).indexOf(activeQuestion) < 0) d3.selectAll('#city_'+d._id).style('opacity',1).classed('selected',true) //only if it's not a matrix multi/menu
		else {
			d3.selectAll('#city_'+d._id).classed('selected',true)
			qCircles.selectAll('#city_'+d._id).style('opacity',1)
		}

		gBorders.select('.mapcircle').remove(); 		
		gBorders.append('circle').attr('class','mapcircle')
			.attr('cx', projection([d.POINT_X,d.POINT_Y])[0])
			.attr('cy', projection([d.POINT_X,d.POINT_Y])[1])
			.attr('r',5)
			.attr('fill',"#D1CBC6")
	}

	function showCityInfo(){
		cityInfo.style('display','block')
		cityData.selectAll('div').remove()
		var surveyDataCity = surveyDataByCity.get(citySelected);
		var dataCity = dataByCity.get(citySelected)
		cityInfo.select('.city-name').text(dataCity.Name+', '+dataCity.Country)
		
		cityData.append('div').attr('class','title').text('Population')
		cityData.append('div').text(numberWithCommas(surveyDataCity.q0601)+' ('+surveyDataCity.q0602+')')
		
		cityData.append('div').attr('class','title').text('People working for the city/local government')
		cityData.append('div').text(surveyDataCity.q08)		

		cityData.append('div').attr('class','title').text('Expenditure')
		cityData.append('div').text(numberWithCommasDolarFormat(dataCity.Expenditure)	)	

		cityData.append('div').attr('class','title').text('Revenue')
		cityData.append('div').text(numberWithCommasDolarFormat(dataCity.Revenue))	
		
	}	

	function highlightCity(id){
		d3.selectAll('#city_'+id).classed('highlighted-'+highlightIndex,true)
		highlightIndexId[id]= highlightIndex;
		if (highlightIndex < 3) highlightIndex += 1;
		else highlightIndex = 0;
	}
	function unHighlight(id){
		d3.selectAll('#city_'+id).classed('highlighted-'+highlightIndexId[id],false)
		if (highlightIndex > 0) {
			highlightIndex -= 1;
		}
		else highlightIndex = 3;
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
  	$('#next').click(function(){ // to do check for last section
		var nextQuestion = questions[activeIndex];
		//chart.activate(activeIndex+1)
		$('html,body').animate({
			scrollTop: $("#section"+nextQuestion).offset().top -60
		}, 1000);
	})
	
	$('#previous').click(function(){
		var previousQuestion = questions[activeIndex-2];
		//chart.activate(activeIndex-1)
		$('html, body').animate({
			scrollTop: $("#section"+previousQuestion).offset().top-60
		}, 1000);
	})

  	$('#scroll').click(function(){ 
		$('html,body').animate({
			scrollTop: $("#section"+questions[0]).offset().top -60
		}, 1000);
	})

	
	$( "#city-search" ).tokenInput(allCityNames, {
		placeholder: 'Highlight cities',
		//resultsLimit:4,
		onAdd: function (item) {
			highlightCity(item.id);
		},
		onDelete: function (item) {
			unHighlight(item.id);
		}
	});

	$('#close').click(function(){
		opacityUnselected = 1;
		citySelectedId = null;
		gBorders.select('.mapcircle').remove()
		$('#city-info').fadeOut();
		d3.selectAll('.q_circle').style('opacity',opacityUnselected);
		d3.selectAll('.citycircle').style('opacity',opacityUnselected);
		d3.selectAll('.selected').classed('selected',false)
	});

	$('#subitem').hide();
	
	$('#mainitem').click(function() { 
		$('#subitem').slideToggle()
	})

	$('#legendclose').click(function(){
      	$(this).text(function(i, text){
          return text === "Hide Legend" ? "Show Legend" : "Hide Legend";
      	})
		$('.legendtoggle').slideToggle()
	})
	
	function numberWithCommasDolarFormat(x) {
		return '$'+x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	function numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	/**
	* activate -
	*
	* @param index - index of the activated section
	*/
	chart.activate = function(index) {
		activeIndex = index;
		var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
		var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
		scrolledSections.forEach(function(i) {
		  activateFunctions[i]();
		});
		lastIndex = activeIndex;
		
		if (activeQuestion =='q00') var title = '';
		else var title = $.grep(shortQuestions, function(e){ return e.qcode == activeQuestion; })[0].theme;
		d3.select('.theme-title').text(title);
	};
	
	/**
	* update
	*
	* @param index
	* @param progress
	*/
	chart.update = function(index, progress) {
		updateFunctions[index](progress);
	};
	
	// return chart function
	return chart;
}

d3.selection.prototype.size = function() {
    var n = 0;
    this.each(function() { ++n; });
    return n;
  };

function display(error, borders, cities, surveyData, titles, shortQuestions) {
  // create a new plot and
  // display it

	var plot = scrollVis(borders, cities, surveyData, titles, shortQuestions)

	d3.select("#vis")
    	.call(plot)	

	// setup scroll functionality
	var scroll = scroller()
		.container(d3.select('#graphic'));

	// pass in .step selection as the steps
	scroll(d3.selectAll('.step'));

	// setup event handling
	scroll.on('active', function(index) {
    // highlight current step text
  		d3.selectAll('.step')
   		.transition()
   		.duration(200)
		.style('opacity',  function(d,i) { return i == index ? 1 : 0.25; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
 
}

function loadSurvey(){
	var url = '/app/themes/urbangovernance/';
	//var url ='';
	
	queue()
		.defer(d3.json, url+"data/world-countries.json")
		.defer(d3.csv, url+"data/Surveydatawebsite_FINAL.csv")
		.defer(d3.csv, url+"data/Survey81_Respondents-2.csv")
		.defer(d3.json, url+"data/titles.json")
		.defer(d3.csv, url+"data/themes-surveyquestions-short.csv")
		.await(display);
}
