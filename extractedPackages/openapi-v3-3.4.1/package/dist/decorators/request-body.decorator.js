"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestBody = exports.REQUEST_BODY_INDEX = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@loopback/core");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const util_1 = require("util");
const generate_schema_1 = require("../generate-schema");
const keys_1 = require("../keys");
const debug = require('debug')('loopback:openapi3:metadata:requestbody');
exports.REQUEST_BODY_INDEX = 'x-parameter-index';
/**
 * Describe the request body of a Controller method parameter.
 *
 * A typical OpenAPI requestBody spec contains property:
 * - `description`
 * - `required`
 * - `content`.
 *
 * @example
 * ```ts
 * requestBodySpec: {
 *   description: 'a user',
 *   required: true,
 *   content: {
 *     'application/json': {...schemaSpec},
 *     'application/text': {...schemaSpec},
 *   },
 * }
 * ```
 *
 * If the `content` object is not provided, this decorator sets it
 * as `application/json` by default.
 * If the `schema` object is not provided in a media type, this decorator
 * generates it for you based on the argument's type. In this case, please
 * make sure the argument type is a class decorated by `@model` from
 * `@loopback/repository`
 *
 * The simplest usage is:
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody() user: User) {}
 * }
 * ```
 *
 * or with properties other than `content`
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody({description: 'a user'}) user: User) {}
 * }
 * ```
 *
 * or to be more complicated, with your customized media type
 *
 * ```ts
 * class MyController {
 *   @post('/User')
 *   async create(@requestBody({
 *     description: 'a user',
 *     // leave the schema as empty object, the decorator will generate it.
 *     content: {'application/text': {}}
 *   }) user: User) {}
 * }
 * ```
 *
 * @param requestBodySpec - The complete requestBody object or partial of it.
 * "partial" for allowing no `content` in spec, for example:
 * ```
 * @requestBody({description: 'a request body'}) user: User
 * ```
 */
function requestBody(requestBodySpec) {
    return function (target, member, index) {
        debug('@requestBody() on %s.%s', target.constructor.name, member);
        debug('  parameter index: %s', index);
        /* istanbul ignore if */
        if (debug.enabled)
            debug('  options: %s', util_1.inspect(requestBodySpec, { depth: null }));
        // Use 'application/json' as default content if `requestBody` is undefined
        requestBodySpec = requestBodySpec !== null && requestBodySpec !== void 0 ? requestBodySpec : { content: {} };
        if (lodash_1.default.isEmpty(requestBodySpec.content))
            requestBodySpec.content = { 'application/json': {} };
        // Get the design time method parameter metadata
        const methodSig = core_1.MetadataInspector.getDesignTypeForMethod(target, member);
        const paramTypes = (methodSig === null || methodSig === void 0 ? void 0 : methodSig.parameterTypes) || [];
        const paramType = paramTypes[index];
        const schema = generate_schema_1.resolveSchema(paramType);
        /* istanbul ignore if */
        if (debug.enabled)
            debug('  inferred schema: %s', util_1.inspect(schema, { depth: null }));
        requestBodySpec.content = lodash_1.default.mapValues(requestBodySpec.content, c => {
            if (!c.schema) {
                c.schema = schema;
            }
            return c;
        });
        // The default position for request body argument is 0
        // if not, add extension 'x-parameter-index' to specify the position
        if (index !== 0) {
            requestBodySpec[exports.REQUEST_BODY_INDEX] = index;
        }
        /* istanbul ignore if */
        if (debug.enabled)
            debug('  final spec: ', util_1.inspect(requestBodySpec, { depth: null }));
        core_1.ParameterDecoratorFactory.createDecorator(keys_1.OAI3Keys.REQUEST_BODY_KEY, requestBodySpec, { decoratorName: '@requestBody' })(target, member, index);
    };
}
exports.requestBody = requestBody;
(function (requestBody) {
    /**
     * Define a requestBody of `array` type.
     *
     * @example
     * ```ts
     * export class MyController {
     *   @post('/greet')
     *   greet(@requestBody.array(
     *     {schema: {type: 'string'}},
     *     {description: 'an array of names', required: false}
     *   ) names: string[]): string {
     *     return `Hello, ${names}`;
     *   }
     * }
     * ```
     *
     * @param properties - The requestBody properties other than `content`
     * @param itemSpec - the full item object
     */
    requestBody.array = (itemSpec, properties) => {
        return requestBody({
            ...properties,
            content: {
                'application/json': {
                    schema: { type: 'array', items: itemSpec },
                },
            },
        });
    };
    /**
     * Define a requestBody of `file` type. This is used to support
     * multipart/form-data based file upload. Use `@requestBody` for other content
     * types.
     *
     * {@link https://swagger.io/docs/specification/describing-request-body/file-upload | OpenAPI file upload}
     *
     * @example
     * import {Request} from '@loopback/rest';
     *
     * ```ts
     * class MyController {
     *   @post('/pictures')
     *   upload(
     *     @requestBody.file()
     *     request: Request,
     *   ) {
     *     // ...
     *   }
     * }
     * ```
     *
     * @param properties - Optional description and required flag
     */
    requestBody.file = (properties) => {
        return requestBody({
            description: 'Request body for multipart/form-data based file upload',
            required: true,
            content: {
                // Media type for file upload
                'multipart/form-data': {
                    // Skip body parsing
                    'x-parser': 'stream',
                    schema: {
                        type: 'object',
                        properties: {
                            file: {
                                type: 'string',
                                // This is required by OpenAPI spec 3.x for file upload
                                format: 'binary',
                            },
                        },
                    },
                },
            },
            ...properties,
        });
    };
})(requestBody = exports.requestBody || (exports.requestBody = {}));
//# sourceMappingURL=request-body.decorator.js.map