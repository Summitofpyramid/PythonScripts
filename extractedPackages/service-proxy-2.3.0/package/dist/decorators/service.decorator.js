"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceProxy = exports.ServiceProxyMetadata = exports.SERVICE_PROXY_KEY = void 0;
const context_1 = require("@loopback/context");
const __1 = require("..");
exports.SERVICE_PROXY_KEY = context_1.MetadataAccessor.create('service.proxy');
/**
 * Metadata for a service proxy
 */
class ServiceProxyMetadata {
    constructor(dataSource) {
        this.decorator = '@serviceProxy';
        if (typeof dataSource === 'string') {
            this.dataSourceName = dataSource;
        }
        else {
            this.dataSource = dataSource;
        }
    }
}
exports.ServiceProxyMetadata = ServiceProxyMetadata;
function serviceProxy(dataSource) {
    return function (target, key, parameterIndex) {
        if (key || typeof parameterIndex === 'number') {
            const meta = new ServiceProxyMetadata(dataSource);
            context_1.inject('', meta, resolve)(target, key, parameterIndex);
        }
        else {
            throw new Error('@serviceProxy can only be applied to properties or method parameters');
        }
    };
}
exports.serviceProxy = serviceProxy;
/**
 * Resolve the @repository injection
 * @param ctx - Context
 * @param injection - Injection metadata
 */
async function resolve(ctx, injection) {
    const meta = injection.metadata;
    if (meta.dataSource)
        return __1.getService(meta.dataSource);
    if (meta.dataSourceName) {
        const ds = await ctx.get('datasources.' + meta.dataSourceName);
        return __1.getService(ds);
    }
    throw new Error('@serviceProxy must provide a name or an instance of DataSource');
}
//# sourceMappingURL=service.decorator.js.map