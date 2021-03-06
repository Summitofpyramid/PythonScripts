"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmptyApiSpec = void 0;
const tslib_1 = require("tslib");
// Export also all spec interfaces
tslib_1.__exportStar(require("openapi3-ts"), exports);
/**
 * Create an empty OpenApiSpec object that's still a valid openapi document.
 *
 * @deprecated Use `OpenApiBuilder` from `openapi3-ts` instead.
 */
function createEmptyApiSpec() {
    return {
        openapi: '3.0.0',
        info: {
            title: 'LoopBack Application',
            version: '1.0.0',
        },
        paths: {},
        servers: [{ url: '/' }],
    };
}
exports.createEmptyApiSpec = createEmptyApiSpec;
//# sourceMappingURL=types.js.map