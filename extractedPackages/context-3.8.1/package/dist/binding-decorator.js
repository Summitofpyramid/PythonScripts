"use strict";
// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.bind = void 0;
const metadata_1 = require("@loopback/metadata");
const binding_inspector_1 = require("./binding-inspector");
/**
 * Decorator factory for `@bind`
 */
class BindDecoratorFactory extends metadata_1.ClassDecoratorFactory {
    mergeWithInherited(inherited, target) {
        if (inherited) {
            return {
                templates: [
                    ...inherited.templates,
                    binding_inspector_1.removeNameAndKeyTags,
                    ...this.spec.templates,
                ],
                target: this.spec.target,
            };
        }
        else {
            this.withTarget(this.spec, target);
            return this.spec;
        }
    }
    mergeWithOwn(ownMetadata) {
        return {
            templates: [...ownMetadata.templates, ...this.spec.templates],
            target: this.spec.target,
        };
    }
    withTarget(spec, target) {
        spec.target = target;
        return spec;
    }
}
/**
 * Decorate a class with binding configuration
 *
 * @example
 * ```ts
 * @bind((binding) => {binding.inScope(BindingScope.SINGLETON).tag('controller')}
 * )
 * export class MyController {
 * }
 * ```
 *
 * @param specs - A list of binding scope/tags or template functions to
 * configure the binding
 */
function bind(...specs) {
    const templateFunctions = specs.map(t => {
        if (typeof t === 'function') {
            return t;
        }
        else {
            return binding_inspector_1.asBindingTemplate(t);
        }
    });
    return (target) => {
        const cls = target;
        const spec = {
            templates: [binding_inspector_1.asClassOrProvider(cls), ...templateFunctions],
            target: cls,
        };
        const decorator = BindDecoratorFactory.createDecorator(binding_inspector_1.BINDING_METADATA_KEY, spec, { decoratorName: '@bind' });
        decorator(target);
    };
}
exports.bind = bind;
(function (bind) {
    /**
     * `@bind.provider` to denote a provider class
     *
     * A list of binding scope/tags or template functions to configure the binding
     */
    function provider(...specs) {
        return (target) => {
            if (!binding_inspector_1.isProviderClass(target)) {
                throw new Error(`Target ${target} is not a Provider`);
            }
            bind(
            // Set up the default for providers
            binding_inspector_1.asProvider(target), 
            // Call other template functions
            ...specs)(target);
        };
    }
    bind.provider = provider;
})(bind = exports.bind || (exports.bind = {}));
//# sourceMappingURL=binding-decorator.js.map