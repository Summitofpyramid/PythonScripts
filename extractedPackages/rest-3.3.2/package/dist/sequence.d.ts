import { RequestContext } from './request-context';
import { FindRoute, InvokeMethod, ParseParams, Reject, Send } from './types';
/**
 * A sequence function is a function implementing a custom
 * sequence of actions to handle an incoming request.
 */
export declare type SequenceFunction = (context: RequestContext, sequence: DefaultSequence) => Promise<void> | void;
/**
 * A sequence handler is a class implementing sequence of actions
 * required to handle an incoming request.
 */
export interface SequenceHandler {
    /**
     * Handle the request by running the configured sequence of actions.
     *
     * @param context - The request context: HTTP request and response objects,
     * per-request IoC container and more.
     */
    handle(context: RequestContext): Promise<void>;
}
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
export declare class DefaultSequence implements SequenceHandler {
    protected findRoute: FindRoute;
    protected parseParams: ParseParams;
    protected invoke: InvokeMethod;
    send: Send;
    reject: Reject;
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
    constructor(findRoute: FindRoute, parseParams: ParseParams, invoke: InvokeMethod, send: Send, reject: Reject);
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
    handle(context: RequestContext): Promise<void>;
}
