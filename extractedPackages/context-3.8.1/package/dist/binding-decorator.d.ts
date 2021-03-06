import { BindingSpec } from './binding-inspector';
import { Constructor } from './value-promise';
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
export declare function bind(...specs: BindingSpec[]): ClassDecorator;
export declare namespace bind {
    /**
     * `@bind.provider` to denote a provider class
     *
     * A list of binding scope/tags or template functions to configure the binding
     */
    function provider(...specs: BindingSpec[]): (target: Constructor<unknown>) => void;
}
