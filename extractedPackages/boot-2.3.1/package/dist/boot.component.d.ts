import { Application, Component } from '@loopback/core';
import { ApplicationMetadataBooter, ControllerBooter, DataSourceBooter, InterceptorProviderBooter, LifeCycleObserverBooter, ModelApiBooter, ModelBooter, RepositoryBooter, ServiceBooter } from './booters';
/**
 * BootComponent is used to export the default list of Booter's made
 * available by this module as well as bind the BootStrapper to the app so it
 * can be used to run the Booters.
 */
export declare class BootComponent implements Component {
    booters: (typeof ApplicationMetadataBooter | typeof ControllerBooter | typeof DataSourceBooter | typeof InterceptorProviderBooter | typeof LifeCycleObserverBooter | typeof ModelApiBooter | typeof ModelBooter | typeof RepositoryBooter | typeof ServiceBooter)[];
    /**
     *
     * @param app - Application instance
     */
    constructor(app: Application);
}
