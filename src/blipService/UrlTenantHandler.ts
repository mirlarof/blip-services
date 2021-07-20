const urlPartsSeparator = '.';

export class UrlTenantHandler {
    /**
     * Add tenant prefix and ID to current URL
     * @param url Current application URL
     * @param tenantId Tenant ID recovered from current URL
     * @param defaultUrl Default url if application have no tenant
     * @param blipDomainUrl Blip URL
     * @returns String with tenant url + blip domain
     */
    static addTenantPrefixToUrl(
        url: string,
        tenantId: string | undefined = undefined,
        defaultUrl: string | undefined = undefined,
        blipDomainUrl: string,
    ): string {
        tenantId = tenantId ?? UrlTenantHandler.getTenantPrefixFromUrl(blipDomainUrl);
        defaultUrl = defaultUrl ?? url;
        try {
            if (tenantId) {
                const treatedUrl = new URL(url);
                if (treatedUrl.host.split(urlPartsSeparator)[0] !== tenantId) {
                    return `${treatedUrl.protocol}//${tenantId}.${treatedUrl.host}/`;
                } else {
                    return `${treatedUrl.protocol}//${treatedUrl.host}/`;
                }
            } else {
                const treatedDefaultUrl = new URL(defaultUrl);
                return `${treatedDefaultUrl.protocol}//${treatedDefaultUrl.host}/`;
            }
        } catch (e) {
            return tenantId ? `${tenantId}.${url}` : defaultUrl;
        }
    }

    /**
     * Get tenant prefix from current URL
     * @param blipDomainUrl current url
     * @returns Tenant prefix from current URL
     */
    static getTenantPrefixFromUrl(blipDomainUrl: string): string | undefined {
        return blipDomainUrl.includes(location.origin)
            ? undefined
            : location.hostname.split(urlPartsSeparator)[0];
    }
}
