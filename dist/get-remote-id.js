#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var constants_1 = require("constants");
var host = process.argv[2];
if (!host) {
    console.log('Usage: harmonyhub-remote-id <hub_host_or_ip>\n');
    console.error('Please provide valid host or ip of the hub as the first argument');
    process.exit(constants_1.EINVAL);
}
requestHub(host)
    .then(function (data) {
    console.log();
    console.log('Found Logitech Harmony Hub');
    console.log('---------------------------');
    console.log(' - Name:', data.friendlyName);
    console.log(' - Remote id:', data.remoteId);
    console.log(' - Firmware:', data.current_fw_version);
    console.log();
})
    .catch(function (error) {
    console.error('Request to the hub failed:', error.message);
    console.error('The host/ip may be incorrect or the hub is not power up\n');
    console.error(error);
});
/**
 * Get informations of the hub
 *
 * @param host The host or ip of the hub
 * @returns A json object containing informations of the hub
 */
function requestHub(host) {
    return new Promise(function (resolve, reject) {
        var body = JSON.stringify({
            "id ": 1,
            "cmd": "connect.discoveryinfo?get",
            "params": {}
        });
        var options = {
            method: 'POST',
            host: host,
            port: 8088,
            path: '/',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Origin': 'http://localhost.nebula.myharmony.com',
                'Accept-Charset': 'utf-8'
            }
        };
        var req = http.request(options, function (res) {
            var chunks = [];
            res.on('data', function (chunk) { return chunks.push(chunk); });
            res.on('end', function () {
                var response = Buffer.concat(chunks).toString();
                var data = JSON.parse(response).data;
                resolve(data);
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
