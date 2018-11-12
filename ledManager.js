const gpio = require("pi-pins");
const makeLogger = require("./makeLogger");

let log;

class LedManager {
    constructor(pin) {
        this.pin = pin;
        this.led = gpio.connect(pin);
        this.led.mode("out");
        this.value = false;
        log = makeLogger(`LED Pin ${pin}`);
        log`initializing to off`;
        this._update();
    }

    set(value) {
        this.value = !!value;
        log`sending ${this.value ? "on" : "off"} signal`;
        this._update();
    }

    setOn() {
        log`sending on signal`;
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