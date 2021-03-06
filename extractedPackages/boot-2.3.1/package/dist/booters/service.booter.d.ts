import { ApplicationWithServices } from '@loopback/service-proxy';
import { ArtifactOptions } from '../types';
import { BaseArtifactBooter } from './base-artifact.booter';
/**
 * A class that extends BaseArtifactBooter to boot the 'Service' artifact type.
 * Discovered services are bound using `app.service()`.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Service Artifact Options Object
 */
export declare class ServiceBooter extends BaseArtifactBooter {
    app: ApplicationWithServices;
    serviceConfig: ArtifactOptions;
    constructor(app: ApplicationWithServices, projectRoot: string, serviceConfig?: ArtifactOptions);
    /**
     * Uses super method to get a list of Artifact classes. Boot each file by
     * creating a DataSourceConstructor and binding it to the application class.
     */
    load(): Promise<void>;
}
/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export declare const ServiceDefaults: ArtifactOptions;
