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
        //Country Array
        self.chartZoomLevel = ko.observable(1);
        self.NADataArray = [];
        self.SADataArray = [];
        self.europeDataArray = [];
        self.asiaDataArray = [];
        self.africaDataArray = [];
        self.oceaniaDataArray = [];
        self.countryName = ko.observable(null);

        self.continentClicked = ko.observable(null);
        var countryCode = {'BD': 50, 'BE': 56, 'BF': 854, 'BG': 100, 'BA': 70, 'BN': 96, 'JP': 392, 'BI': 108, 'BJ': 204, 'KZ': 398, 'BT': 64, 'JM': 388, 'JO': 400, 'BR': 76, 'BY': 112, 'BZ': 84, 'RU': 643, 'RW': 646, 'RS': 688, 'TL': 626, 'TM': 795, 'TJ': 762, 'RO': 642, 'GW': 624, 'GT': 320, 'GR': 300, 'GQ': 226, 'GY': 328, 'GF': 254, 'GE': 268, 'GB': 826, 'GA': 266, 'GN': 324, 'GM': 270, 'GL': 304, 'GH': 288, 'OM': 512, 'TN': 788, 'IL': 376, 'BW': 72, 'HR': 191, 'HT': 332, 'HU': 348, 'HN': 340, 'PR': 630, 'PT': 620, 'PY': 600, 'PA': 591, 'PG': 598, 'PE': 604, 'PK': 586, 'PH': 608, 'PL': 616, 'ZM': 894, 'EH': 732, 'EE': 233, 'EG': 818, 'ZA': 710, 'EC': 218, 'IT': 380, 'VN': 704, 'SB': 90, 'ET': 231, 'ZW': 716, 'ES': 724, 'ER': 232, 'MG': 450, 'UY': 858, 'UZ': 860, 'MM': 104, 'ML': 466, 'MN': 496, 'US': 840, 'MW': 454, 'MR': 478, 'UG': 800, 'UA': 804, 'MX': 484, 'AT': 40, 'FR': 250, 'MA': 504, 'FI': 246, 'FJ': 242, 'FK': 238, 'NI': 558, 'NL': 528, 'NO': 578, 'NA': 516, 'NC': 540, 'NE': 562, 'NG': 566, 'NZ': 554, 'NP': 524, 'CH': 756, 'CO': 170, 'CN': 156, 'CM': 120, 'CL': 152, 'CA': 124, 'CG': 178, 'CF': 140, 'CZ': 203, 'CY': 196, 'CR': 188, 'CU': 192, 'SZ': 748, 'SY': 760, 'KG': 417, 'KE': 404, 'SR': 740, 'KH': 116, 'SV': 222, 'SK': 703, 'SJ': 744, 'SO': 706, 'SN': 686, 'SL': 694, 'KW': 414, 'SA': 682, 'SE': 752, 'SD': 729, 'DO': 214, 'DJ': 262, 'DK': 208, 'DE': 276, 'YE': 887, 'DZ': 12, 'LB': 422, 'TR': 792, 'LK': 144, 'LV': 428, 'LT': 440, 'LU': 442, 'LR': 430, 'LS': 426, 'TH': 764, 'TG': 768, 'TD': 148, 'AE': 784, 'AF': 4, 'IQ': 368, 'IS': 352, 'AM': 51, 'AL': 8, 'AO': 24, 'AR': 32, 'AU': 36, 'VU': 548, 'IN': 356, 'AZ': 31, 'IE': 372, 'ID': 360, 'MY': 458, 'QA': 634, 'MZ': 508};
        self.countryList = {
            "asia": ['IN', 'JP', 'BD', 'CN', 'ID', 'LK', 'MY', 'TH', 'TW', 'PK', 'PH'],
            "northAmerica": ['US', 'MX', 'CA'],
            "southAmerica": ['BR', 'CU'],
            "europe": ['RU', 'RO', 'SE', 'SZ', 'TR', 'IE', 'GB', 'GF', 'ES', 'CH', 'NL', 'DE', 'DK', 'HU'],
            "africa": ['KE', 'ZA', 'ZW', 'EG'],
            "oceania": ['AU', 'NZ']
        };

        //End
        self.allChannelArray = [];
        self.topTenCountryArray = [];
        self.topTenChannelArray = [];
        self.topTenCountryData = [];
        self.topTenCountryByDevice = [];
        self.deviceinfo = [];
        self.allDevices = [];
        self.allCountry = [];
        self.allChannel = [];
        self.channelArray = [];
        self.usedDeviceData = [];
        self.totalPubMessage = ko.observable(0);
        self.totalSubMessage = ko.observable(0);
        self.pPerSecond = ko.observable(0);
        self.sPerSecond = ko.observable(0);
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

                self.streamDataArray.push(msg);

            }

            setInterval(function () {

                self.workingQueue.push(self.streamDataArray);
                self.streamDataArray = [];

            }, 5 * 1000);
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
                    self.allChannelArray = [];
                    self.topTenCountryArray = [];
                    self.topTenChannelArray = [];
                    self.allCountry = [];
                    self.NADataArray = [];
                    self.SADataArray = [];
                    self.europeDataArray = [];
                    self.asiaDataArray = [];
                    self.africaDataArray = [];
                    self.oceaniaDataArray = [];
                    self.channelArray = [];
                    self.totalPubMessage = ko.observable(0);
                    self.totalSubMessage = ko.observable(0);
                    $(".tooltip").remove();
                    for (var i = 0; i < currentRTSWorkingData.length; i++) {

                        var data = currentRTSWorkingData[i];
                        self.createRTSStatsMatrix(data);
                    }



                    if (self.topTenCountryArray.length > 0) {

                        var temp = [];
                        for (var i = 0; i < self.topTenCountryArray.length; i++) {

                            var countryName = self.topTenCountryArray[i].name;
                            var valueCount = 0;
                            var deviceCount =0;
                            var tempObj = {};
                            for (var j = 0; j < self.topTenCountryArray.length; j++) {

                                if (countryName == self.topTenCountryArray[j].name) {


                                    //console.log("RTRTRTR ", self.topTenCountryArray[j].deviceinfo);

                                    for(var k in self.topTenCountryArray[j].deviceinfo){

                                       deviceCount = self.topTenCountryArray[j].deviceinfo[k].p + self.topTenCountryArray[j].deviceinfo[k].s;



                                    }

                                    valueCount = valueCount + self.topTenCountryArray[j].value;

                                }

                            }
                            tempObj.name = countryName;
                            tempObj.value = valueCount;
                            tempObj.totalDeviceVolume=deviceCount;
                            self.allCountry.push(countryName);
                            temp.push(tempObj);
                        }


                        self.topTenCountryData = _.uniq(temp, function (country) {
                            return country.name;
                        });


                    };



                    //Top 10 country by device connection

                   //console.log("Top 10 Country Array ",self.topTenCountryArray);


              /*      for(var i=0; i< self.topTenCountryArray.length;i++){


                               console.log(self.topTenCountryArray[i].deviceinfo);


                    }*/






                    //Device Chart Logic
                    var devicearray = ["Chrome", "Other","Chromium"];
                    var testDevice = [];
                    for (var i = 0; i < devicearray.length; i++) {

                        var matcher = devicearray[i];
                        var total = 0;
                        for (var j = 0; j < self.deviceinfo.length; j++) {

                            var currentdevice = self.deviceinfo[j];

                            var tempObj = {};

                            $.each(currentdevice, function (k, v) {
                                if (k.indexOf(matcher) != -1) {
                                    tempObj.name = k;
                                     console.log(" v.p ",v.p," ","v.s ",v.s);
                                    tempObj.value = v.p + v.s;

                                    testDevice.push(tempObj);
                                }
                            });
                        }
                    }
                    var finalArray = [];
                    for (var i = 0; i < testDevice.length; i++) {
                        var currentDevice = testDevice[i].name;
                        var valueCount = 0;
                        var deviceMap = {};
                        for (var j = 0; j < testDevice.length; j++) {
                            if (currentDevice == testDevice[j].name) {


                               // console.log("** testDevice[j].value ", testDevice[j].value);

                                if(testDevice[j].value == undefined ){
                                    testDevice[j].value = 0;
                                }

                                valueCount = valueCount + testDevice[j].value;
                            }
                        }
                        deviceMap.device = currentDevice;
                        deviceMap.used = valueCount;
                        self.allDevices.push(valueCount);
                        finalArray.push(deviceMap);
                    }
                    self.usedDeviceData = _.uniq(finalArray, function (device) {
                        return device.device;
                    });


                    //Top Country By Device
                    var noOfdevice = [];
                    for (var i = 0; i < self.allCountry.length; i++) {
                        var a = {};
                       // console.log("self.allDevices[i] ",self.allDevices[i]);

                        a.country = self.allCountry[i];
                        a.noOfdevice = self.allDevices[i];
                        noOfdevice.push(a);
                    }
                    var tempDeviceArray = [];
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

                        tempDeviceArray.push(aa);
                    }

                    self.topTenCountryByDevice = _.uniq(tempDeviceArray, function (country) {
                        return country.name;
                    });


                    self.topTenCountryData = _.sortBy(self.topTenCountryData, function (data) {
                        return data.value;
                    });
                    self.topTenCountryData.reverse();

                    self.topTenCountryByDevice = _.sortBy(self.topTenCountryByDevice, function (data) {
                        return data.value;
                    });
                    self.topTenCountryByDevice.reverse();


                    //Top 10 Channel

                    var finalArray = [];
                    for (var i = 0; i < self.allChannelArray.length; i++) {
                        var currentChannel = self.allChannelArray[i].name;
                        var valueCount = 0;
                        var channelMap = {};
                        for (var j = 0; j < self.allChannelArray.length; j++) {
                            if (currentChannel == self.allChannelArray[j].name) {
                                valueCount = valueCount + self.allChannelArray[j].value;
                            }
                        }
                        channelMap.channel = currentChannel;
                        channelMap.used = valueCount;
                        self.allChannel.push(valueCount);
                        finalArray.push(channelMap);
                    }

                    self.topTenChannelArray = _.uniq(finalArray, function (channel) {
                        return channel.channel;
                    });


                    if (self.chartZoomLevel() == '1') {

                        self.plotTopCountriesByTotalMsgVolumeChart(self.topTenCountryData);
                       // self.plotTopCountriesByDeviceChart(self.topTenCountryByDevice);
                        self.plotTopCountriesByDeviceChart(self.topTenCountryData);
                        self.plotTopDeviceChart(self.usedDeviceData);
                        self.plotTopTenChannelChart(self.topTenChannelArray);
                        self.plotTopTenChannelByDeviceChart();

                    } else if (self.chartZoomLevel() == '2') {

                        self.drawNextLevel(self.continentClicked());
                    }
                }, 7 * 1000
            )
        };

        self.setChartZoomLevel = function (levelNo) {

            self.chartZoomLevel(levelNo);
        };

        self.drawNextLevel = function (data) {

            self.continentClicked(data);
            self.chartZoomLevel(2);
            switch (data) {

                case 'northAmerica':

                    var naCountryArray = self.getCountryMsgDataArray(self.NADataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(naCountryArray);

                    break;
                case 'southAmerica':

                    var saCountryArray = self.getCountryMsgDataArray(self.SADataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(saCountryArray);
                    break;
                case 'europe':
                    var euCountryArray = self.getCountryMsgDataArray(self.europeDataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(euCountryArray);
                    break;
                case 'africa':

                    var afCountryArray = self.getCountryMsgDataArray(self.africaDataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(afCountryArray);
                    break;
                case 'asia':

                    var asiaCountryArray = self.getCountryMsgDataArray(self.asiaDataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(asiaCountryArray);
                    break;
                case 'oceania':
                    var osCountryArray = self.getCountryMsgDataArray(self.oceaniaDataArray);
                    self.plotTopCountriesByTotalMsgVolumeChart(osCountryArray);
                    break;
            }

        };

        self.traverse = function (o, func) {
            for (var i in o) {
                func.apply(this, [i, o[i]]);
                if (o[i] !== null && typeof(o[i]) == "object") {
                    //going on step down in the object tree!!
                    self.traverse(o[i], func);
                }
            }
        };

        self.createRTSStatsMatrix = function (data) {
            self.traverse(data, process);


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

                    self.traverse(value, geoProcess);
                }

                if (key == 'unique_user_agents') {

                    self.deviceinfo.push(value);
                }

                if (key == "unique_channels") {

                    self.traverse(value, channelProgress);
                    self.channelArray.push(value);

                }

            };


            function channelProgress(key, value) {

                var channelMap = {};
                var channelName = null;

                if (key.length > 1) {
                    self.channelName = key;
                    channelMap.name = self.channelName;
                    channelMap.value = value.p + value.s;
                    self.allChannelArray.push(channelMap);
                }

            };


            function userAgentProcess(key, value) {




            }


            function geoProcess(key, value) {
                var countryMap = {};
                var stateName = null;
                self.countryName(null);



               /*     if(key=="user_agents"){


                        console.log("UIUIUIUI ",value);


                    }*/



                if (key.indexOf('.') != -1) {

                    stateName = key.split('.');
                    self.countryName(key.split('.')[0]);
                    countryMap.name = self.countryName();
                    countryMap.stateName = stateName[1] + " " + stateName[2];
                    countryMap.value = value.p + value.s;
                    countryMap.deviceinfo = value.user_agents;
                    countryMap.channelsinfo = value.channels;
                    self.topTenCountryArray.push(countryMap);

                    var countryFound = null;
                    for (var key in self.countryList) {

                        var a = {};

                        if (_.indexOf(self.countryList[key], self.countryName()) != -1) {

                            countryFound = key;

                            if (countryFound != undefined && countryFound == 'northAmerica') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.NADataArray.push(a);
                            }
                            if (countryFound != undefined && countryFound == 'southAmerica') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.NADataArray.push(a);
                            }
                            if (countryFound != undefined && countryFound == 'asia') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.asiaDataArray.push(a);
                            }
                            if (countryFound != undefined && countryFound == 'africa') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.africaDataArray.push(a);
                            }
                            if (countryFound != undefined && countryFound == 'europe') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.europeDataArray.push(a);
                            }
                            if (countryFound != undefined && countryFound == 'oceania') {
                                a.name = stateName[1] + " " + stateName[2];
                                a.value = value.p + value.s;


                                self.oceaniaDataArray.push(a);
                            }
                        }
                    }
                }
                if (key == 'p') {
                    self.totalPubMessage(self.totalPubMessage() + value);
                }
                if (key == 's') {
                    self.totalSubMessage(self.totalSubMessage() + value);
                }

            };

        };

        self.getCountryMsgDataArray = function (countryArray) {

            if (countryArray.length > 0) {

                var temp = [];
                for (var i = 0; i < countryArray.length; i++) {

                    var countryName = countryArray[i].name;
                    var valueCount = 0;
                    var tempObj = {};
                    for (var j = 0; j < countryArray.length; j++) {

                        if (countryName == countryArray[j].name) {

                            valueCount = valueCount + countryArray[j].value;

                        }

                    }
                    tempObj.name = countryName;
                    tempObj.value = valueCount;
                    self.allCountry.push(countryName);
                    temp.push(tempObj);
                }


                countryArray = _.uniq(temp, function (country) {
                    return country.name;
                });


            }
            ;

            return countryArray;
        }


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

            var smoothie = new SmoothieChart({scaleSmoothing: 1, grid: {fillStyle: 'rgba(0,0,0,0.34)'}, maxValueScale: 1.5});

            smoothie.streamTo(document.getElementById("message-traffic-chart"), 500);

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

        self.plotTopCountriesByDeviceChart = function (deviceData) {


            console.log("deviceData  ",deviceData)


            $("#top-ten-countries-device-div").html(" ");

            function type(d) {
                d.totalDeviceVolume = +d.totalDeviceVolume;
                return d;
            }

            var data = deviceData;//self.topTenDeviceData
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
                    width + margin.left + margin.right).attr("height",
                    height + margin.top + margin.bottom).append("g").attr(
                    "transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var x = d3.scale.ordinal().rangeRoundBands([ 0, width ], .1);

            var y = d3.scale.linear().range([ height , 0 ]);
            var xAxis = d3.svg.axis().scale(x).orient("bottom");

            var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);
            x.domain(data.map(function (d) {
                return d.name;
            }));

            y.domain([ 0, d3.max(data, function (d) {

                return d.totalDeviceVolume;
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
                    return y(d.totalDeviceVolume);
                }).attr("height",function (d) {
                    return height - y(d.totalDeviceVolume);
                }).on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.totalDeviceVolume + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        };
        self.plotTopDeviceChart = function (deviceData) {
            $("#pie-chart").html(" ");

            var width = $("#pie-chart").width(), height = $("#pie-chart").height(), radius = Math
                .min(width, height) / 2;

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var data = deviceData;
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

            data.forEach(function (d) {
                d.used = +d.used;
            });

            var g = svg.selectAll(".arc").data(pie(data)).enter().append("g")
                .attr("class", "arc");

            g.append("path").attr("d", arc).style("fill",function (d) {
                return color(d.data.device);
            }).on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.data.device + "<br/>Used : " + d.data.used + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0);
                });

            g.append("text").attr("transform",function (d) {
                return "translate(" + arc.centroid(d) + ")";
            }).attr("dy", ".45em").style("text-anchor", "middle").text(
                function (d) {
                    //return d.data.device;
                });
        };


        self.plotTopTenChannelChart = function (channelData) {


            $("#top-ten-channel-by-message-div").html(" ");

            var width = $("#top-ten-channel-by-message-div").width();
            var height = $("#top-ten-channel-by-message-div").height();
            var margin = { "top": 30, "right": 20, "bottom": 20, "left": 30 }, width = width - margin.left - margin.right, height = height
                - margin.top - margin.bottom;
            var format = d3.format(",.0f");
            var x = d3.scale.linear().range([ 0, width ]), y = d3.scale.ordinal()
                .rangeRoundBands([ 0, height], .1);

            var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-height), yAxis = d3.svg
                .axis().scale(y).orient("left").tickSize(0);

            var svg = d3.select("#top-ten-channel-by-message-div").append("svg").attr("width",
                    width + margin.left + margin.right).attr("height",
                    height + margin.top + margin.bottom).append("g").attr("transform",
                    "translate(" + (margin.left + 10) + "," + margin.top + ")");

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            var data = self.topTenChannelArray;

            x.domain([ 0, d3.max(data, function (d) {
                return d.used;
            }) ]);
            y.domain(data.map(function (d) {

                return d.channel;
            }));

            var bar = svg.selectAll("g.bar").data(data).enter().append("g")
                .attr("class", "bar").attr("transform", function (d) {
                    return "translate(0," + y(d.channel) + ")";
                });

            bar.append("rect").attr("width",function (d) {
                return x(d.used);
            }).attr("height", y.rangeBand())
                .on("mouseover", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d.used + "<br/>")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0);
                });

            svg.append("g").attr("class", "x axis").call(xAxis);

            svg.append("g").attr("class", "y axis").call(yAxis);

        };

        self.plotTopTenChannelByDeviceChart = function () {

            //top-ten-channel-by-device-div
            $("#top-ten-channel-by-device-div").html(" ");
            var width = $("#top-ten-channel-by-device-div").width();
            var height = $("#top-ten-channel-by-device-div").height();
            var margin = { "top": 30, "right": 20, "bottom": 20, "left": 30 }, width = width - margin.left - margin.right, height = height
                - margin.top - margin.bottom;
            var format = d3.format(",.0f");
            var x = d3.scale.linear().range([ 0, width ]), y = d3.scale.ordinal()
                .rangeRoundBands([ 0, height], .1);

            var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-height), yAxis = d3.svg
                .axis().scale(y).orient("left").tickSize(0);

            var svg = d3.select("#top-ten-channel-by-device-div").append("svg").attr("width",
                    width + margin.left + margin.right).attr("height",
                    height + margin.top + margin.bottom).append("g").attr("transform",
                    "translate(" + (margin.left + 10) + "," + margin.top + ")");

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            d3.csv("./data/TopTenChannelByDevice.csv", function (data) {

                // Parse numbers, and sort by value.
                data.forEach(function (d) {
                    d.totalMessageVolume = +d.totalMessageVolume;
                });
                data.sort(function (a, b) {
                    return b.totalMessageVolume - a.totalMessageVolume;
                });
                // Set the scale domain.
                x.domain([ 0, d3.max(data, function (d) {
                    return d.totalMessageVolume;
                }) ]);
                y.domain(data.map(function (d) {

                    return d.channelName;
                }));
                var bar = svg.selectAll("g.bar").data(data).enter().append("g")
                    .attr("class", "bar").attr("transform", function (d) {
                        return "translate(0," + y(d.channelName) + ")";
                    });
                bar.append("rect").attr("width",function (d) {
                    return x(d.totalMessageVolume);
                }).attr("height", y.rangeBand()).on("mouseover", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d.totalMessageVolume + "<br/>")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });
                svg.append("g").attr("class", "x axis").call(xAxis);
                svg.append("g").attr("class", "y axis").call(yAxis);
            });

        };
    }
    ;