import { Binding, Constructor } from '@loopback/context';
import { Application, Component, ProviderMap, Server } from '@loopback/core';
import { RequestBodyParser } from './body-parsers';
import { RestServerConfig } from './rest.server';
import { ConsolidationEnhancer } from './spec-enhancers/consolidate.spec-enhancer';
import { InfoSpecEnhancer } from './spec-enhancers/info.spec-enhancer';
export declare class RestComponent implements Component {
    providers: ProviderMap;
    /**
     * Add built-in body parsers
     */
    bindings: (Binding<import("./body-parsers").BodyParser> | Binding<RequestBodyParser> | Binding<InfoSpecEnhancer> | Binding<ConsolidationEnhancer>)[];
    servers: {
        [name: string]: Constructor<Server>;
    };
    constructor(app: Application, config?: RestComponentConfig);
}
export declare type RestComponentConfig = RestServerConfig;
