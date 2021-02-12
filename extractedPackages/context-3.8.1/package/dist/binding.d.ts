/// <reference types="node" />
import { EventEmitter } from 'events';
import { BindingAddress } from './binding-key';
import { Context } from './context';
import { JSONObject } from './json-types';
import { Provider } from './provider';
import { ResolutionContext, ResolutionOptions, ResolutionSession } from './resolution-session';
import { BoundValue, Constructor, MapObject, ValueOrPromise } from './value-promise';
/**
 * Scope for binding values
 */
export declare enum BindingScope {
    /**
     * The binding provides a value that is calculated each time. This will be
     * the default scope if not set.
     *
     * For example, with the following context hierarchy:
     *
     * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
     *   - req1
     *   - req2
     *
     * Now `'b1'` is resolved to a new value each time for `app` and its
     * descendants `req1` and `req2`:
     * - app.get('b1') ==> 0
     * - req1.get('b1') ==> 1
     * - req2.get('b1') ==> 2
     * - req2.get('b1') ==> 3
     * - app.get('b1') ==> 4
     */
    TRANSIENT = "Transient",
    /**
     * The binding provides a value as a singleton within each local context. The
     * value is calculated only once per context and cached for subsequential
     * uses. Child contexts have their own value and do not share with their
     * ancestors.
     *
     * For example, with the following context hierarchy:
     *
     * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
     *   - req1
     *   - req2
     *
     * 1. `0` is the resolved value for `'b1'` within the `app` afterward
     * - app.get('b1') ==> 0 (always)
     *
     * 2. `'b1'` is resolved in `app` but not in `req1`, a new value `1` is
     * calculated and used for `req1` afterward
     * - req1.get('b1') ==> 1 (always)
     *
     * 3. `'b1'` is resolved in `app` but not in `req2`, a new value `2` is
     * calculated and used for `req2` afterward
     * - req2.get('b1') ==> 2 (always)
     */
    CONTEXT = "Context",
    /**
     * The binding provides a value as a singleton within the context hierarchy
     * (the owning context and its descendants). The value is calculated only
     * once for the owning context and cached for subsequential uses. Child
     * contexts share the same value as their ancestors.
     *
     * For example, with the following context hierarchy:
     *
     * - `app` (with a binding `'b1'` that produces sequential values 0, 1, ...)
     *   - req1
     *   - req2
     *
     * 1. `0` is the singleton for `app` afterward
     * - app.get('b1') ==> 0 (always)
     *
     * 2. `'b1'` is resolved in `app`, reuse it for `req1`
     * - req1.get('b1') ==> 0 (always)
     *
     * 3. `'b1'` is resolved in `app`, reuse it for `req2`
     * - req2.get('b1') ==> 0 (always)
     */
    SINGLETON = "Singleton"
}
/**
 * Type of the binding source
 */
export declare enum BindingType {
    /**
     * A fixed value
     */
    CONSTANT = "Constant",
    /**
     * A function to get the value
     */
    DYNAMIC_VALUE = "DynamicValue",
    /**
     * A class to be instantiated as the value
     */
    CLASS = "Class",
    /**
     * A provider class with `value()` function to get the value
     */
    PROVIDER = "Provider",
    /**
     * A alias to another binding key with optional path
     */
    ALIAS = "Alias"
}
/**
 * Binding source for `to`
 */
export declare type ConstantBindingSource<T> = {
    type: BindingType.CONSTANT;
    value: T;
};
/**
 * Binding source for `toDynamicValue`
 */
export declare type DynamicValueBindingSource<T> = {
    type: BindingType.DYNAMIC_VALUE;
    value: ValueFactory<T> | DynamicValueProviderClass<T>;
};
/**
 * Binding source for `toClass`
 */
export declare type ClassBindingSource<T> = {
    type: BindingType.CLASS;
    value: Constructor<T>;
};
/**
 * Binding source for `toProvider`
 */
export declare type ProviderBindingSource<T> = {
    type: BindingType.PROVIDER;
    value: Constructor<Provider<T>>;
};
/**
 * Binding source for `toAlias`
 */
export declare type AliasBindingSource<T> = {
    type: BindingType.ALIAS;
    value: BindingAddress<T>;
};
/**
 * Source for the binding, including the type and value
 */
export declare type BindingSource<T> = ConstantBindingSource<T> | DynamicValueBindingSource<T> | ClassBindingSource<T> | ProviderBindingSource<T> | AliasBindingSource<T>;
export declare type TagMap = MapObject<any>;
/**
 * Binding tag can be a simple name or name/value pairs
 */
export declare type BindingTag = TagMap | string;
/**
 * A function as the template to configure bindings
 */
export declare type BindingTemplate<T = unknown> = (binding: Binding<T>) => void;
/**
 * Information for a binding event
 */
