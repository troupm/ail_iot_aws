var DeviceManager = require("./deviceManager");

const thingName = 'AIL_IoT_RPi_01';
const thingHost = 'a3knx5ouu01ymf-ats.iot.us-east-1.amazonaws.com';

new DeviceManager({ clientId: thingName, host: thingHost }, () => {
  console.log("connected!");
});