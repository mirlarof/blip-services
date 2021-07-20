import { BlipServiceConfiguration } from '.';
import { UrlTenantHandler } from './UrlTenantHandler';
import * as BlipSdk from 'blip-sdk';
import WebSocketTransport from 'lime-transport-websocket';

class BlipClientBuilder {
    private MAX_CONNECT_USER_TRY_COUNT = 6;
    private CONNECT_USER_ERROR = 'Connect user error';
    private connectionTryCount: number = 0;

    /**
     * Connect to Iris application with specified identifier and user token
     * @param identifier Application/Bot identifier
     * @param token User token
     * @param configuration Configuration used to connect to Iris application
     * @returns Promise that will be completed after client be connected
     */
    async connect(
        identifier: string,
        token: string,
        configuration: BlipServiceConfiguration,
    ): Promise<any> {
        try {
            return await this.connectWithExponentialBackoff(
                identifier,
                token,
                configuration,
            );
        } catch (e) {
            throw e;
        }
    }

    /**
     * Connect with exponential backoff and time limit
     * @param identifier Application/Bot identifier
     * @param token User token
     * @param configuration Configuration used to connect to Iris application
     * @returns Promise that will be completed after client be connected
     */
    private async connectWithExponentialBackoff(
        identifier: string,
        token: string,
        configuration: BlipServiceConfiguration,
    ) {
        let client;

        if (this.connectionTryCount >= this.MAX_CONNECT_USER_TRY_COUNT) {
            const error = new Error(
                `${this.CONNECT_USER_ERROR}: Could not connect user ${identifier} - Max connection try count of ${this.MAX_CONNECT_USER_TRY_COUNT} reached. Please refresh the page.`,
            );
            throw error;
        }

        this.connectionTryCount++;

        try {
            client = this.buildBlipClient(
                identifier,
                token,
                configuration.blipWebsocketHostName,
                configuration,
            );
            await client.connect();

            if (
                configuration.tenant &&
                !configuration.blipDomainUrl.includes(location.origin)
            ) {
                client.close();
                client = this.createClientWithTenantHostname(
                    identifier,
                    token,
                    configuration,
                );
                await client.connect();
            }

            this.connectionTryCount = 0;
            return client;
        } catch (e) {
            console.error(e);
            client._transport.onClose = () => {};
            client.close();

            // Use an exponential backoff for the timeout
            const timeout = 100 * Math.pow(2, this.connectionTryCount);

            return new Promise((resolve, reject) => {
                // try to reconnect after the timeout
                setTimeout(async () => {
                    const client = await this.connectWithExponentialBackoff(
                        identifier,
                        token,
                        configuration,
                    );
                    resolve(client);
                }, timeout);
            });
        }
    }

    /**
     * Create client instance using tenant hostname
     * @param identifier Application/Bot identifier
     * @param token User token
     * @param configuration Configuration used to connect to Iris application
     * @returns Promise that will be completed after client be connected
     */
    private createClientWithTenantHostname(
        identifier: string,
        token: string,
        configuration: BlipServiceConfiguration,
    ) {
        const blipWebsocketHostname = UrlTenantHandler.addTenantPrefixToUrl(
            configuration.blipWebsocketHostNameTenant,
            undefined,
            configuration.blipWebsocketHostName,
            configuration.blipDomainUrl,
        );
        return this.buildBlipClient(
            identifier,
            token,
            blipWebsocketHostname,
            configuration,
        );
    }

    /**
     * Create an instance with specified configurations
     * @param identifier Application/Bot identifier
     * @param token User token
     * @param hostname Tenant/Contract hostname
     * @param configuration Configuration used to connect to Iris application
     * @returns Promise that will be completed after client be connected
     */
    private buildBlipClient(
        identifier: string,
        token: string,
        hostname: string,
        configuration: BlipServiceConfiguration,
    ) {
        return new BlipSdk.ClientBuilder()
            .withIdentifier(identifier)
            .withToken(token)
            .withDomain('blip.ai')
            .withIssuer('account.blip.ai')
            .withHostName(hostname)
            .withPort(configuration.blipWebsocketPort)
            .withScheme(configuration.blipWebsocketScheme)
            .withRoutingRule('identity') // To avoid conflicts with BLiP Desk
            .withInstance(configuration.applicationName)
            .withNotifyConsumed(false)
            .withTransportFactory(() => new WebSocketTransport())
            .build();
    }
}

const instance = new BlipClientBuilder();

export { instance as BlipClientBuilder };
