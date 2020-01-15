import { client as WebSocketClient, connection as Connection, IMessage } from 'websocket';
import { EventEmitter } from 'events';
import { logger as log } from './logger';

/**
 * Harmony Hub API uses the local websocket api of the hub
 */
class HarmonyHub extends EventEmitter {

    private hubPort = 8088;
    private wsClient: WebSocketClient = null;
    private wsSocket: Connection = null;
    private nextMsgId = 1;
    private config: any;

    /**
     * Create a new hub
     * 
     * @param hubHost Host or IP of the hub
     * @param hubRemoteId Remote id of the hub
     * @param autoloadConfig True if the config must be loaded at the connection
     */
    constructor(
        private hubHost: string,
        private hubRemoteId: string,
        private autoloadConfig: boolean = true
    ) {
        super();
    }

    /**
     * Connect to the hub
     * 
     * @returns The configuration if autoloadConfig is true
     */
    public connect(): Promise<any> {
        return new Promise((resolve, reject) => {
            let hubUrl = `ws://${this.hubHost}:${this.hubPort}/?domain=svcs.myharmony.com&hubId=${this.hubRemoteId}`;

            this.wsClient = new WebSocketClient();

            this.wsClient.on('connectFailed', (error) => {
                log.error('Connection failed to the websocket: %s', error);
                reject(error);
            });

            this.wsClient.on('connect', (wsSocket) => {
                this.wsSocket = wsSocket;

                wsSocket.on('error', err => this.onWsError(err));
                wsSocket.on('close', (code, desc) => this.onWsClose(code, desc));
                wsSocket.on('message', message => this.onWsMessage(message));

                if (this.autoloadConfig) {
                    // Load the configuration a first time
                    this.loadConfig()
                        .then((config) => {
                            this.emit('connect', config);
                            resolve(config);
                        }).catch(reject);
                } else {
                    this.emit('connect');
                    resolve();
                }

            });

            // Do the connection to the websocket
            this.wsClient.connect(hubUrl);
        });
    }

    /**
     * Disconnect from the hub
     */
    public disconnect(): void {
        log.info('Closing the connection');
        this.wsClient.abort();
        this.wsSocket.close();
    }

    /**
     * Send a command to a device
     * 
     * @param command The command
     * @param deviceId The id of the target device
     * @param status The type of command (press, hold, release)
     */
    public sendCommand(command: string, deviceId: string, status: string = 'press'): void {
        this.sendRequest('vnd.logitech.harmony/vnd.logitech.harmony.engine?holdAction', {
            status: status,
            verb: 'render',
            timestamp: new Date().getTime(),
            action: JSON.stringify({
                command: command,
                type: 'IRCommand',
                deviceId: deviceId
            })
        });
    }

