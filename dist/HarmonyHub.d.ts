/// <reference types="node" />
import { EventEmitter } from 'events';
/**
 * Harmony Hub API uses the local websocket api of the hub
 */
declare class HarmonyHub extends EventEmitter {
    private hubHost;
    private hubRemoteId;
    private autoloadConfig;
    private hubPort;
    private wsClient;
    private wsSocket;
    private nextMsgId;
    private config;
    /**
     * Create a new hub
     *
     * @param hubHost Host or IP of the hub
     * @param hubRemoteId Remote id of the hub
     * @param autoloadConfig True if the config must be loaded at the connection
     */
    constructor(hubHost: string, hubRemoteId: string, autoloadConfig?: boolean);
    /**
     * Connect to the hub
     *
     * @returns The configuration if autoloadConfig is true
     */
    connect(): Promise<any>;
    /**
     * Disconnect from the hub
     */
    disconnect(): void;
    /**
     * Send a command to a device
     *
     * @param command The command
     * @param deviceId The id of the target device
     * @param status The type of command (press, hold, release)
     */
    sendCommand(command: string, deviceId: string, status?: string): void;
    /**
     * Send a command and hold it a specifig duration
     *
     * @param command The command
     * @param deviceId The id of the target device
     * @param duration TH duration to hold the command
     */
    holdCommand(command: string, deviceId: string, duration: number): Promise<void>;
    /**
     * Start an activity
     *
     * @param activityId The ID of the activity
     */
    startActivity(activityId: string): void;
    /**
     * Load and store the current configuration of the hub
     *
     * @returns The configuration
     */
    loadConfig(): Promise<any>;
    /**
     * Get the current configuration of the hub
     *
     * @returns Promise for the response
     * @returns The configuration
     */
    getConfig(): Promise<any>;
    /**
     * Get the list of activites
     *
     * @returns The device list
     */
    getDevices(): Promise<Array<any>>;
    /**
     * Get the list of activites
     *
     * @returns The list of activities
     */
    getActivities(): Promise<Array<any>>;
    /**
     * Get the list of commands of a device
     *
     * @returns Tist of commands
     */
    getCommands(deviceId: string): Promise<Array<any>>;
    /**
     * Send a raw request to the hub
     *
     * @param command The command. Ex: vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity
     * @param params The parameters of the command
     * @returns The id of the message
     */
    sendRequest(command: string, params?: any): string;
    /**
     * Send a request to the hub and wait for the response
     *
     * @param command The command
     * @param params The command parameters
     * @param timeout Time for waiting the response in ms
     * @returns A promise for the response
     */
    sendRequestAndWaitResponse(command: string, params?: any, timeout?: number): Promise<any>;
    /**
     * Get the current started activity
     *
     * @returns A promise with the current activity id
     */
    getCurrentActivity(): Promise<number>;
    /**
     * Ping the hub
     *
     * @returns A promise with the current activity id
     */
    ping(): Promise<any>;
    /**
     * Wait for a response with a specific id
     *
     * @param messageId The message id
     * @param timeout Time for waiting the response in ms
     * @returns A promise with the response or an error if timeout occured
     */
    private waitResponse;
    /**
     * Triggered when on error occure
     *
     * @param error The error
     */
    private onWsError;
    /**
     * Triggered when the connection is closed
     *
     * @param code Closing code
     * @param desc Description
     */
    private onWsClose;
    /**
     * Triggered when a message is received
     *
     * @param message The message data
     */
    private onWsMessage;
    /**
     * Generate a new message id
     */
    private getNewMessageId;
}
export { HarmonyHub };
