var WorldMapVM = function () {
    var self = this;
    self.noOfSubs = ko.observable(null);
    self.noOfPubs = ko.observable(1);
    self.queue = [];
    self.streamDataArray = [];
    self.workingQueue = [];
    self.isZoom = false;
    self.zoomLevel = ko.observable(null);
    self.streamData = ko.observableArray(null);
    self.worldmapWidth = ko.observable(null);
    self.worldmapHeight = ko.observable(null);
    self.totalSubMessage = ko.observable(0);
    self.totalPubMessage = ko.observable(0);
    self.total_history_msgs = ko.observable(0);
    self.total_n_unique_channels = ko.observable(0);
    self.total_message = ko.observable(0);
    self.total_users = ko.observable(0);
    self.topTenCountryArray = [];
    self.topTenCountryByDevice = [];
    self.allCountry = [];
    self.allDevices = [];
    self.topTenCountryData = [];
    self.toTenDeviceData = [];
    self.deviceinfo = [];
    self.projection = null;
    self.dataFromRealtimeStatsChannel = null;
    self.currentTranslate = [];
    self.getPubNubTraficData = function () {

        var pubnub = PUBNUB.init({
            subscribe_key: "e19f2bb0-623a-11df-98a1-fbd39d75aa3f",
            windowing: 500
        });


        pubnub.subscribe({
            backfill: true,
            channel: "real-time-stats-geostats",
            message: self.message,
            timeout: 5000
        });


    };

    self.message = function (msg) {
        self.queue.push(msg);
        self.streamDataArray.push(msg);
    };

    self.renderPoint = function () {

        var colors = ["#299dff"];
        var color = colors[Math.floor(Math.random() * colors.length)];
        var msg = self.queue.shift();
        var pubCircleRadius = 3;
        var subCircleRadius = 3;
        if (!msg) return;
        self.noOfSubs(msg.subs.length);

        var width = self.worldmapWidth();
        var height = self.worldmapHeight();

        /* var projection = d3.geo.equirectangular()
         .scale(180).translate([ (width / 2 - 40), height / 4]);*/

        var zoomPan = d3.select("#zoomPanal");
        var g = zoomPan.append("g");

        if (self.isZoom == true) {
            var zoomLevel = self.zoomLevel();
            if (zoomLevel > 1 && zoomLevel < 2) {
                pubCircleRadius = 2;
                subCircleRadius = 1.5;
            } else if (zoomLevel >= 2 && zoomLevel < 3) {

                pubCircleRadius = 1.5
                subCircleRadius = 1;
            } else if (zoomLevel >= 3) {

                pubCircleRadius = 0.9;
                subCircleRadius = 1;
            } else if (zoomLevel >= 5 && zoomLevel <= 6) {

                pubCircleRadius = 0.8;
                subCircleRadius = 1;

            }
        }
        var pub = g.selectAll("circle.pub")
            .data([msg.pub])
            .enter()
            .append("circle")
            .attr("fill", "green")
            .attr("stroke", "#FFFF00")
            .attr("stroke-width", "1px")
            .attr('class', 'pub')
            .attr('r', pubCircleRadius)
            .attr("cx", function (d, i) {


                return self.projection([d[1], d[0]])[0];
            })
            .attr("cy", function (d, i) {
                return self.projection([d[1], d[0]])[1];
            })
            .transition()
            .duration(500)
            .attr('r', pubCircleRadius + 3)
            .style("opacity", 1)
            .each("end", function () {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('r', pubCircleRadius);
            });

        var subs = g.selectAll("circle.sub")
            .data(msg.subs)
            .enter()
            .append("circle")
            .attr('class', 'sub')
            .attr("fill", color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", "1px")
            .attr('r', subCircleRadius)
            .attr("cx", function (d, i) {
                return self.projection([d[1], d[0]])[0];
            })
            .attr("cy",function (d, i) {
                return self.projection([d[1], d[0]])[1];
            }).transition()
            .duration(1500)
            .attr('r', subCircleRadius)
            .transition()
            .duration(1000)
            .attr('r', subCircleRadius + 2)

        g.transition()
            .duration(1000)
            //.attr('r', 2)
            .style("opacity", 0)
            .each("end", function () {
                d3.select(this).remove();
            });

        if (self.isZoom == true) {
            d3.selectAll('.sub').attr("r", 2).attr("stroke-width", "0.5px");
            d3.selectAll('.pub').attr("r", 3).attr("stroke-width", "0.5px").transition()
                .duration(500)
                .attr('r', 5)
                .style("opacity", 1)
                .each("end", function () {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('r', 2);
                });
        }

    };

    self.plotWorldMap = function () {
        var worldmapWidth = $("#map-wrapper").width();
        var worldMapHeight = $("#map-wrapper").height();
        self.worldmapWidth(worldmapWidth);
        self.worldmapHeight(worldMapHeight);

        var width = self.worldmapWidth();
        var height = self.worldmapHeight();
        var country, state;
        self.projection = d3.geo.equirectangular()
            .scale(170).translate([ (width / 2 - 90), height / 2]);//.precision(.1);

        var svg = d3.select("#map-container");//.append("svg");

        var path = d3.geo.path().projection(self.projection);

        var g = svg.append("g").attr("id", "zoomPanal");

        // var tooltip = d3.select("#map-wrapper").append("div").attr("class", "tooltip hidden");
        var div = d3.select("body").append("div")
            .attr("class", "worldmaptooltip")
            .style("opacity", 0);

        d3.json("./data/world-topo.json",
            function (world) {

                var countries = topojson.feature(world,
                    world.objects.countries).features, neighbors = topojson
                    .neighbors(world.objects.countries.geometries);
                g.append("g").attr("id", "countries").selectAll(
                        "path").data(countries).enter().append("path").attr("id",function (d, i) {
                        return d.id;
                    }).on("click", country_clicked)
                    .attr("title", function (d, i) {
                        return d.properties.name;
                    })
                    .attr("d", path).style("fill",
                    function (d, i) {
                        return "gray";
                    }

                ).on("mouseover", function (d) {
                        div.transition()
                            .duration(100)
                            .style("opacity", .9);
                        div.html(d.properties.name + "<br/>")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 25) + "px");
                    })
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(100)
                            .style("opacity", 0);
                    });
                /*g.insert("path", ".graticule").datum(
                 topojson.mesh(world,
                 world.objects.countries, function (a, b) {
                 return a !== b;
                 })).attr("class", "boundary").attr(
                 "d", path);*/


                self.getPubNubTraficData();
                // load and display the cities


            });

        function get_xyz(d) {
            var bounds = path.bounds(d);
            var w_scale = (bounds[1][0] - bounds[0][0]) / width;
            var h_scale = (bounds[1][1] - bounds[0][1]) / height;
            var z = .96 / Math.max(w_scale, h_scale);
            var x = (bounds[1][0] + bounds[0][0]) / 2;
            var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
            return [x, y, z];
        }

        function country_clicked(d) {
            g.selectAll(["#states", "#cities"]).remove();
            state = null;

            /*  if (country) {
             g.selectAll("#" + country.id).style('display', null);
             }*/
            if (d && country !== d) {
                var xyz = get_xyz(d);
                country = d;

                if (d.id == 840 || d.id == 'JPN') {
                    d3.json("./data/us-10m.json", function (error, us) {
                        g.append("g")
                            .attr("id", "states")
                            .selectAll("path")
                            .data(topojson.feature(us, us.objects.states).features)
                            .enter()
                            .append("path")
                            .attr("id", function (d) {
                                return d.id;
                            })
                            .attr("class", "active")
                            .attr("d", path)
                        /* .on("click", state_clicked);*/

                        // zoom(xyz);
                        g.selectAll("#" + d.id).style('display', 'none');
                    });
                } else {
                    //zoom(xyz);
                }
            }
        }


        // Zoom in/out buttons:


        var zm = d3.behavior.zoom().scaleExtent([1, 6]).on(
            "zoom",
            function (d) {

                self.currentTranslate = d3.event.translate;
                console.log("self.currentTranslate ", self.currentTranslate);
                console.log("zm.scale() ",zm.scale());

                g.attr("transform", "translate("
                    + d3.event.translate.join(",") + ")scale("
                    + d3.event.scale + ")")
                if (zm.scale() != undefined && zm.scale() > 1) {
                    //d3.selectAll('.sub').attr("r",2);
                    self.isZoom = true;
                    self.zoomLevel(zm.scale());
                } else {
                    self.isZoom = false;
                    self.zoomLevel(1);
                }

            });


        d3.select('#zoomIn').on('click', function () {
            g.attr("transform","scale("+zm.scale()*2 +")");

        });
        d3.select('#zoomOut').on('click', function () {
            if(zm.scale()>1){
            g.attr("transform","scale("+zm.scale()*0.5 +")");
            }

         });

         d3.select("#resetBtn").on('click', function(){

              zm.scale(1);
              zm.translate([0,0]);

         });

        svg.call(zm);
    };

    //self.renderPoint();
    //setInterval(self.renderPoint ,500);

    setInterval(function () {

        self.workingQueue.push(self.streamDataArray);
        self.streamDataArray = [];

        self.renderPoint();


        //Device Logic

        var devicearray = ["Chrome", "curl", "Android", "AndroidTab", "PC", "iOS", "Mac OS", "iPad"];

        var testDevice = [];

        for (var i = 0; i < devicearray.length; i++) {

            var matcher = devicearray[i];
            var total = 0;
            for (var j = 0; j < self.deviceinfo.length; j++) {

                var currentdevice = self.deviceinfo[j];

                var dd = {};


                $.each(currentdevice, function (k, v) {

                    if (k.indexOf(matcher) != -1) {
                        dd.name = matcher;
                        dd.value = v;
                        testDevice.push(dd);


                    }


                });


            }


        }


        var finalArray = [];
        for (var i = 0; i < testDevice.length; i++) {

            var currentDevice = testDevice[i].name;
            var valueCount = 0;
            var aa = {};

            for (var j = 0; j < testDevice.length; j++) {
                if (currentDevice == testDevice[j].name) {

                    valueCount = valueCount + testDevice[j].value;

                }

            }

            aa.device = currentDevice;
            aa.used = valueCount;
            self.allDevices.push(valueCount);
            finalArray.push(aa);

        }


        self.toTenDeviceData = _.uniq(finalArray, function (device) {
            return device.device;
        });


        self.makeCountryDictionary(self.workingQueue);

    }, 2000);

    self.makeCountryDictionary = function (workingQueue) {

        /*   var data = workingQueue.shift();

         var publishLocation = [];
         var subscribeLocation = [];

         for(var i=0; i< data.length; i++){



         publishLocation.push(data[i].pub)
         var currentSubs = data[i].subs;
         for(var j=0; j<currentSubs.length;j++){

         subscribeLocation.push(currentSubs[j]);
         }

         }*/

        //called with every property and it's value


        function process(key, value) {


            var statmap = {};

            if (key == 'unique_user_agents') {


                self.deviceinfo.push(value);
                /* statmap.deviceinfo = value;*/
                /* traverse(value, deviceProcess);*/
            }


            if (key == 'history') {

                self.total_history_msgs(self.total_history_msgs() + value);
            }
            if (key == 'n_unique_channels') {

                self.total_n_unique_channels(self.total_n_unique_channels() + value);
            }

            if (key == 'n_active_customers') {

                self.total_users(self.total_users() + value);

            }

            if (key.indexOf('geo') != -1) {


                traverse(value, geoProcess);


            }


            if (key == 'subscribe_msgs' || key == 'publish') {

                self.total_message(self.total_message() + value)

            }


        }


        function geoProcess(key, value) {
            var countryMap = {};
            if (key.indexOf('.') != -1) {

                countryMap.name = key.split('.')[0];
                countryMap.value = value.p + value.s;

                self.topTenCountryArray.push(countryMap)

            }

            if (key == 'p') {
                self.totalPubMessage(self.totalPubMessage() + value);
            }
            if (key == 's') {
                self.totalSubMessage(self.totalSubMessage() + value);
            }


        };

        function traverse(o, func) {
            for (var i in o) {
                func.apply(this, [i, o[i]]);
                if (o[i] !== null && typeof(o[i]) == "object") {
                    //going on step down in the object tree!!
                    traverse(o[i], func);
                }
            }
        }

        function getRealTimeStatsChannelData() {

            var pubnub = PUBNUB.init({
                subscribe_key: 'e19f2bb0-623a-11df-98a1-fbd39d75aa3f',
                publish_key: 'ea1afbc1-70a3-43c1-990c-ede5cf65a542',
                secret_key: 'e42894be-7ed4-5526-a305-729789e6b443',
                origin: 'jordan.devbuild.pubnub.com', // THIS IS IMPORTANT
                windowing: 500
            });

            var message = {
                'subkeys': [
                    'e19f2bb0-623a-11df-98a1-fbd39d75aa3f'
                ]
            }

            pubnub.publish({ 'channel': 'real-time-stats', 'message': message });

            pubnub.subscribe({'channel': 'real-time-stats', 'message': displayMsg});

            function displayMsg(msg) {


                self.dataFromRealtimeStatsChannel = msg;
                var data = msg;

                self.totalPubMessage(0);
                self.total_history_msgs(0);
                self.totalSubMessage(0);
                self.total_n_unique_channels(0);
                self.total_users(0);
                self.total_message(0);
                self.topTenCountryArray = [];
                self.deviceinfo = [];
                self.allCountry = [];
                self.allDevices = [];

                traverse(data, process);


            }
        };

        getRealTimeStatsChannelData();


        /*  d3.json('./data/jordanData1.json', function (data) {


         self.totalPubMessage(0);
         self.total_history_msgs(0);
         self.totalSubMessage(0);
         self.total_n_unique_channels(0);
         self.total_users(0);
         self.total_message(0);
         self.topTenCountryArray = [];
         self.deviceinfo = [];
         self.allCountry = [];
         self.allDevices = [];

         traverse(data, process);


         });*/


        var tt = [];
        for (var i = 0; i < self.topTenCountryArray.length; i++) {

            var countryName = self.topTenCountryArray[i].name;
            var valueCount = 0;
            var aa = {};
            for (var j = 0; j < self.topTenCountryArray.length; j++) {

                if (countryName == self.topTenCountryArray[j].name) {

                    valueCount = valueCount + self.topTenCountryArray[j].value;

                }

            }
            aa.name = countryName;
            aa.value = valueCount;
            self.allCountry.push(countryName);
            tt.push(aa);
        }


        self.topTenCountryData = _.uniq(tt, function (country) {
            return country.name;
        });
        if (self.topTenCountryData.length != 0) {
            self.plotTopCountriesTotalMsgVolumeChart();
            self.topDeviceTypePieChart();
            self.plotTopCountriesByDeviceChart();


        }

        var noOfdevice = [];
        for (var i = 0; i < self.allCountry.length; i++) {
            var a = {};
            a.country = self.allCountry[i];
            a.noOfdevice = self.allDevices[i];
            noOfdevice.push(a);
        }
        var temp = [];
        for (var i = 0; i < noOfdevice.length; i++) {

            var countryName = noOfdevice[i].country;
            var deviceCount = 0;
            var aa = {};
            for (var j = 0; j < noOfdevice.length; j++) {

                if (countryName == noOfdevice[j].country) {

                    deviceCount = deviceCount + noOfdevice[j].noOfdevice;

                }

            }
            aa.name = countryName;
            aa.value = deviceCount;

            temp.push(aa);
        }


        self.topTenCountryByDevice = _.uniq(temp, function (country) {
            return country.name;
        });

    };

    self.plotTopCountriesTotalMsgVolumeChart = function () {
        function type(d) {
            d.value = +d.value;
            return d;
        }

        $("#top-ten-countries-message-div").html(" ");
        var wi = $("#top-ten-countries-message-div").width();
        var hi = $("#top-ten-countries-message-div").height();
        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        }, width = wi - margin.left - margin.right, height = hi - margin.top
            - margin.bottom;

        var data = self.topTenCountryData;

        var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1);

        var y = d3.scale.linear().range([ height , 0 ]);


        var svg = d3.select("#top-ten-countries-message-div").append("svg")
            .attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom)
            .append("g").attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var xAxis = d3.svg.axis().scale(x).orient("bottom");

        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

        /*d3.csv("./data/topTenCountriesByMsg.csv", function(data) {*/

        x.domain(data.map(function (d) {
            return d.name;
        }));

        y.domain([ 0, d3.max(data, function (d) {
            return d.value;
        })]);

        svg.append("g").attr("class", "x axis").attr("transform",
                "translate(0," + height + ")").call(xAxis).selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.1em")
            .attr("dy", ".14em")
            .attr("transform", function (d) {
                return "rotate(-25)"
            });

        svg.append("g").attr("class", "y axis").call(yAxis).append("text")
            .attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
                ".71em").style("text-anchor", "end").text(
                "");

        svg.selectAll(".bar").data(data).enter().append("rect").attr(
                "class", "bar").attr("x",function (d) {
                return x(d.name);
            }).attr("width", x.rangeBand()).attr("y",function (d) {
                return y(d.value);
            }).attr("height",function (d) {
                return height - y(d.value);
            }).on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.value + "<br/>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        /*});*/


    };

    self.topDeviceTypePieChart = function () {

        $("#pie-chart").html(" ");

        var width = $("#pie-chart").width(), height = $("#pie-chart").height(), radius = Math
            .min(width, height) / 2;


        var data = self.toTenDeviceData;
        var color = d3.scale.ordinal().range(
            [ "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56",
                "#d0743c", "#ff8c00" ]);

        var arc = d3.svg.arc().outerRadius(radius - 10).innerRadius(0);

        var pie = d3.layout.pie().sort(null).value(function (d) {
            return d.used;
        });

        var svg = d3.select("#pie-chart").append("svg").attr("width", width)
            .attr("height", height).append("g").attr("transform",
                "translate(" + width / 2 + "," + height / 2 + ")");

        /*d3.csv("./data/topDevice.csv", function (data) {*/

        data.forEach(function (d) {
            d.used = +d.used;
        });

        var g = svg.selectAll(".arc").data(pie(data)).enter().append("g")
            .attr("class", "arc");

        g.append("path").attr("d", arc).style("fill", function (d) {
            return color(d.data.device);
        });

        g.append("text").attr("transform",function (d) {
            return "translate(" + arc.centroid(d) + ")";
        }).attr("dy", ".45em").style("text-anchor", "middle").text(
            function (d) {
                return d.data.device;
            });

        /*     });*/

    };

    self.plotTopCountriesByDeviceChart = function () {
        var color = ["#5AAD2A", "#007AFF", "#E573B9", "#FFCC00", "#E30518", "#708090", "#FFFF00", "#A0522C", "#FFB6C1", "#9732CE"];
        $("#top-ten-countries-device-div").html(" ");
        function type(d) {
            d.value = +d.value;
            return d;
        }

        var data = self.topTenCountryByDevice;
        var wi = $("#top-ten-countries-device-div").width();
        var hi = $("#top-ten-countries-device-div").height();
        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        }, width = wi - margin.left - margin.right, height = hi - margin.top
            - margin.bottom;


        var svg = d3.select("#top-ten-countries-device-div").append("svg").attr("width",
                width).attr("height",
                height + margin.top + margin.bottom).append("g").attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        /*d3.csv("./data/topTenCountriesByDevice.csv", function(data) {*/

        var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1);

        var y = d3.scale.linear().range([ height , 0 ]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom");

        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
        x.domain(data.map(function (d) {
            return d.name;
        }));

        y.domain([ 0, d3.max(data, function (d) {

            return d.value;
        })]);

        svg.append("g").attr("class", "x axis").attr("transform",
                "translate(0," + height + ")").call(xAxis).selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.1em")
            .attr("dy", ".14em")
            .attr("transform", function (d) {
                return "rotate(-25)"
            });

        svg.append("g").attr("class", "y axis").call(yAxis).append("text")
            .attr("transform", "rotate(-90)").attr("y", 6).attr("dy",
                ".71em").style("text-anchor", "end").text(
                "");

        svg.selectAll(".bar1").data(data).enter().append("rect").attr(
                "class", "bar1").attr("x",function (d) {
                return x(d.name);
            }).attr("width", x.rangeBand()).attr("y",function (d) {
                return y(d.value);
            }).attr("height", function (d) {
                return height - y(d.value);
            })
            .attr("fill",function (d, i) {
                return color[i];
            }).on("mouseover", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.value + "<br/>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        /*});*/


    };

    self.plotNetworkTrafficChart = function () {

        var smoothie = new SmoothieChart({scaleSmoothing: 1, grid: {fillStyle: 'rgba(0,0,0,0.34)'}});
        smoothie.streamTo(document.getElementById("message-traffic-chart"), 5000);

        // Data
        var line1 = new TimeSeries();
        var line2 = new TimeSeries();

        // Add a random value to each line every second
        setInterval(function () {
            line1.append(new Date().getTime(), self.totalSubMessage());
            line2.append(new Date().getTime(), self.totalPubMessage());
        }, 1000);

        // Add to SmoothieChart
        smoothie.addTimeSeries(line1, {fillStyle: 'rgba(0, 255, 0, 0.4)'});
        smoothie.addTimeSeries(line2, {fillStyle: 'rgba(220, 0, 255, 0.3)'});

    };

    self.plotNetworkTrafficChart();


};
