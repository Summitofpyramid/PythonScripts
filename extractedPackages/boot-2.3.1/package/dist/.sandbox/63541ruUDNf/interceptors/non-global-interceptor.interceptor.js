"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyInterceptor = void 0;
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
/**
 * This class will be bound to the application as a global `Interceptor` during
 * `boot`
 */
let MyInterceptor = /** @class */ (() => {
    let MyInterceptor = class MyInterceptor {
        /*
        constructor() {}
        */
        /**
         * This method is used by LoopBack context to produce an interceptor function
         * for the binding.
         *
         * @returns An interceptor function
         */
        value() {
            return this.intercept.bind(this);
        }
        /**
         * The logic to intercept an invocation
         * @param invocationCtx - Invocation context
         * @param next - A function to invoke next interceptor or the target method
         */
        async intercept(invocationCtx, next) {
            // eslint-disable-next-line no-useless-catch
            try {
                // Add pre-invocation logic here
                const result = await next();
                // Add post-invocation logic here
                return result;
            }
            catch (err) {
                // Add error handling logic here
                throw err;
            }
        }
    };
    MyInterceptor = tslib_1.__decorate([
        context_1.bind({ tags: { namespace: 'interceptors', name: 'myInterceptor' } })
    ], MyInterceptor);
    return MyInterceptor;
})();
exports.MyInterceptor = MyInterceptor;
//# sourceMappingURL=non-global-interceptor.artifact.js.map
//# sourceMappingURL=/Users/rfeng/Projects/loopback4/loopback-next/packages/boot/dist/__tests__/fixtures/non-global-interceptor.artifact.js.map