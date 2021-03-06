"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SpecificationExtension {
    static isValidExtension(extensionName) {
        return /^x\-/.test(extensionName);
    }
    getExtension(extensionName) {
        if (!SpecificationExtension.isValidExtension(extensionName)) {
            throw new Error("Invalid specification extension: '" +
                extensionName + "'. Extensions must start with prefix 'x-");
        }
        if (this[extensionName]) {
            return this[extensionName];
        }
        return null;
    }
    addExtension(extensionName, payload) {
        if (!SpecificationExtension.isValidExtension(extensionName)) {
            throw new Error("Invalid specification extension: '" +
                extensionName + "'. Extensions must start with prefix 'x-");
        }
        this[extensionName] = payload;
    }
    listExtensions() {
        let res = [];
        for (let propName in this) {
            if (this.hasOwnProperty(propName)) {
                if (SpecificationExtension.isValidExtension(propName)) {
                    res.push(propName);
                }
            }
        }
        return res;
    }
}
exports.SpecificationExtension = SpecificationExtension;
//# sourceMappingURL=SpecificationExtension.js.map