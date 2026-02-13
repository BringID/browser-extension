# BringID Browser Extension v2 - Project Documentation

## Project Overview

**BringID Browser Extension v2** is a Chrome extension that enables users to prove legitimate ownership and activity on various online platforms through TLS notarization (MPC-TLS / zero-knowledge TLS proofs). The extension uses encrypted sessions with a notary server to generate cryptographic proofs that can be verified on blockchain without revealing sensitive personal data.

### Purpose

The extension provides **zero-knowledge proof generation** for user identity verification across multiple platforms:

- **Uber**: Prove at least 5 completed rides
- **Apple Devices**: Prove ownership of Apple devices
- **Apple Subscriptions**: Prove active paid subscriptions
- **Binance KYC**: Prove KYC verification status
- **OKX KYC**: Prove KYC verification status
- **X/Twitter**: Prove premium status and verified followers count

After successful verification, the extension returns a cryptographic proof (TLS notarization presentation) to the requesting web application via `postMessage`.

### Technology Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Language**: TypeScript
- **UI Framework**: React 18
- **State Management**: Redux Toolkit
- **Styling**: Styled Components
- **Blockchain**: Ethers.js v6, Base chain (mainnet + Sepolia testnet)
- **Privacy**: Semaphore Protocol (zero-knowledge proofs)
- **TLS Notarization**: `bringid-tlsn-js` (custom MPC-TLS library)
- **Worker Communication**: Comlink
- **Build**: Webpack 5

### Architecture

```
┌────────────────────────────────────────────────────────┐
│  Web Application (Widget / Connect)                    │
│  Sends REQUEST_ZKTLS_VERIFICATION via                  │
│  chrome.runtime.sendMessage()                          │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────┐
│  Content Script (content.tsx + index.tsx)              │
│  Relays messages between page ↔ extension              │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────┐
│  Background Service Worker (background/index.tsx)      │
│  Routes requests, manages sessions, opens side panel   │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────┐
│  Side Panel (side-panel/)                              │
│  ├── Task Verification UI                              │
│  ├── Request Recorder (captures HTTP requests)         │
│  ├── Notarization Template (handler configs)           │
│  └── TLSNotary (MPC-TLS proof generation)              │
└──────────────────┬─────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────┐
│  External Services                                     │
│  ├── Notary Server (api.bringid.org/v1/notary)         │
│  ├── WebSocket Proxy (proxy.bringid.org/websockify)    │
│  └── Target APIs (Uber, Apple, Binance, OKX, X)        │
└────────────────────────────────────────────────────────┘
```

### Key Components

1. **Background Service Worker** (`src/background/index.tsx`): Handles external messages, manages side panel sessions, routes verification requests
2. **Content Scripts**:
   - `src/content/content.tsx`: Injected into widget pages, relays page messages to extension
   - `src/content/index.tsx`: Receives extension messages, sends results back to page via `postMessage`
3. **Side Panel** (`src/side-panel/`): Main verification UI with React/Redux
4. **Notarization Handlers** (`src/side-panel/services/notarization/handlers/`): Platform-specific verification configs
5. **TLSNotary** (`src/side-panel/services/tlsn/`): MPC-TLS proof generation engine
6. **Request Recorder** (`src/side-panel/services/requests-recorder/`): Captures HTTP requests using Chrome `webRequest` API
7. **Configs** (`src/configs/`): Extension ID, API URLs, chain configs, task definitions

### Verification Flow

1. Web application sends `REQUEST_ZKTLS_VERIFICATION` to extension via `chrome.runtime.sendMessage(EXTENSION_ID, ...)`
2. Background worker validates request and stores task in `chrome.storage.local`
3. Background worker opens side panel UI
4. Side panel displays verification steps to user
5. User navigates to target service (e.g., Uber, Apple ID)
6. Request Recorder captures relevant HTTP requests (cookies, headers, body)
7. Extension replays the request through MPC-TLS notary to generate proof
8. Response middleware validates the data (e.g., enough rides, KYC verified)
9. TLS transcript is selectively disclosed (only specific JSON paths revealed)
10. Cryptographic proof (presentation) is generated
11. Result is sent back to the web application via `VERIFICATION_DATA_READY` postMessage

