"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const http_handler_1 = require("../http-handler");
const keys_1 = require("../keys");
let FindRouteProvider = class FindRouteProvider {
    constructor(context, handler) {
        this.context = context;
        this.handler = handler;
    }
    value() {
        return request => this.action(request);
    }
    action(request) {
        const found = this.handler.findRoute(request);
        found.updateBindings(this.context);
        return found;
    }
};
FindRouteProvider = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(keys_1.RestBindings.Http.CONTEXT)),
    tslib_1.__param(1, context_1.inject(keys_1.RestBindings.HANDLER)),
    tslib_1.__metadata("design:paramtypes", [context_1.Context,
        http_handler_1.HttpHandler])
], FindRouteProvider);
exports.FindRouteProvider = FindRouteProvider;
//# sourceMappingURL=find-route.provider.js.map