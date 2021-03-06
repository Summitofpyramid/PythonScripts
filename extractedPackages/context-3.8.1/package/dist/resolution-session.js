"use strict";
// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.asResolutionOptions = exports.ResolutionSession = void 0;
const tslib_1 = require("tslib");
const metadata_1 = require("@loopback/metadata");
const debug_1 = tslib_1.__importDefault(require("debug"));
const value_promise_1 = require("./value-promise");
const debugSession = debug_1.default('loopback:context:resolver:session');
const getTargetName = metadata_1.DecoratorFactory.getTargetName;
/**
 * Type guard for binding elements
 * @param element - A resolution element
 */
function isBinding(element) {
    return element != null && element.type === 'binding';
}
/**
 * Type guard for injection elements
 * @param element - A resolution element
 */
function isInjection(element) {
    return element != null && element.type === 'injection';
}
/**
 * Object to keep states for a session to resolve bindings and their
 * dependencies within a context
 */
class ResolutionSession {
    constructor() {
        /**
         * A stack of bindings for the current resolution session. It's used to track
         * the path of dependency resolution and detect circular dependencies.
         */
        this.stack = [];
    }
    /**
     * Fork the current session so that a new one with the same stack can be used
     * in parallel or future resolutions, such as multiple method arguments,
     * multiple properties, or a getter function
     * @param session - The current session
     */
    static fork(session) {
        if (session === undefined)
            return undefined;
        const copy = new ResolutionSession();
        copy.stack.push(...session.stack);
        return copy;
    }
    /**
     * Start to resolve a binding within the session
     * @param binding - The current binding
     * @param session - The current resolution session
     */
    static enterBinding(binding, session) {
        session = session !== null && session !== void 0 ? session : new ResolutionSession();
        session.pushBinding(binding);
        return session;
    }
    /**
     * Run the given action with the given binding and session
     * @param action - A function to do some work with the resolution session
     * @param binding - The current binding
     * @param session - The current resolution session
     */
    static runWithBinding(action, binding, session) {
        const resolutionSession = ResolutionSession.enterBinding(binding, session);
        return value_promise_1.tryWithFinally(() => action(resolutionSession), () => resolutionSession.popBinding());
    }
    /**
     * Push an injection into the session
     * @param injection - The current injection
     * @param session - The current resolution session
     */
    static enterInjection(injection, session) {
        session = session !== null && session !== void 0 ? session : new ResolutionSession();
        session.pushInjection(injection);
        return session;
    }
    /**
     * Run the given action with the given injection and session
     * @param action - A function to do some work with the resolution session
     * @param binding - The current injection
     * @param session - The current resolution session
     */
    static runWithInjection(action, injection, session) {
        const resolutionSession = ResolutionSession.enterInjection(injection, session);
        return value_promise_1.tryWithFinally(() => action(resolutionSession), () => resolutionSession.popInjection());
    }
    /**
     * Describe the injection for debugging purpose
     * @param injection - Injection object
     */
    static describeInjection(injection) {
        const name = getTargetName(injection.target, injection.member, injection.methodDescriptorOrParameterIndex);
        return {
            targetName: name,
            bindingSelector: injection.bindingSelector,
            metadata: injection.metadata,
        };
    }
    /**
     * Push the injection onto the session
     * @param injection - Injection The current injection
     */
    pushInjection(injection) {
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Enter injection:', ResolutionSession.describeInjection(injection));
        }
        this.stack.push({ type: 'injection', value: injection });
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Resolution path:', this.getResolutionPath());
        }
    }
    /**
     * Pop the last injection
     */
    popInjection() {
        const top = this.stack.pop();
        if (!isInjection(top)) {
            throw new Error('The top element must be an injection');
        }
        const injection = top.value;
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Exit injection:', ResolutionSession.describeInjection(injection));
            debugSession('Resolution path:', this.getResolutionPath() || '<empty>');
        }
        return injection;
    }
    /**
     * Getter for the current injection
     */
    get currentInjection() {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const element = this.stack[i];
            if (isInjection(element))
                return element.value;
        }
        return undefined;
    }
    /**
     * Getter for the current binding
     */
    get currentBinding() {
        for (let i = this.stack.length - 1; i >= 0; i--) {
            const element = this.stack[i];
            if (isBinding(element))
                return element.value;
        }
        return undefined;
    }
    /**
     * Enter the resolution of the given binding. If
     * @param binding - Binding
     */
    pushBinding(binding) {
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Enter binding:', binding.toJSON());
        }
        if (this.stack.find(i => isBinding(i) && i.value === binding)) {
            const msg = `Circular dependency detected: ` +
                `${this.getResolutionPath()} --> ${binding.key}`;
            debugSession(msg);
            throw new Error(msg);
        }
        this.stack.push({ type: 'binding', value: binding });
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Resolution path:', this.getResolutionPath());
        }
    }
    /**
     * Exit the resolution of a binding
     */
    popBinding() {
        const top = this.stack.pop();
        if (!isBinding(top)) {
            throw new Error('The top element must be a binding');
        }
        const binding = top.value;
        /* istanbul ignore if */
        if (debugSession.enabled) {
            debugSession('Exit binding:', binding === null || binding === void 0 ? void 0 : binding.toJSON());
            debugSession('Resolution path:', this.getResolutionPath() || '<empty>');
        }
        return binding;
    }
    /**
     * Getter for bindings on the stack
     */
    get bindingStack() {
        return this.stack.filter(isBinding).map(e => e.value);
    }
    /**
     * Getter for injections on the stack
     */
    get injectionStack() {
        return this.stack.filter(isInjection).map(e => e.value);
    }
    /**
     * Get the binding path as `bindingA --> bindingB --> bindingC`.
     */
    getBindingPath() {
        return this.bindingStack.map(b => b.key).join(' --> ');
    }
    /**
     * Get the injection path as `injectionA --> injectionB --> injectionC`.
     */
    getInjectionPath() {
        return this.injectionStack
            .map(i => ResolutionSession.describeInjection(i).targetName)
            .join(' --> ');
    }
    static describe(e) {
        switch (e.type) {
            case 'injection':
                return '@' + ResolutionSession.describeInjection(e.value).targetName;
            case 'binding':
                return e.value.key;
        }
    }
    /**
     * Get the resolution path including bindings and injections, for example:
     * `bindingA --> @ClassA[0] --> bindingB --> @ClassB.prototype.prop1
     * --> bindingC`.
     */
    getResolutionPath() {
        return this.stack.map(i => ResolutionSession.describe(i)).join(' --> ');
    }
    toString() {
        return this.getResolutionPath();
    }
}
exports.ResolutionSession = ResolutionSession;
/**
 * Normalize ResolutionOptionsOrSession to ResolutionOptions
 * @param optionsOrSession - resolution options or session
 */
function asResolutionOptions(optionsOrSession) {
    // backwards compatibility
    if (optionsOrSession instanceof ResolutionSession) {
        return { session: optionsOrSession };
    }
    return optionsOrSession !== null && optionsOrSession !== void 0 ? optionsOrSession : {};
}
exports.asResolutionOptions = asResolutionOptions;
//# sourceMappingURL=resolution-session.js.map