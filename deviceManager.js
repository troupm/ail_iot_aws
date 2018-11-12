const AwsIot = require('aws-iot-device-sdk');
const deviceDefaults = require("./deviceDefaults");
const makeLogger = require("./makeLogger");

const events = {
  connect: "connect",
  message: "message",
  delta: "delta"
};

const awsDeltaPath = "$aws/things/<THING>/shadow/update/delta";
const getAwsDeltaPath = thing => awsDeltaPath.replace("<THING>", thing);
let log;

class DeviceManager {
  constructor(deviceModuleDetails, onConnect = null, onMessage = null, onDelta = null) {
    this.onConnect = onConnect;
    this.onMessage = onMessage;
    this.onDelta = onDelta;
    const opts = { ...deviceDefaults, ...deviceModuleDetails };
    this.device = new AwsIot.device(opts);
    this.clientId = opts.clientId;
    log = makeLogger(`Device ${this.clientId}`);
    this.bindHandlers();
  }

  bindHandlers() {
    this._handleConnect = this._handleConnect.bind(this);
    this._handleMessage = this._handleMessage.bind(this);
    this._handleDelta = this._handleDelta.bind(this);

    this.device.on(events.connect, this._handleConnect);
    this.device.on(events.message, this._handleMessage);
    this.device.on(events.delta, this._handleDelta);
  }

  _handleConnect() {
    log`connected`;
    log`subscribing to shadow update deltas`;
    this.topicPath = getAwsDeltaPath(this.clientId);
    this.device.subscribe(this.topicPath);
    if (this.onConnect) {
      log`onConnect provided, calling...`;
      this.onConnect();
    }
  }

  _handleMessage(topic, payload) {
    log`Message received from Topic ${topic}. Processing...`;
    log`Payload:`;
    console.log(payload);

    if (this.onMessage) {
      log`onMessage provided, calling...`;
      this.onMessage(topic, payload);
    }
  }

  _handleDelta(topic, payload) {
    log`Delta received from Topic ${topic}. Processing...`;
    log`Payload:`;
    console.log(payload);

    if (this.onDelta) {
      log`onDelta provided, calling...`;
      this.onDelta(topic, payload);
    }
  }

}

module.exports = DeviceManager;