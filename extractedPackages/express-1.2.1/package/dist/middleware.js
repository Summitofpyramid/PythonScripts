"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.toExpressMiddleware = exports.invokeExpressMiddleware = exports.invokeMiddleware = exports.createMiddlewareBinding = exports.registerMiddleware = exports.asMiddleware = exports.registerExpressMiddleware = exports.createMiddleware = exports.toMiddleware = void 0;
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const core_1 = require("@loopback/core");
const debug_1 = tslib_1.__importDefault(require("debug"));
const keys_1 = require("./keys");
const middleware_interceptor_1 = require("./middleware-interceptor");
const types_1 = require("./types");
const debug = debug_1.default('loopback:middleware');
/**
 * An adapter function to create a LoopBack middleware that invokes the list
 * of Express middleware handler functions in the order of their positions
 * @example
 * ```ts
 * toMiddleware(fn);
 * toMiddleware(fn1, fn2, fn3);
 * ```
 * @param firstHandler - An Express middleware handler
 * @param additionalHandlers A list of Express middleware handler functions
 * @returns A LoopBack middleware function that wraps the list of Express
 * middleware
 */
function toMiddleware(firstHandler, ...additionalHandlers) {
    if (additionalHandlers.length === 0)
        return middleware_interceptor_1.toInterceptor(firstHandler);
    const handlers = [firstHandler, ...additionalHandlers];
    const middlewareList = handlers.map(handler => middleware_interceptor_1.toInterceptor(handler));
    return (middlewareCtx, next) => {
        if (middlewareList.length === 1) {
            return middlewareList[0](middlewareCtx, next);
        }
        const middlewareChain = new types_1.MiddlewareChain(middlewareCtx, middlewareList);
        return middlewareChain.invokeInterceptors(next);
    };
}
exports.toMiddleware = toMiddleware;
/**
 * An adapter function to create a LoopBack middleware from Express middleware
 * factory function and configuration object.
 *
 * @param middlewareFactory - Express middleware factory function
 * @param middlewareConfig - Express middleware config
 *
 * @returns A LoopBack middleware function that wraps the Express middleware
 */
function createMiddleware(middlewareFactory, middlewareConfig) {
    return middleware_interceptor_1.createInterceptor(middlewareFactory, middlewareConfig);
}
exports.createMiddleware = createMiddleware;
/**
 * Bind a Express middleware to the given context
 *
 * @param ctx - Context object
 * @param middlewareFactory - Middleware module name or factory function
 * @param middlewareConfig - Middleware config
 * @param options - Options for registration
 *
 * @typeParam CFG - Configuration type
 */
function registerExpressMiddleware(ctx, middlewareFactory, middlewareConfig, options = {}) {
    var _a;
    options = { injectConfiguration: true, ...options };
    options.chain = (_a = options.chain) !== null && _a !== void 0 ? _a : types_1.DEFAULT_MIDDLEWARE_CHAIN;
    if (!options.injectConfiguration) {
        const middleware = createMiddleware(middlewareFactory, middlewareConfig);
        return registerMiddleware(ctx, middleware, options);
    }
    const providerClass = middleware_interceptor_1.defineInterceptorProvider(middlewareFactory, middlewareConfig, options);
    return registerMiddleware(ctx, providerClass, options);
}
exports.registerExpressMiddleware = registerExpressMiddleware;
/**
 * Template function for middleware bindings
 * @param options - Options to configure the binding
 */
function asMiddleware(options = {}) {
    return function middlewareBindingTemplate(binding) {
        var _a, _b;
        binding
            .apply(core_1.extensionFor((_a = options.chain) !== null && _a !== void 0 ? _a : types_1.DEFAULT_MIDDLEWARE_CHAIN))
            .tag({ group: (_b = options.group) !== null && _b !== void 0 ? _b : keys_1.DEFAULT_MIDDLEWARE_GROUP });
    };
}
exports.asMiddleware = asMiddleware;
/**
 * Bind the middleware function or provider class to the context
 * @param ctx - Context object
 * @param middleware - Middleware function or provider class
 * @param options - Middleware binding options
 */
