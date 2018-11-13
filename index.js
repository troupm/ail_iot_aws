const DeviceManager = require("./deviceManager");
const LedManager = require("./ledManager");

const thingName = 'AIL_IoT_RPi_01';
const thingHost = 'a3knx5ouu01ymf-ats.iot.us-east-1.amazonaws.com';


const led12 = new LedManager(12);

function handleDelta(payload, shadow) {
    console.log("delta", payload, shadow);
    if(payload.delta && payload.delta.light === 'on')
    {
        console.log("DELTA: Swithing LED on...");
        led12.setOn();
        // update shadow
        shadow.update(shadow.clientId, {
            state: {
            reported: {
                light: 'on'
            }
            }

        })
        console.log("DELTA: Thing Shadow Updated");
    } 
    else if (payload.delta && payload.delta.light == 'off')
    {
        console.log("DELTA: Swithing LED off...");
        led12.setOff();
        shadow.update(shadow.clientId, {
            state: {
            reported: {
                light: 'off'
            }
            }
        })
        console.log("DELTA: Thing Shadow Updated");
    }
}

function handleMesasage(topic, payload, shadow) {
    console.log("message", topic, payload, shadow);
    if(topic == 'LED')
    {
        if(payload.light == 'on')
        {
            console.log(`MESSAGE ${topic}: Switching LED on...`);
            led12.setOn();
            // update shadow
            shadow.update(shadow.clientId, {
                state: {
                reported: {
                    light: 'on'
                }
                }
            })
            console.log(`MESSAGE ${topic}: Thing Shadow Updated`);
        } 
        else 
        {
            console.log(`MESSAGE ${topic}: Switching LED off...`);
            led12.setOff();
            shadow.update(shadow.clientId, {
                state: {
                reported: {
                    light: 'off'
                }
                }
            });
            console.log(`MESSAGE ${topic}: Thing Shadow Updated`);
        }
    }
}

new DeviceManager({clientId: thingName, host: thingHost}, ["LED"], handleMesasage, handleDelta);