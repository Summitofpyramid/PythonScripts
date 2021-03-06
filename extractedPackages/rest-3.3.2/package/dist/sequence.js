"use strict";
// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const debug = require('debug')('loopback:rest:sequence');
const context_1 = require("@loopback/context");
const keys_1 = require("./keys");
const SequenceActions = keys_1.RestBindings.SequenceActions;
/**
 * The default implementation of SequenceHandler.
 *
 * @remarks
 * This class implements default Sequence for the LoopBack framework.
 * Default sequence is used if user hasn't defined their own Sequence
 * for their application.
 *
 * Sequence constructor() and run() methods are invoked from [[http-handler]]
 * when the API request comes in. User defines APIs in their Application
 * Controller class.
 *
 * @example
 * User can bind their own Sequence to app as shown below
 * ```ts
 * app.bind(CoreBindings.SEQUENCE).toClass(MySequence);
 * ```
 */
let DefaultSequence = class DefaultSequence {
    /**
     * Constructor: Injects findRoute, invokeMethod & logError
     * methods as promises.
     *
     * @param findRoute - Finds the appropriate controller method,
     *  spec and args for invocation (injected via SequenceActions.FIND_ROUTE).
     * @param parseParams - The parameter parsing function (injected
     * via SequenceActions.PARSE_PARAMS).
     * @param invoke - Invokes the method specified by the route
     * (injected via SequenceActions.INVOKE_METHOD).
     * @param send - The action to merge the invoke result with the response
     * (injected via SequenceActions.SEND)
     * @param reject - The action to take if the invoke returns a rejected
     * promise result (injected via SequenceActions.REJECT).
     */
    constructor(findRoute, parseParams, invoke, send, reject) {
        this.findRoute = findRoute;
        this.parseParams = parseParams;
        this.invoke = invoke;
        this.send = send;
        this.reject = reject;
    }
    /**
     * Runs the default sequence. Given a handler context (request and response),
     * running the sequence will produce a response or an error.
     *
     * Default sequence executes these steps
     *  - Finds the appropriate controller method, swagger spec
     *    and args for invocation
     *  - Parses HTTP request to get API argument list
     *  - Invokes the API which is defined in the Application Controller
     *  - Writes the result from API into the HTTP response
     *  - Error is caught and logged using 'logError' if any of the above steps
     *    in the sequence fails with an error.
     *
     * @param context - The request context: HTTP request and response objects,
     * per-request IoC container and more.
     */
    async handle(context) {
        try {
            const { request, response } = context;
            const route = this.findRoute(request);
            const args = await this.parseParams(request, route);
            const result = await this.invoke(route, args);
            debug('%s result -', route.describe(), result);
            this.send(response, result);
        }
        catch (error) {
            this.reject(context, error);
        }
    }
};
DefaultSequence = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(SequenceActions.FIND_ROUTE)),
    tslib_1.__param(1, context_1.inject(SequenceActions.PARSE_PARAMS)),
    tslib_1.__param(2, context_1.inject(SequenceActions.INVOKE_METHOD)),
    tslib_1.__param(3, context_1.inject(SequenceActions.SEND)),
    tslib_1.__param(4, context_1.inject(SequenceActions.REJECT)),
    tslib_1.__metadata("design:paramtypes", [Function, Function, Function, Function, Function])
], DefaultSequence);
exports.DefaultSequence = DefaultSequence;
//# sourceMappingURL=sequence.js.map