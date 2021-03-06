"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExplorerController = void 0;
const tslib_1 = require("tslib");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const context_1 = require("@loopback/context");
const rest_1 = require("@loopback/rest");
const ejs_1 = tslib_1.__importDefault(require("ejs"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const rest_explorer_keys_1 = require("./rest-explorer.keys");
// TODO(bajtos) Allow users to customize the template
const indexHtml = path_1.default.resolve(__dirname, '../templates/index.html.ejs');
const template = fs_1.default.readFileSync(indexHtml, 'utf-8');
const templateFn = ejs_1.default.compile(template);
let ExplorerController = /** @class */ (() => {
    let ExplorerController = class ExplorerController {
        constructor(restConfig = {}, explorerConfig = {}, serverBasePath, restServer, requestContext) {
            var _a;
            this.serverBasePath = serverBasePath;
            this.restServer = restServer;
            this.requestContext = requestContext;
            this.useSelfHostedSpec = explorerConfig.useSelfHostedSpec !== false;
            this.openApiSpecUrl = this.getOpenApiSpecUrl(restConfig);
            this.swaggerThemeFile = (_a = explorerConfig.swaggerThemeFile) !== null && _a !== void 0 ? _a : './swagger-ui.css';
        }
        indexRedirect() {
            const { request, response } = this.requestContext;
            let url = request.originalUrl || request.url;
            // be safe against path-modifying reverse proxies by generating the redirect
            // as a _relative_ URL
            const lastSlash = url.lastIndexOf('/');
            if (lastSlash >= 0) {
                url = './' + url.substr(lastSlash + 1) + '/';
            }
            response.redirect(301, url);
        }
        index() {
            const swaggerThemeFile = this.swaggerThemeFile;
            let openApiSpecUrl = this.openApiSpecUrl;
            // if using self-hosted openapi spec, then the path to use is always the
            // exact relative path, and no base path logic needs to be applied
            if (!this.useSelfHostedSpec) {
                // baseURL is composed from mountPath and basePath
                // OpenAPI endpoints ignore basePath but do honor mountPath
                let rootPath = this.requestContext.request.baseUrl;
                if (this.serverBasePath &&
                    this.serverBasePath !== '/' &&
                    rootPath.endsWith(this.serverBasePath)) {
                    rootPath = rootPath.slice(0, -this.serverBasePath.length);
                }
                if (rootPath && rootPath !== '/') {
                    openApiSpecUrl = rootPath + openApiSpecUrl;
                }
            }
            const data = {
                openApiSpecUrl,
                swaggerThemeFile,
            };
            const homePage = templateFn(data);
            this.requestContext.response
                .status(200)
                .contentType('text/html')
                .send(homePage);
        }
        spec() {
            return this.restServer.getApiSpec(this.requestContext);
        }
        getOpenApiSpecUrl(restConfig) {
            var _a, _b;
            if (this.useSelfHostedSpec) {
                return './' + ExplorerController.OPENAPI_RELATIVE_URL;
            }
            const openApiConfig = (_a = restConfig.openApiSpec) !== null && _a !== void 0 ? _a : {};
            const endpointMapping = (_b = openApiConfig.endpointMapping) !== null && _b !== void 0 ? _b : {};
            const endpoint = Object.keys(endpointMapping).find(k => isOpenApiV3Json(endpointMapping[k]));
            return endpoint !== null && endpoint !== void 0 ? endpoint : '/openapi.json';
        }
    };
    ExplorerController.OPENAPI_RELATIVE_URL = 'openapi.json';
    ExplorerController.OPENAPI_FORM = Object.freeze({
        version: '3.0.0',
        format: 'json',
    });
    ExplorerController = tslib_1.__decorate([
        tslib_1.__param(0, context_1.inject(rest_1.RestBindings.CONFIG, { optional: true })),
        tslib_1.__param(1, context_1.config({ fromBinding: rest_explorer_keys_1.RestExplorerBindings.COMPONENT })),
        tslib_1.__param(2, context_1.inject(rest_1.RestBindings.BASE_PATH)),
        tslib_1.__param(3, context_1.inject(rest_1.RestBindings.SERVER)),
        tslib_1.__param(4, context_1.inject(rest_1.RestBindings.Http.CONTEXT)),
        tslib_1.__metadata("design:paramtypes", [Object, Object, String, rest_1.RestServer,
            rest_1.RequestContext])
    ], ExplorerController);
    return ExplorerController;
})();
exports.ExplorerController = ExplorerController;
function isOpenApiV3Json(mapping) {
    return (mapping.version === ExplorerController.OPENAPI_FORM.version &&
        mapping.format === ExplorerController.OPENAPI_FORM.format);
}
//# sourceMappingURL=rest-explorer.controller.js.map