---

## PostMessage Communication

All postMessage communication flows between the extension and web applications hosted on BringID widget/connect domains.

### Messages Received by Extension (from Web Application)

#### 1. REQUEST_ZKTLS_VERIFICATION

Initiates a zero-knowledge TLS verification flow. Sent from the web application to the extension via `chrome.runtime.sendMessage()`.

**TypeScript Interface:**

```typescript
interface IRequestZktlsVerification {
  type: 'REQUEST_ZKTLS_VERIFICATION';
  requestId: string; // Unique request identifier
  payload: {
    task: string; // JSON stringified TTask object
    origin: string; // Originating domain URL
  };
}
```

**Example:**

```javascript
chrome.runtime.sendMessage('fjlmbkpfjmbjokokgmfcijlliceljbeh', {
  type: 'REQUEST_ZKTLS_VERIFICATION',
  requestId: 'unique-request-id-123',
  payload: {
    task: JSON.stringify({
      id: '1',
      title: 'Uber Rides',
      service: 'Uber',
      description: 'Prove that you had at least 5 uber trips',
      permissionUrl: [
        'https://riders.uber.com/graphql',
        'https://riders.uber.com/trips',
      ],
      groups: [{ points: 10, semaphoreGroupId: '0', credentialGroupId: '1' }],
      steps: [
        { text: 'Visit website' },
        { text: 'Wait for request capture' },
        { text: 'MPC-TLS verification progress', notarization: true },
      ],
    }),
    origin: 'https://widget.bringid.org',
  },
});
```

**Validation:**

- `payload.task` is required
- `payload.origin` is required
- `requestId` is required
- `sender.tab.id` must be present

---

#### 2. PING

Checks if the extension is installed and responsive.

**TypeScript Interface:**

```typescript
interface IPing {
  type: 'PING';
}
```

**Example:**

```javascript
chrome.runtime.sendMessage('fjlmbkpfjmbjokokgmfcijlliceljbeh', {
  type: 'PING',
});
```

**Response:** Returns `true` if extension is active.

---

### Messages Sent by Extension (to Web Application)

All outgoing messages are sent via `window.postMessage()` from the content script to the web application page. Every message includes `source: 'bringID extension'`.

#### 1. VERIFICATION_DATA_READY

Sent when verification completes successfully with a valid TLS notarization proof.

**TypeScript Interface:**

```typescript
interface IVerificationDataReady {
  source: 'bringID extension';
  type: 'VERIFICATION_DATA_READY';
  requestId: string; // Matches the original request ID
  payload: {
    transcriptRecv: string; // Base64-encoded TLS transcript (received data)
    presentationData: string; // Cryptographic proof / presentation
  };
}
```

**Example:**

```javascript
// Received by web application via window.addEventListener('message', ...)
{
  source: 'bringID extension',
  type: 'VERIFICATION_DATA_READY',
  requestId: 'unique-request-id-123',
  payload: {
    transcriptRecv: 'base64encodedtranscript...',
    presentationData: 'cryptographicproof...'
  }
}
```

**Note:** The message is sent to the specific origin that initiated the request, not `'*'`.

---

#### 2. VERIFICATION_DATA_ERROR

Sent when verification fails or is cancelled by the user.

**TypeScript Interface:**

```typescript
interface IVerificationDataError {
  source: 'bringID extension';
  type: 'VERIFICATION_DATA_ERROR';
  requestId: string; // Matches the original request ID
  payload: {
    error: string; // Error code
  };
}
```

**Error Codes (sent to widget):**

| Error Code            | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `USER_CANCELLED`      | User closed the side panel before verification completed |
| `VERIFICATION_FAILED` | Notarization process failed                              |

**Note:** Additional error codes (e.g., `uber_data_not_found`, `binance_kyc_not_verified`, `okx_kyc_not_verified`, etc.) are used internally within the side panel UI but are not currently sent to the widget. These internal errors are mapped to `VERIFICATION_FAILED` before being communicated externally.

