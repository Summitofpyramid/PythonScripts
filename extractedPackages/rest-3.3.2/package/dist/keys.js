"use strict";
// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("@loopback/context");
const core_1 = require("@loopback/core");
/**
 * RestServer-specific bindings
 */
var RestBindings;
(function (RestBindings) {
    /**
     * Binding key for setting and injecting RestComponentConfig
     */
    RestBindings.CONFIG = core_1.CoreBindings.APPLICATION_CONFIG.deepProperty('rest');
    /**
     * Binding key for setting and injecting the host name of RestServer
     */
    RestBindings.HOST = context_1.BindingKey.create('rest.host');
    /**
     * Binding key for setting and injecting the port number of RestServer
     */
    RestBindings.PORT = context_1.BindingKey.create('rest.port');
    /**
     * Binding key for setting and injecting the socket path of the RestServer
     */
    RestBindings.PATH = context_1.BindingKey.create('rest.path');
    /**
     * Binding key for setting and injecting the URL of RestServer
     */
    RestBindings.URL = context_1.BindingKey.create('rest.url');
    /**
     * Binding key for setting and injecting the protocol of RestServer
     */
    RestBindings.PROTOCOL = context_1.BindingKey.create('rest.protocol');
    /**
     * Binding key for HTTPS options
     */
    RestBindings.HTTPS_OPTIONS = context_1.BindingKey.create('rest.httpsOptions');
    /**
     * Binding key for the server itself
     */
    RestBindings.SERVER = context_1.BindingKey.create('servers.RestServer');
    /**
     * Internal binding key for basePath
     */
    RestBindings.BASE_PATH = context_1.BindingKey.create('rest.basePath');
    /**
     * Internal binding key for http-handler
     */
    RestBindings.HANDLER = context_1.BindingKey.create('rest.handler');
    /**
     * Internal binding key for rest router
     */
    RestBindings.ROUTER = context_1.BindingKey.create('rest.router');
    RestBindings.ROUTER_OPTIONS = context_1.BindingKey.create('rest.router.options');
    /**
     * Binding key for setting and injecting Reject action's error handling
     * options.
     *
     * See https://github.com/strongloop/strong-error-handler#options for
     * the list of available options. Please note that the flag `log` is not used
     * by `@loopback/rest`.
     */
    RestBindings.ERROR_WRITER_OPTIONS = context_1.BindingKey.create('rest.errorWriterOptions');
    /**
     * Binding key for request body parser options
     */
    RestBindings.REQUEST_BODY_PARSER_OPTIONS = context_1.BindingKey.create('rest.requestBodyParserOptions');
    /**
     * Binding key for request body parser
     */
    RestBindings.REQUEST_BODY_PARSER = context_1.BindingKey.create('rest.requestBodyParser');
    function bodyParserBindingKey(parser) {
        return `${RestBindings.REQUEST_BODY_PARSER}.${parser}`;
    }
    /**
     * Binding key for request json body parser
     */
    RestBindings.REQUEST_BODY_PARSER_JSON = context_1.BindingKey.create(bodyParserBindingKey('JsonBodyParser'));
    /**
     * Binding key for request urlencoded body parser
     */
    RestBindings.REQUEST_BODY_PARSER_URLENCODED = context_1.BindingKey.create(bodyParserBindingKey('UrlEncodedBodyParser'));
    /**
     * Binding key for request text body parser
     */
    RestBindings.REQUEST_BODY_PARSER_TEXT = context_1.BindingKey.create(bodyParserBindingKey('TextBodyParser'));
    /**
     * Binding key for request raw body parser
     */
    RestBindings.REQUEST_BODY_PARSER_RAW = context_1.BindingKey.create(bodyParserBindingKey('RawBodyParser'));
    /**
     * Binding key for request raw body parser
     */
    RestBindings.REQUEST_BODY_PARSER_STREAM = context_1.BindingKey.create(bodyParserBindingKey('StreamBodyParser'));
    /**
     * Binding key for AJV
     */
    RestBindings.AJV_FACTORY = context_1.BindingKey.create(bodyParserBindingKey('rest.ajvFactory'));
    /**
     * Binding key for setting and injecting an OpenAPI spec
     */
    RestBindings.API_SPEC = context_1.BindingKey.create('rest.apiSpec');
    /**
     * Binding key for setting and injecting an OpenAPI operation spec
     */
    RestBindings.OPERATION_SPEC_CURRENT = context_1.BindingKey.create('rest.operationSpec.current');
    /**
     * Binding key for setting and injecting a Sequence
     */
    RestBindings.SEQUENCE = context_1.BindingKey.create('rest.sequence');
    /**
     * Bindings for potential actions that could be used in a sequence
     */
    let SequenceActions;
    (function (SequenceActions) {
        /**
         * Binding key for setting and injecting a route finding function
         */
        SequenceActions.FIND_ROUTE = context_1.BindingKey.create('rest.sequence.actions.findRoute');
        /**
         * Binding key for setting and injecting a parameter parsing function
         */
        SequenceActions.PARSE_PARAMS = context_1.BindingKey.create('rest.sequence.actions.parseParams');
        /**
         * Binding key for setting and injecting a controller route invoking function
         */
        SequenceActions.INVOKE_METHOD = context_1.BindingKey.create('rest.sequence.actions.invokeMethod');
        /**
         * Binding key for setting and injecting an error logging function
         */
        SequenceActions.LOG_ERROR = context_1.BindingKey.create('rest.sequence.actions.logError');
        /**
         * Binding key for setting and injecting a response writing function
         */
        SequenceActions.SEND = context_1.BindingKey.create('rest.sequence.actions.send');
        /**
         * Binding key for setting and injecting a bad response writing function
         */
        SequenceActions.REJECT = context_1.BindingKey.create('rest.sequence.actions.reject');
    })(SequenceActions = RestBindings.SequenceActions || (RestBindings.SequenceActions = {}));
    /**
     * Binding key for setting and injecting a wrapper function for retrieving
     * values from a given context
     */
    RestBindings.GET_FROM_CONTEXT = context_1.BindingKey.create('getFromContext');
    /**
     * Binding key for setting and injecting a wrapper function for setting values
     * on a given context
     */
    RestBindings.BIND_ELEMENT = context_1.BindingKey.create('bindElement');
    /**
     * Request-specific bindings
     */
    let Http;
    (function (Http) {
        /**
         * Binding key for setting and injecting the http request
         */
        Http.REQUEST = context_1.BindingKey.create('rest.http.request');
        /**
         * Binding key for setting and injecting the http response
         */
        Http.RESPONSE = context_1.BindingKey.create('rest.http.response');
        /**
         * Binding key for setting and injecting the http request context
         */
        Http.CONTEXT = context_1.BindingKey.create('rest.http.request.context');
    })(Http = RestBindings.Http || (RestBindings.Http = {}));
    /**
     * Namespace for REST routes
     */
    RestBindings.ROUTES = 'routes';
})(RestBindings = exports.RestBindings || (exports.RestBindings = {}));
/**
 * Binding tags for RestServer
 */
var RestTags;
(function (RestTags) {
    /**
     * Binding tag to identify REST routes
     */
    RestTags.REST_ROUTE = 'restRoute';
    /**
     * Binding tag for the REST route verb
     */
    RestTags.ROUTE_VERB = 'restRouteVerb';
    /**
     * Binding tag for the REST route path
     */
    RestTags.ROUTE_PATH = 'restRoutePath';
    /**
     * Binding tag to identify controller based REST routes
     */
    RestTags.CONTROLLER_ROUTE = 'controllerRoute';
    /**
     * Binding tag for controller route bindings to represent the controller
     * binding key
     */
    RestTags.CONTROLLER_BINDING = 'controllerBinding';
    RestTags.AJV_KEYWORD = 'ajvKeyword';
    RestTags.AJV_FORMAT = 'ajvFormat';
})(RestTags = exports.RestTags || (exports.RestTags = {}));
//# sourceMappingURL=keys.js.map