    /**
     * Send a command and hold it a specifig duration
     * 
     * @param command The command
     * @param deviceId The id of the target device
     * @param duration TH duration to hold the command
     */
    public holdCommand(command: string, deviceId: string, duration: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sendCommand(command, deviceId, 'press');
            let intervalId = setInterval(() => {
                this.sendCommand(command, deviceId, 'hold');
            }, 50);
            setTimeout(() => {
                clearInterval(intervalId);
                this.sendCommand(command, deviceId, 'release');
                resolve();
            }, duration);
        });
    }

    /**
     * Start an activity
     * 
     * @param activityId The ID of the activity
     */
    public startActivity(activityId: string): void {
        this.sendRequest('vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity', {
            timestamp: new Date().getTime(),
            activityId: activityId
        });
    }

    /**
     * Load and store the current configuration of the hub
     * 
     * @returns The configuration
     */
    public async loadConfig(): Promise<any> {
        return this.sendRequestAndWaitResponse('vnd.logitech.harmony/vnd.logitech.harmony.engine?config')
            .then(message => this.config = message.data);
    }

    /**
     * Get the current configuration of the hub
     * 
     * @returns Promise for the response
     * @returns The configuration
     */
    public async getConfig(): Promise<any> {
        return this.config;
    }

    /**
     * Get the list of activites
     * 
     * @returns The device list
     */
    public async getDevices(): Promise<Array<any>> {
        return this.config.device;
    }

    /**
     * Get the list of activites
     * 
     * @returns The list of activities
     */
    public async getActivities(): Promise<Array<any>> {
        return this.config.activity;
    }

    /**
     * Get the list of commands of a device
     * 
     * @returns Tist of commands
     */
    public async getCommands(deviceId: string): Promise<Array<any>> {
        let config = await this.getConfig();
        let device = config.device
            .filter((device: any) => device.id === deviceId)[0];

        if (!device) {
            throw new Error(`Device '${deviceId}' not found`);
        }

        return device.controlGroup
            .reduce((acc: any, arr: any) => acc.concat(arr.function), []);
    }

    /**
     * Send a raw request to the hub
     * 
     * @param command The command. Ex: vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity
     * @param params The parameters of the command
     * @returns The id of the message
     */
    public sendRequest(command: string, params?: any): string {

        if (params === undefined) {
            params = {
                verb: 'get',
                format: 'json'
            };
        }

        const messageId = this.getNewMessageId();
        const payload = {
            hubId: this.hubRemoteId,
            timeout: 30,
            hbus: {
                cmd: command,
                id: messageId,
                params: params
            }
        }

        const requetData = JSON.stringify(payload);
        log.debug('Send request: %s', requetData);
        this.wsSocket.sendUTF(requetData);
        return messageId;
    }

    /**
     * Send a request to the hub and wait for the response
     * 
     * @param command The command
     * @param params The command parameters
     * @param timeout Time for waiting the response in ms
     * @returns A promise for the response
     */
    public sendRequestAndWaitResponse(command: string, params?: any, timeout?: number): Promise<any> {
        const messageId = this.sendRequest(command, params);
        return this.waitResponse(messageId, timeout);
    }

    /**
     * Get the current started activity
     * 
     * @returns A promise with the current activity id
     */
    public async getCurrentActivity(): Promise<number> {
        return this.sendRequestAndWaitResponse('vnd.logitech.harmony/vnd.logitech.harmony.engine?getCurrentActivity')
            .then(message => message.data.result);
    }

    /**
     * Ping the hub
     * 
     * @returns A promise with the current activity id
     */
    public async ping(): Promise<any> {
        return this.sendRequestAndWaitResponse('vnd.logitech.connect/vnd.logitech.pingvnd.logitech.ping')
            .then(message => message.data);
    }

    /**
     * Wait for a response with a specific id
     * 
     * @param messageId The message id
     * @param timeout Time for waiting the response in ms
     * @returns A promise with the response or an error if timeout occured
     */
    private async waitResponse(messageId: string, timeout: number = 30000): Promise<any> {
        return new Promise((resolve, reject) => {

            let timeoutId: NodeJS.Timeout;
            if (timeout) {
                timeoutId = setTimeout(() => {
                    log.debug(`No response for the message id ${messageId} after ${timeout}ms`);
                    this.removeListener('message', handleMessage);
                    reject(new Error('timeout'));
                }, timeout);
            }

            const handleMessage = (message: any) => {
                if (message.id === messageId) {
                    clearTimeout(timeoutId);
                    this.removeListener('message', handleMessage);
                    resolve(message);
                }
            };

            this.addListener('message', handleMessage);
        });
    }

    /**
     * Triggered when on error occure
     * 
     * @param error The error
     */
    private onWsError(error: Error): void {
        log.error('Error: ', error);
        this.emit('error', error);
    }

    /**
     * Triggered when the connection is closed
     * 
     * @param code Closing code
     * @param desc Description
     */
    private onWsClose(code: number, desc: string): void {
        log.info('Websocket connection closed');
        this.emit('close', { code, desc });
    }

    /**
     * Triggered when a message is received
     * 
     * @param message The message data
     */
    private onWsMessage(message: IMessage): void {
        log.debug('Receive data: %s', message.utf8Data);
        this.emit('message', JSON.parse(message.utf8Data));
    }

    /**
     * Generate a new message id
     */
    private getNewMessageId(): string {
        return this.nextMsgId++ + '';;
    }

}

export { HarmonyHub };
