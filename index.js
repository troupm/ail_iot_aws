const DeviceManager = require("./deviceManager");
const LedManager = require("./ledManager");

const thingName = 'AIL_IoT_RPi_01';
const thingHost = 'a3knx5ouu01ymf-ats.iot.us-east-1.amazonaws.com';


const led12 = new LedManager(12);

function handleDelta(thingName, payload, shadow) {
    console.log("** handleDelta Invoked **");
    console.log("delta", payload, shadow);
    if(payload.state && payload.state.light === 'on')
    {
        console.log("DELTA: Swithing LED on...");
        led12.setOn();
        // update shadow
        shadow.update(thingName, {
            state: {
                reported: {
                    light: 'on'
                }
                // ,
                // desired: {
                //     light: 'on'
                // }
            }
        });
        console.log("DELTA: Thing Shadow Updated");
        console.log(shadow);
    } 
    else if (payload.state && payload.state.light == 'off')
    {
        console.log("DELTA: Swithing LED off...");
        led12.setOff();
        shadow.update(thingName, {
            state: {
                reported: {
                    light: 'off'
                }
                // ,
                // desired: {
                //     light: 'off'
                // }
            }
        });
        console.log("DELTA: Thing Shadow Updated");
        console.log(shadow);
    }
}

function handleMesasage(topic, payload, shadow) {
    console.log("message", topic, payload, shadow);
    if(topic == 'LED')
    {
        try{
        if(payload.light == 'on')
        {
            console.log(`MESSAGE ${topic}: Switching LED on...`);
            led12.setOn();
            // update shadow
            shadow.update(shadow.clientId, {
                state: {
                reported: {
                    light: 'on'
                },
                desired: {
                    light: 'on'
                }
                }
            });
            console.log(`MESSAGE ${topic}: Thing Shadow Updated`);
            console.log(shadow);
        } 
        else 
        {
            console.log(`MESSAGE ${topic}: Switching LED off...`);
            led12.setOff();
            shadow.update(shadow.clientId, {
                state: {
                reported: {
                    light: 'off'
                },
                desired: {
                    light: 'off'
                }
                }
            });
            console.log(`MESSAGE ${topic}: Thing Shadow Updated`);
            console.log(shadow);
        }
    }
    catch(err)
    {
        console.error(err);
    }
    }
}

new DeviceManager({clientId: thingName, host: thingHost}, ["LED"], handleMesasage, handleDelta);