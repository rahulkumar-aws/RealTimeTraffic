var DeviceDataVM = function() {
	var self = this;
	self.topChannelsViewTitle = "Top 10 channels by device connection";
	self.deviceTypeViewTitle = "Device Type";
	self.topReasonViewTitle = "Top 10 countries by device connections";
	self.plotPieChart = function() {

		var width = $("#pie-chart").width(), height = $("#pie-chart").height(), radius = Math
				.min(width, height) / 2;

		var color = d3.scale.ordinal().range(
				[ "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56",
						"#d0743c", "#ff8c00" ]);

		var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);

		var pie = d3.layout.pie().sort(null).value(function(d) {
			return d.used;
		});

		var svg = d3.select("#pie-chart").append("svg").attr("width", width)
				.attr("height", height).append("g").attr("transform",
						"translate(" + width / 2 + "," + height / 2 + ")");

		d3.csv("./data/topDevice.csv", function(data) {

			data.forEach(function(d) {
				d.used = +d.used;
			});

			var g = svg.selectAll(".arc").data(pie(data)).enter().append("g")
					.attr("class", "arc");

			g.append("path").attr("d", arc).style("fill", function(d) {
				return color(d.data.device);
			});

			g.append("text").attr("transform", function(d) {
				return "translate(" + arc.centroid(d) + ")";
			}).attr("dy", ".45em").style("text-anchor", "middle").text(
					function(d) {
						return d.data.device;
					});

		});

	};


	self.plotTopTenChannelByDeviceChart = function(){
		
		//top-ten-channel-by-device-div
		var color=["#5AAD2A","#007AFF","#E573B9","#FFCC00","#E30518","#708090","#FFFF00","#A0522C","#FFB6C1","#9732CE"];
		var width = $("#top-ten-channel-by-device-div").width();
		var height = $("#top-ten-channel-by-device-div").height();
		var margin = { "top":30, "right":20, "bottom":20, "left":30 }, width = width - margin.left - margin.right, height = height
				- margin.top - margin.bottom;
		var format = d3.format(",.0f");
		var x = d3.scale.linear().range([ 0, width ]), y = d3.scale.ordinal()
				.rangeRoundBands([ 0, height], .1);

		var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-height), yAxis = d3.svg
				.axis().scale(y).orient("left").tickSize(0);

		var svg = d3.select("#top-ten-channel-by-device-div").append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr("transform",
				"translate(" + (margin.left+10) + "," + margin.top + ")");

		var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
		
		d3.csv("./data/TopTenChannelByDevice.csv", function(data) {

			// Parse numbers, and sort by value.
			data.forEach(function(d) {
				d.totalMessageVolume = +d.totalMessageVolume;
			});
			data.sort(function(a, b) {
				return b.totalMessageVolume - a.totalMessageVolume;
			});

			// Set the scale domain.
			x.domain([ 0, d3.max(data, function(d) {
				return d.totalMessageVolume;
			}) ]);
			y.domain(data.map(function(d) {
					
				return d.channelName;
			}));

			var bar = svg.selectAll("g.bar1").data(data).enter().append("g")
					.attr("class", "bar1").attr("transform", function(d) {
						return "translate(0," + y(d.channelName) + ")";
					})
					.attr("fill",function(d,i){return color[i];});

			bar.append("rect").attr("width", function(d) {
				return x(d.totalMessageVolume);
			}).attr("height", y.rangeBand()).on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html(d.totalMessageVolume + "<br/>")  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })         
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(200)      
                .style("opacity", 0);   
        });

			/*bar.append("text").attr("class", "value").attr("x", function(d) {
				return x(d.value);
			}).attr("y", y.rangeBand() / 2).attr("dx", -3).attr("dy", ".35em")
					.attr("text-anchor", "end").text(function(d) {
						return format(d.value);
					});*/

			svg.append("g").attr("class", "x axis").call(xAxis);

			svg.append("g").attr("class", "y axis").call(yAxis);
		});
		
	};
	
	self.plotTopCountriesByDeviceChart = function() {
		var color=["#5AAD2A","#007AFF","#E573B9","#FFCC00","#E30518","#708090","#FFFF00","#A0522C","#FFB6C1","#9732CE"];
		function type(d) {
			d.frequency = +d.frequency;
			return d;
		}

		var wi = $("#top-ten-countries-device-div").width();
		var hi = $("#top-ten-countries-device-div").height();
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 40
		}, width = wi - margin.left - margin.right, height = hi - margin.top
				- margin.bottom;

		var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1);

		var y = d3.scale.linear().range([ height , 0 ]);

		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

		var svg = d3.select("#top-ten-countries-device-div").append("svg").attr("width",
				width).attr("height",
				height + margin.top + margin.bottom).append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");
		
		var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
		

		d3.csv("./data/topTenCountriesByDevice.csv", function(data) {
			
			x.domain(data.map(function(d) {
				return d.letter;
			}));
			/*y.domain([ 0, d3.max(data, function(d) {
				
				console.log("*** ",d.frequency);
				return d.frequency;
			}) ]);*/
			y.domain([ 0, 9000]);

			svg.append("g").attr("class", "x axis").attr("transform",
					"translate(0," + height + ")").call(xAxis).selectAll("text")  
		            .style("text-anchor", "end")
		            .attr("dx", "-.1em")
		            .attr("dy", ".14em")
		            .attr("transform", function(d) {
		                return "rotate(-25)" 
		                });

			svg.append("g").attr("class", "y axis").call(yAxis).append("text")
					.attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
							".71em").style("text-anchor", "end").text(
							"");

			svg.selectAll(".bar1").data(data).enter().append("rect").attr(
					"class", "bar1").attr("x", function(d) {
				return x(d.letter);
			}).attr("width", x.rangeBand()).attr("y", function(d) {
				return y(d.frequency);
			}).attr("height", function(d) {
				return height - y(d.frequency);
			})
			.attr("fill",function(d,i){ return color[i];}).on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div .html(d.frequency + "<br/>")  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px");    
            })         
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(200)      
                .style("opacity", 0);   
        });

		});

		

	};

};