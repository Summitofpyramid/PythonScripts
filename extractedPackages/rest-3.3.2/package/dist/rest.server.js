"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const core_1 = require("@loopback/core");
const http_server_1 = require("@loopback/http-server");
const openapi_v3_1 = require("@loopback/openapi-v3");
const assert_1 = require("assert");
const cors_1 = tslib_1.__importDefault(require("cors"));
const debug_1 = tslib_1.__importDefault(require("debug"));
const express_1 = tslib_1.__importDefault(require("express"));
const js_yaml_1 = require("js-yaml");
const lodash_1 = require("lodash");
const strong_error_handler_1 = require("strong-error-handler");
const body_parsers_1 = require("./body-parsers");
const http_handler_1 = require("./http-handler");
const keys_1 = require("./keys");
const request_context_1 = require("./request-context");
const router_1 = require("./router");
const router_spec_1 = require("./router/router-spec");
const sequence_1 = require("./sequence");
const debug = debug_1.default('loopback:rest:server');
const SequenceActions = keys_1.RestBindings.SequenceActions;
/**
 * A REST API server for use with Loopback.
 * Add this server to your application by importing the RestComponent.
 *
 * @example
 * ```ts
 * const app = new MyApplication();
 * app.component(RestComponent);
 * ```
 *
 * To add additional instances of RestServer to your application, use the
 * `.server` function:
 * ```ts
 * app.server(RestServer, 'nameOfYourServer');
 * ```
 *
 * By default, one instance of RestServer will be created when the RestComponent
 * is bootstrapped. This instance can be retrieved with
 * `app.getServer(RestServer)`, or by calling `app.get('servers.RestServer')`
 * Note that retrieving other instances of RestServer must be done using the
 * server's name:
 * ```ts
 * const server = await app.getServer('foo')
 * // OR
 * const server = await app.get('servers.foo');
 * ```
 */
