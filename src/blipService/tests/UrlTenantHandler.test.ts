/**
 * @jest-environment jsdom
 */

import { UrlTenantHandler } from '../UrlTenantHandler';

const tenantId = 'my-tenant';
const hrefWithTenant = `https://${tenantId}.portal.blip.ai`;
const hostnameWithTenant = 'my-tenant.portal.blip.ai';
const blipDomainUrl = 'https://portal.blip.ai';
const originalWindow = { ...global.window };

describe('Url Tenant Handler', () => {

    beforeAll(() => {
        Object.defineProperty(global.window, 'location', {
            writable: true,
            value: {
                href: hrefWithTenant,
                hostname: hostnameWithTenant,
                origin: hrefWithTenant
            },
        });
    });

    afterAll(() => {
        global.window = originalWindow;
    })

    test('Should get tenant prefix from URL', () => {
        const tenantPrefix =
            UrlTenantHandler.getTenantPrefixFromUrl(blipDomainUrl);

        expect(tenantPrefix).toEqual('my-tenant');
    });

    test('Should add tenant prefix to url with TenantId', () => {
        const prefixedUrl = UrlTenantHandler.addTenantPrefixToUrl(
            blipDomainUrl,
            tenantId,
            undefined,
            blipDomainUrl,
        );

        expect(prefixedUrl).toEqual(`https://${tenantId}.portal.blip.ai/`);
    });

    test('Should add tenant prefix to url without TenantId as param', () => {
        const prefixedUrlWithoutTenantId =
            UrlTenantHandler.addTenantPrefixToUrl(
                hrefWithTenant,
                undefined,
                undefined,
                blipDomainUrl,
            );

        expect(prefixedUrlWithoutTenantId).toEqual(
            `https://${tenantId}.portal.blip.ai/`,
        );
    });

    test('Should return url with Tenant ID if URL parameter is invalid', () => {
        const prefixedUrlWithoutTenantId =
            UrlTenantHandler.addTenantPrefixToUrl(
                'portal.blip.ai',
                tenantId,
                undefined,
                blipDomainUrl,
            );

        expect(prefixedUrlWithoutTenantId).toEqual('my-tenant.portal.blip.ai');
    });
});

describe('URL Tenant Handler for undefined tenant', () => {
    const defaultHostname = 'portal.blip.ai';

    beforeAll(() => {
        Object.defineProperty(global.window, 'location', {
            writable: true,
            value: {
                href: blipDomainUrl,
                hostname: defaultHostname,
                origin: blipDomainUrl
            },
        });
    });

    test('Should add tenant prefix to url with undefined tenantId', () => {
        const prefixedUrlWithoutTenantId =
            UrlTenantHandler.addTenantPrefixToUrl(
                blipDomainUrl,
                undefined,
                undefined,
                blipDomainUrl,
            );

        expect(prefixedUrlWithoutTenantId).toEqual(`${blipDomainUrl}/`);
    });

    test('Should return defaultUrl if URL parameter is invalid', () => {
        const defaultUrl = 'defaultUrl.blip.ai'
        const prefixedUrlWithoutTenantId =
            UrlTenantHandler.addTenantPrefixToUrl(
                'invalid.blip.ai',
                undefined,
                defaultUrl,
                blipDomainUrl,
            );

        expect(prefixedUrlWithoutTenantId).toEqual(defaultUrl);
    });
});
