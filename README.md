# Harmony Hub API (with websocket)

This module  tend to replace the old XMPP API which was removed with the firemware 4.15.206 ([see more here](https://community.logitech.com/s/question/0D55A00008D4bZ4SAJ/harmony-hub-firmware-update-fixes-vulnerabilities)).

It uses the local websocket API of the hub.

## Get the remote id of the hub
```
Host: <hub_host>:8088
Origin: http://localhost.nebula.myharmony.com
Content-Type: application/json
Accept-Charset: utf-8

{
    "id ": 1,
    "cmd": "connect.discoveryinfo?get",
    "params": {}
}
```

## Get the configuration of the hub
```json
{
    "hubId"  : "xXxXxXx",
    "timeout": 30,
    "hbus"   : {
        "cmd": "vnd.logitech.harmony/vnd.logitech.harmony.engine?config",
        "id" : "xXxXxXx",
        "params": {
            "verb": "get",
            "format": "json"
        }
    }
}
```

## Send a remote press
```json
{
    "hubId"  : "xXxXxXx",
    "timeout": 30,
    "hbus"   : {
        "cmd": "vnd.logitech.harmony/vnd.logitech.harmony.engine?holdAction",
        "id" : "xXxXxXx",
        "params": {
            "command": "Mute",
            "type": "IRCommand", 
            "deviceId": "xXxXxX" 
        }
    }
}
```


## Some available commands

- vnd.logitech.connect/vnd.logitech.pingvnd.logitech.ping

- vnd.logitech.harmony/vnd.logitech.harmony.engine?getCurrentActivity

- vnd.logitech.harmony/vnd.logitech.harmony.engine?holdAction
    - params: { "command": "Mute", "type": "IRCommand", "deviceId": "53161273" }
- vnd.logitech.harmony/vnd.logitech.harmony.engine?config

- vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity
    - params: { "activityId": "xxxxx"}