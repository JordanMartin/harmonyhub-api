# Harmony Hub API (with websocket)

This module  tend to replace the old XMPP API which was removed with the firemware 4.15.206 ([see more here](https://community.logitech.com/s/question/0D55A00008D4bZ4SAJ/harmony-hub-firmware-update-fixes-vulnerabilities)).

It uses the local websocket API of the hub.

# Usage

## Installation
```bash
$ npm install harmonyhub-api
```

## Connexion 
```javascript
const hub = new HarmonyHub('X.X.X.X', '12345678');
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

## Full documentation
The full documentation of the API is available in the `docs/` folder.

## Send commands
```javascript
// Simple press
hub.sendCommand('VolumeUp', '53161273');

// Hold a press for 1 second
hub.holdCommand('VolumeUp', '53161273', 1000);
```

## Listen for events
The HarmonyHub object is a EventEmitter for some events : 

```javascript
hub.on('error|connect|close|message|', callback)
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
By default, the logger is set on 'warn'. You can be overrided with the `LOG_LEVEL` environnement variable. eg:
```bash
$ LOG_LEVEL=debug node test.js
```
