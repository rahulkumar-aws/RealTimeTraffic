var DasboardVM = function () {
    var self = this;
    self.topChannelsViewTitle = "Top 10 channels";
    self.trafficViewTitle = "Traffic";
    self.topReasonViewTitle = "Top 10 Countries based on Total Message Volume";

    self.topChannelsByDeviceTitle = "Top 10 channels by device connection";
    self.deviceTypeViewTitle = "Device Type";
    self.topReasonByDeviceTitle = "Top 10 countries by device connections";


    self.worldMapVM = new WorldMapVM();
    self.realTimeGraphVM = new RealTimeGraphVM();


};