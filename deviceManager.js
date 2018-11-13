const AwsIot = require('aws-iot-device-sdk');
const deviceDefaults = require("./deviceDefaults");
const makeLogger = require("./makeLogger");
const { parsePayload } = require("./helpers");
const util = require('util');
var shadowState = null;

const events = {
    connect: "connect",
    message: "message",
    delta: "delta",
    close: "close",
    reconnect: "reconnect",
    offline: "offline",
    error: "error"
};
AwsIot.thingShadow

const awsDeltaPath = "$aws/things/<THING>/shadow/update/delta";
const getAwsDeltaPath = thing => awsDeltaPath.replace("<THING>", thing);

class DeviceManager {
    constructor(deviceModuleOptions, topicsToSubscribeTo = [], onMessage = null, onDelta = null) {
        this.onMessage = onMessage;
        this.onDelta = onDelta;
        this._topicsToSubscribeTo = topicsToSubscribeTo;
        this._subscribed = false;
        const opts = { ...deviceDefaults, ...deviceModuleOptions };
        this.device = new AwsIot.device(opts);
        this.clientId = opts.clientId;

        this.log = makeLogger(`Device ${this.clientId}`);

        opts.maximumReconnectTimeMs = 3000;
        this.shadow = new AwsIot.thingShadow(opts);
        this.log`resgistering thingShadow clientId = ${this.clientId}`;
        util.promisify(this.shadow.register)(this.clientId)
                .then(()=>{
                    /*
                    shadowState = this.shadow.get(this.clientId);
                    console.log(`thingShadow State clientId = ${this.clientId}:`);
                    console.log(shadowState);
                    */
                    console.log("Updating thingShadow State- light:on");
                    let thisDelta = {
                        state: {
                        reported: {
                            light: 'on'
                        }}};
                    //shadowState = {...shadowState,...thisDelta};
                    this.shadow.update(this.shadow.clientId, thisDelta)
                    /*
                    console.log(`New thingShadow State clientId = ${this.clientId}:`);
                    shadowState = this.shadow.get(this.clientId);
                    console.log(shadowState);
                    */
                }).catch((err)=>console.error(err));
        this.bindHandlers();
    }

    bindHandlers() {
        this._handleConnect = this._handleConnect.bind(this);
        this._handleMessage = this._handleMessage.bind(this);

        this.device.on(events.connect, this._handleConnect);
        this.device.on(events.message, this._handleMessage);

        this.device.on(events.close, () => this.log`CLOSE EVENT`);
        this.device.on(events.reconnect, () => this.log`RECONNECT EVENT`);
        this.device.on(events.offline, () => this.log`OFFLINE EVENT`);
        this.device.on(events.error, (err) => this.log`ERROR EVENT: ${err}`);
    }

    subscribe() {
        this.log`SUBSCRIBE METHOD`;
        if (!this._subscribed) {
            this.device.subscribe(this._topicsToSubscribeTo);
        }
    }

    _handleConnect() {
        this.log`CONNECT EVENT`;
        if (this.connected) {
            this.log`already connected`;
            return;
        }
        this.connected = true;
        this.log`connected`;
        this.log`subscribing to shadow update deltas`;
        this.deltaTopicPath = getAwsDeltaPath(this.clientId);
        this._topicsToSubscribeTo.push(this.deltaTopicPath);
        this.subscribe();
    }

    _handleMessage(topic, payload) {
        this.log`MESSAGE EVENT`;
        payload = parsePayload(payload);
        console.log("topic", topic);
        console.log("payload", payload);
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