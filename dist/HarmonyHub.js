"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var websocket_1 = require("websocket");
var events_1 = require("events");
var logger_1 = require("./logger");
/**
 * Harmony Hub API uses the local websocket api of the hub
 */
var HarmonyHub = /** @class */ (function (_super) {
    __extends(HarmonyHub, _super);
    /**
     * Create a new hub
     *
     * @param hubHost Host or IP of the hub
     * @param hubRemoteId Remote id of the hub
     * @param autoloadConfig True if the config must be loaded at the connection
     */
    function HarmonyHub(hubHost, hubRemoteId, autoloadConfig) {
        if (autoloadConfig === void 0) { autoloadConfig = true; }
        var _this = _super.call(this) || this;
        _this.hubHost = hubHost;
        _this.hubRemoteId = hubRemoteId;
        _this.autoloadConfig = autoloadConfig;
        _this.hubPort = 8088;
        _this.wsClient = null;
        _this.wsSocket = null;
        _this.nextMsgId = 1;
        return _this;
    }
    /**
     * Connect to the hub
     *
     * @returns The configuration if autoloadConfig is true
     */
    HarmonyHub.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var hubUrl = "ws://" + _this.hubHost + ":" + _this.hubPort + "/?domain=svcs.myharmony.com&hubId=" + _this.hubRemoteId;
            _this.wsClient = new websocket_1.client();
            _this.wsClient.on('connectFailed', function (error) {
                logger_1.logger.error('Connection failed to the websocket: %s', error);
                reject(error);
            });
            _this.wsClient.on('connect', function (wsSocket) {
                _this.wsSocket = wsSocket;
                wsSocket.on('error', function (err) { return _this.onWsError(err); });
                wsSocket.on('close', function (code, desc) { return _this.onWsClose(code, desc); });
                wsSocket.on('message', function (message) { return _this.onWsMessage(message); });
                if (_this.autoloadConfig) {
                    // Load the configuration a first time
                    _this.loadConfig()
                        .then(function (config) {
                        _this.emit('connect', config);
                        resolve(config);
                    }).catch(reject);
                }
                else {
                    _this.emit('connect');
                    resolve();
                }
            });
            // Do the connection to the websocket
            _this.wsClient.connect(hubUrl);
        });
    };
    /**
     * Disconnect from the hub
     */
    HarmonyHub.prototype.disconnect = function () {
        logger_1.logger.info('Closing the connection');
        this.wsClient.abort();
        this.wsSocket.close();
    };
    /**
     * Send a command to a device
     *
     * @param command The command
     * @param deviceId The id of the target device
     * @param status The type of command (press, hold, release)
     */
    HarmonyHub.prototype.sendCommand = function (command, deviceId, status) {
        if (status === void 0) { status = 'press'; }
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
    };
    /**
     * Send a command and hold it a specifig duration
     *
     * @param command The command
     * @param deviceId The id of the target device
     * @param duration TH duration to hold the command
     */
    HarmonyHub.prototype.holdCommand = function (command, deviceId, duration) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendCommand(command, deviceId, 'press');
            var intervalId = setInterval(function () {
                _this.sendCommand(command, deviceId, 'hold');
            }, 50);
            setTimeout(function () {
                clearInterval(intervalId);
                _this.sendCommand(command, deviceId, 'release');
                resolve();
            }, duration);
        });
    };
    /**
     * Start an activity
     *
     * @param activityId The ID of the activity
     */
    HarmonyHub.prototype.startActivity = function (activityId) {
        this.sendRequest('vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity', {
            timestamp: new Date().getTime(),
            activityId: activityId
        });
    };
    /**
     * Load and store the current configuration of the hub
     *
     * @returns The configuration
     */
    HarmonyHub.prototype.loadConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAndWaitResponse('vnd.logitech.harmony/vnd.logitech.harmony.engine?config')
                        .then(function (message) { return _this.config = message.data; })];
            });
        });
    };
    /**
     * Get the current configuration of the hub
     *
     * @returns Promise for the response
     * @returns The configuration
     */
    HarmonyHub.prototype.getConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.config];
            });
        });
    };
    /**
     * Get the list of activites
     *
     * @returns The device list
     */
    HarmonyHub.prototype.getDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.config.device];
            });
        });
    };
    /**
     * Get the list of activites
     *
     * @returns The list of activities
     */
    HarmonyHub.prototype.getActivities = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.config.activity];
            });
        });
    };
    /**
     * Get the list of commands of a device
     *
     * @returns Tist of commands
     */
    HarmonyHub.prototype.getCommands = function (deviceId) {
        return __awaiter(this, void 0, void 0, function () {
            var config, device;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getConfig()];
                    case 1:
                        config = _a.sent();
                        device = config.device
                            .filter(function (device) { return device.id === deviceId; })[0];
                        if (!device) {
                            throw new Error("Device '" + deviceId + "' not found");
                        }
                        return [2 /*return*/, device.controlGroup
                                .reduce(function (acc, arr) { return acc.concat(arr.function); }, [])];
                }
            });
        });
    };
    /**
     * Send a raw request to the hub
     *
     * @param command The command. Ex: vnd.logitech.harmony/vnd.logitech.harmony.engine?startactivity
     * @param params The parameters of the command
     * @returns The id of the message
     */
    HarmonyHub.prototype.sendRequest = function (command, params) {
        if (params === undefined) {
            params = {
                verb: 'get',
                format: 'json'
            };
        }
        var messageId = this.getNewMessageId();
        var payload = {
            hubId: this.hubRemoteId,
            timeout: 30,
            hbus: {
                cmd: command,
                id: messageId,
                params: params
            }
        };
        var requetData = JSON.stringify(payload);
        logger_1.logger.debug('Send request: %s', requetData);
        this.wsSocket.sendUTF(requetData);
        return messageId;
    };
    /**
     * Send a request to the hub and wait for the response
     *
     * @param command The command
     * @param params The command parameters
     * @param timeout Time for waiting the response in ms
     * @returns A promise for the response
     */
    HarmonyHub.prototype.sendRequestAndWaitResponse = function (command, params, timeout) {
        var messageId = this.sendRequest(command, params);
        return this.waitResponse(messageId, timeout);
    };
    /**
     * Get the current started activity
     *
     * @returns A promise with the current activity id
     */
    HarmonyHub.prototype.getCurrentActivity = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAndWaitResponse('vnd.logitech.harmony/vnd.logitech.harmony.engine?getCurrentActivity')
                        .then(function (message) { return message.data.result; })];
            });
        });
    };
    /**
     * Ping the hub
     *
     * @returns A promise with the current activity id
     */
    HarmonyHub.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendRequestAndWaitResponse('vnd.logitech.connect/vnd.logitech.pingvnd.logitech.ping')
                        .then(function (message) { return message.data; })];
            });
        });
    };
    /**
     * Wait for a response with a specific id
     *
     * @param messageId The message id
     * @param timeout Time for waiting the response in ms
     * @returns A promise with the response or an error if timeout occured
     */
    HarmonyHub.prototype.waitResponse = function (messageId, timeout) {
        if (timeout === void 0) { timeout = 30000; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timeoutId;
                        if (timeout) {
                            timeoutId = setTimeout(function () {
                                logger_1.logger.debug("No response for the message id " + messageId + " after " + timeout + "ms");
                                _this.removeListener('message', handleMessage);
                                reject(new Error('timeout'));
                            }, timeout);
                        }
                        var handleMessage = function (message) {
                            if (message.id === messageId) {
                                clearTimeout(timeoutId);
                                _this.removeListener('message', handleMessage);
                                resolve(message);
                            }
                        };
                        _this.addListener('message', handleMessage);
                    })];
            });
        });
    };
    /**
     * Triggered when on error occure
     *
     * @param error The error
     */
    HarmonyHub.prototype.onWsError = function (error) {
        logger_1.logger.error('Error: ', error);
        this.emit('error', error);
    };
    /**
     * Triggered when the connection is closed
     *
     * @param code Closing code
     * @param desc Description
     */
    HarmonyHub.prototype.onWsClose = function (code, desc) {
        logger_1.logger.info('Websocket connection closed');
        this.emit('close', { code: code, desc: desc });
    };
    /**
     * Triggered when a message is received
     *
     * @param message The message data
     */
    HarmonyHub.prototype.onWsMessage = function (message) {
        logger_1.logger.debug('Receive data: %s', message.utf8Data);
        this.emit('message', JSON.parse(message.utf8Data));
    };
    /**
     * Generate a new message id
     */
    HarmonyHub.prototype.getNewMessageId = function () {
        return this.nextMsgId++ + '';
        ;
    };
    return HarmonyHub;
}(events_1.EventEmitter));
exports.HarmonyHub = HarmonyHub;