**Example:**

```javascript
{
  source: 'bringID extension',
  type: 'VERIFICATION_DATA_ERROR',
  requestId: 'unique-request-id-123',
  payload: {
    error: 'USER_CANCELLED'
  }
}
```

---

### Internal Extension Messages

These messages flow between extension components (background worker, side panel, content scripts) and are not visible to external web applications.

#### Side Panel → Background (Port Connection)

```typescript
// Register active verification session
{
  type: 'REGISTER_SESSION',
  tabId: number,
  requestId: string,
  origin: string
}
```

#### Side Panel → Background (Runtime Message)

```typescript
// Unregister session on successful completion
{
  type: 'UNREGISTER_SESSION',
  requestId: string
}
```

#### Background/Side Panel → Content Script (Tab Message)

```typescript
// Success result forwarded to content script for postMessage relay
{
  type: 'VERIFICATION_DATA_READY',
  payload: {
    transcriptRecv: string,
    presentationData: string,
    requestId: string,
    origin: string
  }
}

// Error result forwarded to content script
{
  type: 'VERIFICATION_DATA_ERROR',
  payload: {
    error: string,
    requestId: string,
    origin: string
  }
}
```

#### Web Worker ↔ Main Thread (TLS Progress)

```typescript
// Main thread → Worker
{ action: 'initWsMonitor' }
{ action: 'setWsMonitorConfig', config: WsMonitorConfig }

// Worker → Main thread
{
  type: 'data',
  payload: {
    progress: number,       // 0-100 percentage
    eta: number,            // Estimated seconds remaining
    speed: string,          // e.g., "512 KB/s"
    quality: string,        // Connection quality indicator
    totalBytes: number,
    remainingBytes: number,
    elapsedSeconds: number
  }
}
```

---

## External Services Used

### 1. BringID Notary Server

**Base URL:** `https://api.bringid.org`
**Authentication:** API key via Zuplo gateway (`zpka_...`)

| Endpoint         | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `GET /v1/notary` | Obtains a TLS notary session URL for MPC-TLS proof generation |

### 2. BringID WebSocket Proxy

**URL:** `wss://proxy.bringid.org/websockify`
**Purpose:** Proxies TLS connections for MPC-TLS handshake between the extension and target servers.

### 3. BringID Widget / Connect Domains

These are the allowed origins for external communication:

| Domain                               | Purpose                          |
| ------------------------------------ | -------------------------------- |
| `https://connect.bringid.org`        | Main wallet connection interface |
| `https://dev.connect.bringid.org`    | Development environment          |
| `https://widget.bringid.org`         | Embeddable widget                |
| `https://staging.widget.bringid.org` | Staging widget                   |

### 4. Target Verification Services

These are the third-party services whose data is captured and notarized:

#### Uber Rides

- **Endpoint:** `POST https://riders.uber.com/graphql`
- **Server DNS:** `riders.uber.com`
- **Redirect URL:** `https://riders.uber.com/trips`
- **Cookies Used:** `sid`, `csid`
- **GraphQL Query:** `{currentUser {uuid} activities {past(limit: 10) {activities {uuid, description}}}}`
- **Disclosed Fields:** `/data/currentUser/uuid`, `/data/activities/past/activities`
- **Validation:** At least 5 non-canceled rides required

#### Apple Devices

- **Endpoint:** `GET https://appleid.apple.com/account/manage/security/devices`
- **Server DNS:** `account.apple.com`
- **Redirect URL:** `https://account.apple.com/account/manage/section/devices`
- **Cookies Used:** `aidsp`
- **Disclosed Fields:** `/devices`
- **Validation:** At least 1 device required

#### Apple Subscriptions

- **Endpoint:** `GET https://speedysub.apps.apple.com/subscription/v3/manage/list*`
- **Server DNS:** `speedysub.apps.apple.com`
- **Redirect URL:** `https://account.apple.com/account/manage/section/subscriptions`
- **Cookies Used:** `myacinfo`, `commerce-authorization-token`, `caw`, `caw-at`, `dslang`, `site`
- **Disclosed Fields:** Per subscription: `/active/{index}/subscriptionId`, `/active/{index}/status`, `/active/{index}/latestPlan/paidPrice`
- **Validation:** At least 1 active paid subscription required

