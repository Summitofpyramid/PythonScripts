"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestExplorerBindings = void 0;
const context_1 = require("@loopback/context");
/**
 * Binding keys used by this component.
 */
var RestExplorerBindings;
(function (RestExplorerBindings) {
    /**
     * Binding key for RestExplorerComponent
     */
    RestExplorerBindings.COMPONENT = context_1.BindingKey.create('components.RestExplorerComponent');
    /**
     * Binding key for configuration of RestExplorerComponent.
     *
     * We recommend `ctx.configure(RestExplorerBindings.COMPONENT)` to be used
     * instead of `ctx.bind(RestExplorerBindings.CONFIG)`.
     */
    RestExplorerBindings.CONFIG = context_1.BindingKey.buildKeyForConfig(RestExplorerBindings.COMPONENT);
})(RestExplorerBindings = exports.RestExplorerBindings || (exports.RestExplorerBindings = {}));
//# sourceMappingURL=rest-explorer.keys.js.map