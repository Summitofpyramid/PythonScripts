"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const keys_1 = require("../keys");
let InvokeMethodProvider = class InvokeMethodProvider {
    constructor(context) {
        this.context = context;
    }
    value() {
        return (route, args) => this.action(route, args);
    }
    action(route, args) {
        return route.invokeHandler(this.context, args);
    }
};
InvokeMethodProvider = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(keys_1.RestBindings.Http.CONTEXT)),
    tslib_1.__metadata("design:paramtypes", [context_1.Context])
], InvokeMethodProvider);
exports.InvokeMethodProvider = InvokeMethodProvider;
//# sourceMappingURL=invoke-method.provider.js.map