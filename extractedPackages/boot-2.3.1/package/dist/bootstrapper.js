"use strict";
// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bootstrapper = void 0;
const tslib_1 = require("tslib");
const context_1 = require("@loopback/context");
const core_1 = require("@loopback/core");
const debug_1 = tslib_1.__importDefault(require("debug"));
const path_1 = require("path");
const keys_1 = require("./keys");
const mixins_1 = require("./mixins");
const types_1 = require("./types");
const debug = debug_1.default('loopback:boot:bootstrapper');
/**
 * The Bootstrapper class provides the `boot` function that is responsible for
 * finding and executing the Booters in an application based on given options.
 *
 * NOTE: Bootstrapper should be bound as a SINGLETON so it can be cached as
 * it does not maintain any state of it's own.
 *
 * @param app - Application instance
 * @param projectRoot - The root directory of the project, relative to which all other paths are resolved
 * @param bootOptions - The BootOptions describing the conventions to be used by various Booters
 */
let Bootstrapper = /** @class */ (() => {
    let Bootstrapper = class Bootstrapper {
        constructor(app, projectRoot, bootOptions = {}) {
            this.app = app;
            this.projectRoot = projectRoot;
            this.bootOptions = bootOptions;
            // Resolve path to projectRoot and re-bind
            this.projectRoot = path_1.resolve(this.projectRoot);
            app.bind(keys_1.BootBindings.PROJECT_ROOT).to(this.projectRoot);
            // This is re-bound for testing reasons where this value may be passed directly
            // and needs to be propagated to the Booters via DI
            app.bind(keys_1.BootBindings.BOOT_OPTIONS).to(this.bootOptions);
        }
        /**
         * Function is responsible for calling all registered Booter classes that
         * are bound to the Application instance. Each phase of an instance must
         * complete before the next phase is started.
         *
         * @param execOptions - Execution options for boot. These
         * determine the phases and booters that are run.
         * @param ctx - Optional Context to use to resolve bindings. This is
         * primarily useful when running app.boot() again but with different settings
         * (in particular phases) such as 'start' / 'stop'. Using a returned Context from
         * a previous boot call allows DI to retrieve the same instances of Booters previously
         * used as they are bound using a CONTEXT scope. This is important as Booter instances
         * may maintain state.
         */
        async boot(execOptions, ctx) {
            const bootCtx = ctx !== null && ctx !== void 0 ? ctx : new context_1.Context(this.app);
            // Bind booters passed in as a part of BootOptions
            // We use _bindBooter so this Class can be used without the Mixin
            if (execOptions === null || execOptions === void 0 ? void 0 : execOptions.booters) {
                execOptions.booters.forEach(booter => mixins_1._bindBooter(this.app, booter));
            }
            // Determine the phases to be run. If a user set a phases filter, those
            // are selected otherwise we run the default phases (BOOTER_PHASES).
            const phases = execOptions
                ? execOptions.filter && execOptions.filter.phases
                    ? execOptions.filter.phases
                    : types_1.BOOTER_PHASES
                : types_1.BOOTER_PHASES;
            // Find booters registered to the BOOTERS_TAG by getting the bindings
            const bindings = bootCtx.findByTag(keys_1.BootTags.BOOTER);
            // Prefix length. +1 because of `.` => 'booters.'
            const prefixLength = keys_1.BootBindings.BOOTER_PREFIX.length + 1;
            // Names of all registered booters.
            const defaultBooterNames = bindings.map(binding => binding.key.slice(prefixLength));
            // Determining the booters to be run. If a user set a booters filter (class
            // names of booters that should be run), that is the value, otherwise it
            // is all the registered booters by default.
            const names = execOptions
                ? execOptions.filter && execOptions.filter.booters
                    ? execOptions.filter.booters
                    : defaultBooterNames
                : defaultBooterNames;
            // Filter bindings by names
            const filteredBindings = bindings.filter(binding => names.includes(binding.key.slice(prefixLength)));
            // Resolve Booter Instances
            const booterInsts = await context_1.resolveList(filteredBindings, binding => 
            // We cannot use Booter interface here because "filter.booters"
            // allows arbitrary string values, not only the phases defined
            // by Booter interface
            bootCtx.get(binding.key));
            // Run phases of booters
            for (const phase of phases) {
                for (const inst of booterInsts) {
                    const instName = inst.constructor.name;
                    if (inst[phase]) {
                        debug(`${instName} phase: ${phase} starting.`);
                        await inst[phase]();
                        debug(`${instName} phase: ${phase} complete.`);
                    }
                    else {
                        debug(`${instName} phase: ${phase} not implemented.`);
                    }
                }
            }
            return bootCtx;
        }
    };
    Bootstrapper = tslib_1.__decorate([
        tslib_1.__param(0, context_1.inject(core_1.CoreBindings.APPLICATION_INSTANCE)),
        tslib_1.__param(1, context_1.inject(keys_1.BootBindings.PROJECT_ROOT)),
        tslib_1.__param(2, context_1.inject(keys_1.BootBindings.BOOT_OPTIONS, { optional: true })),
        tslib_1.__metadata("design:paramtypes", [Object, String, Object])
    ], Bootstrapper);
    return Bootstrapper;
})();
exports.Bootstrapper = Bootstrapper;
//# sourceMappingURL=bootstrapper.js.map