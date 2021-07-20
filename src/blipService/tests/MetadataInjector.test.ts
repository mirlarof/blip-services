import { MetadataInjector } from "../MetadataInjector";

describe('Metadata Injector', () => {
    test('Should inject metadata from SET, DELETE and MERGE command methods', () => {
        const authentication = 'fakemail@blip.ai'
        const commandWithDelete: Lime.Command = {
            uri: '/test-uri',
            method: 'delete'
        };

        const commandWithSet: Lime.Command = {
            uri: '/test-uri',
            method: 'set'
        };

        const commandWithMerge: Lime.Command = {
            uri: '/test-uri',
            method: 'merge'
        };

        const commandWithGet: Lime.Command = {
            uri: '/test-uri',
            method: 'get'
        };

        MetadataInjector.injectMetadata(commandWithDelete, authentication);
        MetadataInjector.injectMetadata(commandWithSet, authentication);
        MetadataInjector.injectMetadata(commandWithMerge, authentication);
        MetadataInjector.injectMetadata(commandWithGet, authentication);

        const deleteCommandWithMetadata: Lime.Command = {
            ...commandWithDelete,
            metadata: {
                'server.shouldStore': 'true',
                'blip_portal.email': authentication
            }
        }

        const setCommandWithMetadata: Lime.Command = {
            ...commandWithSet,
            metadata: {
                'server.shouldStore': 'true',
                'blip_portal.email': authentication
            }
        }

        const mergeCommandWithMetadata: Lime.Command = {
            ...commandWithMerge,
            metadata: {
                'server.shouldStore': 'true',
                'blip_portal.email': authentication
            }
        }

        expect(commandWithDelete).toStrictEqual(deleteCommandWithMetadata);
        expect(commandWithSet).toStrictEqual(setCommandWithMetadata);
        expect(commandWithMerge).toStrictEqual(mergeCommandWithMetadata);
        expect(commandWithGet).not.toHaveProperty('metadata.server.shouldStore')
    });
});
