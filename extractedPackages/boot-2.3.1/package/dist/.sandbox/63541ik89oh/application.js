"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooterApp = void 0;
const repository_1 = require("@loopback/repository");
const rest_1 = require("@loopback/rest");
const service_proxy_1 = require("@loopback/service-proxy");
const __1 = require("../..");
class BooterApp extends __1.BootMixin(service_proxy_1.ServiceMixin(repository_1.RepositoryMixin(rest_1.RestApplication))) {
    constructor(options) {
        super(options);
        this.projectRoot = __dirname;
    }
}
exports.BooterApp = BooterApp;
//# sourceMappingURL=application.js.map
//# sourceMappingURL=/Users/rfeng/Projects/loopback4/loopback-next/packages/boot/dist/__tests__/fixtures/application.js.map