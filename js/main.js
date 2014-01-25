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


require(["d3", "vm/pubnub.dashboard", "vm/pubnub.worldmap", "vm/pubnub.messagedata", "vm/pubnub.devicedata"], function (d3) {
    console.log(d3);
    window.currentdashboard = new DasboardVM();
    currentdashboard.worldMapVM.plotWorldMap();
    ko.applyBindings(currentdashboard);
})
