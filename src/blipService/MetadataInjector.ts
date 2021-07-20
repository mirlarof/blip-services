import Lime from "lime-js";
export class MetadataInjector {
    /**
     * Inject all necessary metadata to command
     * @param requestCommand Command to inject the metadata
     */
    static injectMetadata(requestCommand: Lime.Command, authentication: string) {
        requestCommand.metadata = requestCommand.metadata || {};
        MetadataInjector.injectSaveCommandMetadata(requestCommand);
        MetadataInjector.injectAuthenticationMetadata(requestCommand, authentication);
    }

    /**
    * Inject metadata to save all specified command methods
    * @param requestCommand Lime.Command
    */
    static injectSaveCommandMetadata(requestCommand: Lime.Command) {
        if (
            requestCommand.method === 'set' ||
            requestCommand.method === 'delete' ||
            requestCommand.method === 'merge'
        ) {
            requestCommand.metadata['server.shouldStore'] = 'true';
        }
    }

    /**
     * Inject connected user metadata
     * @param requestCommand Lime.Command
     */
    static injectAuthenticationMetadata(requestCommand: Lime.Command, authentication: string) {
        requestCommand.metadata['blip_portal.email'] = authentication;
    }
}
