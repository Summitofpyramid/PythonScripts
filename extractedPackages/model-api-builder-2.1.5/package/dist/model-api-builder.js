"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/model-api-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.asModelApiBuilder = exports.MODEL_API_BUILDER_PLUGINS = void 0;
const core_1 = require("@loopback/core");
/**
 * Extension Point name for Model API builders.
 */
exports.MODEL_API_BUILDER_PLUGINS = 'model-api-builders';
/**
 * A binding template for model API extensions
 */
exports.asModelApiBuilder = binding => {
    core_1.extensionFor(exports.MODEL_API_BUILDER_PLUGINS)(binding);
    binding.tag({ namespace: 'model-api-builders' });
};
//# sourceMappingURL=model-api-builder.js.map