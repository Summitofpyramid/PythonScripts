"use strict";
// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbDataSource = void 0;
const repository_1 = require("@loopback/repository");
let DbDataSource = /** @class */ (() => {
    class DbDataSource extends repository_1.juggler.DataSource {
        constructor() {
            super({ name: 'db' });
        }
    }
    DbDataSource.dataSourceName = 'db';
    return DbDataSource;
})();
exports.DbDataSource = DbDataSource;
//# sourceMappingURL=datasource.artifact.js.map
//# sourceMappingURL=/Users/rfeng/Projects/loopback4/loopback-next/packages/boot/dist/__tests__/fixtures/datasource.artifact.js.map