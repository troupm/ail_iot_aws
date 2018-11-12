const AwsIot = require('aws-iot-device-sdk');
const deviceDefaults = require("./deviceDefaults");
const makeLogger = require("./makeLogger");

const events = {
    connect: "connect",
    message: "message",
    delta: "delta",
    close: "close",
    reconnect: "reconnect",
    offline: "offline"
};
AwsIot.thingShadow

const awsDeltaPath = "$aws/things/<THING>/shadow/update/delta";
const getAwsDeltaPath = thing => awsDeltaPath.replace("<THING>", thing);
let log;

class DeviceManager {
    constructor(deviceModuleOptions, topicsToSubscribeTo = [], onMessage = null, onDelta = null) {
        this.onMessage = onMessage;
        this.onDelta = onDelta;
        this._topicsToSubscribeTo = topicsToSubscribeTo;
        this._subscribed = false;
        const opts = { ...deviceDefaults, ...deviceModuleOptions };
        this.device = new AwsIot.device(opts);
        this.clientId = opts.clientId;

        this.shadow = new AwsIot.thingShadow(opts);

        log = makeLogger(`Device ${this.clientId}`);
        this.bindHandlers();
        
    }

    bindHandlers() {
        log`bind handlers`;

        this._handleConnect = this._handleConnect.bind(this);
        this._handleMessage = this._handleMessage.bind(this);

        this.device.on(events.connect, this._handleConnect);
        this.device.on(events.message, this._handleMessage);

        this.device.on(events.close, () => console.log("CLOSE EVENT"));
        this.device.on(events.reconnect, () => console.log("RECONNECT EVENT"));
        this.device.on(events.offline, () => console.log("OFFLINE EVENT"));
        this.device.on("error", err => console.log(`ERROR EVENT`, err));
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
        log`resgistering thingShadow`;
        this.shadow.register(this.clientId);
        log`subscribing to shadow update deltas`;
        this.deltaTopicPath = getAwsDeltaPath(this.clientId);
        this._topicsToSubscribeTo.push(this.deltaTopicPath);
        this.subscribe();
    }

    _handleMessage(topic, payload) {
        if (topic === this.deltaTopicPath) {
            if (this.onDelta) {
                this.onDelta(payload, this.shadow);
            }
        } else {
            if (this.onMessage) {
                this.onMessage(topic, payload, this.shadow);
            }
        }
    }

}

module.exports = DeviceManager;