export declare type BindingEvent = {
    /**
     * Event type
     */
    type: string;
    /**
     * Source binding that emits the event
     */
    binding: Readonly<Binding<unknown>>;
    /**
     * Operation that triggers the event
     */
    operation: string;
};
/**
 * Event listeners for binding events
 */
export declare type BindingEventListener = (
/**
 * Binding event
 */
event: BindingEvent) => void;
/**
 * A factory function for `toDynamicValue`
 */
export declare type ValueFactory<T = unknown> = (resolutionCtx: ResolutionContext) => ValueOrPromise<T | undefined>;
/**
 * A class with a static `value` method as the factory function for
 * `toDynamicValue`.
 *
 * @example
 * ```ts
 * import {inject} from '@loopback/context';
 *
 * export class DynamicGreetingProvider {
 *   static value(@inject('currentUser') user: string) {
 *     return `Hello, ${user}`;
 *   }
 * }
 * ```
 */
export interface DynamicValueProviderClass<T = unknown> extends Constructor<unknown>, Function {
    value: (...args: BoundValue[]) => ValueOrPromise<T>;
}
/**
 * Check if the factory is a value factory provider class
 * @param factory - A factory function or a dynamic value provider class
 */
export declare function isDynamicValueProviderClass<T = unknown>(factory: unknown): factory is DynamicValueProviderClass<T>;
/**
 * Binding represents an entry in the `Context`. Each binding has a key and a
 * corresponding value getter.
 */
