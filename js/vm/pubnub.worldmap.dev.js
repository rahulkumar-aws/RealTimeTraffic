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

    self.countryCode = {'BD': 50, 'BE': 56, 'BF': 854, 'BG': 100, 'BA': 70, 'BN': 96, 'JP': 392, 'BI': 108, 'BJ': 204, 'KZ': 398, 'BT': 64, 'JM': 388, 'JO': 400, 'BR': 76, 'BY': 112, 'BZ': 84, 'RU': 643, 'RW': 646, 'RS': 688, 'TL': 626, 'TM': 795, 'TJ': 762, 'RO': 642, 'GW': 624, 'GT': 320, 'GR': 300, 'GQ': 226, 'GY': 328, 'GF': 254, 'GE': 268, 'GB': 826, 'GA': 266, 'GN': 324, 'GM': 270, 'GL': 304, 'GH': 288, 'OM': 512, 'TN': 788, 'IL': 376, 'BW': 72, 'HR': 191, 'HT': 332, 'HU': 348, 'HN': 340, 'PR': 630, 'PT': 620, 'PY': 600, 'PA': 591, 'PG': 598, 'PE': 604, 'PK': 586, 'PH': 608, 'PL': 616, 'ZM': 894, 'EH': 732, 'EE': 233, 'EG': 818, 'ZA': 710, 'EC': 218, 'IT': 380, 'VN': 704, 'SB': 90, 'ET': 231, 'ZW': 716, 'ES': 724, 'ER': 232, 'MG': 450, 'UY': 858, 'UZ': 860, 'MM': 104, 'ML': 466, 'MN': 496, 'US': 840, 'MW': 454, 'MR': 478, 'UG': 800, 'UA': 804, 'MX': 484, 'AT': 40, 'FR': 250, 'MA': 504, 'FI': 246, 'FJ': 242, 'FK': 238, 'NI': 558, 'NL': 528, 'NO': 578, 'NA': 516, 'NC': 540, 'NE': 562, 'NG': 566, 'NZ': 554, 'NP': 524, 'CH': 756, 'CO': 170, 'CN': 156, 'CM': 120, 'CL': 152, 'CA': 124, 'CG': 178, 'CF': 140, 'CZ': 203, 'CY': 196, 'CR': 188, 'CU': 192, 'SZ': 748, 'SY': 760, 'KG': 417, 'KE': 404, 'SR': 740, 'KH': 116, 'SV': 222, 'SK': 703, 'SJ': 744, 'SO': 706, 'SN': 686, 'SL': 694, 'KW': 414, 'SA': 682, 'SE': 752, 'SD': 729, 'DO': 214, 'DJ': 262, 'DK': 208, 'DE': 276, 'YE': 887, 'DZ': 12, 'LB': 422, 'TR': 792, 'LK': 144, 'LV': 428, 'LT': 440, 'LU': 442, 'LR': 430, 'LS': 426, 'TH': 764, 'TG': 768, 'TD': 148, 'AE': 784, 'AF': 4, 'IQ': 368, 'IS': 352, 'AM': 51, 'AL': 8, 'AO': 24, 'AR': 32, 'AU': 36, 'VU': 548, 'IN': 356, 'AZ': 31, 'IE': 372, 'ID': 360, 'MY': 458, 'QA': 634, 'MZ': 508};
    self.countryList = {
        "asia": ['IN', 'JP', 'BD', 'CN', 'ID', 'LK', 'MY', 'TH', 'TW', 'PK', 'PH'],
        "northAmerica": ['US', 'MX', 'CA'],
        "southAmerica": ['BR', 'CU'],
        "europe": ['RU', 'RO', 'SE', 'SZ', 'TR', 'IE', 'GB', 'GF', 'ES', 'CH', 'NL', 'DE', 'DK', 'HU'],
        "africa": ['KE', 'ZA', 'ZW', 'EG'],
        "oceania": ['AU', 'NZ']
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


    self.getContinentName = function (id) {

        for (key in self.countryCode) {

            if (id == self.countryCode[key]) {

                for (code in self.countryList) {

                    var continentName = _.indexOf(self.countryList[code], key);

                    if (continentName != -1) {


                    }

                }


            }
        }


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
                        var data = {};
                        data.id = d.id;
                        var continentName = null;

                        self.getContinentName(d.id);

                        //alert(d.id);

                        for(var code in self.countryCode){

                            if(d.id== self.countryCode[code]){

                                var currentCountryCode = code;

                                for(var c in self.countryList){

                                    var currentCountryArray = self.countryList[c];

                                    if(_.indexOf(currentCountryArray, currentCountryCode)!= -1){

                                        continentName = c;

                                    }

                                }


                            }
                        }



                        data.continentName = continentName;
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