import { BindingAddress, Context, GenericInterceptor, GenericInterceptorChain, InvocationContext, Next, ValueOrPromise } from '@loopback/core';
import { Request, RequestHandler, Response } from 'express';
export { Request, Response, Router, RouterOptions } from 'express';
/**
 * An object holding HTTP request, response and other data
 * needed to handle an incoming HTTP request.
 */
export interface HandlerContext {
    readonly request: Request;
    readonly response: Response;
}
/**
 * Type alias for Express RequestHandler
 */
export declare type ExpressRequestHandler = RequestHandler;
/**
 * A per-request Context for middleware to combine an IoC container with handler
 * context (request, response, etc.).
 */
export declare class MiddlewareContext extends Context implements HandlerContext {
    readonly request: Request;
    readonly response: Response;
    /**
     * Constructor for `MiddlewareContext`
     * @param request - Express request object
     * @param response - Express response object
     * @param parent - Parent context
     * @param name - Name of the middleware context
     */
    constructor(request: Request, response: Response, parent?: Context, name?: string);
    protected setupBindings(): void;
}
/**
 * Interface LoopBack 4 middleware to be executed within sequence of actions.
 * A middleware for LoopBack is basically a generic interceptor that uses
 * `RequestContext`.
 *
 * The signature of a middleware function is described at
 * {@link https://loopback.io/doc/en/lb4/apidocs.express.middleware.html | Middleware}.
 * It's very much the same as
 * {@link https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware | Koa middleware}.
 *
 * @example
 * ```ts
 * const log: Middleware = async (requestCtx, next) => {
 *   const {request} = requestCtx;
 *   console.log('Request: %s %s', request.method, request.originalUrl);
 *   try {
 *     // Proceed with next middleware
 *     await next();
 *     console.log('Response received for %s %s', request.method, request.originalUrl);
 *   } catch(err) {
 *     console.error('Error received for %s %s', request.method, request.originalUrl);
 *     throw err;
 *   }
 * }
 * ```
 */
export interface Middleware extends GenericInterceptor<MiddlewareContext> {
}
/**
 * An interceptor chain of middleware. This represents a list of cascading
 * middleware functions to be executed by the order of `group` names.
 */
export declare class MiddlewareChain extends GenericInterceptorChain<MiddlewareContext> {
}
/**
 * Default extension point name for middleware
 */
export declare const DEFAULT_MIDDLEWARE_CHAIN = "middlewareChain.default";
/**
 * Options for `InvokeMiddleware`
 */
export interface InvokeMiddlewareOptions {
    /**
     * Name of the extension point. Default to the `extensionPoint` tag value
     * from the binding
     */
    chain?: string;
    /**
     * An array of group names to denote the order of execution
     */
    orderedGroups?: string[];
    next?: Next;
}
/**
 * Interface for the invoker of middleware registered under the an extension
 * point name.
 */
export interface InvokeMiddleware {
    /**
     * Invoke the request interceptors in the chain.
     * @param middlewareCtx - Middleware Context
     * @param options - Options for the invocation
     */
    (middlewareCtx: MiddlewareContext, options?: InvokeMiddlewareOptions): ValueOrPromise<boolean>;
    /**
     * Invoke a list of Express middleware handler functions
     *
     * @example
     * ```ts
     * import cors from 'cors';
     * import helmet from 'helmet';
     * import morgan from 'morgan';
     *
     *
     * const finished = await this.invokeMiddleware(
     *   middlewareCtx, [
     *     cors(),
     *     helmet(),
     *     morgan('combined'),
     * ]);
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
    (middlewareCtx: MiddlewareContext, handlers: ExpressRequestHandler[]): ValueOrPromise<boolean>;
}
/**
 * Options for defining a middleware
 */
export interface MiddlewareCreationOptions {
    /**
     * A flag to control if configuration for the middleware can be injected
     * lazily.
     *
     * - `true` (default): creates a provider class with `@config`
     * - `false`: No configuration injection is supported
     * - 'watch': creates a provider class with `@config.view`
     */
    injectConfiguration?: boolean | 'watch';
    /**
     * Class name for the created provider class. It's only used if
     * `injectConfiguration` is not set to `false`.
     */
    providerClassName?: string;
}
/**
 * Options to create a middleware binding for the sequence action or interceptor.
 * @typeParam CTX - Context class
 */
export interface BaseMiddlewareBindingOptions<CTX extends Context> extends MiddlewareCreationOptions {
    /**
     * Binding key for the middleware.
     */
    key?: BindingAddress<GenericInterceptor<CTX>>;
    /**
     * An optional `group` name to be used for order of executions
     */
    group?: string;
}
/**
 * Options to bind a middleware as an interceptor to the context
 */
export interface MiddlewareInterceptorBindingOptions extends BaseMiddlewareBindingOptions<InvocationContext> {
    /**
     * A flag to control if the interceptor should be global. Default to `true`.
     */
    global?: boolean;
}
/**
 * Options to bind middleware as a request context based interceptor within an
 * `InvokeMiddleware` action of the sequence.
 */
export interface MiddlewareBindingOptions extends BaseMiddlewareBindingOptions<MiddlewareContext> {
    /**
     * Name of the middleware extension point. Default to `DEFAULT_MIDDLEWARE_CHAIN`.
     */
    chain?: string;
}
/**
 * Interface for an express middleware factory
 * @typeParam C - Configuration type
 */
export interface ExpressMiddlewareFactory<C> {
    (middlewareConfig?: C): ExpressRequestHandler;
}
/**
 * A symbol to store `MiddlewareContext` on the request object
 */
export declare const MIDDLEWARE_CONTEXT: unique symbol;
