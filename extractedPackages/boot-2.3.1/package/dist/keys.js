"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootTags = exports.BootBindings = void 0;
const context_1 = require("@loopback/context");
/**
 * Namespace for boot related binding keys
 */
var BootBindings;
(function (BootBindings) {
    /**
     * Binding key for boot options
     */
    BootBindings.BOOT_OPTIONS = context_1.BindingKey.create('boot.options');
    /**
     * Binding key for determining project root directory
     */
    BootBindings.PROJECT_ROOT = context_1.BindingKey.create('boot.project_root');
    /**
     * Binding key for binding the BootStrapper class
     */
    BootBindings.BOOTSTRAPPER_KEY = context_1.BindingKey.create('application.bootstrapper');
    BootBindings.BOOTER_PREFIX = 'booters';
})(BootBindings = exports.BootBindings || (exports.BootBindings = {}));
/**
 * Namespace for boot related tags
 */
var BootTags;
(function (BootTags) {
    BootTags.BOOTER = 'booter';
    /**
     * @deprecated Use `BootTags.BOOTER` instead.
     */
    BootTags.BOOTER_TAG = BootTags.BOOTER;
})(BootTags = exports.BootTags || (exports.BootTags = {}));
//# sourceMappingURL=keys.js.map