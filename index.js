const DeviceManager = require("./deviceManager");
const LedManager = require("./ledManager");

const thingName = 'AIL_IoT_RPi_01';
const thingHost = 'a3knx5ouu01ymf-ats.iot.us-east-1.amazonaws.com';


const led12 = new LedManager(12);

function handleDelta(payload, shadow) {
    console.log("delta", payload, shadow);
}

function handleMesasage(topic, payload, shadow) {
    console.log("message", topic, payload, shadow);
}

new DeviceManager({clientId: thingName, host: thingHost}, ["LED"], handleMesasage, handleDelta);