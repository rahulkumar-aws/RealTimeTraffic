var WorldMapVM = function () {

    var self = this;
    self.worldmapDataQueue = [];
    self.worldmapProperty = {
        worldmapWidth: ko.observable(0),
        worldmapHeight: ko.observable(0),
        projection: null,
        zoomLevel: ko.observable(1),
        isZoomed: false
    };


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

    self.message = function (data) {
        self.worldmapDataQueue.push(data);

    };


    self.plotWorldMap = function () {


        var worldmapWidth = $("#map-wrapper").width();
        var worldMapHeight = $("#map-wrapper").height();
        self.worldmapProperty.worldmapWidth(worldmapWidth);
        self.worldmapProperty.worldmapHeight(worldMapHeight);

        var width = self.worldmapProperty.worldmapWidth();
        var height = self.worldmapProperty.worldmapHeight();

        var country, state;

        if (typeof(Storage) !== "undefined") {

            localStorage.currentLevel = 1;
            localStorage.countryId = 0;
        }
        else {
            // Sorry! No web storage support..
        }


        self.worldmapProperty.projection = d3.geo.equirectangular().scale(170).translate([ (width / 2 - 90), height / 2]);//.precision(.1);

        var svg = d3.select("#map-container");//.append("svg");

        var path = d3.geo.path().projection(self.worldmapProperty.projection);

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
                    }).on("click", function (d) {
                        localStorage.currentLevel = 2;
                        localStorage.countryId = d.id;
                        var data ={};
                        data.id= d.id;
                        data.continentName = "northAmerica";
                        postbox.notifySubscribers(data.continentName, "levelChange");
                    })
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

                // self.getPubNubTraficData();
                // load and display the cities


                self.getPubNubTraficData();
            });

        var zm = d3.behavior.zoom().scaleExtent([1, 6]).on(
            "zoom",
            function (d) {

                g.attr("transform", "translate("
                    + d3.event.translate.join(",") + ")scale("
                    + d3.event.scale + ")")
                if (zm.scale() != undefined && zm.scale() > 1) {
                    //d3.selectAll('.sub').attr("r",2);
                    self.worldmapProperty.isZoomed = true;
                    self.worldmapProperty.zoomLevel(zm.scale());
                } else {
                    self.worldmapProperty.isZoomed = false;
                    self.worldmapProperty.zoomLevel(1);
                    postbox.notifySubscribers(1, "resetZoomLevel");
                }

            });


        svg.call(zm);
    };

    self.renderPoint = function () {

        var colors = ["#299dff"];
        var color = colors[Math.floor(Math.random() * colors.length)];

        var msg = self.worldmapDataQueue.shift();

        var pubCircleRadius = 3;
        var subCircleRadius = 3;
        if (!msg) return;

        var width = self.worldmapProperty.worldmapWidth();
        var height = self.worldmapProperty.worldmapHeight();

        var zoomPan = d3.select("#zoomPanal");
        var g = zoomPan.append("g");

        if (self.isZoom == true) {
            var zoomLevel = self.worldmapProperty.zoomLevel();
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


                return self.worldmapProperty.projection([d[1], d[0]])[0];
            })
            .attr("cy", function (d, i) {
                return self.worldmapProperty.projection([d[1], d[0]])[1];
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
                return self.worldmapProperty.projection([d[1], d[0]])[0];
            })
            .attr("cy",function (d, i) {
                return self.worldmapProperty.projection([d[1], d[0]])[1];
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
    self.renderPoint();
    setInterval(self.renderPoint, 1 * 1000);


};