export declare class Binding<T = BoundValue> extends EventEmitter {
    isLocked: boolean;
    /**
     * Key of the binding
     */
    readonly key: string;
    /**
     * Map for tag name/value pairs
     */
    readonly tagMap: TagMap;
    private _scope?;
    /**
     * Scope of the binding to control how the value is cached/shared
     */
    get scope(): BindingScope;
    /**
     * Type of the binding value getter
     */
    get type(): BindingType | undefined;
    private _cache;
    private _getValue?;
    /**
     * The original source value received from `to`, `toClass`, `toDynamicValue`,
     * `toProvider`, or `toAlias`.
     */
    private _source?;
    get source(): ConstantBindingSource<T> | DynamicValueBindingSource<T> | ClassBindingSource<T> | ProviderBindingSource<T> | AliasBindingSource<T> | undefined;
    /**
     * For bindings bound via `toClass()`, this property contains the constructor
     * function of the class
     */
    get valueConstructor(): Constructor<T> | undefined;
    /**
     * For bindings bound via `toProvider()`, this property contains the
     * constructor function of the provider class
     */
    get providerConstructor(): Constructor<Provider<T>> | undefined;
    constructor(key: BindingAddress<T>, isLocked?: boolean);
    /**
     * Cache the resolved value by the binding scope
     * @param ctx - The current context
     * @param result - The calculated value for the binding
     */
    private _cacheValue;
    /**
     * Clear the cache
     */
    private _clearCache;
    /**
     * Invalidate the binding cache so that its value will be reloaded next time.
     * This is useful to force reloading a singleton when its configuration or
     * dependencies are changed.
     * **WARNING**: The state held in the cached value will be gone.
     *
     * @param ctx - Context object
     */
    refresh(ctx: Context): void;
    /**
     * This is an internal function optimized for performance.
     * Users should use `@inject(key)` or `ctx.get(key)` instead.
     *
     * Get the value bound to this key. Depending on `isSync`, this
     * function returns either:
     *  - the bound value
     *  - a promise of the bound value
     *
     * Consumers wishing to consume sync values directly should use `isPromiseLike`
     * to check the type of the returned value to decide how to handle it.
     *
     * @example
     * ```
     * const result = binding.getValue(ctx);
     * if (isPromiseLike(result)) {
     *   result.then(doSomething)
     * } else {
     *   doSomething(result);
     * }
     * ```
     *
     * @param ctx - Context for the resolution
     * @param session - Optional session for binding and dependency resolution
     */
    getValue(ctx: Context, session?: ResolutionSession): ValueOrPromise<T>;
    /**
     * Returns a value or promise for this binding in the given context. The
     * resolved value can be `undefined` if `optional` is set to `true` in
     * `options`.
     * @param ctx - Context for the resolution
     * @param options - Optional options for binding and dependency resolution
     */
    getValue(ctx: Context, options?: ResolutionOptions): ValueOrPromise<T | undefined>;
    /**
     * Lock the binding so that it cannot be rebound
     */
    lock(): this;
    /**
     * Emit a `changed` event
     * @param operation - Operation that makes changes
     */
    private emitChangedEvent;
    /**
     * Tag the binding with names or name/value objects. A tag has a name and
     * an optional value. If not supplied, the tag name is used as the value.
     *
     * @param tags - A list of names or name/value objects. Each
     * parameter can be in one of the following forms:
     * - string: A tag name without value
     * - string[]: An array of tag names
     * - TagMap: A map of tag name/value pairs
     *
     * @example
     * ```ts
     * // Add a named tag `controller`
     * binding.tag('controller');
     *
     * // Add two named tags: `controller` and `rest`
     * binding.tag('controller', 'rest');
     *
     * // Add two tags
     * // - `controller` (name = 'controller')
     * // `{name: 'my-controller'}` (name = 'name', value = 'my-controller')
     * binding.tag('controller', {name: 'my-controller'});
     *
     * ```
     */
    tag(...tags: BindingTag[]): this;
    /**
     * Get an array of tag names
     */
    get tagNames(): string[];
    /**
     * Set the binding scope
     * @param scope - Binding scope
     */
    inScope(scope: BindingScope): this;
    /**
     * Apply default scope to the binding. It only changes the scope if it's not
     * set yet
     * @param scope - Default binding scope
     */
    applyDefaultScope(scope: BindingScope): this;
    /**
     * Set the `_getValue` function
     * @param getValue - getValue function
     */
    private _setValueGetter;
    /**
     * Bind the key to a constant value. The value must be already available
     * at binding time, it is not allowed to pass a Promise instance.
     *
     * @param value - The bound value.
     *
     * @example
     *
     * ```ts
     * ctx.bind('appName').to('CodeHub');
     * ```
     */
    to(value: T): this;
    /**
     * Bind the key to a computed (dynamic) value.
     *
     * @param factoryFn - The factory function creating the value.
     *   Both sync and async functions are supported.
     *
     * @example
     *
     * ```ts
     * // synchronous
     * ctx.bind('now').toDynamicValue(() => Date.now());
     *
     * // asynchronous
     * ctx.bind('something').toDynamicValue(
     *  async () => Promise.delay(10).then(doSomething)
     * );
     * ```
     */
    toDynamicValue(factory: ValueFactory<T> | DynamicValueProviderClass<T>): this;
    /**
     * Bind the key to a value computed by a Provider.
     *
     * * @example
     *
     * ```ts
     * export class DateProvider implements Provider<Date> {
     *   constructor(@inject('stringDate') private param: String){}
     *   value(): Date {
     *     return new Date(param);
     *   }
     * }
     * ```
     *
     * @param provider - The value provider to use.
     */
    toProvider(providerClass: Constructor<Provider<T>>): this;
    /**
     * Bind the key to an instance of the given class.
     *
     * @param ctor - The class constructor to call. Any constructor
     *   arguments must be annotated with `@inject` so that
     *   we can resolve them from the context.
     */
    toClass(ctor: Constructor<T>): this;
    /**
     * Bind the key to an alias of another binding
     * @param keyWithPath - Target binding key with optional path,
     * such as `servers.RestServer.options#apiExplorer`
     */
    toAlias(keyWithPath: BindingAddress<T>): this;
    /**
     * Unlock the binding
     */
    unlock(): this;
    /**
     * Apply one or more template functions to set up the binding with scope,
     * tags, and other attributes as a group.
     *
     * @example
     * ```ts
     * const serverTemplate = (binding: Binding) =>
     *   binding.inScope(BindingScope.SINGLETON).tag('server');
     *
     * const serverBinding = new Binding<RestServer>('servers.RestServer1');
     * serverBinding.apply(serverTemplate);
     * ```
     * @param templateFns - One or more functions to configure the binding
     */
    apply(...templateFns: BindingTemplate<T>[]): this;
    /**
     * Convert to a plain JSON object
     */
    toJSON(): JSONObject;
    /**
     * Inspect the binding to return a json representation of the binding information
     * @param options - Options to control what information should be included
     */
    inspect(options?: BindingInspectOptions): JSONObject;
    /**
     * A static method to create a binding so that we can do
     * `Binding.bind('foo').to('bar');` as `new Binding('foo').to('bar')` is not
     * easy to read.
     * @param key - Binding key
     */
    static bind<T = unknown>(key: BindingAddress<T>): Binding<T>;
    /**
     * Create a configuration binding for the given key
     *
     * @example
     * ```ts
     * const configBinding = Binding.configure('servers.RestServer.server1')
     *   .to({port: 3000});
     * ```
     *
     * @typeParam T Generic type for the configuration value (not the binding to
     * be configured)
     *
     * @param key - Key for the binding to be configured
     */
    static configure<T = unknown>(key: BindingAddress): Binding<T>;
}
/**
 * Options for binding.inspect()
 */
export interface BindingInspectOptions {
    /**
     * The flag to control if injections should be inspected
     */
    includeInjections?: boolean;
}
