import { Getter } from '@loopback/context';
import legacy from 'loopback-datasource-juggler';
import { AnyObject, Command, Count, DataObject, NamedParameters, Options, PositionalParameters } from '../common-types';
import { Entity, Model } from '../model';
import { Filter, FilterExcludingWhere, Inclusion, Where } from '../query';
import { BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory, InclusionResolver } from '../relations';
import { IsolationLevel, Transaction } from '../transaction';
import { EntityCrudRepository, TransactionalEntityRepository } from './repository';
export declare namespace juggler {
    export import DataSource = legacy.DataSource;
    export import ModelBase = legacy.ModelBase;
    export import ModelBaseClass = legacy.ModelBaseClass;
    export import PersistedModel = legacy.PersistedModel;
    export import KeyValueModel = legacy.KeyValueModel;
    export import PersistedModelClass = legacy.PersistedModelClass;
    export import Transaction = legacy.Transaction;
    export import IsolationLevel = legacy.IsolationLevel;
}
/**
 * This is a bridge to the legacy DAO class. The function mixes DAO methods
 * into a model class and attach it to a given data source
 * @param modelClass - Model class
 * @param ds - Data source
 * @returns {} The new model class with DAO (CRUD) operations
 */
export declare function bindModel<T extends juggler.ModelBaseClass>(modelClass: T, ds: juggler.DataSource): T;
/**
 * Ensure the value is a promise
 * @param p - Promise or void
 */
export declare function ensurePromise<T>(p: legacy.PromiseOrVoid<T>): Promise<T>;
/**
 * Default implementation of CRUD repository using legacy juggler model
 * and data source
 */
