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
        self.streamDataArray.push(data);
    };


    self.plotWorldMap = function () {

        var worldmapWidth = $("#map-wrapper").width();
        var worldMapHeight = $("#map-wrapper").height();
        self.worldmapProperty.worldmapWidth(worldmapWidth);
        self.worldmapProperty.worldmapHeight(worldMapHeight);

        var width = self.worldmapProperty.worldmapWidth();
        var height = self.worldmapProperty.worldmapHeight();

        var country, state;

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
                    })//.on("click", country_clicked)
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
                }

            });


        svg.call(zm);
    };


};