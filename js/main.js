require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'lib/jquery-1.10.2',
        knockout: 'lib/knockout',
        d3: "lib/d3.v3"

    },
    shim: {
        d3: {
            exports: 'd3'
        }
    }
});
require(
    [
        "d3",
        "jquery",
        "lib/json2",
        "lib/underscore",
        "lib/pubnub",
        "lib/queue",
        "lib/topojson",
        "lib/smoothie"
    ]
);
require([
    "knockout"
], function (ko) {
    window.ko = ko;
});


require(["d3", "vm/pubnub.dashboard", "vm/pubnub.worldmap.dev","vm/pubnub.rtsgraph.dev"], function (d3) {
    window.currentdashboard = new DasboardVM();
    currentdashboard.worldMapVM.plotWorldMap();
    currentdashboard.realTimeGraphVM.getRealTimeStatsData();

    ko.applyBindings(currentdashboard);
})