let RestServer = class RestServer extends context_1.Context {
    /**
     *
     * Creates an instance of RestServer.
     *
     * @param app - The application instance (injected via
     * CoreBindings.APPLICATION_INSTANCE).
     * @param config - The configuration options (injected via
     * RestBindings.CONFIG).
     *
     */
    constructor(app, config = {}) {
        var _a;
        super(app);
        /*
         * Registry of external routes & static assets
         */
        this._externalRoutes = new router_1.ExternalExpressRoutes();
        this.config = resolveRestServerConfig(config);
        this.bind(keys_1.RestBindings.PORT).to(this.config.port);
        this.bind(keys_1.RestBindings.HOST).to(config.host);
        this.bind(keys_1.RestBindings.PATH).to(config.path);
        this.bind(keys_1.RestBindings.PROTOCOL).to((_a = config.protocol) !== null && _a !== void 0 ? _a : 'http');
        this.bind(keys_1.RestBindings.HTTPS_OPTIONS).to(config);
        if (config.requestBodyParser) {
            this.bind(keys_1.RestBindings.REQUEST_BODY_PARSER_OPTIONS).to(config.requestBodyParser);
        }
        if (config.sequence) {
            this.sequence(config.sequence);
        }
        if (config.router) {
            this.bind(keys_1.RestBindings.ROUTER_OPTIONS).to(config.router);
        }
        this.basePath(config.basePath);
        this.bind(keys_1.RestBindings.BASE_PATH).toDynamicValue(() => this._basePath);
        this.bind(keys_1.RestBindings.HANDLER).toDynamicValue(() => this.httpHandler);
    }
    get OASEnhancer() {
        this._setupOASEnhancerIfNeeded();
        return this._OASEnhancer;
    }
    get requestHandler() {
        if (this._requestHandler == null) {
            this._setupRequestHandlerIfNeeded();
        }
        return this._requestHandler;
    }
    get httpHandler() {
        this._setupHandlerIfNeeded();
        return this._httpHandler;
    }
    get listening() {
        return this._httpServer ? this._httpServer.listening : false;
    }
    /**
     * The base url for the server, including the basePath if set. For example,
     * the value will be 'http://localhost:3000/api' if `basePath` is set to
     * '/api'.
     */
    get url() {
        let serverUrl = this.rootUrl;
        if (!serverUrl)
            return serverUrl;
        serverUrl = serverUrl + (this._basePath || '');
        return serverUrl;
    }
    /**
     * The root url for the server without the basePath. For example, the value
     * will be 'http://localhost:3000' regardless of the `basePath`.
     */
    get rootUrl() {
        return this._httpServer && this._httpServer.url;
    }
    _setupOASEnhancerIfNeeded() {
        if (this._OASEnhancer != null)
            return;
        this.add(context_1.createBindingFromClass(openapi_v3_1.OASEnhancerService, {
            key: openapi_v3_1.OASEnhancerBindings.OAS_ENHANCER_SERVICE,
        }));
        this._OASEnhancer = this.getSync(openapi_v3_1.OASEnhancerBindings.OAS_ENHANCER_SERVICE);
    }
    _setupRequestHandlerIfNeeded() {
        if (this._expressApp != null)
            return;
        this._expressApp = express_1.default();
        this._applyExpressSettings();
        this._requestHandler = this._expressApp;
        // Allow CORS support for all endpoints so that users
        // can test with online SwaggerUI instance
        this._expressApp.use(cors_1.default(this.config.cors));
        // Set up endpoints for OpenAPI spec/ui
        this._setupOpenApiSpecEndpoints();
        // Mount our router & request handler
        this._expressApp.use(this._basePath, (req, res, next) => {
            this._handleHttpRequest(req, res).catch(next);
        });
        // Mount our error handler
        this._expressApp.use(this._unexpectedErrorHandler());
    }
    /**
     * Get an Express handler for unexpected errors
     */
    _unexpectedErrorHandler() {
        const handleUnExpectedError = (err, req, res, next) => {
            // Handle errors reported by Express middleware such as CORS
            // First try to use the `REJECT` action
            this.get(SequenceActions.REJECT, { optional: true })
                .then(reject => {
                if (reject) {
                    // TODO(rfeng): There is a possibility that the error is thrown
                    // from the `REJECT` action in the sequence
                    return reject({ request: req, response: res }, err);
                }
                // Use strong-error handler directly
                strong_error_handler_1.writeErrorToResponse(err, req, res);
            })
                .catch(unexpectedErr => next(unexpectedErr));
        };
        return handleUnExpectedError;
    }
    /**
     * Apply express settings.
     */
    _applyExpressSettings() {
        const settings = this.config.expressSettings;
        for (const key in settings) {
            this._expressApp.set(key, settings[key]);
        }
        if (this.config.router && typeof this.config.router.strict === 'boolean') {
            this._expressApp.set('strict routing', this.config.router.strict);
        }
    }
    /**
     * Mount /openapi.json, /openapi.yaml for specs and /swagger-ui, /explorer
     * to redirect to externally hosted API explorer
     */
    _setupOpenApiSpecEndpoints() {
        if (this.config.openApiSpec.disabled)
            return;
        const mapping = this.config.openApiSpec.endpointMapping;
        // Serving OpenAPI spec
        for (const p in mapping) {
            this.addOpenApiSpecEndpoint(p, mapping[p]);
        }
        const explorerPaths = ['/swagger-ui', '/explorer'];
        this._expressApp.get(explorerPaths, (req, res, next) => this._redirectToSwaggerUI(req, res, next));
    }
    /**
     * Add a new non-controller endpoint hosting a form of the OpenAPI spec.
     *
     * @param path Path at which to host the copy of the OpenAPI
     * @param form Form that should be renedered from that path
     */
    addOpenApiSpecEndpoint(path, form) {
        if (this._expressApp) {
            // if the app is already started, try to hot-add it
            // this only actually "works" mid-startup, once this._handleHttpRequest
            // has been added to express, adding any later routes won't work
            // NOTE(bajtos) Regular routes are handled through Sequence.
            // IMO, this built-in endpoint should not run through a Sequence,
            // because it's not part of the application API itself.
            // E.g. if the app implements access/audit logs, I don't want
            // this endpoint to trigger a log entry. If the server implements
            // content-negotiation to support XML clients, I don't want the OpenAPI
            // spec to be converted into an XML response.
            this._expressApp.get(path, (req, res) => this._serveOpenApiSpec(req, res, form));
        }
        else {
            // if the app is not started, add the mapping to the config
            const mapping = this.config.openApiSpec.endpointMapping;
            if (path in mapping) {
                throw new Error(`The path ${path} is already configured for OpenApi hosting`);
            }
            mapping[path] = form;
        }
    }
    _handleHttpRequest(request, response) {
        return this.httpHandler.handleRequest(request, response);
    }
    _setupHandlerIfNeeded() {
        if (this._httpHandler)
            return;
        // Watch for binding events
        // See https://github.com/strongloop/loopback-next/issues/433
        const routesObserver = {
            filter: binding => context_1.filterByKey(keys_1.RestBindings.API_SPEC.key)(binding) ||
                (context_1.filterByKey(/^(controllers|routes)\..+/)(binding) &&
                    // Exclude controller routes to avoid circular events
                    !context_1.filterByTag(keys_1.RestTags.CONTROLLER_ROUTE)(binding)),
            observe: () => {
                // Rebuild the HttpHandler instance whenever a controller/route was
                // added/deleted.
                this._createHttpHandler();
            },
        };
        this._routesEventSubscription = this.subscribe(routesObserver);
        this._createHttpHandler();
    }
    /**
     * Create an instance of HttpHandler and populates it with routes
     */
    _createHttpHandler() {
        /**
         * Check if there is custom router in the context
         */
        const router = this.getSync(keys_1.RestBindings.ROUTER, { optional: true });
        const routingTable = new router_1.RoutingTable(router, this._externalRoutes);
        this._httpHandler = new http_handler_1.HttpHandler(this, this.config, routingTable);
        // Remove controller routes
        for (const b of this.findByTag(keys_1.RestTags.CONTROLLER_ROUTE)) {
            this.unbind(b.key);
        }
        for (const b of this.find(`${core_1.CoreBindings.CONTROLLERS}.*`)) {
            const controllerName = b.key.replace(/^controllers\./, '');
            const ctor = b.valueConstructor;
            if (!ctor) {
                throw new Error(`The controller ${controllerName} was not bound via .toClass()`);
            }
            const apiSpec = openapi_v3_1.getControllerSpec(ctor);
            if (!apiSpec) {
                // controller methods are specified through app.api() spec
                debug('Skipping controller %s - no API spec provided', controllerName);
                continue;
            }
            debug('Registering controller %s', controllerName);
            if (apiSpec.components) {
                this._httpHandler.registerApiComponents(apiSpec.components);
            }
            const controllerFactory = router_1.createControllerFactoryForBinding(b.key);
            const routes = router_1.createRoutesForController(apiSpec, ctor, controllerFactory);
            for (const route of routes) {
                const binding = this.bindRoute(route);
                binding
                    .tag(keys_1.RestTags.CONTROLLER_ROUTE)
                    .tag({ [keys_1.RestTags.CONTROLLER_BINDING]: b.key });
            }
        }
        for (const b of this.findByTag(keys_1.RestTags.REST_ROUTE)) {
            // TODO(bajtos) should we support routes defined asynchronously?
            const route = this.getSync(b.key);
            this._httpHandler.registerRoute(route);
        }
        // TODO(bajtos) should we support API spec defined asynchronously?
        const spec = this.getSync(keys_1.RestBindings.API_SPEC);
        for (const path in spec.paths) {
            for (const verb in spec.paths[path]) {
                const routeSpec = spec.paths[path][verb];
                this._setupOperation(verb, path, routeSpec);
            }
        }
    }
    _setupOperation(verb, path, spec) {
        const handler = spec['x-operation'];
        if (typeof handler === 'function') {
            // Remove a field value that cannot be represented in JSON.
            // Start by creating a shallow-copy of the spec, so that we don't
            // modify the original spec object provided by user.
            spec = Object.assign({}, spec);
            delete spec['x-operation'];
            const route = new router_1.Route(verb, path, spec, handler);
            this._httpHandler.registerRoute(route);
            return;
        }
        const controllerName = spec['x-controller-name'];
        if (typeof controllerName === 'string') {
            const b = this.getBinding(`controllers.${controllerName}`, {
                optional: true,
            });
            if (!b) {
                throw new Error(`Unknown controller ${controllerName} used by "${verb} ${path}"`);
            }
            const ctor = b.valueConstructor;
            if (!ctor) {
                throw new Error(`The controller ${controllerName} was not bound via .toClass()`);
            }
            const controllerFactory = router_1.createControllerFactoryForBinding(b.key);
            const route = new router_1.ControllerRoute(verb, path, spec, ctor, controllerFactory);
            this._httpHandler.registerRoute(route);
            return;
        }
        throw new Error(`There is no handler configured for operation "${verb} ${path}`);
    }
    async _serveOpenApiSpec(request, response, specForm) {
        const requestContext = new request_context_1.RequestContext(request, response, this, this.config);
        specForm = specForm !== null && specForm !== void 0 ? specForm : { version: '3.0.0', format: 'json' };
        const specObj = await this.getApiSpec(requestContext);
        if (specForm.format === 'json') {
            const spec = JSON.stringify(specObj, null, 2);
            response.setHeader('content-type', 'application/json; charset=utf-8');
            response.end(spec, 'utf-8');
        }
        else {
            const yaml = js_yaml_1.safeDump(specObj, {});
            response.setHeader('content-type', 'text/yaml; charset=utf-8');
            response.end(yaml, 'utf-8');
        }
    }
    async _redirectToSwaggerUI(request, response, next) {
        const config = this.config.apiExplorer;
        if (config.disabled) {
            debug('Redirect to swagger-ui was disabled by configuration.');
            next();
            return;
        }
        debug('Redirecting to swagger-ui from %j.', request.originalUrl);
        const requestContext = new request_context_1.RequestContext(request, response, this, this.config);
        const protocol = requestContext.requestedProtocol;
        const baseUrl = protocol === 'http' ? config.httpUrl : config.url;
        const openApiUrl = `${requestContext.requestedBaseUrl}/openapi.json`;
        const fullUrl = `${baseUrl}?url=${openApiUrl}`;
        response.redirect(302, fullUrl);
    }
    /**
     * Register a controller class with this server.
     *
     * @param controllerCtor - The controller class
     * (constructor function).
     * @returns The newly created binding, you can use the reference to
     * further modify the binding, e.g. lock the value to prevent further
     * modifications.
     *
     * @example
     * ```ts
     * class MyController {
     * }
     * app.controller(MyController).lock();
     * ```
     *
     */
    controller(controllerCtor) {
        return this.bind('controllers.' + controllerCtor.name).toClass(controllerCtor);
    }
    route(routeOrVerb, path, spec, controllerCtorOrHandler, controllerFactory, methodName) {
        if (typeof routeOrVerb === 'object') {
            const r = routeOrVerb;
            // Encode the path to escape special chars
            return this.bindRoute(r);
        }
        if (!path) {
            throw new assert_1.AssertionError({
                message: 'path is required for a controller-based route',
            });
        }
        if (!spec) {
            throw new assert_1.AssertionError({
                message: 'spec is required for a controller-based route',
            });
        }
        if (arguments.length === 4) {
            if (!controllerCtorOrHandler) {
                throw new assert_1.AssertionError({
                    message: 'handler function is required for a handler-based route',
                });
            }
            return this.route(new router_1.Route(routeOrVerb, path, spec, controllerCtorOrHandler));
        }
        if (!controllerCtorOrHandler) {
            throw new assert_1.AssertionError({
                message: 'controller is required for a controller-based route',
            });
        }
        if (!methodName) {
            throw new assert_1.AssertionError({
                message: 'methodName is required for a controller-based route',
            });
        }
        return this.route(new router_1.ControllerRoute(routeOrVerb, path, spec, controllerCtorOrHandler, controllerFactory, methodName));
    }
    bindRoute(r) {
        const namespace = keys_1.RestBindings.ROUTES;
        const encodedPath = encodeURIComponent(r.path).replace(/\./g, '%2E');
        return this.bind(`${namespace}.${r.verb} ${encodedPath}`)
            .to(r)
            .tag(keys_1.RestTags.REST_ROUTE)
            .tag({ [keys_1.RestTags.ROUTE_VERB]: r.verb, [keys_1.RestTags.ROUTE_PATH]: r.path });
    }
    /**
     * Register a route redirecting callers to a different URL.
     *
     * @example
     * ```ts
     * server.redirect('/explorer', '/explorer/');
     * ```
     *
     * @param fromPath - URL path of the redirect endpoint
     * @param toPathOrUrl - Location (URL path or full URL) where to redirect to.
     * If your server is configured with a custom `basePath`, then the base path
     * is prepended to the target location.
     * @param statusCode - HTTP status code to respond with,
     *   defaults to 303 (See Other).
     */
    redirect(fromPath, toPathOrUrl, statusCode) {
        return this.route(new router_1.RedirectRoute(fromPath, this._basePath + toPathOrUrl, statusCode));
    }
    /**
     * Mount static assets to the REST server.
     * See https://expressjs.com/en/4x/api.html#express.static
     * @param path - The path(s) to serve the asset.
     * See examples at https://expressjs.com/en/4x/api.html#path-examples
     * @param rootDir - The root directory from which to serve static assets
     * @param options - Options for serve-static
     */
    static(path, rootDir, options) {
        this._externalRoutes.registerAssets(path, rootDir, options);
    }
    /**
     * Set the OpenAPI specification that defines the REST API schema for this
     * server. All routes, parameter definitions and return types will be defined
     * in this way.
     *
     * Note that this will override any routes defined via decorators at the
     * controller level (this function takes precedent).
     *
     * @param spec - The OpenAPI specification, as an object.
     * @returns Binding for the spec
     *
     */
    api(spec) {
        return this.bind(keys_1.RestBindings.API_SPEC).to(spec);
    }
    /**
     * Get the OpenAPI specification describing the REST API provided by
     * this application.
     *
     * This method merges operations (HTTP endpoints) from the following sources:
     *  - `app.api(spec)`
     *  - `app.controller(MyController)`
     *  - `app.route(route)`
     *  - `app.route('get', '/greet', operationSpec, MyController, 'greet')`
     *
     * If the optional `requestContext` is provided, then the `servers` list
     * in the returned spec will be updated to work in that context.
     * Specifically:
     * 1. if `config.openApi.setServersFromRequest` is enabled, the servers
     * list will be replaced with the context base url
     * 2. Any `servers` entries with a path of `/` will have that path
     * replaced with `requestContext.basePath`
     *
     * @param requestContext - Optional context to update the `servers` list
     * in the returned spec
     */
    async getApiSpec(requestContext) {
        let spec = await this.get(keys_1.RestBindings.API_SPEC);
        const components = this.httpHandler.getApiComponents();
        // Apply deep clone to prevent getApiSpec() callers from
        // accidentally modifying our internal routing data
        spec.paths = lodash_1.cloneDeep(this.httpHandler.describeApiPaths());
        if (components) {
            const defs = lodash_1.cloneDeep(components);
            spec.components = { ...spec.components, ...defs };
        }
        router_spec_1.assignRouterSpec(spec, this._externalRoutes.routerSpec);
        if (requestContext) {
            spec = this.updateSpecFromRequest(spec, requestContext);
        }
        // Apply OAS enhancers to the OpenAPI specification
        this.OASEnhancer.spec = spec;
        spec = await this.OASEnhancer.applyAllEnhancers();
        return spec;
    }
    /**
     * Update or rebuild OpenAPI Spec object to be appropriate for the context of
     * a specific request for the spec, leveraging both app config and request
     * path information.
     *
     * @param spec base spec object from which to start
     * @param requestContext request to use to infer path information
     * @returns Updated or rebuilt spec object to use in the context of the request
     */
    updateSpecFromRequest(spec, requestContext) {
        if (this.config.openApiSpec.setServersFromRequest) {
            spec = Object.assign({}, spec);
            spec.servers = [{ url: requestContext.requestedBaseUrl }];
        }
        const basePath = requestContext.basePath;
        if (spec.servers && basePath) {
            for (const s of spec.servers) {
                // Update the default server url to honor `basePath`
                if (s.url === '/') {
                    s.url = basePath;
                }
            }
        }
        return spec;
    }
    /**
     * Configure a custom sequence class for handling incoming requests.
     *
     * @example
     * ```ts
     * class MySequence implements SequenceHandler {
     *   constructor(
     *     @inject('send) public send: Send)) {
     *   }
     *
     *   public async handle({response}: RequestContext) {
     *     send(response, 'hello world');
     *   }
     * }
     * ```
     *
     * @param value - The sequence to invoke for each incoming request.
     */
    sequence(value) {
        this.bind(keys_1.RestBindings.SEQUENCE).toClass(value);
    }
    /**
     * Configure a custom sequence function for handling incoming requests.
     *
     * @example
     * ```ts
     * app.handler(({request, response}, sequence) => {
     *   sequence.send(response, 'hello world');
     * });
     * ```
     *
     * @param handlerFn - The handler to invoke for each incoming request.
     */
    handler(handlerFn) {
        let SequenceFromFunction = class SequenceFromFunction extends sequence_1.DefaultSequence {
            // NOTE(bajtos) Unfortunately, we have to duplicate the constructor
            // in order for our DI/IoC framework to inject constructor arguments
            constructor(findRoute, parseParams, invoke, send, reject) {
                super(findRoute, parseParams, invoke, send, reject);
                this.findRoute = findRoute;
                this.parseParams = parseParams;
                this.invoke = invoke;
                this.send = send;
                this.reject = reject;
            }
            async handle(context) {
                await Promise.resolve(handlerFn(context, this));
            }
        };
        SequenceFromFunction = tslib_1.__decorate([
            tslib_1.__param(0, context_1.inject(SequenceActions.FIND_ROUTE)),
            tslib_1.__param(1, context_1.inject(SequenceActions.PARSE_PARAMS)),
            tslib_1.__param(2, context_1.inject(SequenceActions.INVOKE_METHOD)),
            tslib_1.__param(3, context_1.inject(SequenceActions.SEND)),
            tslib_1.__param(4, context_1.inject(SequenceActions.REJECT)),
            tslib_1.__metadata("design:paramtypes", [Function, Function, Function, Function, Function])
        ], SequenceFromFunction);
        this.sequence(SequenceFromFunction);
    }
    /**
     * Bind a body parser to the server context
     * @param parserClass - Body parser class
     * @param address - Optional binding address
     */
    bodyParser(bodyParserClass, address) {
        const binding = createBodyParserBinding(bodyParserClass, address);
        this.add(binding);
        return binding;
    }
    /**
     * Configure the `basePath` for the rest server
     * @param path - Base path
     */
    basePath(path = '') {
        if (this._requestHandler != null) {
            throw new Error('Base path cannot be set as the request handler has been created');
        }
        // Trim leading and trailing `/`
        path = path.replace(/(^\/)|(\/$)/, '');
        if (path)
            path = '/' + path;
        this._basePath = path;
        this.config.basePath = path;
    }
    /**
     * Start this REST API's HTTP/HTTPS server.
     */
    async start() {
        // Set up the Express app if not done yet
        this._setupRequestHandlerIfNeeded();
        // Setup the HTTP handler so that we can verify the configuration
        // of API spec, controllers and routes at startup time.
        this._setupHandlerIfNeeded();
        const port = await this.get(keys_1.RestBindings.PORT);
        const host = await this.get(keys_1.RestBindings.HOST);
        const path = await this.get(keys_1.RestBindings.PATH);
        const protocol = await this.get(keys_1.RestBindings.PROTOCOL);
        const httpsOptions = await this.get(keys_1.RestBindings.HTTPS_OPTIONS);
        if (this.config.listenOnStart === false) {
            debug('RestServer is not listening as listenOnStart flag is set to false.');
            return;
        }
        const serverOptions = {};
        if (protocol === 'https')
            Object.assign(serverOptions, httpsOptions);
        Object.assign(serverOptions, { port, host, protocol, path });
        this._httpServer = new http_server_1.HttpServer(this.requestHandler, serverOptions);
        await this._httpServer.start();
        this.bind(keys_1.RestBindings.PORT).to(this._httpServer.port);
        this.bind(keys_1.RestBindings.HOST).to(this._httpServer.host);
        this.bind(keys_1.RestBindings.URL).to(this._httpServer.url);
        debug('RestServer listening at %s', this._httpServer.url);
    }
    /**
     * Stop this REST API's HTTP/HTTPS server.
     */
    async stop() {
        // Kill the server instance.
        if (!this._httpServer)
            return;
        await this._httpServer.stop();
        this._httpServer = undefined;
    }
    /**
     * Mount an Express router to expose additional REST endpoints handled
     * via legacy Express-based stack.
     *
     * @param basePath - Path where to mount the router at, e.g. `/` or `/api`.
     * @param router - The Express router to handle the requests.
     * @param spec - A partial OpenAPI spec describing endpoints provided by the
     * router. LoopBack will prepend `basePath` to all endpoints automatically.
     * This argument is optional. You can leave it out if you don't want to
     * document the routes.
     */
    mountExpressRouter(basePath, router, spec) {
        this._externalRoutes.mountRouter(basePath, router, spec);
    }
};
RestServer = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, context_1.inject(keys_1.RestBindings.CONFIG, { optional: true })),
    tslib_1.__metadata("design:paramtypes", [core_1.Application, Object])
], RestServer);
exports.RestServer = RestServer;
/**
 * Create a binding for the given body parser class
 * @param parserClass - Body parser class
 * @param key - Optional binding address
 */
