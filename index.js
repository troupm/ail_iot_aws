const DeviceManager = require("./deviceManager");
const LedManager = require("./ledManager");

const thingName = 'AIL_IoT_RPi_01';
const thingHost = 'a3knx5ouu01ymf-ats.iot.us-east-1.amazonaws.com';

function handleMessage(topic, payload) {
    payload = JSON.parse(payload.toString());
    console.log("payload", payload);
}

new DeviceManager({ clientId: thingName, host: thingHost }, ["LED"], handleMessage);