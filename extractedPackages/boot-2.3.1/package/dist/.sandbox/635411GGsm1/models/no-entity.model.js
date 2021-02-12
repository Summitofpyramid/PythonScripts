"use strict";
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoEntity = void 0;
const tslib_1 = require("tslib");
const repository_1 = require("@loopback/repository");
let NoEntity = /** @class */ (() => {
    let NoEntity = class NoEntity extends repository_1.Model {
    };
    tslib_1.__decorate([
        repository_1.property({ id: true }),
        tslib_1.__metadata("design:type", Number)
    ], NoEntity.prototype, "id", void 0);
    tslib_1.__decorate([
        repository_1.property({ required: true }),
        tslib_1.__metadata("design:type", String)
    ], NoEntity.prototype, "name", void 0);
    NoEntity = tslib_1.__decorate([
        repository_1.model()
    ], NoEntity);
    return NoEntity;
})();
exports.NoEntity = NoEntity;
//# sourceMappingURL=no-entity.model.js.map
//# sourceMappingURL=/Users/rfeng/Projects/loopback4/loopback-next/packages/boot/dist/__tests__/fixtures/no-entity.model.js.map