#### Binance KYC

- **Endpoint:** `POST https://www.binance.com/bapi/kyc/v2/private/certificate/user-kyc/current-kyc-status`
- **Server DNS:** `www.binance.com`
- **Redirect URL:** `https://www.binance.com/en/my/dashboard`
- **Cookies Used:** `aws-waf-token`, `p20t`, `bnc-uuid`, `d1og`, `logined`, `cr00`, `__cuid`, `BNC_FV_KEY`, `BNC_FV_KEY_T`, `BNC_FV_KEY_EXPIRE`
- **Headers Forwarded:** `csrftoken`, `bnc-uuid`
- **Disclosed Fields:** `/data/kycStatus`, `/data/currentKycLevel`, `/data/jumioStatus`, `/data/userId`
- **Validation:** `kycStatus === 1` AND `jumioStatus === 'PASS'`

#### OKX KYC

- **Endpoint:** `GET https://www.okx.com/v3/users/security/profile*`
- **Server DNS:** `www.okx.com`
- **Redirect URL:** `https://www.okx.com/account/users`
- **Cookies Used:** `token`, `uid`, `ok-ses-id`, `devId`, `__cf_bm`, `locale`, `browserCheck`
- **Headers Forwarded:** `authorization`, `user-agent`
- **Disclosed Fields:** `/code`, `/data/kycLevel`, `/data/uuid`
- **Validation:** `code === 0` AND `kycLevel >= 2`

#### X/Twitter Verified Followers

- **Endpoint:** `GET https://x.com/i/api/graphql/LwtiA7urqM6eDeBheAFi5w/AccountOverviewQuery?*`
- **Server DNS:** `x.com`
- **Redirect URL:** `https://x.com/i/account_analytics/overview`
- **Cookies Used:** `auth_token`, `ct0`
- **Headers Forwarded:** `authorization`, `x-csrf-token`
- **Disclosed Fields:** `/data/viewer_v2/user_results/result/verified_follower_count`, `/data/viewer_v2/user_results/result/id`
- **Validation:** At least 10 verified followers required
- **Score Groups:** 20 points (1000+), 10 points (100+), 5 points (10+)

### 5. Blockchain (Base Chain)

| Network                | Chain ID | RPC URL                                     | Explorer                       |
| ---------------------- | -------- | ------------------------------------------- | ------------------------------ |
| Base Sepolia (testnet) | 84532    | `https://base-sepolia.drpc.org`             | `https://sepolia.basescan.org` |
| Base (mainnet)         | 8453     | `https://developer-access-mainnet.base.org` | `https://basescan.org`         |

**Registry Contracts:**

- Testnet: `0x0b2Ab187a6FD2d2F05fACc158611838c284E3a9c`
- Mainnet: `0xFEA4133236B093eC727286473286A45c5d4443BC`

---

## Data Models

### TTask

Task definition that describes a verification type.

```typescript
interface TTask {
  id: string; // Task identifier
  title: string; // Display name (e.g., "Uber Rides")
  service: string; // Service name (e.g., "Uber", "Apple ID")
  description: string; // Human-readable description
  icon: string; // Icon URL
  permissionUrl: string[]; // URLs requiring host permission
  verificationType?: string; // e.g., "zktls"
  additionalInfo?: {
    // Optional info shown during verification
    title: string;
    text: string;
    showBeforeStep: number;
  };
  groups: Array<{
    points: number; // Score points for this group
    semaphoreGroupId: string; // Semaphore group identifier
    credentialGroupId: string; // Credential group identifier
    checks?: Array<{
      // Optional additional validation checks
      key: string; // Field to check
      type: string; // Comparison type (e.g., "gte")
      value: string; // Threshold value
    }>;
  }>;
  steps: Array<{
    text: string; // Step description
    notarization?: boolean; // Whether this is the notarization step
  }>;
}
```

