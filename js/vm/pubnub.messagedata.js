var MessageDataVM = function() {

	var self = this;
	self.topChannelsViewTitle = "Top 10 channels";
	self.trafficViewTitle = "Traffic";
	self.topReasonViewTitle = "Top 10 Countries based on Total Message Volume";

	self.plotAreaChart = function() {
		var wi = $("#message-area-chart").width();
		var hi = $("#message-area-chart").height();
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 50
		}, width = wi - margin.left - margin.right, height = hi - margin.top
				- margin.bottom;

		var parseDate = d3.time.format("%d-%b-%y").parse;

		var x = d3.time.scale().range([ 0, width ]);

		var y = d3.scale.linear().range([ height, 0 ]);

		var xAxis = d3.svg.axis().scale(x).orient("bottom");

		var yAxis = d3.svg.axis().scale(y).orient("left");

		var area = d3.svg.area().x(function(d) {
			return x(d.date);
		}).y0(height).y1(function(d) {
			return y(d.close);
		});

		var svg = d3.select("#message-area-chart").append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");

		d3.csv("./data/areadata.csv", function(data) {
			data.forEach(function(d) {
				d.date = parseDate(d.date);
				d.close = +d.close;
			});

			x.domain(d3.extent(data, function(d) {
				return d.date;
			}));
			y.domain([ 0, d3.max(data, function(d) {
				return d.close;
			}) ]);

			svg.append("path").datum(data).attr("class", "area")
					.attr("d", area);

			svg.append("g").attr("class", "x axis").attr("transform",
					"translate(0," + height + ")").call(xAxis);

			svg.append("g").attr("class", "y axis").call(yAxis).append("text")
					.attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
							".71em").style("text-anchor", "end").text("");
		});

	};

    //Network Traffic Chart

    self.plotNetworkTrafficChart = function(){
        var smoothie = new SmoothieChart();
        smoothie.streamTo(document.getElementById("message-traffic-chart"));

        // Data
        var line1 = new TimeSeries();
        var line2 = new TimeSeries();

        // Add a random value to each line every second
        setInterval(function() {
          line1.append(new Date().getTime(), Math.random());
          line2.append(new Date().getTime(), Math.random());
        }, 1000);

        // Add to SmoothieChart
        smoothie.addTimeSeries(line1);
        smoothie.addTimeSeries(line2);

    };

	// Top 10 Countries Based on Pub/Sub Activity

	self.plotTopCountriesTotalMsgVolumeChart = function() {
		function type(d) {
			d.frequency = +d.frequency;
			return d;
		}

		var wi = $("#top-ten-countries-message-div").width();
		var hi = $("#top-ten-countries-message-div").height();
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

		var svg = d3.select("#top-ten-countries-message-div").append("svg")
                .attr("width",width + margin.left + margin.right).attr("height",height + margin.top + margin.bottom)
                .append("g").attr(
				"transform",
				"translate(" + margin.left + "," + margin.top + ")");

		var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
		
		
		d3.csv("./data/topTenCountriesByMsg.csv", function(data) {
			
			x.domain(data.map(function(d) {
				return d.letter;
			}));
			/*y.domain([ 0, d3.max(data, function(d) {
				
				console.log("*** ",d.frequency);
				return d.frequency;
			}) ]);*/
			y.domain([ 0, 5000]);

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

			svg.selectAll(".bar").data(data).enter().append("rect").attr(
					"class", "bar").attr("x", function(d) {
				return x(d.letter);
			}).attr("width", x.rangeBand()).attr("y", function(d) {
				return y(d.frequency);
			}).attr("height", function(d) {
				return height - y(d.frequency);
			}).on("mouseover", function(d) {      
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

	self.plotTopTenChannelChart = function() {

		var color = d3.scale.category20c();
		var width = $("#top-ten-channel-by-message-div").width();
		var height = $("#top-ten-channel-by-message-div").height();
		var margin = { "top":30, "right":20, "bottom":20, "left":30 }, width = width - margin.left - margin.right, height = height
				- margin.top - margin.bottom;
		var format = d3.format(",.0f");
		var x = d3.scale.linear().range([ 0, width ]), y = d3.scale.ordinal()
				.rangeRoundBands([ 0, height], .1);

		var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-height), yAxis = d3.svg
				.axis().scale(y).orient("left").tickSize(0);

		var svg = d3.select("#top-ten-channel-by-message-div").append("svg").attr("width",
				width + margin.left + margin.right).attr("height",
				height + margin.top + margin.bottom).append("g").attr("transform",
				"translate(" + (margin.left+10) + "," + margin.top + ")");

		var div = d3.select("body").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
		
		d3.csv("./data/TopTenChannel.csv", function(data) {

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
					.attr("fill",function(d,i){ return color(d.totalMessageVolume);});

			bar.append("rect").attr("width", function(d) {
				return x(d.totalMessageVolume);
			}).attr("height", y.rangeBand())
			.on("mouseover", function(d) {      
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

};