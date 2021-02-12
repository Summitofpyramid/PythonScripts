"use strict";
// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveHasOneMetadata = void 0;
const tslib_1 = require("tslib");
const debug_1 = tslib_1.__importDefault(require("debug"));
const lodash_1 = require("lodash");
const errors_1 = require("../../errors");
const type_resolver_1 = require("../../type-resolver");
const relation_types_1 = require("../relation.types");
const debug = debug_1.default('loopback:repository:has-one-helpers');
/**
 * Resolves given hasOne metadata if target is specified to be a resolver.
 * Mainly used to infer what the `keyTo` property should be from the target's
 * hasOne metadata
 * @param relationMeta - hasOne metadata to resolve
 * @internal
 */
function resolveHasOneMetadata(relationMeta) {
    if (relationMeta.type !== relation_types_1.RelationType.hasOne) {
        const reason = 'relation type must be HasOne';
        throw new errors_1.InvalidRelationError(reason, relationMeta);
    }
    if (!type_resolver_1.isTypeResolver(relationMeta.target)) {
        const reason = 'target must be a type resolver';
        throw new errors_1.InvalidRelationError(reason, relationMeta);
    }
    const targetModel = relationMeta.target();
    const targetModelProperties = targetModel.definition && targetModel.definition.properties;
    const sourceModel = relationMeta.source;
    if (!sourceModel || !sourceModel.modelName) {
        const reason = 'source model must be defined';
        throw new errors_1.InvalidRelationError(reason, relationMeta);
    }
    // keyFrom defaults to id property
    let keyFrom;
    if (relationMeta.keyFrom &&
        relationMeta.source.definition.properties[relationMeta.keyFrom]) {
        keyFrom = relationMeta.keyFrom;
    }
    else {
        keyFrom = sourceModel.getIdProperties()[0];
    }
    // Make sure that if it already keys to the foreign key property,
    // the key exists in the target model
    if (relationMeta.keyTo && targetModelProperties[relationMeta.keyTo]) {
        // The explicit cast is needed because of a limitation of type inference
        return Object.assign(relationMeta, { keyFrom });
    }
    debug('Resolved model %s from given metadata: %o', targetModel.modelName, targetModel);
    const defaultFkName = lodash_1.camelCase(sourceModel.modelName + '_id');
    const hasDefaultFkProperty = targetModelProperties[defaultFkName];
    if (!hasDefaultFkProperty) {
        const reason = `target model ${targetModel.name} is missing definition of foreign key ${defaultFkName}`;
        throw new errors_1.InvalidRelationError(reason, relationMeta);
    }
    return Object.assign(relationMeta, { keyFrom, keyTo: defaultFkName });
}
exports.resolveHasOneMetadata = resolveHasOneMetadata;
//# sourceMappingURL=has-one.helpers.js.map