### Handler Configs

Each verification type has a handler config defining how to capture, replay, and validate requests.

```typescript
// Simple handler (single request)
interface SimpleHandlerConfig {
  name: string;
  request: { method: string; urlPattern: string };
  redirect: string; // URL to open for user navigation
  tlsnConfig: {
    serverDns: string; // TLS server hostname
    maxSentData: number; // Max bytes sent
    maxRecvData: number; // Max bytes received
  };
  replayRequestCfg: {
    url?: (req: Request) => string; // Optional URL transform
    headers: {
      custom: Record<string, string>; // Fixed headers
      whitelist: string[]; // Headers to forward from capture
      cookie: {
        whitelist: string[]; // Cookies to forward from capture
      };
    };
    customBody?: object; // Override request body
  };
  transcriptDisclose: string[]; // JSON pointers for selective disclosure
  responseMiddleware?: ResponseMiddleware;
}

// Complex handler (multiple requests, custom middleware)
interface HandlerConfig {
  name: string;
  requests: Array<{ method: string; urlPattern: string }>;
  redirect: string;
  tlsnConfig: { serverDns: string; maxSentData: number; maxRecvData: number };
  requestMiddleware?: (requests: Request[]) => Promise<Request>;
  transcriptMiddleware: TranscriptMiddleware;
  responseMiddleware?: ResponseMiddleware;
}
```

---

## Configuration

### Extension Identity

- **Extension ID:** `fjlmbkpfjmbjokokgmfcijlliceljbeh`
- **Manifest Version:** 3

### Chrome Permissions

**Required:**

- `storage`: Local/sync storage access
- `webRequest`: HTTP request interception for capture
- `activeTab`: Current tab access
- `sidePanel`: Side panel UI

**Host Permissions (Required):**

- `https://connect.bringid.org/*`
- `https://dev.connect.bringid.org/*`
- `https://widget.bringid.org/*`
- `https://staging.widget.bringid.org/*`

**Optional Host Permissions (User-Granted):**

- `https://appleid.apple.com/*`
- `https://riders.uber.com/*`
- `https://account.apple.com/*`
- `https://www.binance.com/*`
- `https://www.okx.com/*`
- `https://speedysub.apps.apple.com/*`
- `https://apps.apple.com/*`

### Environment Variables

- `PROXY_URL`: WebSocket proxy URL (default: `wss://proxy.bringid.org/websockify`)

### Build Commands

```bash
yarn dev          # Development build with hot reload (watch mode)
yarn build        # Production build
yarn lint         # Run ESLint
yarn lint:fix     # Fix ESLint issues
```

**Requirements:** Node.js 20+, Yarn

---

## Important Notes

1. **Extension Communication**: Web applications communicate with the extension via `chrome.runtime.sendMessage(EXTENSION_ID, ...)` for incoming requests, and receive results via `window.postMessage()` on the page.

2. **Externally Connectable**: Only pages on `connect.bringid.org`, `dev.connect.bringid.org`, `widget.bringid.org`, and `staging.widget.bringid.org` can send messages to the extension.

3. **Content Scripts**: Injected into all frames on the connectable domains. They relay messages bidirectionally between the page and the extension background.

4. **Side Panel Sessions**: The background worker tracks active sessions. If the user closes the side panel before completion, a `USER_CANCELLED` error is sent to the originating tab.

5. **Selective Disclosure**: TLS notarization proofs only reveal specific JSON paths (defined in `transcriptDisclose`). All other response data remains hidden in the proof.

6. **Request Replay**: The extension first captures a real request from the user's browser session, then replays it through the MPC-TLS notary with filtered headers/cookies to generate the proof.

7. **Cookie Filtering**: Each handler config defines a whitelist of cookies to include in the replayed request. This minimizes data exposure while maintaining authentication.

8. **Semaphore Integration**: Verification results can be used to join Semaphore groups on-chain (Base), enabling privacy-preserving proof of humanity.

9. **Content Security Policy**: Extension pages use `'wasm-unsafe-eval'` for WebAssembly support (required by `bringid-tlsn-js`).