function registerMiddleware(ctx, middleware, options) {
    var _a;
    if (context_1.isProviderClass(middleware)) {
        const binding = createMiddlewareBinding(middleware, options);
        ctx.add(binding);
        return binding;
    }
    const key = (_a = options.key) !== null && _a !== void 0 ? _a : context_1.BindingKey.generate(keys_1.MIDDLEWARE_NAMESPACE);
    return ctx
        .bind(key)
        .to(middleware)
        .apply(asMiddleware(options));
}
exports.registerMiddleware = registerMiddleware;
/**
 * Create a binding for the middleware provider class
 *
 * @param middlewareProviderClass - Middleware provider class
 * @param options - Options to create middleware binding
 *
 */
function createMiddlewareBinding(middlewareProviderClass, options = {}) {
    var _a;
    options.chain = (_a = options.chain) !== null && _a !== void 0 ? _a : types_1.DEFAULT_MIDDLEWARE_CHAIN;
    const binding = context_1.createBindingFromClass(middlewareProviderClass, {
        defaultScope: context_1.BindingScope.TRANSIENT,
        namespace: keys_1.MIDDLEWARE_NAMESPACE,
        key: options.key,
    }).apply(asMiddleware(options));
    return binding;
}
exports.createMiddlewareBinding = createMiddlewareBinding;
/**
 * Discover and invoke registered middleware in a chain for the given extension
 * point.
 *
 * @param middlewareCtx - Middleware context
 * @param options - Options to invoke the middleware chain
 */
function invokeMiddleware(middlewareCtx, options) {
    debug('Invoke middleware chain for %s %s with options', middlewareCtx.request.method, middlewareCtx.request.originalUrl, options);
    const { chain = types_1.DEFAULT_MIDDLEWARE_CHAIN, orderedGroups } = options !== null && options !== void 0 ? options : {};
    // Find extensions for the given extension point binding
    const filter = core_1.extensionFilter(chain);
    if (debug.enabled) {
        debug('Middleware for extension point "%s":', chain, middlewareCtx.find(filter).map(b => b.key));
    }
    const _middlewareChain = new types_1.MiddlewareChain(middlewareCtx, filter, context_1.compareBindingsByTag('group', orderedGroups));
    return _middlewareChain.invokeInterceptors(options === null || options === void 0 ? void 0 : options.next);
}
exports.invokeMiddleware = invokeMiddleware;
/**
 * Invoke a list of Express middleware handler functions
 *
 * @example
 * ```ts
 * import cors from 'cors';
 * import helmet from 'helmet';
 * import morgan from 'morgan';
 * import {MiddlewareContext, invokeExpressMiddleware} from '@loopback/express';
 *
 * // ... Either an instance of `MiddlewareContext` is passed in or a new one
 * // can be instantiated from Express request and response objects
 *
 * const middlewareCtx = new MiddlewareContext(request, response);
 * const finished = await invokeExpressMiddleware(
 *   middlewareCtx,
 *   cors(),
 *   helmet(),
 *   morgan('combined'));
 *
 * if (finished) {
 *   // Http response is sent by one of the middleware
 * } else {
 *   // Http response is yet to be produced
 * }
 * ```
 * @param middlewareCtx - Middleware context
 * @param handlers - A list of Express middleware handler functions
 */
function invokeExpressMiddleware(middlewareCtx, ...handlers) {
    if (handlers.length === 0) {
        throw new Error('No Express middleware handler function is provided.');
    }
    const middleware = toMiddleware(handlers[0], ...handlers.slice(1));
    debug('Invoke Express middleware for %s %s', middlewareCtx.request.method, middlewareCtx.request.originalUrl);
    // Invoke the middleware with a no-op next()
    const result = middleware(middlewareCtx, () => undefined);
    // Check if the response is finished
    return context_1.transformValueOrPromise(result, val => val === middlewareCtx.response);
}
exports.invokeExpressMiddleware = invokeExpressMiddleware;
/**
 * An adapter function to create an Express middleware handler to discover and
 * invoke registered LoopBack-style middleware in the context.
 * @param ctx - Context object to discover registered middleware
 */
function toExpressMiddleware(ctx) {
    return async (req, res, next) => {
        const middlewareCtx = new types_1.MiddlewareContext(req, res, ctx);
        // Set the middleware context to `request` object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req[types_1.MIDDLEWARE_CONTEXT] = middlewareCtx;
        try {
            const result = await invokeMiddleware(middlewareCtx);
            if (result !== res) {
                next();
            }
        }
        catch (err) {
            next(err);
        }
    };
}
exports.toExpressMiddleware = toExpressMiddleware;
//# sourceMappingURL=middleware.js.map