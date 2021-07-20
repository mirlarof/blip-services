# Introduction

This project aims to implement aditional features to BlipSdk client, commands and connection. Here you can find the main implementation for BLiP SDK connection and its extensions, like account, contacts, artificial intelligence

# Objective

The goal of this project is to share all services in the same library, as we can have multiple project stacks.

# Usage

```javascript
import { BlipService } from 'blip-services';

const blipService = new BlipService({
    tenant: 'tenant-id',
    blipDomainUrl: 'http://localhost:8080/',
    blipDomain: 'blip.ai',
    blipAccountIssuer: 'account.blip.ai',
    blipWebsocketPort: '443',
    blipWebsocketScheme: 'wss',
    blipWebsocketHostName: 'hmg-ws.blip.ai',
    blipWebsocketHostNameTenant: 'hmg-ws.blip.ai',
    applicationName: 'my-micro-frontend' // Optional, but recommended. Default value is 'portal'
});

await blipService.connect(userIdentifier, userToken, authentication);
```
### connect

| Param | Type | Description | Required |
|---|---|---|---|
| *userIdentifier* | **string** | User identifier used to connect to blip.ai domain. It's normally used with user email | **true** |
| *userToken* | **string** | The same user token used to login into BlipAccount | **true**  |
| *authentication* | **string** | User email, that will be used to track user actions like SET, MERGE and DELETE commands. Ex: ```blipuser@take.net``` | **true** |
