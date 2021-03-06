"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const core_1 = require("@loopback/core");
const openapi_v3_1 = require("@loopback/openapi-v3");
const body_parsers_1 = require("./body-parsers");
const body_parser_raw_1 = require("./body-parsers/body-parser.raw");
const keys_1 = require("./keys");
const providers_1 = require("./providers");
const rest_server_1 = require("./rest.server");
const sequence_1 = require("./sequence");
const consolidate_spec_enhancer_1 = require("./spec-enhancers/consolidate.spec-enhancer");
const info_spec_enhancer_1 = require("./spec-enhancers/info.spec-enhancer");
const ajv_factory_provider_1 = require("./validation/ajv-factory.provider");
let RestComponent = class RestComponent {
    constructor(app, config) {
        var _a;
        this.providers = {
            [keys_1.RestBindings.SequenceActions.LOG_ERROR.key]: providers_1.LogErrorProvider,
            [keys_1.RestBindings.SequenceActions.FIND_ROUTE.key]: providers_1.FindRouteProvider,
            [keys_1.RestBindings.SequenceActions.INVOKE_METHOD.key]: providers_1.InvokeMethodProvider,
            [keys_1.RestBindings.SequenceActions.REJECT.key]: providers_1.RejectProvider,
            [keys_1.RestBindings.BIND_ELEMENT.key]: providers_1.BindElementProvider,
            [keys_1.RestBindings.GET_FROM_CONTEXT.key]: providers_1.GetFromContextProvider,
            [keys_1.RestBindings.SequenceActions.PARSE_PARAMS.key]: providers_1.ParseParamsProvider,
            [keys_1.RestBindings.SequenceActions.SEND.key]: providers_1.SendProvider,
            [keys_1.RestBindings.AJV_FACTORY.key]: ajv_factory_provider_1.AjvFactoryProvider,
        };
        /**
         * Add built-in body parsers
         */
        this.bindings = [
            // FIXME(rfeng): We now register request body parsers in TRANSIENT scope
            // so that they can be bound at application or server level
            context_1.Binding.bind(keys_1.RestBindings.REQUEST_BODY_PARSER).toClass(body_parsers_1.RequestBodyParser),
            rest_server_1.createBodyParserBinding(body_parsers_1.JsonBodyParser, keys_1.RestBindings.REQUEST_BODY_PARSER_JSON),
            rest_server_1.createBodyParserBinding(body_parsers_1.TextBodyParser, keys_1.RestBindings.REQUEST_BODY_PARSER_TEXT),
            rest_server_1.createBodyParserBinding(body_parsers_1.UrlEncodedBodyParser, keys_1.RestBindings.REQUEST_BODY_PARSER_URLENCODED),
            rest_server_1.createBodyParserBinding(body_parser_raw_1.RawBodyParser, keys_1.RestBindings.REQUEST_BODY_PARSER_RAW),
            rest_server_1.createBodyParserBinding(body_parsers_1.StreamBodyParser, keys_1.RestBindings.REQUEST_BODY_PARSER_STREAM),
            context_1.createBindingFromClass(info_spec_enhancer_1.InfoSpecEnhancer),
            context_1.createBindingFromClass(consolidate_spec_enhancer_1.ConsolidationEnhancer),
        ];
        this.servers = {
            RestServer: rest_server_1.RestServer,
        };
        app.bind(keys_1.RestBindings.SEQUENCE).toClass(sequence_1.DefaultSequence);
        const apiSpec = openapi_v3_1.createEmptyApiSpec();
        // Merge the OpenAPI `servers` spec from the config into the empty one
        if ((_a = config === null || config === void 0 ? void 0 : config.openApiSpec) === null || _a === void 0 ? void 0 : _a.servers) {
            Object.assign(apiSpec, { servers: config.openApiSpec.servers });
        }
        app.bind(keys_1.RestBindings.API_SPEC).to(apiSpec);
    }
};
RestComponent = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(core_1.CoreBindings.APPLICATION_INSTANCE)),
    tslib_1.__param(1, context_1.inject(keys_1.RestBindings.CONFIG)),
    tslib_1.__metadata("design:paramtypes", [core_1.Application, Object])
], RestComponent);
exports.RestComponent = RestComponent;
//# sourceMappingURL=rest.component.js.map