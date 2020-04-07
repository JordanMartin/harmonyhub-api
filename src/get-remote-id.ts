#!/usr/bin/env node

import * as http from 'http';
import { EINVAL } from 'constants';
let host = process.argv[2];

if (!host) {
    console.log('Usage: harmonyhub-remote-id <hub_host_or_ip>\n');
    console.error('Please provide valid host or ip of the hub as the first argument');
    process.exit(EINVAL);
}

requestHub(host)
    .then((data) => {
        console.log();
        console.log('Found Logitech Harmony Hub');
        console.log('---------------------------');
        console.log(' - Username    :', data.username);
        console.log(' - Remote id   :', data.activeRemoteId);
        console.log();
    })
    .catch((error) => {
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
function requestHub(host: string): Promise<any> {
    return new Promise((resolve, reject) => {

        const body: any = JSON.stringify({
            "id ": 1,
            "cmd": "setup.account?getProvisionInfo",
            "params": {}
        });

        const options = {
            method: 'POST',
            host: host,
            port: 8088,
            path: '/',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'Origin': 'http://sl.dhg.myharmony.com',
                'Accept-Charset': 'utf-8'
            }
        };

        const req = http.request(options, (res) => {
            const chunks: any[] = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const response: string = Buffer.concat(chunks).toString();

                if (res.statusCode === 200) {
                    const data: any = JSON.parse(response).data;
                    resolve(data);
                } else {
                    reject({
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        body: response
                    });
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}