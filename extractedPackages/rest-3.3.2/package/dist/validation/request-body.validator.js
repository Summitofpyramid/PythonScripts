"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const openapi_v3_1 = require("@loopback/openapi-v3");
const debug_1 = tslib_1.__importDefault(require("debug"));
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const util_1 = tslib_1.__importDefault(require("util"));
const __1 = require("..");
const ajv_factory_provider_1 = require("./ajv-factory.provider");
const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');
const debug = debug_1.default('loopback:rest:validation');
/**
 * Check whether the request body is valid according to the provided OpenAPI schema.
 * The JSON schema is generated from the OpenAPI schema which is typically defined
 * by `@requestBody()`.
 * The validation leverages AJV schema validator.
 * @param body - The request body parsed from an HTTP request.
 * @param requestBodySpec - The OpenAPI requestBody specification defined in `@requestBody()`.
 * @param globalSchemas - The referenced schemas generated from `OpenAPISpec.components.schemas`.
 * @param options - Request body validation options for AJV
 */
async function validateRequestBody(body, requestBodySpec, globalSchemas = {}, options = {}) {
    const required = requestBodySpec === null || requestBodySpec === void 0 ? void 0 : requestBodySpec.required;
    if (required && body.value == null) {
        const err = Object.assign(new __1.HttpErrors.BadRequest('Request body is required'), {
            code: 'MISSING_REQUIRED_PARAMETER',
            parameterName: 'request body',
        });
        throw err;
    }
    const schema = body.schema;
    /* istanbul ignore if */
    if (debug.enabled) {
        debug('Request body schema:', util_1.default.inspect(schema, { depth: null }));
        if (schema &&
            openapi_v3_1.isReferenceObject(schema) &&
            schema.$ref.startsWith('#/components/schemas/')) {
            const ref = schema.$ref.slice('#/components/schemas/'.length);
            debug('  referencing:', util_1.default.inspect(globalSchemas[ref], { depth: null }));
        }
    }
    if (!schema)
        return;
    options = { coerceTypes: !!body.coercionRequired, ...options };
    await validateValueAgainstSchema(body.value, schema, globalSchemas, options);
}
exports.validateRequestBody = validateRequestBody;
/**
 * Convert an OpenAPI schema to the corresponding JSON schema.
 * @param openapiSchema - The OpenAPI schema to convert.
 */
function convertToJsonSchema(openapiSchema) {
    const jsonSchema = toJsonSchema(openapiSchema);
    delete jsonSchema['$schema'];
    /* istanbul ignore if */
    if (debug.enabled) {
        debug('Converted OpenAPI schema to JSON schema: %s', util_1.default.inspect(jsonSchema, { depth: null }));
    }
    return jsonSchema;
}
/**
 * Built-in cache for complied schemas by AJV
 */
const DEFAULT_COMPILED_SCHEMA_CACHE = new WeakMap();
/**
 * Build a cache key for AJV options
 * @param options - Request body validation options
 */
function getKeyForOptions(options) {
    const ajvOptions = {};
    // Sort keys for options
    const keys = Object.keys(options).sort();
    for (const k of keys) {
        if (k === 'compiledSchemaCache')
            continue;
        ajvOptions[k] = options[k];
    }
    return JSON.stringify(ajvOptions);
}
/**
 * Validate the request body data against JSON schema.
 * @param body - The request body data.
 * @param schema - The JSON schema used to perform the validation.
 * @param globalSchemas - Schema references.
 * @param options - Request body validation options.
 */
async function validateValueAgainstSchema(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
body, schema, globalSchemas = {}, options = {}) {
    var _a, _b;
    let validate;
    const cache = (_a = options.compiledSchemaCache) !== null && _a !== void 0 ? _a : DEFAULT_COMPILED_SCHEMA_CACHE;
    const key = getKeyForOptions(options);
    let validatorMap;
    if (cache.has(schema)) {
        validatorMap = cache.get(schema);
        validate = validatorMap.get(key);
    }
    if (!validate) {
        const ajvFactory = (_b = options.ajvFactory) !== null && _b !== void 0 ? _b : new ajv_factory_provider_1.AjvFactoryProvider(options).value();
        const ajvInst = ajvFactory(options);
        validate = createValidator(schema, globalSchemas, ajvInst);
        validatorMap = validatorMap !== null && validatorMap !== void 0 ? validatorMap : new Map();
        validatorMap.set(key, validate);
        cache.set(schema, validatorMap);
    }
    let validationErrors = [];
    try {
        const validationResult = await validate(body);
        // When body is optional & values is empty / null, ajv returns null
        if (validationResult || validationResult === null) {
            debug('Request body passed AJV validation.');
            return;
        }
    }
    catch (error) {
        validationErrors = error.errors;
    }
    /* istanbul ignore if */
    if (debug.enabled) {
        debug('Invalid request body: %s. Errors: %s', util_1.default.inspect(body, { depth: null }), util_1.default.inspect(validationErrors));
    }
    if (typeof options.ajvErrorTransformer === 'function') {
        validationErrors = options.ajvErrorTransformer(validationErrors);
    }
    const error = __1.RestHttpErrors.invalidRequestBody();
    error.details = lodash_1.default.map(validationErrors, e => {
        return {
            path: e.dataPath,
            code: e.keyword,
            message: e.message,
            info: e.params,
        };
    });
    throw error;
}
/**
 * Create a validate function for the given schema
 * @param schema - JSON schema for the target
 * @param globalSchemas - Global schemas
 * @param ajvInst - An instance of Ajv
 */
function createValidator(schema, globalSchemas = {}, ajvInst) {
    const jsonSchema = convertToJsonSchema(schema);
    // Clone global schemas to set `$async: true` flag
    const schemas = {};
    for (const name in globalSchemas) {
        // See https://github.com/strongloop/loopback-next/issues/4939
        schemas[name] = { ...globalSchemas[name], $async: true };
    }
    const schemaWithRef = { components: { schemas }, ...jsonSchema };
    // See https://ajv.js.org/#asynchronous-validation for async validation
    schemaWithRef.$async = true;
    return ajvInst.compile(schemaWithRef);
}
//# sourceMappingURL=request-body.validator.js.map