export declare class DefaultCrudRepository<T extends Entity, ID, Relations extends object = {}> implements EntityCrudRepository<T, ID, Relations> {
    entityClass: typeof Entity & {
        prototype: T;
    };
    dataSource: juggler.DataSource;
    modelClass: juggler.PersistedModelClass;
    readonly inclusionResolvers: Map<string, InclusionResolver<T, Entity>>;
    /**
     * Constructor of DefaultCrudRepository
     * @param entityClass - LoopBack 4 entity class
     * @param dataSource - Legacy juggler data source
     */
    constructor(entityClass: typeof Entity & {
        prototype: T;
    }, dataSource: juggler.DataSource);
    private ensurePersistedModel;
    /**
     * Creates a legacy persisted model class, attaches it to the datasource and
     * returns it. This method can be overriden in sub-classes to acess methods
     * and properties in the generated model class.
     * @param entityClass - LB4 Entity constructor
     */
    protected definePersistedModel(entityClass: typeof Model): typeof juggler.PersistedModel;
    private resolvePropertyType;
    /**
     * @deprecated
     * Function to create a constrained relation repository factory
     *
     * Use `this.createHasManyRepositoryFactoryFor()` instead
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected _createHasManyRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>): HasManyRepositoryFactory<Target, ForeignKeyType>;
    /**
     * Function to create a constrained relation repository factory
     *
     * @example
     * ```ts
     * class CustomerRepository extends DefaultCrudRepository<
     *   Customer,
     *   typeof Customer.prototype.id,
     *   CustomerRelations
     * > {
     *   public readonly orders: HasManyRepositoryFactory<Order, typeof Customer.prototype.id>;
     *
     *   constructor(
     *     protected db: juggler.DataSource,
     *     orderRepository: EntityCrudRepository<Order, typeof Order.prototype.id>,
     *   ) {
     *     super(Customer, db);
     *     this.orders = this._createHasManyRepositoryFactoryFor(
     *       'orders',
     *       orderRepository,
     *     );
     *   }
     * }
     * ```
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected createHasManyRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>): HasManyRepositoryFactory<Target, ForeignKeyType>;
    /**
     * @deprecated
     * Function to create a belongs to accessor
     *
     * Use `this.createBelongsToAccessorFor()` instead
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected _createBelongsToAccessorFor<Target extends Entity, TargetId>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>): BelongsToAccessor<Target, ID>;
    /**
     * Function to create a belongs to accessor
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected createBelongsToAccessorFor<Target extends Entity, TargetId>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetId>>): BelongsToAccessor<Target, ID>;
    /**
     * @deprecated
     * Function to create a constrained hasOne relation repository factory
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected _createHasOneRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>): HasOneRepositoryFactory<Target, ForeignKeyType>;
    /**
     * Function to create a constrained hasOne relation repository factory
     *
     * @param relationName - Name of the relation defined on the source model
     * @param targetRepo - Target repository instance
     */
    protected createHasOneRepositoryFactoryFor<Target extends Entity, TargetID, ForeignKeyType>(relationName: string, targetRepoGetter: Getter<EntityCrudRepository<Target, TargetID>>): HasOneRepositoryFactory<Target, ForeignKeyType>;
    create(entity: DataObject<T>, options?: Options): Promise<T>;
    createAll(entities: DataObject<T>[], options?: Options): Promise<T[]>;
    save(entity: T, options?: Options): Promise<T>;
    find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;
    findOne(filter?: Filter<T>, options?: Options): Promise<(T & Relations) | null>;
    findById(id: ID, filter?: FilterExcludingWhere<T>, options?: Options): Promise<T & Relations>;
    update(entity: T, options?: Options): Promise<void>;
    delete(entity: T, options?: Options): Promise<void>;
    updateAll(data: DataObject<T>, where?: Where<T>, options?: Options): Promise<Count>;
    updateById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
    replaceById(id: ID, data: DataObject<T>, options?: Options): Promise<void>;
    deleteAll(where?: Where<T>, options?: Options): Promise<Count>;
    deleteById(id: ID, options?: Options): Promise<void>;
    count(where?: Where<T>, options?: Options): Promise<Count>;
    exists(id: ID, options?: Options): Promise<boolean>;
    execute(command: Command, parameters: NamedParameters | PositionalParameters, options?: Options): Promise<AnyObject>;
    protected toEntity<R extends T>(model: juggler.PersistedModel): R;
    protected toEntities<R extends T>(models: juggler.PersistedModel[]): R[];
    /**
     * Register an inclusion resolver for the related model name.
     *
     * @param relationName - Name of the relation defined on the source model
     * @param resolver - Resolver function for getting related model entities
     */
    registerInclusionResolver(relationName: string, resolver: InclusionResolver<T, Entity>): void;
    /**
     * Returns model instances that include related models of this repository
     * that have a registered resolver.
     *
     * @param entities - An array of entity instances or data
     * @param include -Inclusion filter
     * @param options - Options for the operations
     */
    protected includeRelatedModels(entities: T[], include?: Inclusion[], options?: Options): Promise<(T & Relations)[]>;
    /**
     * This function works as a persist hook.
     * It converts an entity from the CRUD operations' caller
     * to a persistable data that can will be stored in the
     * back-end database.
     *
     * User can extend `DefaultCrudRepository` then override this
     * function to execute custom persist hook.
     * @param entity The entity passed from CRUD operations' caller.
     * @param options
     */
    protected entityToData<R extends T>(entity: R | DataObject<R>, options?: {}): Promise<legacy.ModelData<legacy.PersistedModel>>;
    /** Converts an entity object to a JSON object to check if it contains navigational property.
     * Throws an error if `entity` contains navigational property.
     *
     * @param entity The entity passed from CRUD operations' caller.
     * @param options
     */
    protected ensurePersistable<R extends T>(entity: R | DataObject<R>, options?: {}): legacy.ModelData<legacy.PersistedModel>;
    /**
     * Removes juggler's "include" filter as it does not apply to LoopBack 4
     * relations.
     *
     * @param filter - Query filter
     */
    protected normalizeFilter(filter?: Filter<T>): legacy.Filter | undefined;
}
/**
 * Default implementation of CRUD repository using legacy juggler model
 * and data source with beginTransaction() method for connectors which
 * support Transactions
 */
export declare class DefaultTransactionalRepository<T extends Entity, ID, Relations extends object = {}> extends DefaultCrudRepository<T, ID, Relations> implements TransactionalEntityRepository<T, ID, Relations> {
    beginTransaction(options?: IsolationLevel | Options): Promise<Transaction>;
}
