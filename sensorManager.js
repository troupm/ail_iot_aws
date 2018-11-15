const gpio = require("pi-pins");
const makeLogger = require("./makeLogger");
var lastValue = false;

let log;

class SensorManager {
    constructor(pin) {
        this.pin = pin;
        this.led = gpio.connect(pin);
        this.led.mode("in");
        this.value = false;
        log = makeLogger(`Sensor Pin ${pin}`);
        this._update();
    }

    set(value) {
        this.value = !!value;
        log`sending ${this.value ? "on" : "off"} signal`;
        this._update();
    }

    read() {
        log`reading from pin ${this.pin}`;
        this.lastValue = this.value;
        this.value = true;
        this._update();
    }

    setOff() {
        log`sending off signal`;
        this.value = false;
        this._update();
    }

    _update() {
        this.led.value(this.value);
    }
}

module.exports = LedManager;