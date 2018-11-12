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
    constructor(deviceModuleOptions, topicsToSubscribeTo = [], onMessage = null) {
        this.onMessage = onMessage;
        this._topicsToSubscribeTo = topicsToSubscribeTo;
        this._subscribed = false;
        const opts = { ...deviceDefaults, ...deviceModuleOptions };
        this.device = new AwsIot.device(opts);
        this.clientId = opts.clientId;
        log = makeLogger(`Device ${this.clientId}`);
        this.bindHandlers();
    }

    bindHandlers() {
        log`bind handlers`;

        this._handleConnect = this._handleConnect.bind(this);
        this._handleMessage = this._handleMessage.bind(this);
        this._handleDelta = this._handleDelta.bind(this);

        this.device.on(events.connect, this._handleConnect);
        this.device.on(events.message, this._handleMessage);
        this.device.on(events.delta, this._handleDelta);
    }

    subscribe() {
        log`subscribe`;
        if (!this._subscribed) {
            this.device.subscribe(this._topicsToSubscribeTo);
        }
    }

    _handleConnect() {
        if (this.connected) {
            log`already connected`;
            return;
        }
        this.connected = true;
        log`connected`;
        log`subscribing to shadow update deltas`;
        this._topicsToSubscribeTo.push(getAwsDeltaPath(this.clientId));
        this.subscribe();
    }

    _handleMessage(topic, payload) {
        console.log(`topic: ${topic}`);
        console.log("arguments: ", arguments);
        if(this.onMessage) {
            this.onMessage(topic, payload);
        }
    }

    _handleDelta(topic, payload) {
        log`Delta received from Topic ${topic}. Processing...`;
        log`Payload:`;
        console.log(payload);
    }

}

module.exports = DeviceManager;