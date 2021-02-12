"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpServer = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const events_1 = require("events");
const http_1 = tslib_1.__importDefault(require("http"));
const https_1 = tslib_1.__importDefault(require("https"));
const os_1 = tslib_1.__importDefault(require("os"));
const stoppable_1 = tslib_1.__importDefault(require("stoppable"));
/**
 * HTTP / HTTPS server used by LoopBack's RestServer
 */
class HttpServer {
    /**
     * @param requestListener
     * @param serverOptions
     */
    constructor(requestListener, serverOptions) {
        var _a;
        this._listening = false;
        this.requestListener = requestListener;
        this.serverOptions = Object.assign({ port: 0, host: undefined }, serverOptions);
        if (this.serverOptions.path) {
            const ipcPath = this.serverOptions.path;
            checkNamedPipe(ipcPath);
            // Remove `port` so that `path` is honored
            delete this.serverOptions.port;
        }
        this._protocol = serverOptions ? (_a = serverOptions.protocol) !== null && _a !== void 0 ? _a : 'http' : 'http';
        if (this._protocol === 'https') {
            this.server = https_1.default.createServer(this.serverOptions, this.requestListener);
        }
        else {
            this.server = http_1.default.createServer(this.requestListener);
        }
        // Set up graceful stop for http server
        if (typeof this.serverOptions.gracePeriodForClose === 'number') {
            this._stoppable = stoppable_1.default(this.server, this.serverOptions.gracePeriodForClose);
        }
    }
    /**
     * Starts the HTTP / HTTPS server
     */
    async start() {
        this.server.listen(this.serverOptions);
        await events_1.once(this.server, 'listening');
        this._listening = true;
        const address = this.server.address();
        assert_1.default(address != null);
        this._address = address;
    }
    /**
     * Stops the HTTP / HTTPS server
     */
    async stop() {
        if (!this._listening)
            return;
        if (this._stoppable != null) {
            this._stoppable.stop();
        }
        else {
            this.server.close();
        }
        await events_1.once(this.server, 'close');
        this._listening = false;
    }
    /**
     * Protocol of the HTTP / HTTPS server
     */
    get protocol() {
        return this._protocol;
    }
    /**
     * Port number of the HTTP / HTTPS server
     */
    get port() {
        if (typeof this._address === 'string')
            return 0;
        return (this._address && this._address.port) || this.serverOptions.port;
    }
    /**
     * Host of the HTTP / HTTPS server
     */
    get host() {
        if (typeof this._address === 'string')
            return undefined;
        return (this._address && this._address.address) || this.serverOptions.host;
    }
    /**
     * URL of the HTTP / HTTPS server
     */
    get url() {
        if (typeof this._address === 'string') {
            /* istanbul ignore if */
            if (isWin32()) {
                return this._address;
            }
            const basePath = encodeURIComponent(this._address);
            return `${this.protocol}+unix://${basePath}`;
        }
        let host = this.host;
        if (this._address.family === 'IPv6') {
            if (host === '::')
                host = '::1';
            host = `[${host}]`;
        }
        else if (host === '0.0.0.0') {
            host = '127.0.0.1';
        }
        return `${this._protocol}://${host}:${this.port}`;
    }
    /**
     * State of the HTTP / HTTPS server
     */
    get listening() {
        return this._listening;
    }
    /**
     * Address of the HTTP / HTTPS server
     */
    get address() {
        return this._listening ? this._address : undefined;
    }
}
exports.HttpServer = HttpServer;
/**
 * Makes sure `path` conform to named pipe naming requirement on Windows
 *
 * See https://nodejs.org/api/net.html#net_identifying_paths_for_ipc_connections
 *
 * @param ipcPath - Named pipe path
 */
function checkNamedPipe(ipcPath) {
    /* istanbul ignore if */
    if (isWin32()) {
        const pipes = ['\\\\?\\pipe\\', '\\\\.\\pipe\\'];
        assert_1.default(pipes.some(p => ipcPath.startsWith(p)), `Named pipe ${ipcPath} does NOT start with + ${pipes.join(' or ')}`);
    }
}
/**
 * Check if it's Windows OS
 */
function isWin32() {
    return os_1.default.platform() === 'win32';
}
//# sourceMappingURL=http-server.js.map