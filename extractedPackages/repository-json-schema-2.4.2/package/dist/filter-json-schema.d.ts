import { Model } from '@loopback/repository';
import { JSONSchema7 as JsonSchema } from 'json-schema';
export interface FilterSchemaOptions {
    /**
     * Set this flag if you want the schema to set generated title property.
     *
     * By default the setting is enabled. (e.g. {setTitle: true})
     *
     */
    setTitle?: boolean;
    /**
     * To exclude one or more property from `filter`
     */
    exclude?: string[] | string;
}
/**
 * Build a JSON schema describing the format of the "scope" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export declare function getScopeFilterJsonSchemaFor(modelCtor: typeof Model, options?: FilterSchemaOptions): JsonSchema;
/**
 * Build a JSON schema describing the format of the "filter" object
 * used to query model instances.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 * @param options - Options to build the filter schema.
 */
export declare function getFilterJsonSchemaFor(modelCtor: typeof Model, options?: FilterSchemaOptions): JsonSchema;
/**
 * Build a JSON schema describing the format of the "where" object
 * used to filter model instances to query, update or delete.
 *
 * Note we don't take the model properties into account yet and return
 * a generic json schema allowing any "where" condition.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export declare function getWhereJsonSchemaFor(modelCtor: typeof Model, options?: FilterSchemaOptions): JsonSchema;
/**
 * Build a JSON schema describing the format of the "fields" object
 * used to include or exclude properties of model instances.
 *
 * @param modelCtor - The model constructor to build the filter schema for.
 */
export declare function getFieldsJsonSchemaFor(modelCtor: typeof Model, options?: FilterSchemaOptions): JsonSchema;
