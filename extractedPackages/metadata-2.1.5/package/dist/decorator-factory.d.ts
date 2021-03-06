import { DecoratorType, MetadataKey, MetadataMap } from './types';
/**
 * Options for a decorator
 */
export interface DecoratorOptions {
    /**
     * Controls if inherited metadata will be honored. Default to `true`.
     */
    allowInheritance?: boolean;
    /**
     * Controls if the value of `spec` argument will be cloned. Sometimes we
     * use shared spec for the decoration, but the decorator function might need
     * to mutate the object. Cloning the input spec makes it safe to use the same
     * spec (`template`) to decorate different members.
     *
     * Default to `true`.
     */
    cloneInputSpec?: boolean;
    /**
     * Name of the decorator for debugging purpose, such as `@inject`
     */
    decoratorName?: string;
    [name: string]: any;
}
/**
 * Base factory class for decorator functions
 *
 * @example
 * ```
 * function classDecorator(spec: MySpec): ClassDecorator {
 *   return ClassDecoratorFactory.createDecorator('my-key', spec);
 * }
 * ```
 * or
 * ```
 * function classDecorator(spec: MySpec): ClassDecorator {
 *   const factory: ClassDecoratorFactory<MySpec>('my-key', spec);
 *   return factory.create();
 * }
 * ```
 * These functions above declare `@classDecorator` that can be used as follows:
 * ```
 * @classDecorator({x: 1})
 * class MyController {}
 * ```
 */
