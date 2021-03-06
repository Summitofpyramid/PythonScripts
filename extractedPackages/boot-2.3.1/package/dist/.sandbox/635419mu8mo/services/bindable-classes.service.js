"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotBindableDateProvider = exports.NotBindableGreetingService = exports.DateProvider = exports.BindableGreetingService = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
let BindableGreetingService = /** @class */ (() => {
    let BindableGreetingService = class BindableGreetingService {
        greet(whom = 'world') {
            return Promise.resolve(`Hello ${whom}`);
        }
    };
    BindableGreetingService = tslib_1.__decorate([
        core_1.bind({
            tags: { serviceType: 'local' },
            scope: core_1.BindingScope.SINGLETON,
        })
    ], BindableGreetingService);
    return BindableGreetingService;
})();
exports.BindableGreetingService = BindableGreetingService;
let DateProvider = /** @class */ (() => {
    let DateProvider = class DateProvider {
        value() {
            return Promise.resolve(new Date());
        }
    };
    DateProvider = tslib_1.__decorate([
        core_1.bind({ tags: { serviceType: 'local', name: 'CurrentDate' } })
    ], DateProvider);
    return DateProvider;
})();
exports.DateProvider = DateProvider;
class NotBindableGreetingService {
    greet(whom = 'world') {
        return Promise.resolve(`Hello ${whom}`);
    }
}
exports.NotBindableGreetingService = NotBindableGreetingService;
class NotBindableDateProvider {
    value() {
        return Promise.resolve(new Date());
    }
}
exports.NotBindableDateProvider = NotBindableDateProvider;
//# sourceMappingURL=bindable-classes.artifact.js.map
//# sourceMappingURL=/Users/rfeng/Projects/loopback4/loopback-next/packages/boot/dist/__tests__/fixtures/bindable-classes.artifact.js.map