var RealTimeGraphVM = function () {

    var self = this;
    self.streamDataArray = [];
    self.workingQueue = [];
    self.rtsStatsMessages = {
        totalChannels: ko.observable(0),
        totalUsers: ko.observable(0),
        totalPublishPerSec: ko.observable(0),
        totalSubscribePerSec: ko.observable(0),
        totalMessages: ko.observable(0),
        totalHistoryMessages: ko.observable(0),
        totalHistoryRequest: ko.observable(0)
    };

    self.topTenCountryArray = [];
    self.topTenCountryData = [];
    self.totalPubMessage = ko.observable(0);
    self.totalSubMessage = ko.observable(0);


    self.getRealTimeStatsData = function () {

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

            /*Put rts channel data into an Array with time interval 30 sec*/
            self.streamDataArray.push(msg);

        }

        setInterval(function () {

            self.workingQueue.push(self.streamDataArray);
            self.streamDataArray = [];

        }, 10 * 1000);

        setInterval(function () {

            var currentRTSWorkingData = self.workingQueue.shift();
            var rtsInformationArray = [];
            self.rtsStatsMessages.totalChannels(0),
                self.rtsStatsMessages.totalUsers(0),
                self.rtsStatsMessages.totalPublishPerSec(0),
                self.rtsStatsMessages.totalSubscribePerSec(0),
                self.rtsStatsMessages.totalMessages(0),
                self.rtsStatsMessages.totalHistoryMessages(0),
                self.rtsStatsMessages.totalHistoryRequest(0);
            self.topTenCountryArray = [];
            self.totalPubMessage = ko.observable(0);
            self.totalSubMessage = ko.observable(0);
            for (var i = 0; i < currentRTSWorkingData.length; i++) {

                var data = currentRTSWorkingData[i];
                self.createRTSStatsMatrix(data);
            }

            if (self.topTenCountryArray.length > 0) {
                console.log(self.topTenCountryArray);

                var temp = [];
                for (var i = 0; i < self.topTenCountryArray.length; i++) {

                    var countryName = self.topTenCountryArray[i].name;
                    var valueCount = 0;
                    var tempObj = {};
                    for (var j = 0; j < self.topTenCountryArray.length; j++) {

                        if (countryName == self.topTenCountryArray[j].name) {

                            valueCount = valueCount + self.topTenCountryArray[j].value;

                        }

                    }
                    tempObj.name = countryName;
                    tempObj.value = valueCount;
                    /*self.allCountry.push(countryName);*/
                    temp.push(tempObj);
                }


                self.topTenCountryData = _.uniq(temp, function (country) {
                    return country.name;
                });


            }

            self.plotTopCountriesByTotalMsgVolumeChart(self.topTenCountryData);


        }, 15 * 1000)
    };

    self.createRTSStatsMatrix = function (data) {

        traverse(data, process);

        function traverse(o, func) {
            for (var i in o) {
                func.apply(this, [i, o[i]]);
                if (o[i] !== null && typeof(o[i]) == "object") {
                    //going on step down in the object tree!!
                    traverse(o[i], func);
                }
            }
        };

        function process(key, value) {

            //Total No of Channel (sum of all n_unique_channels)
            if (key == 'n_unique_channels') {
                self.rtsStatsMessages.totalChannels(self.rtsStatsMessages.totalChannels() + value);
            }
            //Total no of User
            if (key == 'n_active_customers') {
                self.rtsStatsMessages.totalUsers(self.rtsStatsMessages.totalUsers() + value);
            }
            //Total Publish/sec
            if (key == 'publish') {
                self.rtsStatsMessages.totalPublishPerSec(self.rtsStatsMessages.totalPublishPerSec() + value);
            }
            //Total Subscribe/sec
            if (key == 'subscribe_msgs') {
                self.rtsStatsMessages.totalSubscribePerSec(self.rtsStatsMessages.totalSubscribePerSec() + value);
            }
            //Total History Message
            if (key == 'history_msgs') {
                self.rtsStatsMessages.totalHistoryMessages(self.rtsStatsMessages.totalHistoryMessages() + value);

                //Total Messages(publish+subscribe+history)
                self.rtsStatsMessages.totalMessages(self.rtsStatsMessages.totalMessages() + self.rtsStatsMessages.totalSubscribePerSec()
                    + self.rtsStatsMessages.totalHistoryRequest());
            }
            //Total History Requests
            if (key == 'history') {
                self.rtsStatsMessages.totalHistoryRequest(self.rtsStatsMessages.totalHistoryRequest() + value);
            }

            if (key.indexOf('geo') != -1) {
                traverse(value, geoProcess);
            }
        };
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


    };


    self.plotTopCountriesByTotalMsgVolumeChart = function (msgvolumedata) {

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

        var data = msgvolumedata;

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

    };
    self.plotNetworkTrafficGraph = function () {

        var smoothie = new SmoothieChart({scaleSmoothing: 1, grid: {fillStyle: 'rgba(0,0,0,0.34)'}});

        smoothie.streamTo(document.getElementById("message-traffic-chart"), 1000);

        // Data
        var line1 = new TimeSeries();
        var line2 = new TimeSeries();

        // Add a random value to each line every second
        setInterval(function () {
            line1.append(new Date().getTime(), self.totalPubMessage());
            line2.append(new Date().getTime(), self.totalSubMessage());
        }, 1000);

        // Add to SmoothieChart
        smoothie.addTimeSeries(line1, {fillStyle: 'rgba(0, 255, 0, 0.4)'});
        smoothie.addTimeSeries(line2, {fillStyle: 'rgba(220, 0, 255, 0.3)'});

    };

     self.plotNetworkTrafficGraph();

    self.plotTopCountriesByDeviceChart = function () {
    };
    self.plotTopDeviceChart = function () {
    };


};