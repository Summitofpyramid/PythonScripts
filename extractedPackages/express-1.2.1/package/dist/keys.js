"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MIDDLEWARE_GROUP = exports.MIDDLEWARE_INTERCEPTOR_NAMESPACE = exports.GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE = exports.MIDDLEWARE_NAMESPACE = exports.MiddlewareBindings = void 0;
const context_1 = require("@loopback/context");
var MiddlewareBindings;
(function (MiddlewareBindings) {
    /**
     * Binding key for setting and injecting the http request context
     */
    MiddlewareBindings.CONTEXT = context_1.BindingKey.create('middleware.http.context');
})(MiddlewareBindings = exports.MiddlewareBindings || (exports.MiddlewareBindings = {}));
/**
 * Default namespaces for middleware
 */
exports.MIDDLEWARE_NAMESPACE = 'middleware';
/**
 * Default namespace for Express middleware based global interceptors
 */
exports.GLOBAL_MIDDLEWARE_INTERCEPTOR_NAMESPACE = 'globalInterceptors.middleware';
/**
 * Default namespace for Express middleware based local interceptors
 */
exports.MIDDLEWARE_INTERCEPTOR_NAMESPACE = 'globalInterceptors.middleware';
/**
 * Default order group name for Express middleware based global interceptors
 */
exports.DEFAULT_MIDDLEWARE_GROUP = 'middleware';
//# sourceMappingURL=keys.js.map