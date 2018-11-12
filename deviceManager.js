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
    constructor(deviceModuleOptions, subscriptions = []) {
        this._toSubscribeTo = subscriptions;
        this._initialSubscription = false;
        const opts = { ...deviceDefaults, ...deviceModuleOptions };
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

    subscribe(additionalTopics) {
        this.device.subscribe(additionalTopics);
        if (!this._initialSubscription) {
            this.device.subscribe(this._toSubscribeTo);
        }
    }

    _handleConnect() {
        log`connected`;
        log`subscribing to shadow update deltas`;
        this.topicPath = getAwsDeltaPath(this.clientId);
        this.subscribe(this.topicPath);
    }

    _handleMessage(topic, payload) {
        log`Message received from Topic ${topic}. Processing...`;
        log`Payload:`;
        console.log(payload);
    }

    _handleDelta(topic, payload) {
        log`Delta received from Topic ${topic}. Processing...`;
        log`Payload:`;
        console.log(payload);
    }

}

module.exports = DeviceManager;