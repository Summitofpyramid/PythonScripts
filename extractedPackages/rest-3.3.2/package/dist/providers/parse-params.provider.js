"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const body_parsers_1 = require("../body-parsers");
const keys_1 = require("../keys");
const parser_1 = require("../parser");
/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @returns The handler function that will parse request args.
 */
let ParseParamsProvider = class ParseParamsProvider {
    constructor(requestBodyParser, validationOptions = {}, ajvFactory) {
        this.requestBodyParser = requestBodyParser;
        this.validationOptions = validationOptions;
        this.ajvFactory = ajvFactory;
    }
    value() {
        return (request, route) => parser_1.parseOperationArgs(request, route, this.requestBodyParser, {
            ajvFactory: this.ajvFactory,
            ...this.validationOptions,
        });
    }
};
ParseParamsProvider = tslib_1.__decorate([
    tslib_1.__param(0, context_1.inject(keys_1.RestBindings.REQUEST_BODY_PARSER)),
    tslib_1.__param(1, context_1.inject(keys_1.RestBindings.REQUEST_BODY_PARSER_OPTIONS.deepProperty('validation'), { optional: true })),
    tslib_1.__param(2, context_1.inject(keys_1.RestBindings.AJV_FACTORY, { optional: true })),
    tslib_1.__metadata("design:paramtypes", [body_parsers_1.RequestBodyParser, Object, Function])
], ParseParamsProvider);
exports.ParseParamsProvider = ParseParamsProvider;
//# sourceMappingURL=parse-params.provider.js.map