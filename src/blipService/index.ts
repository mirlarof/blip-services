import * as uuid from 'uuid';
import Lime from 'lime-js';
import Semaphore from 'semaphore-async-await';
import { MetadataInjector } from './MetadataInjector';
import { BlipClientBuilder } from './BlipClientBuilder';

export interface BlipServiceConfiguration {
    tenant?: any;
    blipDomainUrl: string;
    blipDomain: string;
    blipAccountIssuer: string;
    blipWebsocketPort: string;
    blipWebsocketScheme: string;
    blipWebsocketHostName: string;
    blipWebsocketHostNameTenant: string;
    applicationName?: string;
}

class BlipService {
    private client: any;
    private COMMAND_TIMEOUT = 10000;
    private lock: Semaphore;
    private waitForInitializationPromise: {
        resolve: (value?: unknown) => void;
        reject: (reason?: any) => void;
        promise: Promise<unknown>;
    };
    private configuration: BlipServiceConfiguration;
    private authentication: string = '';

    constructor(configuration: BlipServiceConfiguration) {
        this.configuration = {
            ...configuration,
            applicationName: configuration.applicationName ?? 'portal',
        };
        this.waitForInitializationPromise = {
            resolve: () => undefined,
            reject: () => undefined,
            promise: new Promise(() => undefined),
        };

        this.lock = new Semaphore(1);
        this.createInitializationPromise();
    }

    /**
     * Create a promise to be resolved right after client connection be resolved
     */
    private createInitializationPromise() {
        const promise = new Promise((resolve, reject) => {
            this.waitForInitializationPromise.resolve = resolve;
            this.waitForInitializationPromise.reject = reject;
        });
        this.waitForInitializationPromise.promise = promise;
    }

    /**
     * Auxiliar method to expose promise object outside the class
     * @returns Promise
     */
    waitForInitialization(): Promise<any> {
        return this.waitForInitializationPromise.promise;
    }

    /**
     * Optional method to use external client instance instead
     * @param client
     * @returns Blip SDK Client
     */
    public withClient(client: any) {
        if (!client.listening) {
            throw new Error('Client must be listening');
        }
        this.client = client;
        return this;
    }

    /**
     * Process command using connected client
     * @param command Lime.Command
     * @param timeout Number
     * @returns Promise
     */
    public processCommand(
        command: Lime.Command,
        timeout = this.COMMAND_TIMEOUT,
    ) {
        const requestCommand = {
            ...command,
            id: command.id ? command.id : uuid.v4(),
        };

        MetadataInjector.injectMetadata(requestCommand, this.authentication);
        return this.client.processCommand(requestCommand, timeout);
    }

    /**
     * Connect to Iris application with specified identifier and user token
     * @param identifier Application/Bot identifier
     * @param token User token
     * @returns Promise that will be completed after client be connected
     */
    async connect(
        identifier: string,
        token: string,
        authentication: string,
    ): Promise<any> {
        this.authentication = authentication;

        try {
            await this.lock.wait();
            if (this.client) {
                return;
            }

            if (identifier === 'undefined') {
                throw new Error('Identifier is empty, try to connect again');
            }

            this.client = await BlipClientBuilder.connect(
                identifier,
                token,
                this.configuration,
            );
            this.waitForInitializationPromise.resolve();
        } catch (e) {
            throw e;
        } finally {
            this.lock.signal();
        }
    }
}

export default BlipService;