export declare class DecoratorFactory<T, // Type of the metadata spec for individual class/method/property/parameter
M extends T | MetadataMap<T> | MetadataMap<T[]>, // Type of the metadata
D extends DecoratorType> {
    protected key: string;
    protected spec: T;
    protected options: DecoratorOptions;
    protected decoratorName: string;
    /**
     * A constant to reference the target of a decoration
     */
    static TARGET: string;
    /**
     * Construct a new class decorator factory
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator. Default to
     * `{allowInheritance: true}` if not provided
     */
    constructor(key: string, spec: T, options?: DecoratorOptions);
    protected allowInheritance(): boolean;
    /**
     * Inherit metadata from base classes. By default, this method merges base
     * metadata into the spec if `allowInheritance` is set to `true`. To customize
     * the behavior, this method can be overridden by sub classes.
     *
     * @param inheritedMetadata - Metadata from base classes for the member
     */
    protected inherit(inheritedMetadata: T | undefined | null): T;
    /**
     * Get the qualified name of a decoration target. For example:
     * ```
     * class MyClass
     * MyClass.constructor[0] // First parameter of the constructor
     * MyClass.myStaticProperty
     * MyClass.myStaticMethod()
     * MyClass.myStaticMethod[0] // First parameter of the myStaticMethod
     * MyClass.prototype.myProperty
     * MyClass.prototype.myMethod()
     * MyClass.prototype.myMethod[1] // Second parameter of myMethod
     * ```
     * @param target - Class or prototype of a class
     * @param member - Optional property/method name
     * @param descriptorOrIndex - Optional method descriptor or parameter index
     */
    static getTargetName(target: Object, member?: string | symbol, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): string;
    /**
     * Get the number of parameters for a given constructor or method
     * @param target - Class or the prototype
     * @param member - Method name
     */
    static getNumberOfParameters(target: Object, member?: string): number;
    /**
     * Set a reference to the target class or prototype for a given spec if
     * it's an object
     * @param spec - Metadata spec
     * @param target - Target of the decoration. It is a class or the prototype of
     * a class.
     */
    withTarget(spec: T, target: Object): T;
    /**
     * Get the optional decoration target of a given spec
     * @param spec - Metadata spec
     */
    getTarget(spec: T): any;
    /**
     * This method is called by the default implementation of the decorator
     * function to merge the spec argument from the decoration with the inherited
     * metadata for a class, all properties, all methods, or all method
     * parameters that are decorated by this decorator.
     *
     * It MUST be overridden by subclasses to process inherited metadata.
     *
     * @param inheritedMetadata - Metadata inherited from the base classes
     * @param target - Decoration target
     * @param member - Optional property or method
     * @param descriptorOrIndex - Optional parameter index or method descriptor
     */
    protected mergeWithInherited(inheritedMetadata: M, target: Object, member?: string | symbol, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): M;
    /**
     * This method is called by the default implementation of the decorator
     * function to merge the spec argument from the decoration with the own
     * metadata for a class, all properties, all methods, or all method
     * parameters that are decorated by this decorator.
     *
     * It MUST be overridden by subclasses to process own metadata.
     *
     * @param ownMetadata - Own Metadata exists locally on the target
     * @param target - Decoration target
     * @param member - Optional property or method
     * @param descriptorOrIndex - Optional parameter index or method descriptor
     */
    protected mergeWithOwn(ownMetadata: M, target: Object, member?: string | symbol, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): M;
    /**
     * Create an error to report if the decorator is applied to the target more
     * than once
     * @param target - Decoration target
     * @param member - Optional property or method
     * @param descriptorOrIndex - Optional parameter index or method descriptor
     */
    protected duplicateDecorationError(target: Object, member?: string | symbol, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): Error;
    /**
     * Create a decorator function of the given type. Each sub class MUST
     * implement this method.
     */
    create(): D;
    /**
     * Base implementation of the decorator function
     * @param target - Decorator target
     * @param member - Optional property or method
     * @param descriptorOrIndex - Optional method descriptor or parameter index
     */
    protected decorate(target: Object, member?: string | symbol, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): void;
    /**
     * Create a decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    protected static _createDecorator<T, M extends T | MetadataMap<T> | MetadataMap<T[]>, D extends DecoratorType>(key: MetadataKey<T, D>, spec: T, options?: DecoratorOptions): D;
    private static _cloneableTypes;
    static cloneDeep<V>(val: Readonly<V>): V;
}
/**
 * Factory for class decorators
 */
export declare class ClassDecoratorFactory<T> extends DecoratorFactory<T, T, ClassDecorator> {
    protected mergeWithInherited(inheritedMetadata: T, target: Object, member?: string, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): T;
    protected mergeWithOwn(ownMetadata: T, target: Object, member?: string, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): T;
    create(): ClassDecorator;
    /**
     * Create a class decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    static createDecorator<T>(key: MetadataKey<T, ClassDecorator>, spec: T, options?: DecoratorOptions): ClassDecorator;
}
/**
 * Factory for property decorators
 */
export declare class PropertyDecoratorFactory<T> extends DecoratorFactory<T, MetadataMap<T>, PropertyDecorator> {
    protected mergeWithInherited(inheritedMetadata: MetadataMap<T>, target: Object, propertyName?: string, descriptorOrIndex?: TypedPropertyDescriptor<any> | number): MetadataMap<T>;
    protected mergeWithOwn(ownMetadata: MetadataMap<T>, target: Object, propertyName?: string, descriptorOrParameterIndex?: TypedPropertyDescriptor<any> | number): MetadataMap<T>;
    create(): PropertyDecorator;
    /**
     * Create a property decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    static createDecorator<T>(key: MetadataKey<T, PropertyDecorator>, spec: T, options?: DecoratorOptions): PropertyDecorator;
}
/**
 * Factory for method decorators
 */
export declare class MethodDecoratorFactory<T> extends DecoratorFactory<T, MetadataMap<T>, MethodDecorator> {
    protected mergeWithInherited(inheritedMetadata: MetadataMap<T>, target: Object, methodName?: string, methodDescriptor?: TypedPropertyDescriptor<any> | number): MetadataMap<T>;
    protected mergeWithOwn(ownMetadata: MetadataMap<T>, target: Object, methodName?: string, methodDescriptor?: TypedPropertyDescriptor<any> | number): MetadataMap<T>;
    create(): MethodDecorator;
    /**
     * Create a method decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    static createDecorator<T>(key: MetadataKey<T, MethodDecorator>, spec: T, options?: DecoratorOptions): MethodDecorator;
}
/**
 * Factory for parameter decorators
 */
export declare class ParameterDecoratorFactory<T> extends DecoratorFactory<T, MetadataMap<T[]>, ParameterDecorator> {
    private getOrInitMetadata;
    protected mergeWithInherited(inheritedMetadata: MetadataMap<T[]>, target: Object, methodName?: string, parameterIndex?: TypedPropertyDescriptor<any> | number): MetadataMap<T[]>;
    protected mergeWithOwn(ownMetadata: MetadataMap<T[]>, target: Object, methodName?: string, parameterIndex?: TypedPropertyDescriptor<any> | number): MetadataMap<T[]>;
    create(): ParameterDecorator;
    /**
     * Create a parameter decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    static createDecorator<T>(key: MetadataKey<T, ParameterDecorator>, spec: T, options?: DecoratorOptions): ParameterDecorator;
}
/**
 * Factory for method level parameter decorator.
 *
 * @example
 * For example, the following code uses `@param` to declare two parameters for
 * `greet()`.
 * ```ts
 * class MyController {
 *   @param('name') // Parameter 0
 *   @param('msg')  // Parameter 1
 *   greet() {}
 * }
 * ```
 */
export declare class MethodParameterDecoratorFactory<T> extends DecoratorFactory<T, MetadataMap<T[]>, MethodDecorator> {
    /**
     * Find the corresponding parameter index for the decoration
     * @param target
     * @param methodName
     * @param methodDescriptor
     */
    private getParameterIndex;
    protected mergeWithInherited(inheritedMetadata: MetadataMap<T[]>, target: Object, methodName?: string, methodDescriptor?: TypedPropertyDescriptor<any> | number): MetadataMap<T[]>;
    protected mergeWithOwn(ownMetadata: MetadataMap<T[]>, target: Object, methodName?: string, methodDescriptor?: TypedPropertyDescriptor<any> | number): MetadataMap<T[]>;
    create(): MethodDecorator;
    /**
     * Create a method decorator function
     * @param key - Metadata key
     * @param spec - Metadata object from the decorator function
     * @param options - Options for the decorator
     */
    static createDecorator<T>(key: MetadataKey<T, MethodDecorator>, spec: T, options?: DecoratorOptions): MethodDecorator;
}
/**
 *  Factory for an append-array of method-level decorators
 *  The `@response` metadata for a method is an array.
 *  Each item in the array should be a single value, containing
 *  a response code and a single spec or Model.  This should allow:
 *
 * @example
 * ```ts
 *  @response(200, MyFirstModel)
 *  @response(403, [NotAuthorizedReasonOne, NotAuthorizedReasonTwo])
 *  @response(404, NotFoundOne)
 *  @response(404, NotFoundTwo)
 *  @response(409, {schema: {}})
 *  public async myMethod() {}
 * ```
 *
 * In the case that a ResponseObject is passed, it becomes the
 * default for description/content, and if possible, further Models are
 * incorporated as a `oneOf: []` array.
 *
 * In the case that a ReferenceObject is passed, it and it alone is used, since
 * references can be external and we cannot `oneOf` their content.
 *
 * The factory creates and updates an array of items T[], and the getter
 * provides the values as that array.
 */
export declare class MethodMultiDecoratorFactory<T> extends MethodDecoratorFactory<T[]> {
    protected mergeWithInherited(inheritedMetadata: MetadataMap<T[]>, target: Object, methodName?: string): MetadataMap<T[]>;
    protected mergeWithOwn(ownMetadata: MetadataMap<T[]>, target: Object, methodName?: string, methodDescriptor?: TypedPropertyDescriptor<any> | number): MetadataMap<T[]>;
    private _mergeArray;
}
