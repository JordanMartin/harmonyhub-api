# Harmony Hub API (with local websocket)

This module  tend to replace the old XMPP API which was removed with the firemware 4.15.206 ([see more here](https://community.logitech.com/s/question/0D55A00008D4bZ4SAJ/harmony-hub-firmware-update-fixes-vulnerabilities)).

It uses the local websocket API of the hub.

> **UPDATE 23/12/2018**
> Logitech reversed his decision about the XMPP API. It makes available back the API but only for developers. [see more here](https://community.logitech.com/s/question/0D55A00008D4bZ4SAJ/harmony-hub-firmware-update-fixes-vulnerabilities). The local websocket API remains available.

# Usage

## Installation
```bash
$ npm install harmonyhub-api
```

## Get the remote id of the hub
Use the following helper:
```bash
$ node_modules/.bin/harmonyhub-remote-id <hub_ip_or_host>
```

Or juste make the following http post
```http
Host: <hub_host_or_ip>:8088
Origin: http://sl.dhg.myharmony.com
Content-Type: application/json
Accept-Charset: utf-8

{
    "id ": 1,
    "cmd": "setup.account?getProvisionInfo",
    "params": {}
}
```

**Example with curl**
```bash
$ curl -X POST <hub_host_or_ip>:8088 -H 'Accept: utf-8' -H 'Content-Type: application/json' -H 'Origin: http://sl.dhg.myharmony.com' -d '{"id":1,"cmd":"setup.account?getProvisionInfo","params":{}}'
```

## Connection and configuration
```javascript
const HarmonyHub = require('harmonyhub-api').HarmonyHub;
const HUB_HOST = 'X.X.X.X';
const HUB_REMOTE_ID = 'XXXXXXX';
const hub = new HarmonyHub(HUB_HOST, HUB_REMOTE_ID);

hub.connect()
    .then((config) => {
        console.log('Connected to the hub');

        console.log('\nActivities\n==========');
        config.activity.forEach(activity => {
            console.log(`${activity.label} (${activity.id})`);
        });

        console.log('\nDevices\n========');
        config.device.forEach(device => {
            console.log(`${device.label} (${device.id})`);
        });
    });
```

> :warning: Without activities, the connection is automatically closed after 60 seconds. You can periodically send a `ping` or catch the `close` event to open a new connection.

## Start an activity
The list of activityId can be found in the configuration object or with `hub.getActivities()`
```javascript
hub.startActivity('xxxxxx');
```

## Send command to a device
The list of commands and deviceId can be found in the configuration object of each devices. Browse the content of `hub.getDevices()`.

```javascript
// Simple press
hub.sendCommand('VolumeUp', '53161273');

// Hold a press for 1 second
hub.holdCommand('VolumeUp', '53161273', 1000);
```

## Close the connection
```javascript
hub.disconnect();
```

## Listen for events
The HarmonyHub object is a EventEmitter for some events : 

```javascript
hub.on('error|connect|close|message', callback)
````

- `error` : On error on the websocket
    - 1 argument: the error
- `connect` : On connection to the websocket of the hub
    - 1 argument: the config of the hub
- `close` : On the websocket connection close
    - 2 arguments: code and description
- `message` : On incoming message from the hub
    - 1 argument: The message data


## Log level
By default, the logger is set on 'warn'. You can override with the `LOG_LEVEL` environnement variable. eg:
```bash
$ LOG_LEVEL=debug node test.js
```

## API documentation
The full API documentation is available in the `docs/` folder.