function createBodyParserBinding(parserClass, key) {
    const address = key !== null && key !== void 0 ? key : `${keys_1.RestBindings.REQUEST_BODY_PARSER}.${parserClass.name}`;
    return context_1.Binding.bind(address)
        .toClass(parserClass)
        .inScope(context_1.BindingScope.TRANSIENT)
        .tag(body_parsers_1.REQUEST_BODY_PARSER_TAG);
}
exports.createBodyParserBinding = createBodyParserBinding;
const OPENAPI_SPEC_MAPPING = {
    '/openapi.json': { version: '3.0.0', format: 'json' },
    '/openapi.yaml': { version: '3.0.0', format: 'yaml' },
};
const DEFAULT_CONFIG = {
    port: 3000,
    openApiSpec: {},
    apiExplorer: {},
    cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
        maxAge: 86400,
        credentials: true,
    },
    expressSettings: {},
    router: {},
    listenOnStart: true,
};
function resolveRestServerConfig(config) {
    const result = Object.assign(lodash_1.cloneDeep(DEFAULT_CONFIG), config);
    // Can't check falsiness, 0 is a valid port.
    if (result.port == null) {
        result.port = 3000;
    }
    if (result.host == null) {
        // Set it to '' so that the http server will listen on all interfaces
        result.host = undefined;
    }
    if (!result.openApiSpec.endpointMapping) {
        // mapping may be mutated by addOpenApiSpecEndpoint, be sure that doesn't
        // pollute the default mapping configuration
        result.openApiSpec.endpointMapping = lodash_1.cloneDeep(OPENAPI_SPEC_MAPPING);
    }
    result.apiExplorer = normalizeApiExplorerConfig(config.apiExplorer);
    if (result.openApiSpec.disabled) {
        // Disable apiExplorer if the OpenAPI spec endpoint is disabled
        result.apiExplorer.disabled = true;
    }
    return result;
}
function normalizeApiExplorerConfig(input) {
    var _a, _b, _c;
    const config = input !== null && input !== void 0 ? input : {};
    const url = (_a = config.url) !== null && _a !== void 0 ? _a : 'https://explorer.loopback.io';
    config.httpUrl = (_c = (_b = config.httpUrl) !== null && _b !== void 0 ? _b : config.url) !== null && _c !== void 0 ? _c : 'http://explorer.loopback.io';
    config.url = url;
    return config;
}
//# sourceMappingURL=rest.server.js.map